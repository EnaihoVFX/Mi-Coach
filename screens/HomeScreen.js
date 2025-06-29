import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  Animated,
  Dimensions,
  StatusBar,
  Switch,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { getNeumorphicShadows, getCardStyles, getButtonStyles } from '../utils/theme';
import Timeline from '../components/Timeline';
import CoachingCard from '../components/CoachingCard';
import AIChatOverlay from '../components/AIChatOverlay';
import AudioPlayer from '../components/AudioPlayer';
import { generateCoachingInsights } from '../utils/geminiPrompt';
import { checkStaticNudges, generateContextualNudge } from '../utils/nudgeEngine';
import { testTranscriptsAndElevenLabs, testAIChatFlow } from '../utils/testIntegration';
import continuousRecordingService from '../utils/continuousRecordingService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HomeScreen({ navigation, route }) {
  const { theme, currentTheme, setTheme } = useTheme();
  
  // Fallback theme in case theme is not loaded
  const safeTheme = theme || {
    colors: {
      background: '#F0F0F3',
      surface: '#F0F0F3',
      card: '#F0F0F3',
      text: '#1C1C1E',
      textSecondary: '#8E8E93',
      primary: '#007AFF',
      shadow: 'rgba(0, 0, 0, 0.1)',
      border: '#E5E5EA',
      inverse: '#FFFFFF',
      accent: '#FF9500',
      tertiary: '#8E8E93',
    }
  };
  
  // Don't render if theme is not available
  if (!safeTheme || !safeTheme.colors) {
    return null;
  }
  
  const [userProfile, setUserProfile] = useState(route.params?.userProfile || {
    name: 'User',
    goals: ['Personal Growth'],
    challenges: ['General Challenges'],
    voiceTone: 'calm',
    theme: 'light'
  });
  const [transcript, setTranscript] = useState([]);
  const [coaching, setCoaching] = useState(null);
  const [recentNudges, setRecentNudges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [realTimeTranscript, setRealTimeTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(null);
  const [showVoiceFeedbackModal, setShowVoiceFeedbackModal] = useState(false);
  const audioPlayerRef = useRef(null);
  const [testInput, setTestInput] = useState('');
  const [showTestInput, setShowTestInput] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Load mock transcript on component mount
  useEffect(() => {
    loadMockTranscript();
    startAnimations();
  }, []);

  // Apply user's theme preference
  useEffect(() => {
    if (userProfile.theme && userProfile.theme !== currentTheme) {
      setTheme(userProfile.theme);
    }
  }, [userProfile.theme, currentTheme]);

  // Real-time transcript logic
  useEffect(() => {
    let initialized = false;
    if (isRealTimeEnabled) {
      (async () => {
        try {
          await continuousRecordingService.initialize(userProfile, {
            onTranscriptUpdate: (newTranscriptArr) => {
              if (newTranscriptArr && newTranscriptArr.length > 0) {
                setRealTimeTranscript(newTranscriptArr[newTranscriptArr.length - 1].text);
              }
            },
            onNudgeTriggered: (nudge) => {
              setRecentNudges(prev => [...prev, nudge]);
              Alert.alert('Coaching Tip', nudge.message, [{ text: 'Got it!' }]);
            },
            onVoiceFeedback: (feedback) => {
              // Set voice feedback and show modal
              setVoiceFeedback(feedback);
              setShowVoiceFeedbackModal(true);
              
              // Add to recent nudges
              setRecentNudges(prev => [...prev, {
                id: Date.now().toString(),
                message: feedback.text,
                type: 'voice_feedback',
                timestamp: feedback.timestamp
              }]);
            },
          });
          initialized = true;
          // Start real-time recording
          await continuousRecordingService.startRecording();
          setIsRecording(true);
        } catch (error) {
          setIsRealTimeEnabled(false);
          setIsRecording(false);
          setRealTimeTranscript('');
          alert('Failed to start real-time transcript: ' + error.message);
        }
      })();
    } else {
      if (isRecording) {
        continuousRecordingService.stopRecording();
        setIsRecording(false);
      }
      setRealTimeTranscript('');
    }
    return () => {
      if (initialized || isRecording) {
        continuousRecordingService.stopRecording();
        setIsRecording(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealTimeEnabled]);

  // Auto-play voice feedback when modal appears
  useEffect(() => {
    if (showVoiceFeedbackModal && voiceFeedback && audioPlayerRef.current) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        if (audioPlayerRef.current && audioPlayerRef.current.loadAndPlayAudio) {
          audioPlayerRef.current.loadAndPlayAudio();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [showVoiceFeedbackModal, voiceFeedback]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation for accent elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadMockTranscript = async () => {
    try {
      const mockData = require('../data/mockTranscript.json');
      setTranscript(mockData);
    } catch (error) {
      console.error('Error loading mock transcript:', error);
    }
  };

  const handleNudgeTrigger = (nudge) => {
    setRecentNudges(prev => [...prev, nudge]);
    console.log('Nudge triggered:', nudge);
  };

  const generateDailyCoaching = async () => {
    if (transcript.length === 0) {
      Alert.alert('No Data', 'Please add some reflections first.');
      return;
    }

    setIsLoading(true);
    
    // Bounce animation for feedback
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

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

  const handleCoachingFeedback = (feedback) => {
    console.log('Coaching feedback:', feedback);
  };

  const addNewEntry = () => {
    navigation.navigate('Reflect', { userProfile });
  };

  const toggleRealTimeTranscript = () => {
    setIsRealTimeEnabled((prev) => !prev);
  };

  // Test voice feedback with custom input
  const testVoiceFeedback = async () => {
    if (!testInput.trim()) return;

    try {
      console.log('🧪 Testing voice feedback with:', testInput);
      
      // Analyze the test input
      await continuousRecordingService.analyzeTranscriptForIssues(testInput);
      
      // Clear input
      setTestInput('');
      setShowTestInput(false);
      
    } catch (error) {
      console.error('Error testing voice feedback:', error);
    }
  };

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header, 
        { 
          backgroundColor: safeTheme.colors.surface,
          shadowColor: safeTheme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}
    >
      <View style={styles.headerContent}>
        <Text style={[styles.greeting, { color: safeTheme.colors.text }]}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {userProfile.name}! 👋
        </Text>
        <Text style={[styles.subtitle, { color: safeTheme.colors.textSecondary }]}>
          Ready to reflect on your day?
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.profileButton, { backgroundColor: safeTheme.colors.primary }]}
        onPress={() => navigation.navigate('Profile', { userProfile })}
        activeOpacity={0.8}
      >
        <Ionicons name="person" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRealTimeToggle = () => (
    <Animated.View 
      style={[
        styles.realTimeCard, 
        { 
          backgroundColor: safeTheme.colors.card,
          shadowColor: safeTheme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}
    >
      <View style={styles.realTimeHeader}>
        <View style={styles.realTimeTitleContainer}>
          <Ionicons 
            name={isRealTimeEnabled ? "radio" : "radio-outline"} 
            size={20} 
            color={isRealTimeEnabled ? safeTheme.colors.primary : safeTheme.colors.textSecondary} 
          />
          <Text style={[styles.realTimeTitle, { color: safeTheme.colors.text }]}>
            Real-time Transcript
          </Text>
        </View>
        <Switch
          value={isRealTimeEnabled}
          onValueChange={toggleRealTimeTranscript}
          trackColor={{ false: safeTheme.colors.border, true: safeTheme.colors.primary }}
          thumbColor={isRealTimeEnabled ? "#FFFFFF" : safeTheme.colors.textSecondary}
        />
      </View>
      
      {isRealTimeEnabled && (
        <View style={[styles.realTimeContent, { backgroundColor: safeTheme.colors.surface }]}>
          {/* Recording Status */}
          <View style={styles.recordingStatusContainer}>
            <View style={[styles.recordingIndicator, { backgroundColor: isRecording ? safeTheme.colors.primary : safeTheme.colors.textSecondary }]} />
            <Text style={[styles.recordingStatusText, { color: safeTheme.colors.text }]}>
              {isRecording ? 'Recording...' : 'Processing...'}
            </Text>
          </View>
          
          {/* Test Input Section */}
          <View style={styles.testInputContainer}>
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: safeTheme.colors.primary }]}
              onPress={() => setShowTestInput(!showTestInput)}
              activeOpacity={0.8}
            >
              <Text style={styles.testButtonText}>
                {showTestInput ? 'Hide Test Input' : 'Test Voice Feedback'}
              </Text>
            </TouchableOpacity>
            
            {showTestInput && (
              <View style={styles.testInputContent}>
                <TextInput
                  style={[
                    styles.testInput,
                    { 
                      color: safeTheme.colors.text,
                      backgroundColor: safeTheme.colors.background,
                      borderColor: safeTheme.colors.border
                    }
                  ]}
                  placeholder="Type a thought to test voice feedback..."
                  placeholderTextColor={safeTheme.colors.textSecondary}
                  value={testInput}
                  onChangeText={setTestInput}
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity
                  style={[
                    styles.sendTestButton,
                    { backgroundColor: safeTheme.colors.primary }
                  ]}
                  onPress={testVoiceFeedback}
                  disabled={!testInput.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sendTestButtonText}>Test</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Current Transcript Display */}
          {realTimeTranscript && (
            <View style={styles.currentThoughtContainer}>
              <Text style={[styles.currentThoughtLabel, { color: safeTheme.colors.textSecondary }]}>
                Current Transcript:
              </Text>
              <Text style={[styles.currentThoughtText, { color: safeTheme.colors.text }]}>
                "{realTimeTranscript}"
              </Text>
            </View>
          )}
          
          {/* Recent Nudges */}
          {recentNudges.length > 0 && (
            <View style={styles.recentThoughtsContainer}>
              <Text style={[styles.recentThoughtsLabel, { color: safeTheme.colors.textSecondary }]}>
                Recent Insights:
              </Text>
              {recentNudges.slice(-3).map((nudge, index) => (
                <Text key={index} style={[styles.recentThoughtText, { color: safeTheme.colors.text }]}>
                  • {nudge.message}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View 
      style={[
        styles.card, 
        { 
          backgroundColor: safeTheme.colors.card,
          shadowColor: safeTheme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}
    >
      <View style={styles.cardTitleContainer}>
        <Animated.View style={{ transform: [{ rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        }) }] }}>
          <Ionicons name="flash" size={20} color={safeTheme.colors.primary} />
        </Animated.View>
        <Text style={[styles.cardTitle, { color: safeTheme.colors.text }]}> Quick Actions</Text>
      </View>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={[
            styles.actionCard, 
            { 
              backgroundColor: safeTheme.colors.surface,
              shadowColor: safeTheme.colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }
          ]}
          onPress={addNewEntry}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={24} color={safeTheme.colors.primary} />
          <Text style={[styles.actionText, { color: safeTheme.colors.text }]}>Add Reflection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionCard, 
            { 
              backgroundColor: safeTheme.colors.surface,
              shadowColor: safeTheme.colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }
          ]}
          onPress={() => navigation.navigate('ContinuousRecording', { userProfile })}
          activeOpacity={0.8}
        >
          <Ionicons name="mic" size={24} color={safeTheme.colors.primary} />
          <Text style={[styles.actionText, { color: safeTheme.colors.text }]}>Voice Recording</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionCard, 
            { 
              backgroundColor: safeTheme.colors.surface,
              shadowColor: safeTheme.colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }
          ]}
          onPress={() => navigation.navigate('Coaching', { userProfile })}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubbles" size={24} color={safeTheme.colors.primary} />
          <Text style={[styles.actionText, { color: safeTheme.colors.text }]}>AI Coaching</Text>
        </TouchableOpacity>
      </View>
      
      {/* Daily Insights Button - Full Width */}
      <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
        <TouchableOpacity 
          style={[
            styles.insightsButton, 
            { 
              backgroundColor: safeTheme.colors.primary,
              shadowColor: safeTheme.colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
            }
          ]}
          onPress={generateDailyCoaching}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <View style={styles.insightsButtonContent}>
            {isLoading ? (
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
            ) : (
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            )}
            <Text style={[styles.insightsButtonText, { color: "#FFFFFF" }]}>
              {isLoading ? 'Generating Daily Insights...' : 'Generate Daily Insights'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );

  const renderTodaySummary = () => (
    <Animated.View 
      style={[
        styles.card, 
        { 
          backgroundColor: safeTheme.colors.card,
          shadowColor: safeTheme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}
    >
      <View style={styles.cardTitleContainer}>
        <Ionicons name="analytics" size={20} color={safeTheme.colors.primary} />
        <Text style={[styles.cardTitle, { color: safeTheme.colors.text }]}> Today's Summary</Text>
      </View>
      <View style={styles.summaryGrid}>
        <Animated.View 
          style={[
            styles.summaryItem, 
            { 
              backgroundColor: safeTheme.colors.surface,
              shadowColor: safeTheme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            },
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Text style={[styles.summaryNumber, { color: safeTheme.colors.primary }]}>{transcript.length}</Text>
          <Text style={[styles.summaryLabel, { color: safeTheme.colors.textSecondary }]}>Reflections</Text>
        </Animated.View>
        <Animated.View 
          style={[
            styles.summaryItem, 
            { 
              backgroundColor: safeTheme.colors.surface,
              shadowColor: safeTheme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            },
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Text style={[styles.summaryNumber, { color: safeTheme.colors.primary }]}>{recentNudges.length}</Text>
          <Text style={[styles.summaryLabel, { color: safeTheme.colors.textSecondary }]}>Tips Received</Text>
        </Animated.View>
        <Animated.View 
          style={[
            styles.summaryItem, 
            { 
              backgroundColor: safeTheme.colors.surface,
              shadowColor: safeTheme.colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            },
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Text style={[styles.summaryNumber, { color: safeTheme.colors.primary }]}>
            {coaching ? '1' : '0'}
          </Text>
          <Text style={[styles.summaryLabel, { color: safeTheme.colors.textSecondary }]}>Coaching Sessions</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );

  const renderRecentActivity = () => (
    <Animated.View 
      style={[
        styles.card, 
        { 
          backgroundColor: safeTheme.colors.card,
          shadowColor: safeTheme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="list" size={20} color={safeTheme.colors.primary} />
          <Text style={[styles.cardTitle, { color: safeTheme.colors.text }]}> Recent Activity</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Reflect', { userProfile })}>
          <Text style={[styles.viewAllButton, { color: safeTheme.colors.primary }]}>View All</Text>
        </TouchableOpacity>
      </View>
      
      {transcript.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text" size={48} color={safeTheme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: safeTheme.colors.textSecondary }]}>No reflections yet</Text>
          <Text style={[styles.emptySubtext, { color: safeTheme.colors.textSecondary }]}>Add your first reflection to get started</Text>
        </View>
      ) : (
        <View>
          {transcript.slice(-3).map((entry, index) => (
            <View key={index} style={[styles.activityItem, { backgroundColor: safeTheme.colors.surface }]}>
              <View style={styles.activityIcon}>
                <Ionicons name="chatbubble" size={16} color={safeTheme.colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: safeTheme.colors.text }]} numberOfLines={2}>
                  {entry.text}
                </Text>
                <Text style={[styles.activityTime, { color: safeTheme.colors.textSecondary }]}>
                  {entry.timestamp}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );

  const renderCoachingSection = () => {
    if (!coaching) return null;

    return (
      <Animated.View 
        style={[
          styles.card, 
          { 
            backgroundColor: safeTheme.colors.card,
            shadowColor: safeTheme.colors.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
          },
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}
      >
        <View style={styles.cardTitleContainer}>
          <Ionicons name="bulb" size={20} color={safeTheme.colors.primary} />
          <Text style={[styles.cardTitle, { color: safeTheme.colors.text }]}> Your Coaching</Text>
        </View>
        <CoachingCard 
          coaching={coaching}
          userProfile={userProfile}
          onFeedback={handleCoachingFeedback}
          onRefresh={generateDailyCoaching}
        />
      </Animated.View>
    );
  };

  const renderRecentTips = () => (
    <Animated.View 
      style={[
        styles.card, 
        { 
          backgroundColor: safeTheme.colors.card,
          shadowColor: safeTheme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideUpAnim }]
        }
      ]}
    >
      <View style={styles.cardTitleContainer}>
        <Ionicons name="bulb" size={20} color={safeTheme.colors.primary} />
        <Text style={[styles.cardTitle, { color: safeTheme.colors.text }]}> Recent Tips</Text>
      </View>
      
      {recentNudges.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bulb" size={48} color={safeTheme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: safeTheme.colors.textSecondary }]}>No tips yet</Text>
          <Text style={[styles.emptySubtext, { color: safeTheme.colors.textSecondary }]}>Start using the app to receive personalized tips</Text>
        </View>
      ) : (
        <View>
          {recentNudges.slice(-3).map((nudge, index) => (
            <View key={index} style={[styles.nudgeItem, { backgroundColor: safeTheme.colors.surface }]}>
              <View style={styles.nudgeIcon}>
                <Ionicons name="bulb" size={20} color={safeTheme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.nudgeText, { color: safeTheme.colors.text }]}>
                  {nudge.message}
                </Text>
                <Text style={[styles.nudgeTime, { color: safeTheme.colors.textSecondary }]}>
                  {new Date(nudge.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderRadius: 20,
      borderWidth: 0,
    },
    headerContent: {
      flex: 1,
    },
    greeting: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '400',
    },
    profileButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 0,
    },
    card: {
      borderRadius: 24,
      padding: 24,
      marginBottom: 24,
      borderWidth: 0,
    },
    cardTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginLeft: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    viewAllButton: {
      fontSize: 16,
      fontWeight: '600',
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionCard: {
      width: '48%',
      aspectRatio: 1,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 0,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 12,
      textAlign: 'center',
    },
    summaryGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
      padding: 20,
      borderRadius: 16,
      marginHorizontal: 4,
      borderWidth: 0,
    },
    summaryNumber: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
    },
    emptyState: {
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      fontWeight: '400',
      textAlign: 'center',
    },
    nudgeItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 0,
    },
    nudgeIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    nudgeText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 22,
      marginBottom: 8,
    },
    nudgeTime: {
      fontSize: 12,
      fontWeight: '400',
    },
    realTimeCard: {
      borderRadius: 24,
      padding: 24,
      marginBottom: 24,
      borderWidth: 0,
    },
    realTimeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    realTimeTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    realTimeTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginLeft: 12,
    },
    realTimeContent: {
      padding: 20,
    },
    recordingStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    recordingIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 8,
    },
    recordingStatusText: {
      fontSize: 16,
      fontWeight: '500',
    },
    currentThoughtContainer: {
      marginBottom: 16,
    },
    currentThoughtLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    currentThoughtText: {
      fontSize: 14,
      fontWeight: '500',
    },
    recentThoughtsContainer: {
      marginBottom: 16,
    },
    recentThoughtsLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    recentThoughtText: {
      fontSize: 14,
      fontWeight: '500',
    },
    insightsButton: {
      width: '100%',
      padding: 20,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 0,
    },
    insightsButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    insightsButtonText: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 12,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 0,
    },
    activityIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    activityContent: {
      flex: 1,
    },
    activityText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 22,
      marginBottom: 8,
    },
    activityTime: {
      fontSize: 12,
      fontWeight: '400',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 20,
    },
    voiceFeedbackModal: {
      width: '100%',
      maxWidth: 400,
      padding: 24,
      borderRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    voiceFeedbackHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    voiceFeedbackTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginLeft: 12,
    },
    voiceFeedbackText: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
      marginBottom: 24,
    },
    voiceFeedbackActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    audioPlayer: {
      flex: 1,
      marginRight: 12,
    },
    closeButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 16,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    testInputContainer: {
      marginBottom: 16,
    },
    testButton: {
      padding: 12,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: 8,
    },
    testButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    testInputContent: {
      marginTop: 8,
    },
    testInput: {
      padding: 12,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 8,
      fontSize: 14,
    },
    sendTestButton: {
      padding: 12,
      borderRadius: 16,
      alignItems: 'center',
    },
    sendTestButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]}>
      <StatusBar barStyle={safeTheme.colors.background === '#1C1C1E' ? 'light-content' : 'dark-content'} backgroundColor={safeTheme.colors.background} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderRealTimeToggle()}
        {renderQuickActions()}
        {renderTodaySummary()}
        {renderRecentActivity()}
        {renderCoachingSection()}
        {renderRecentTips()}
      </ScrollView>
      
      {/* AI Chat Overlay */}
      <AIChatOverlay 
        userProfile={userProfile}
        transcript={transcript}
        moments={recentNudges}
        isVisible={true}
      />

      {/* Voice Feedback Modal */}
      <Modal
        visible={showVoiceFeedbackModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVoiceFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.voiceFeedbackModal,
            {
              backgroundColor: safeTheme.colors.card,
              shadowColor: safeTheme.colors.shadow,
            }
          ]}>
            <View style={styles.voiceFeedbackHeader}>
              <Ionicons name="heart" size={24} color={safeTheme.colors.primary} />
              <Text style={[styles.voiceFeedbackTitle, { color: safeTheme.colors.text }]}>
                Voice Support
              </Text>
            </View>
            
            {voiceFeedback && (
              <>
                <Text style={[styles.voiceFeedbackText, { color: safeTheme.colors.text }]}>
                  {voiceFeedback.text}
                </Text>
                
                <View style={styles.voiceFeedbackActions}>
                  <AudioPlayer
                    audioUri={voiceFeedback.audioUri}
                    style={styles.audioPlayer}
                    ref={audioPlayerRef}
                  />
                  
                  <TouchableOpacity
                    style={[
                      styles.closeButton,
                      { backgroundColor: safeTheme.colors.surface }
                    ]}
                    onPress={() => setShowVoiceFeedbackModal(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.closeButtonText, { color: safeTheme.colors.text }]}>
                      Got it
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 