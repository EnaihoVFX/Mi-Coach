import { Audio } from 'expo-av';
import { generateCoachingInsights } from './geminiPrompt';
import { textToSpeech } from './elevenLabsAPI';
import speechToTextService from './speechToText';
import { 
  checkStaticNudges, 
  generateContextualNudge, 
  generateBackgroundCoaching,
  generateTimeBasedCoaching,
  generateActivityBasedCoaching
} from './nudgeEngine';

class ContinuousRecordingService {
  constructor() {
    this.isRecording = false;
    this.currentRecording = null;
    this.recordingInterval = null;
    this.transcriptBuffer = [];
    this.momentBuffer = [];
    this.coachingHistory = [];
    this.onTranscriptUpdate = null;
    this.onMomentDetected = null;
    this.onNudgeTriggered = null;
    this.onCoachingGenerated = null;
    this.onVoiceFeedback = null;
    this.userProfile = null;
    this.recordingDuration = 10000; // 10 seconds per recording segment
    this.momentDetectionThreshold = 0.7; // AI confidence threshold for moment detection
    this.lastBackgroundCoaching = null; // Track last background coaching time
    this.backgroundCoachingInterval = null; // Interval for background coaching
    this.lastVoiceFeedback = null; // Track last voice feedback to avoid spam
    this.voiceFeedbackCooldown = 30000; // 30 seconds between voice feedbacks
    this.isPaused = false; // Track if recording is paused for audio playback
  }

  // Initialize the service
  async initialize(userProfile, callbacks = {}) {
    this.userProfile = userProfile;
    this.onTranscriptUpdate = callbacks.onTranscriptUpdate;
    this.onMomentDetected = callbacks.onMomentDetected;
    this.onNudgeTriggered = callbacks.onNudgeTriggered;
    this.onCoachingGenerated = callbacks.onCoachingGenerated;
    this.onVoiceFeedback = callbacks.onVoiceFeedback;

    // Request microphone permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Microphone permission is required for continuous recording');
    }

