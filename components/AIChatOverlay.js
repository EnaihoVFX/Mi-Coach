import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView,
  PanGestureHandler,
  State
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { generateCoachingInsights } from '../utils/geminiPrompt';
import { textToSpeech } from '../utils/elevenLabsAPI';
import continuousRecordingService from '../utils/continuousRecordingService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AIChatOverlay({ 
  userProfile, 
  transcript, 
  moments, 
  isVisible = true 
}) {
  const { theme, isLoading } = useTheme();
  
  if (isLoading) return null;
  
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
      error: '#FF3B30',
    }
  };

  if (!safeTheme || !safeTheme.colors) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Advanced animation values
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  // Wave animation values for listening effect
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
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
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isListening) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start wave animations
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave1, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(wave1, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(wave2, {
            toValue: 1,
            duration: 1500,
            delay: 500,
            useNativeDriver: true,
          }),
          Animated.timing(wave2, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(wave3, {
            toValue: 1,
            duration: 1500,
            delay: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(wave3, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      wave1.setValue(0);
      wave2.setValue(0);
      wave3.setValue(0);
      glowAnim.setValue(0);
    }
  }, [isListening]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const expandAnimation = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const collapseAnimation = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 100,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      
      // Pause continuous recording to avoid conflicts
      continuousRecordingService.pauseRecording();
      
      // Bounce animation for feedback
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.3,
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
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Could not start voice recording');
      setIsListening(false);
      // Resume continuous recording if AI chat recording fails
      continuousRecordingService.resumeRecording();
    }
  };

  const stopListening = async () => {
    if (!recording) return;

    try {
      setIsListening(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Resume continuous recording
      continuousRecordingService.resumeRecording();

      const demoTranscripts = [
        "I'm feeling a bit overwhelmed today and could use some guidance on managing my stress levels.",
        "I had a great conversation with my colleague but I'm still feeling anxious about the upcoming presentation.",
        "I'm proud of the progress I've made this week, but I'm also feeling tired and need some encouragement.",
        "I'm struggling with focus today and keep getting distracted by my phone and social media.",
        "I had a breakthrough moment where I realized I need to set better boundaries at work."
      ];
      
      const userMessage = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)];
      
      const userEntry = {
        id: Date.now(),
        type: 'user',
        text: userMessage,
        timestamp: new Date().toISOString(),
      };
      
      setConversation(prev => [...prev, userEntry]);
      await processWithAI(userMessage);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsListening(false);
      // Resume continuous recording even if there's an error
      continuousRecordingService.resumeRecording();
    }
  };

  const processWithAI = async (userMessage) => {
    setIsProcessing(true);
    
    try {
      const context = {
        userProfile,
        recentTranscript: transcript.slice(-5),
        moments: moments.slice(-3),
        userMessage
      };

      const aiResponse = await generateAIResponse(context);
      
      const aiEntry = {
        id: Date.now() + 1,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date().toISOString(),
      };
      
      setConversation(prev => [...prev, aiEntry]);
      
      // Animate the new message
      Animated.spring(fadeInAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      // Speak the response
      await speakResponse(aiResponse);
      
    } catch (error) {
      console.error('Error processing with AI:', error);
      Alert.alert('Error', 'Could not process your message');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIResponse = async (context) => {
    try {
      const prompt = `
You are ${context.userProfile?.name || 'the user'}'s personal AI coach.
Their goals: ${context.userProfile?.goals?.join(', ') || 'personal growth'}
Their challenges: ${context.userProfile?.challenges?.join(', ') || 'general challenges'}
They prefer a ${context.userProfile?.voiceTone || 'calm'} tone.

Recent context: ${context.userMessage}

Provide a supportive, actionable response (2-3 sentences) that:
1. Acknowledges their situation
2. Offers specific, helpful advice
3. Uses their preferred tone
4. Relates to their goals and challenges

Respond conversationally, as if you're having a real chat.
`;

      const response = await generateCoachingInsights(context.userMessage);
      return response.insights || "I understand how you're feeling. Let's work through this together. What specific aspect would you like to focus on right now?";
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm here to support you. Could you tell me more about what's on your mind?";
    }
  };

  const speakResponse = async (text) => {
    try {
      setIsSpeaking(true);
      await textToSpeech(text, userProfile?.voiceTone || 'calm');
    } catch (error) {
      console.error('Error speaking response:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleToggle = () => {
    if (isExpanded) {
      collapseAnimation();
      setTimeout(() => setIsExpanded(false), 200);
    } else {
      setIsExpanded(true);
      expandAnimation();
    }
  };

  const handleClose = () => {
    collapseAnimation();
    setTimeout(() => setIsExpanded(false), 200);
  };

  const renderFloatingButton = () => (
    <Animated.View
      style={[
        styles.floatingButton,
        {
          transform: [
            { scale: Animated.multiply(bounceAnim, pulseAnim) },
            { rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg']
            })}
          ],
          opacity: opacityAnim,
        }
      ]}
    >
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: glowAnim,
            transform: [{ scale: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.5]
            })}]
          }
        ]}
      />
      
      {/* Wave effects when listening */}
      {isListening && (
        <>
          <Animated.View
            style={[
              styles.waveEffect,
              {
                opacity: wave1,
                transform: [{ scale: wave1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2]
                })}]
              }
            ]}
          />
          <Animated.View
            style={[
              styles.waveEffect,
              {
                opacity: wave2,
                transform: [{ scale: wave2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2.5]
                })}]
              }
            ]}
          />
          <Animated.View
            style={[
              styles.waveEffect,
              {
                opacity: wave3,
                transform: [{ scale: wave3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 3]
                })}]
              }
            ]}
          />
        </>
      )}
      
      <TouchableOpacity
        style={[
          styles.floatingButtonInner,
          { backgroundColor: isListening ? safeTheme.colors.primary : safeTheme.colors.primary }
        ]}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={isListening ? "mic" : "chatbubbles"} 
          size={28} 
          color={safeTheme.colors.inverse} 
        />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderOverlay = () => (
    <Modal
      visible={isExpanded}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.modalCard,
          {
            opacity: opacityAnim,
            transform: [
              { translateY: slideUpAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor={safeTheme.colors.background} />
        
        {/* Background gradient */}
        <View style={[styles.backgroundGradient, { backgroundColor: safeTheme.colors.background }]} />
        
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            { backgroundColor: safeTheme.colors.surface },
            {
              transform: [{ translateY: fadeInAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0]
              })}]
            }
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="sparkles" size={24} color={safeTheme.colors.primary} />
              <Text style={[styles.headerTitle, { color: safeTheme.colors.primary }]}>AI Coach</Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: safeTheme.colors.textSecondary }]}>
              Your mental wellness companion
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: safeTheme.colors.card }]}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={safeTheme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Conversation */}
        <ScrollView 
          style={styles.conversationContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conversationContent}
        >
          {conversation.length === 0 ? (
            <Animated.View 
              style={[
                styles.welcomeMessage,
                { backgroundColor: safeTheme.colors.card },
                {
                  transform: [{ translateY: fadeInAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })}]
                }
              ]}
            >
              <View style={styles.welcomeIconContainer}>
                <Ionicons name="sparkles" size={48} color={safeTheme.colors.primary} />
              </View>
              <Text style={[styles.welcomeTitle, { color: safeTheme.colors.primary }]}>
                Hello! I'm your AI Coach
              </Text>
              <Text style={[styles.welcomeText, { color: safeTheme.colors.textSecondary }]}>
                I'm here to support your mental wellness journey. Tap the microphone to start a conversation.
              </Text>
              
              <View style={styles.welcomeFeatures}>
                <View style={[styles.featureItem, { backgroundColor: safeTheme.colors.surface }]}>
                  <Ionicons name="mic" size={22} color={safeTheme.colors.primary} />
                  <Text style={[styles.featureText, { color: safeTheme.colors.primary }]}>Voice conversations</Text>
                </View>
                <View style={[styles.featureItem, { backgroundColor: safeTheme.colors.surface }]}>
                  <Ionicons name="brain" size={22} color={safeTheme.colors.primary} />
                  <Text style={[styles.featureText, { color: safeTheme.colors.primary }]}>Personalized insights</Text>
                </View>
                <View style={[styles.featureItem, { backgroundColor: safeTheme.colors.surface }]}>
                  <Ionicons name="heart" size={22} color={safeTheme.colors.primary} />
                  <Text style={[styles.featureText, { color: safeTheme.colors.primary }]}>Emotional support</Text>
                </View>
              </View>
            </Animated.View>
          ) : (
            conversation.map((message, index) => (
              <Animated.View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.type === 'user' ? styles.userMessage : styles.aiMessage,
                  {
                    backgroundColor: message.type === 'user' ? safeTheme.colors.primary : safeTheme.colors.card,
                    transform: [{ translateY: fadeInAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })}]
                  }
                ]}
              >
                <View style={styles.messageHeader}>
                  <View style={styles.messageAvatar}>
                    <Ionicons 
                      name={message.type === 'user' ? 'person' : 'sparkles'} 
                      size={16} 
                      color={message.type === 'user' ? safeTheme.colors.inverse : safeTheme.colors.primary} 
                    />
                  </View>
                  <Text style={[
                    styles.messageSender,
                    { color: message.type === 'user' ? safeTheme.colors.inverse : safeTheme.colors.textSecondary }
                  ]}>
                    {message.type === 'user' ? userProfile?.name || 'You' : 'AI Coach'}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    { color: message.type === 'user' ? safeTheme.colors.inverse : safeTheme.colors.textSecondary }
                  ]}>
                    {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}
                  </Text>
                </View>
                <Text style={[
                  styles.messageText,
                  { color: message.type === 'user' ? safeTheme.colors.inverse : safeTheme.colors.text }
                ]}>
                  {message.text}
                </Text>
              </Animated.View>
            ))
          )}
          
          {isProcessing && (
            <Animated.View
              style={[
                styles.typingIndicator,
                { backgroundColor: safeTheme.colors.card },
                {
                  transform: [{ translateY: fadeInAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })}]
                }
              ]}
            >
              <View style={styles.typingDots}>
                <Animated.View style={[styles.typingDot, { backgroundColor: safeTheme.colors.primary }]} />
                <Animated.View style={[styles.typingDot, { backgroundColor: safeTheme.colors.primary }]} />
                <Animated.View style={[styles.typingDot, { backgroundColor: safeTheme.colors.primary }]} />
              </View>
              <Text style={[styles.typingText, { color: safeTheme.colors.textSecondary }]}>
                AI Coach is thinking...
              </Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Voice Control */}
        <Animated.View 
          style={[
            styles.voiceControl,
            { backgroundColor: safeTheme.colors.surface },
            {
              transform: [{ translateY: fadeInAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })}]
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.voiceButton,
              { backgroundColor: isListening ? safeTheme.colors.error : safeTheme.colors.primary },
              {
                transform: [{ scale: isListening ? pulseAnim : bounceAnim }]
              }
            ]}
            onPress={isListening ? stopListening : startListening}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isListening ? "stop" : "mic"} 
              size={32} 
              color={safeTheme.colors.inverse} 
            />
          </TouchableOpacity>
          <Text style={[styles.voiceLabel, { color: safeTheme.colors.textSecondary }]}>
            {isListening ? 'Tap to stop' : 'Tap to speak'}
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  if (!isVisible) return null;

  const styles = StyleSheet.create({
    floatingButton: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
      backgroundColor: 'transparent',
      zIndex: 100,
    },
    floatingButtonInner: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      borderRadius: 35,
      shadowColor: '#fff',
      shadowOffset: { width: -3, height: -3 },
      shadowOpacity: 0.8,
      shadowRadius: 6,
      elevation: 4,
    },
    glowEffect: {
      position: 'absolute',
      top: -5,
      left: -5,
      right: -5,
      bottom: -5,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    waveEffect: {
      position: 'absolute',
      top: -10,
      left: -10,
      right: -10,
      bottom: -10,
      borderRadius: 45,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    overlay: {
      flex: 1,
    },
    backgroundGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 24,
      paddingTop: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0, 0, 0, 0.05)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 4,
      marginBottom: 12,
    },
    headerContent: {
      flex: 1,
    },
    headerTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      marginLeft: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      fontWeight: '400',
    },
    closeButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    conversationContainer: {
      flex: 1,
    },
    conversationContent: {
      padding: 24,
      paddingBottom: 120,
    },
    welcomeMessage: {
      alignItems: 'center',
      padding: 32,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    },
    welcomeIconContainer: {
      alignItems: 'center',
      marginBottom: 24,
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    welcomeTitle: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 16,
      textAlign: 'center',
    },
    welcomeText: {
      fontSize: 18,
      textAlign: 'center',
      lineHeight: 28,
      marginBottom: 32,
      fontWeight: '400',
    },
    welcomeFeatures: {
      width: '100%',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    featureText: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 12,
    },
    messageContainer: {
      marginVertical: 12,
      padding: 20,
      borderRadius: 24,
      maxWidth: '85%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    userMessage: {
      alignSelf: 'flex-end',
      marginLeft: '15%',
    },
    aiMessage: {
      alignSelf: 'flex-start',
      marginRight: '15%',
    },
    messageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    messageAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    messageSender: {
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
    },
    messageTime: {
      fontSize: 12,
      fontWeight: '400',
    },
    messageText: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
    },
    typingIndicator: {
      padding: 20,
      borderRadius: 24,
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginRight: '15%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    typingDots: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 3,
    },
    typingText: {
      fontSize: 14,
      fontWeight: '500',
    },
    voiceControl: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingVertical: 24,
      paddingBottom: 40,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: 'rgba(0, 0, 0, 0.05)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    voiceButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
    voiceLabel: {
      fontSize: 16,
      fontWeight: '600',
    },
    modalCard: {
      width: '95%',
      maxWidth: 500,
      maxHeight: '90%',
      alignSelf: 'center',
      marginVertical: 30,
      borderRadius: 32,
      overflow: 'hidden',
      backgroundColor: safeTheme.colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 16,
    },
  });

  return (
    <>
      {renderFloatingButton()}
      {renderOverlay()}
    </>
  );
} 