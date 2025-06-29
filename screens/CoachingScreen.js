import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { getNeumorphicShadows } from '../utils/theme';
import { playElevenLabsAudio } from '../utils/elevenLabsAPI';

const { width, height } = Dimensions.get('window');

const CoachingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [coachingHistory, setCoachingHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [showTodayOnly, setShowTodayOnly] = useState(true);

  // Mock coaching data - in real app, this would come from storage/API
  const mockCoachingData = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      message: "I noticed you've been working for a while. Remember to take a 5-minute break to stretch and refresh your mind. This will help maintain your focus and reduce stress.",
      audioUrl: null, // Would be generated from ElevenLabs
      type: 'break_reminder'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      message: "Great job staying focused! I heard you mention feeling overwhelmed earlier. Try taking three deep breaths - inhale for 4 counts, hold for 4, exhale for 6. This simple technique can help reset your nervous system.",
      audioUrl: null,
      type: 'breathing_tip'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      message: "I sense some tension in your voice. Would you like to take a moment to identify what's causing this stress? Sometimes just naming our emotions can help us feel more in control.",
      audioUrl: null,
      type: 'emotional_support'
    }
  ];

  useEffect(() => {
    setCoachingHistory(mockCoachingData);
  }, []);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const playCoachingAudio = async (message) => {
    try {
      if (isPlaying && currentAudio) {
        await currentAudio.stopAsync();
        setIsPlaying(false);
        setCurrentAudio(null);
        return;
      }

      setIsPlaying(true);
      const audioUrl = await playElevenLabsAudio(message, 'Adam');
      setCurrentAudio(audioUrl);
      
      // Reset after audio finishes
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentAudio(null);
      }, 10000); // Approximate duration
      
    } catch (error) {
      console.error('Error playing coaching audio:', error);
      Alert.alert('Audio Error', 'Unable to play coaching audio');
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  const filteredHistory = showTodayOnly 
    ? coachingHistory.filter(item => {
        const today = new Date();
        const itemDate = new Date(item.timestamp);
        return itemDate.toDateString() === today.toDateString();
      })
    : coachingHistory;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'break_reminder':
        return 'timer-outline';
      case 'breathing_tip':
        return 'leaf-outline';
      case 'emotional_support':
        return 'heart-outline';
      default:
        return 'bulb-outline';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'break_reminder':
        return theme.coachingBreak;
      case 'breathing_tip':
        return theme.coachingBreathing;
      case 'emotional_support':
        return theme.coachingEmotional;
      default:
        return theme.coachingLearning;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>AI Coaching</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Toggle */}
      <View style={[styles.filterContainer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showTodayOnly && { backgroundColor: theme.colors.accent }
          ]}
          onPress={() => setShowTodayOnly(true)}
        >
          <Text style={[
            styles.filterText,
            { color: showTodayOnly ? theme.colors.inverse : theme.colors.secondary }
          ]}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !showTodayOnly && { backgroundColor: theme.colors.accent }
          ]}
          onPress={() => setShowTodayOnly(false)}
        >
          <Text style={[
            styles.filterText,
            { color: !showTodayOnly ? theme.colors.inverse : theme.colors.secondary }
          ]}>
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Coaching History */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.tertiary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {showTodayOnly 
                ? "No coaching tips for today yet. I'm listening and will provide guidance when needed!"
                : "No coaching history yet. Start using the app to receive personalized AI coaching."
              }
            </Text>
          </View>
        ) : (
          filteredHistory.map((coaching) => (
            <View key={coaching.id} style={[styles.coachingCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.coachingHeader}>
                <View style={styles.coachingMeta}>
                  <View style={[
                    styles.typeIcon,
                    { backgroundColor: getTypeColor(coaching.type) }
                  ]}>
                    <Ionicons 
                      name={getTypeIcon(coaching.type)} 
                      size={16} 
                      color="white" 
                    />
                  </View>
                  <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
                    {formatTime(coaching.timestamp)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.playButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => playCoachingAudio(coaching.message)}
                >
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.coachingMessage, { color: theme.colors.primary }]}>
                {coaching.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 21,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  coachingCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  coachingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  coachingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 14,
    fontWeight: '500',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachingMessage: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
});

export default CoachingScreen; 