import { generateCoachingInsights } from './geminiPrompt';
import { textToSpeech, getAvailableVoices } from './elevenLabsAPI';
import continuousRecordingService from './continuousRecordingService';

export const testTranscriptsAndElevenLabs = async () => {
  console.log('🧪 Testing Transcripts and ElevenLabs Integration...');
  
  const results = {
    transcripts: false,
    elevenLabs: false,
    continuousRecording: false,
    errors: []
  };

  try {
    // Test 1: Transcript processing with Gemini
    console.log('📝 Testing transcript processing...');
    const testTranscript = "I'm feeling a bit overwhelmed today and could use some guidance on managing my stress levels.";
    
    const insights = await generateCoachingInsights(testTranscript);
    
    if (insights && insights.insights && insights.recommendations) {
      console.log('✅ Transcript processing works!');
      console.log('Insights:', insights.insights.substring(0, 100) + '...');
      results.transcripts = true;
    } else {
      console.log('❌ Transcript processing failed');
      results.errors.push('Transcript processing failed');
    }

    // Test 2: ElevenLabs TTS
    console.log('🔊 Testing ElevenLabs text-to-speech...');
    const testText = "Hello! This is a test of the ElevenLabs integration.";
    
    const audioUri = await textToSpeech(testText);
    
    if (audioUri && audioUri.startsWith('data:audio/mpeg;base64,')) {
      console.log('✅ ElevenLabs TTS works!');
      results.elevenLabs = true;
    } else {
      console.log('❌ ElevenLabs TTS failed - no API key or service error');
      results.errors.push('ElevenLabs TTS failed - check API key');
    }

    // Test 3: Available voices
    console.log('🎤 Testing available voices...');
    const voices = await getAvailableVoices();
    
    if (voices && voices.length > 0) {
      console.log(`✅ Found ${voices.length} available voices`);
      console.log('Sample voices:', voices.slice(0, 3).map(v => v.name));
    } else {
      console.log('⚠️ No voices found - API key may be missing');
    }

    // Test 4: Continuous recording service
    console.log('🎙️ Testing continuous recording service...');
    
    try {
      // Initialize with mock user profile
      const mockUserProfile = {
        name: 'Test User',
        voiceTone: 'calm',
        goals: ['stress management', 'focus improvement']
      };
      
      await continuousRecordingService.initialize(mockUserProfile, {
        onTranscriptUpdate: (transcripts) => {
          console.log('📊 Transcript update received:', transcripts.length);
        },
        onMomentDetected: (moment) => {
          console.log('💡 Moment detected:', moment.type);
        },
        onNudgeTriggered: (nudge) => {
          console.log('🔔 Nudge triggered:', nudge.message);
        }
      });
      
      console.log('✅ Continuous recording service initialized');
      results.continuousRecording = true;
      
    } catch (error) {
      console.log('❌ Continuous recording service failed:', error.message);
      results.errors.push(`Continuous recording: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    results.errors.push(error.message);
  }

  // Summary
  console.log('\n📋 Integration Test Summary:');
  console.log(`Transcripts: ${results.transcripts ? '✅' : '❌'}`);
  console.log(`ElevenLabs: ${results.elevenLabs ? '✅' : '❌'}`);
  console.log(`Continuous Recording: ${results.continuousRecording ? '✅' : '❌'}`);
  
  if (results.errors.length > 0) {
    console.log('\n⚠️ Issues found:');
    results.errors.forEach(error => console.log(`- ${error}`));
  }

  return results;
};

export const testAIChatFlow = async () => {
  console.log('🤖 Testing AI Chat Flow...');
  
  try {
    // Simulate a complete chat flow
    const userMessage = "I'm feeling stressed about my upcoming presentation tomorrow.";
    
    console.log('👤 User message:', userMessage);
    
    // Generate AI response
    const insights = await generateCoachingInsights(userMessage);
    const aiResponse = `I understand you're feeling stressed about your presentation. ${insights.insights} Here's what I suggest: ${insights.recommendations[0]}`;
    
    console.log('🤖 AI response:', aiResponse);
    
    // Generate speech
    const audioUri = await textToSpeech(aiResponse);
    
    if (audioUri) {
      console.log('✅ Complete AI chat flow works!');
      return true;
    } else {
      console.log('❌ AI chat flow failed at speech generation');
      return false;
    }
    
  } catch (error) {
    console.error('❌ AI chat flow test failed:', error);
    return false;
  }
}; 