    // Configure audio mode for background recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: 1, // DO_NOT_MIX
      interruptionModeAndroid: 1, // DO_NOT_MIX
      shouldDuckAndroid: true,
    });

    console.log('Continuous recording service initialized with 10-second segments');
  }

  // Start continuous recording
  async startRecording() {
    if (this.isRecording) {
      console.log('Recording already in progress');
      return;
    }

    this.isRecording = true;
    this.isPaused = false;
    console.log('Starting continuous recording with 10-second segments...');

    // Start the first recording segment
    await this.startRecordingSegment();

    // Set up interval for continuous recording
    this.recordingInterval = setInterval(async () => {
      if (this.isRecording && !this.isPaused) {
        await this.rotateRecording();
      }
    }, this.recordingDuration);

    // Start background coaching system
    this.startBackgroundCoaching();
  }

  // Pause recording (e.g., when audio is playing)
  pauseRecording() {
    this.isPaused = true;
    console.log('Recording paused for audio playback');
  }

  // Resume recording
  resumeRecording() {
    this.isPaused = false;
    console.log('Recording resumed');
  }

  // Stop continuous recording
  async stopRecording() {
    if (!this.isRecording) {
      console.log('No recording in progress');
      return;
    }

    this.isRecording = false;
    this.isPaused = false;
    console.log('Stopping continuous recording...');

    // Clear the intervals
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    if (this.backgroundCoachingInterval) {
      clearInterval(this.backgroundCoachingInterval);
      this.backgroundCoachingInterval = null;
    }

    // Stop current recording
    if (this.currentRecording) {
      await this.stopCurrentRecording();
    }
  }

  // Start background coaching system
  startBackgroundCoaching() {
    // Generate initial time-based coaching
    this.generateBackgroundCoachingTips();

    // Set up interval for regular background coaching (every 30 minutes)
    this.backgroundCoachingInterval = setInterval(async () => {
      if (this.isRecording) {
        await this.generateBackgroundCoachingTips();
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  // Generate background coaching tips
  async generateBackgroundCoachingTips() {
    try {
      const coachingTips = await generateBackgroundCoaching(
        this.transcriptBuffer,
        this.userProfile,
        this.coachingHistory
      );

      if (coachingTips.length > 0) {
        // Add to coaching history
        this.coachingHistory.push(...coachingTips);

        // Trigger coaching callback
        if (this.onCoachingGenerated) {
          coachingTips.forEach(tip => {
            this.onCoachingGenerated(tip);
          });
        }

        console.log(`Generated ${coachingTips.length} background coaching tips`);
      }
    } catch (error) {
      console.error('Error generating background coaching:', error);
    }
  }

  // Start a new recording segment
  async startRecordingSegment() {
    try {
      // Configure audio mode for iOS recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1, // DO_NOT_MIX
        interruptionModeAndroid: 1, // DO_NOT_MIX
        shouldDuckAndroid: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.currentRecording = recording;
      console.log('Started new 10-second recording segment');
    } catch (error) {
      console.error('Error starting recording segment:', error);
    }
  }

  // Rotate recording (stop current, start new)
  async rotateRecording() {
    try {
      if (this.currentRecording) {
        await this.stopCurrentRecording();
        // Add a small delay to ensure proper cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await this.startRecordingSegment();
    } catch (error) {
      console.error('Error rotating recording:', error);
      // If there's an error, try to reset the recording state
      this.currentRecording = null;
      await this.startRecordingSegment();
    }
  }

  // Stop current recording and process it
  async stopCurrentRecording() {
    if (!this.currentRecording) return;

    try {
      await this.currentRecording.stopAndUnloadAsync();
      const uri = this.currentRecording.getURI();
      this.currentRecording = null;

      // Process the recorded audio
      await this.processRecording(uri);
    } catch (error) {
      console.error('Error stopping recording:', error);
      // Ensure recording is cleaned up even if there's an error
      this.currentRecording = null;
    }
  }

  // Process recorded audio and generate transcript
  async processRecording(audioUri) {
    try {
      console.log('Processing 10-second recording segment...');
      
      // Generate real transcript from audio using speech-to-text
      const transcript = await this.generateRealTranscriptFromAudio(audioUri);
      
      if (!transcript || transcript.trim() === '') {
        console.log('No speech detected in this segment');
        return;
      }
      
      // Add to transcript buffer
      this.transcriptBuffer.push({
        timestamp: new Date().toISOString(),
        text: transcript,
        audioUri: audioUri,
        duration: this.recordingDuration / 1000
      });

      // Real-time Gemini analysis for issues
      await this.analyzeTranscriptForIssues(transcript);

      // Check for immediate nudges
      const nudges = checkStaticNudges(transcript, this.userProfile);
      if (nudges.length > 0 && this.onNudgeTriggered) {
        this.onNudgeTriggered(nudges[0]);
      }

      // Generate activity-based coaching
      const activityCoaching = generateActivityBasedCoaching(this.transcriptBuffer, this.userProfile);
      if (activityCoaching && this.onCoachingGenerated) {
        this.coachingHistory.push({
          ...activityCoaching,
          timestamp: new Date().toISOString(),
          source: 'activity_based'
        });
        this.onCoachingGenerated(activityCoaching);
      }

      // Check for significant moments
      await this.detectSignificantMoments(transcript);

      // Update transcript
      if (this.onTranscriptUpdate) {
        this.onTranscriptUpdate([...this.transcriptBuffer]);
      }

    } catch (error) {
      console.error('Error processing recording:', error);
    }
  }

  // Generate real transcript from audio using speech-to-text API
  async generateRealTranscriptFromAudio(audioUri) {
    try {
      console.log('🎤 Sending audio to speech-to-text service...');
      
      // Use the real speech-to-text service
      const transcript = await speechToTextService.transcribeAudio(audioUri);
      
      return transcript;
      
    } catch (error) {
      console.error('Error generating real transcript from audio:', error);
      return null;
    }
  }

  // Analyze transcript for issues using Gemini API
  async analyzeTranscriptForIssues(transcript) {
    try {
      console.log('🔍 Analyzing transcript for issues:', transcript.substring(0, 50) + '...');
      
      // Use Gemini API to analyze the transcript
      const analysis = await generateCoachingInsights(transcript);
      
      // Check if there are concerning patterns
      const hasIssues = this.detectConcerningPatterns(analysis, transcript);
      
      if (hasIssues && this.shouldProvideVoiceFeedback()) {
        await this.provideVoiceFeedback(analysis, transcript);
      }
      
    } catch (error) {
      console.error('Error analyzing transcript for issues:', error);
    }
  }

  // Detect concerning patterns in the analysis
  detectConcerningPatterns(analysis, transcript) {
    const lowerTranscript = transcript.toLowerCase();
    const lowerInsights = analysis.insights.toLowerCase();
    
    // Check for concerning keywords
    const concerningKeywords = [
      'stressed', 'anxious', 'overwhelmed', 'depressed', 'hopeless',
      'suicidal', 'self-harm', 'worthless', 'failure', 'hate myself',
      'can\'t take it', 'want to give up', 'no point', 'tired of life',
      'struggling', 'difficult', 'hard time', 'crying', 'sad', 'lonely'
    ];
    
    // Check for high emotional intensity
    const intensityKeywords = [
      'really', 'very', 'extremely', 'so much', 'incredibly',
      'absolutely', 'completely', 'totally', 'deeply', 'profoundly'
    ];
    
    let concernLevel = 0;
    
    // Check for concerning keywords
    concerningKeywords.forEach(keyword => {
      if (lowerTranscript.includes(keyword) || lowerInsights.includes(keyword)) {
        concernLevel += 0.3;
      }
    });
    
    // Check for emotional intensity
    intensityKeywords.forEach(keyword => {
      if (lowerTranscript.includes(keyword)) {
        concernLevel += 0.1;
      }
    });
    
    // Check mood analysis
    if (analysis.moodAnalysis && analysis.moodAnalysis.sentiment === 'negative') {
      concernLevel += 0.4;
    }
    
    // Check for repeated negative patterns
    if (this.transcriptBuffer.length > 2) {
      const recentTranscripts = this.transcriptBuffer.slice(-3);
      const negativeCount = recentTranscripts.filter(t => 
        concerningKeywords.some(keyword => t.text.toLowerCase().includes(keyword))
      ).length;
      
      if (negativeCount >= 2) {
        concernLevel += 0.5; // Multiple negative segments
      }
    }
    
    return concernLevel >= 0.5; // Threshold for providing feedback
  }

  // Check if we should provide voice feedback (avoid spam)
  shouldProvideVoiceFeedback() {
    const now = Date.now();
    if (this.lastVoiceFeedback && (now - this.lastVoiceFeedback) < this.voiceFeedbackCooldown) {
      return false;
    }
    return true;
  }

  // Provide voice feedback using ElevenLabs
  async provideVoiceFeedback(analysis, transcript) {
    try {
      console.log('🎤 Generating voice feedback for user...');
      
      // Check if we should provide voice feedback (avoid spam)
      if (!this.shouldProvideVoiceFeedback()) {
        console.log('Voice feedback skipped due to cooldown');
        return;
      }
      
      // Pause recording while generating and playing audio
      this.pauseRecording();
      
      // Create response based on Gemini's actual analysis
      const feedbackText = this.createGeminiBasedResponse(analysis, transcript);
      
      console.log('🎤 Voice feedback text:', feedbackText);
      
      // Generate voice using ElevenLabs
      const audioUri = await textToSpeech(feedbackText);
      
      if (audioUri && this.onVoiceFeedback) {
        this.onVoiceFeedback({
          text: feedbackText,
          audioUri: audioUri,
          timestamp: new Date().toISOString(),
          type: 'real_time_feedback'
        });
        
        this.lastVoiceFeedback = Date.now();
        console.log('✅ Voice feedback provided to user');
      }
      
    } catch (error) {
      console.error('Error providing voice feedback:', error);
      // Resume recording on error
      this.resumeRecording();
    }
  }

  // Create response based on Gemini's actual analysis
  createGeminiBasedResponse(analysis, transcript) {
    let response = "";
    
    // Create a short, focused response based on the main issue
    const lowerTranscript = transcript.toLowerCase();
    
    // Identify the main issue from the transcript
    let mainIssue = "";
    if (lowerTranscript.includes('stressed') || lowerTranscript.includes('overwhelmed')) {
      mainIssue = "stress and feeling overwhelmed";
    } else if (lowerTranscript.includes('anxious') || lowerTranscript.includes('worried')) {
      mainIssue = "anxiety and worry";
    } else if (lowerTranscript.includes('sad') || lowerTranscript.includes('lonely')) {
      mainIssue = "feeling sad and lonely";
    } else if (lowerTranscript.includes('tired') || lowerTranscript.includes('exhausted')) {
      mainIssue = "feeling tired and exhausted";
    } else if (lowerTranscript.includes('failing') || lowerTranscript.includes('not good enough')) {
      mainIssue = "feeling like you're not good enough";
    } else {
      mainIssue = "what you're going through";
    }
    
    // Start with empathy
    response += `I hear you're dealing with ${mainIssue}. `;
    
    // Add the most relevant insight from Gemini
    if (analysis.insights) {
      // Take just the first sentence or two from insights
      const insightSentences = analysis.insights.split('.');
      response += insightSentences[0] + ". ";
    }
    
    // Add one specific, actionable tip
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      response += analysis.recommendations[0] + " ";
    } else if (analysis.actionItems && analysis.actionItems.length > 0) {
      response += analysis.actionItems[0] + " ";
    }
    
    // Add mood-based encouragement
    if (analysis.moodAnalysis && analysis.moodAnalysis.sentiment === 'negative') {
      response += "Remember, it's okay to not be okay sometimes. ";
    }
    
    // Short, encouraging close
    response += "You're doing better than you think.";
    
    return response;
  }

  // Detect significant moments using AI
  async detectSignificantMoments(transcript) {
    try {
      // In a real implementation, you would use AI to analyze the transcript
      // For now, we'll use keyword detection and sentiment analysis
      
      const significantKeywords = [
        'breakthrough', 'realization', 'insight', 'clarity', 'understanding',
        'struggle', 'challenge', 'overwhelmed', 'anxious', 'stressed',
        'proud', 'accomplished', 'grateful', 'excited', 'motivated',
        'tired', 'exhausted', 'frustrated', 'confused', 'lost'
      ];

      const lowerTranscript = transcript.toLowerCase();
      let significance = 0;
      let detectedKeywords = [];

      // Check for significant keywords
      significantKeywords.forEach(keyword => {
        if (lowerTranscript.includes(keyword)) {
          significance += 0.3;
          detectedKeywords.push(keyword);
        }
      });

      // Check for emotional intensity indicators
      const emotionalIndicators = [
        'really', 'very', 'extremely', 'so much', 'incredibly',
        'absolutely', 'completely', 'totally', 'deeply', 'profoundly'
      ];

      emotionalIndicators.forEach(indicator => {
        if (lowerTranscript.includes(indicator)) {
          significance += 0.2;
        }
      });

      // Check for personal insights
      if (lowerTranscript.includes('i realized') || 
          lowerTranscript.includes('i understand') || 
          lowerTranscript.includes('i learned')) {
        significance += 0.4;
      }

      // If significance is above threshold, create a moment
      if (significance >= this.momentDetectionThreshold) {
        const moment = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          transcript: transcript,
          significance: Math.min(significance, 1.0),
          keywords: detectedKeywords,
          type: this.categorizeMoment(transcript, detectedKeywords),
          audioUri: this.transcriptBuffer[this.transcriptBuffer.length - 1]?.audioUri
        };

        this.momentBuffer.push(moment);

        if (this.onMomentDetected) {
          this.onMomentDetected(moment);
        }

        console.log('Significant moment detected:', moment);
      }

    } catch (error) {
      console.error('Error detecting significant moments:', error);
    }
  }

  // Categorize the type of moment
  categorizeMoment(transcript, keywords) {
    const lowerTranscript = transcript.toLowerCase();
    
    if (keywords.some(k => ['breakthrough', 'realization', 'insight', 'clarity'].includes(k))) {
      return 'insight';
    } else if (keywords.some(k => ['struggle', 'challenge', 'overwhelmed', 'anxious', 'stressed'].includes(k))) {
      return 'challenge';
    } else if (keywords.some(k => ['proud', 'accomplished', 'grateful', 'excited', 'motivated'].includes(k))) {
      return 'achievement';
    } else if (keywords.some(k => ['tired', 'exhausted', 'frustrated', 'confused', 'lost'].includes(k))) {
      return 'struggle';
    } else {
      return 'reflection';
    }
  }

  // Get current transcript
  getTranscript() {
    return [...this.transcriptBuffer];
  }

  // Get detected moments
  getMoments() {
    return [...this.momentBuffer];
  }

  // Clear transcript and moments
  clearData() {
    this.transcriptBuffer = [];
    this.momentBuffer = [];
  }

  // Update user profile
  updateUserProfile(userProfile) {
    this.userProfile = userProfile;
  }

  // Get recording status
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      transcriptCount: this.transcriptBuffer.length,
      momentCount: this.momentBuffer.length,
      currentSegment: this.currentRecording ? 'active' : 'none'
    };
  }
}

// Create singleton instance
const continuousRecordingService = new ContinuousRecordingService();

export default continuousRecordingService; 