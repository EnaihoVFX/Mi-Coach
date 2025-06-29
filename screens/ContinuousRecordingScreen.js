import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import continuousRecordingService from '../utils/continuousRecordingService';
import MomentsTimeline from '../components/MomentsTimeline';
import Timeline from '../components/Timeline';
import NavigationHeader from '../components/NavigationHeader';
import Card from '../components/Card';
import StatsGrid from '../components/StatsGrid';
import AIChatOverlay from '../components/AIChatOverlay';

export default function ContinuousRecordingScreen({ navigation, route }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [moments, setMoments] = useState([]);
  const [coachingTips, setCoachingTips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'moments', 'transcript', 'coaching'
  const [userProfile, setUserProfile] = useState(route.params?.userProfile || {
    name: 'User',
    goals: ['Personal Growth'],
    challenges: ['General Challenges'],
    voiceTone: 'calm'
  });

  useEffect(() => {
    initializeService();
    return () => {
      // Cleanup when component unmounts
      if (isRecording) {
        continuousRecordingService.stopRecording();
      }
    };
  }, []);

  const initializeService = async () => {
    try {
      setIsLoading(true);
      await continuousRecordingService.initialize(userProfile, {
        onTranscriptUpdate: (newTranscript) => {
          setTranscript(newTranscript);
        },
        onMomentDetected: (moment) => {
          setMoments(prev => [moment, ...prev]);
          // Show notification for new moment
          Alert.alert(
            'Significant Moment Detected!',
            `"${moment.transcript.substring(0, 50)}..."`,
            [{ text: 'View', onPress: () => setActiveTab('moments') }, { text: 'Dismiss' }]
          );
        },
        onNudgeTriggered: (nudge) => {
          Alert.alert('Coaching Tip', nudge.message, [{ text: 'Got it!' }]);
        },
        onCoachingGenerated: (coachingTip) => {
          setCoachingTips(prev => [coachingTip, ...prev]);
          // Show notification for new coaching tip
          Alert.alert(
            'AI Coaching Tip',
            coachingTip.message,
            [
              { text: 'View All', onPress: () => setActiveTab('coaching') }, 
              { text: 'Got it!' }
            ]
          );
        }
      });
      
      // Load existing data
      setTranscript(continuousRecordingService.getTranscript());
      setMoments(continuousRecordingService.getMoments());
      
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize recording service: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        await continuousRecordingService.stopRecording();
        setIsRecording(false);
      } else {
        await continuousRecordingService.startRecording();
        setIsRecording(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle recording: ' + error.message);
    }
  };

  const clearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all transcripts, moments, and coaching tips. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            continuousRecordingService.clearData();
            setTranscript([]);
            setMoments([]);
            setCoachingTips([]);
          }
        }
      ]
    );
  };

  const handleMomentPress = (moment) => {
    Alert.alert(
      'Moment Details',
      `Type: ${moment.type}\nSignificance: ${Math.round(moment.significance * 100)}%\n\n"${moment.transcript}"`,
      [
        { text: 'Share', onPress: () => console.log('Share moment') },
        { text: 'Save', onPress: () => console.log('Save moment') },
        { text: 'Close' }
      ]
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
          📊 Overview
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'moments' && styles.activeTab]}
        onPress={() => setActiveTab('moments')}
      >
        <Text style={[styles.tabText, activeTab === 'moments' && styles.activeTabText]}>
          💡 Moments ({moments.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'transcript' && styles.activeTab]}
        onPress={() => setActiveTab('transcript')}
      >
        <Text style={[styles.tabText, activeTab === 'transcript' && styles.activeTabText]}>
          📝 Transcript ({transcript.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'coaching' && styles.activeTab]}
        onPress={() => setActiveTab('coaching')}
      >
        <Text style={[styles.tabText, activeTab === 'coaching' && styles.activeTabText]}>
          🧠 Coaching ({coachingTips.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Recording Controls */}
      <Card>
        <Text style={styles.cardTitle}>🎙️ Recording Controls</Text>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Background Recording</Text>
          <Switch
            value={isRecording}
            onValueChange={toggleRecording}
            trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
            thumbColor={isRecording ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
        
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Auto-start on app launch</Text>
          <Switch
            value={autoStart}
            onValueChange={setAutoStart}
            trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
            thumbColor={autoStart ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordingActive]}
          onPress={toggleRecording}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? '🛑 Stop Recording' : '🎙️ Start Recording'}
          </Text>
        </TouchableOpacity>

        {isRecording && (
          <View style={styles.statusContainer}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>Recording in background...</Text>
          </View>
        )}
      </Card>

      {/* Statistics */}
      <Card>
        <Text style={styles.cardTitle}>📊 Statistics</Text>
        <StatsGrid 
          stats={[
            { value: transcript.length, label: 'Transcript Entries' },
            { value: moments.length, label: 'Significant Moments' },
            { value: coachingTips.length, label: 'Coaching Tips' },
            { value: transcript.length > 0 ? Math.round(transcript.reduce((acc, t) => acc + (t.duration || 0), 0) / 60) : 0, label: 'Minutes Recorded' }
          ]}
        />
      </Card>

      {/* Quick Actions */}
      <Card>
        <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveTab('moments')}
          >
            <Text style={styles.actionButtonText}>View Moments</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveTab('transcript')}
          >
            <Text style={styles.actionButtonText}>View Transcript</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setActiveTab('coaching')}
          >
            <Text style={styles.actionButtonText}>View Coaching Tips</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={clearData}
          >
            <Text style={styles.actionButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );

  const renderMoments = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Significant Moments</Text>
        <TouchableOpacity onPress={() => setMoments([])}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>
      <MomentsTimeline 
        moments={moments}
        onMomentPress={handleMomentPress}
      />
    </View>
  );

  const renderTranscript = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Live Transcript</Text>
        <TouchableOpacity onPress={clearData}>
          <Text style={styles.clearButton}>Clear All</Text>
        </TouchableOpacity>
      </View>
      {transcript.length > 0 ? (
        <Timeline 
          transcript={transcript.map(t => ({
            timestamp: new Date(t.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            text: t.text
          }))}
          userProfile={userProfile}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Transcript Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start recording to see your transcript here
          </Text>
        </View>
      )}
    </View>
  );

  const renderCoaching = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>AI Coaching Tips</Text>
        <TouchableOpacity onPress={() => setCoachingTips([])}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>
      {coachingTips.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {coachingTips.map((tip, index) => (
            <View key={index} style={styles.coachingCard}>
              <View style={styles.coachingHeader}>
                <Text style={styles.coachingTime}>
                  {new Date(tip.timestamp).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </Text>
                <Text style={styles.coachingSource}>
                  {tip.source?.replace('_', ' ').toUpperCase() || 'AI GENERATED'}
                </Text>
              </View>
              <Text style={styles.coachingMessage}>{tip.message}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Coaching Tips Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start recording to receive personalized AI coaching tips throughout your day
          </Text>
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'moments':
        return renderMoments();
      case 'transcript':
        return renderTranscript();
      case 'coaching':
        return renderCoaching();
      default:
        return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationHeader 
          title="Continuous Recording" 
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing recording service...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader 
        title="Continuous Recording" 
        onBack={() => navigation.goBack()}
      />
      {renderTabBar()}
      {renderContent()}
      
      {/* AI Chat Overlay */}
      <AIChatOverlay 
        userProfile={userProfile}
        transcript={transcript}
        moments={moments}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  controlLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  recordButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  recordingActive: {
    backgroundColor: '#FF3B30',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  statusText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dangerButton: {
    backgroundColor: '#fff5f5',
    borderColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  coachingCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  coachingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  coachingTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  coachingSource: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  coachingMessage: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
}); 