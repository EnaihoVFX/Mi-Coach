import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Audio } from 'expo-av';
import Timeline from '../components/Timeline';
import CoachingCard from '../components/CoachingCard';
import AIChatOverlay from '../components/AIChatOverlay';
import { generateCoachingInsights } from '../utils/geminiPrompt';
import { checkStaticNudges } from '../utils/nudgeEngine';

export default function ReflectionScreen({ navigation, route }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [coaching, setCoaching] = useState(null);
  const [recentNudges, setRecentNudges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(route.params?.userProfile || {
    name: 'User',
    goals: ['Personal Growth'],
    challenges: ['General Challenges'],
    voiceTone: 'calm'
  });

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is needed for voice recording.');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1, // DO_NOT_MIX
        interruptionModeAndroid: 1, // DO_NOT_MIX
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Could not start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    
    // Simulate transcript generation
    // In a real app, you'd send the audio to a transcription service
    const mockTranscript = "I had a productive day working on my project. There were some challenges with focus in the afternoon, but I managed to complete most of my tasks. I'm feeling a bit tired but satisfied with my progress.";
    
    addTranscriptEntry(mockTranscript);
  };

  const addTranscriptEntry = (text) => {
    const newEntry = {
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      text: text
    };
    
    setTranscript(prev => [...prev, newEntry]);
    
    // Check for nudge triggers
    const nudges = checkStaticNudges(text, userProfile);
    if (nudges.length > 0) {
      setRecentNudges(prev => [...prev, ...nudges]);
    }
  };

  const handleNudgeTrigger = (nudge) => {
    setRecentNudges(prev => [...prev, nudge]);
    console.log('Nudge triggered:', nudge);
  };

  const addManualEntry = () => {
    Alert.prompt(
      'Add Reflection',
      'What\'s on your mind?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (text) => {
            if (text && text.trim()) {
              addTranscriptEntry(text.trim());
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const generateCoaching = async () => {
    if (transcript.length === 0) {
      Alert.alert('No Data', 'Please add some reflections first.');
      return;
    }

    setIsLoading(true);
    try {
      const fullTranscript = transcript.map(entry => entry.text).join(' ');
      const insights = await generateCoachingInsights(fullTranscript);
      
      const coachingData = {
        id: Date.now().toString(),
        summary: insights.insights || "You had a productive day with some challenges and successes.",
        tips: insights.recommendations || [
          "Take a moment to celebrate your progress",
          "Practice self-compassion for any challenges",
          "Plan one small action for tomorrow"
        ],
        moodAnalysis: insights.moodAnalysis || {
          sentiment: "mixed",
          description: "You showed resilience throughout the day"
        },
        actionItems: insights.actionItems || [
          "Reflect on what went well today",
          "Identify one area for improvement tomorrow"
        ]
      };

      setCoaching(coachingData);
    } catch (error) {
      console.error('Error generating coaching:', error);
      Alert.alert('Error', 'Could not generate coaching insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Daily Reflection</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderRecordingSection = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🎙️ Voice Recording</Text>
      <View style={styles.recordingContainer}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingActive]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '🛑 Stop Recording' : '🎙️ Start Recording'}
          </Text>
        </TouchableOpacity>
        
        {isRecording && (
          <View style={styles.recordingStatus}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.recordingStatusText}>Recording in progress...</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderTextEntry = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>✏️ Text Reflection</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={addManualEntry}
      >
        <Text style={styles.addButtonText}>Add Text Reflection</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCoachingSection = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🧠 AI Coaching</Text>
      {transcript.length > 0 && !coaching && (
        <TouchableOpacity
          style={[styles.coachingButton, isLoading && styles.coachingButtonDisabled]}
          onPress={generateCoaching}
          disabled={isLoading}
        >
          <Text style={styles.coachingButtonText}>
            {isLoading ? 'Generating Insights...' : 'Get AI Coaching'}
          </Text>
        </TouchableOpacity>
      )}
      
      {coaching && (
        <CoachingCard 
          coaching={coaching}
          userProfile={userProfile}
          onFeedback={(feedback) => console.log('Coaching feedback:', feedback)}
        />
      )}
    </View>
  );

  const renderReflections = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>📝 Your Reflections</Text>
        <Text style={styles.reflectionCount}>({transcript.length})</Text>
      </View>
      {transcript.length > 0 ? (
        <Timeline 
          transcript={transcript}
          onNudgeTrigger={handleNudgeTrigger}
          userProfile={userProfile}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No reflections yet</Text>
          <Text style={styles.emptySubtext}>Start recording or add text to see your reflections here</Text>
        </View>
      )}
    </View>
  );

  const renderRecentTips = () => {
    if (recentNudges.length === 0) return null;
    
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 Recent Tips</Text>
        {recentNudges.slice(-3).map((nudge, index) => (
          <View key={index} style={styles.nudgeItem}>
            <Text style={styles.nudgeText}>{nudge.message}</Text>
            <Text style={styles.nudgeTime}>
              {new Date(nudge.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderRecordingSection()}
        {renderTextEntry()}
        {renderCoachingSection()}
        {renderReflections()}
        {renderRecentTips()}
      </ScrollView>
      
      {/* AI Chat Overlay */}
      <AIChatOverlay 
        userProfile={userProfile}
        transcript={transcript}
        moments={recentNudges}
        isVisible={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 60,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reflectionCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#FF3B30',
    padding: 20,
    borderRadius: 50,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  recordingActive: {
    backgroundColor: '#FF6B6B',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingStatusText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  coachingButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  coachingButtonDisabled: {
    backgroundColor: '#ccc',
  },
  coachingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  nudgeItem: {
    backgroundColor: '#f8f9fa',
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  nudgeText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  nudgeTime: {
    fontSize: 12,
    color: '#666',
  },
}); 