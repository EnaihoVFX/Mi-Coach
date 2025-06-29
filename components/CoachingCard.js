import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Animated,
  Dimensions
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

export default function CoachingCard({ coaching, userProfile, onFeedback }) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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

    // Start pulse animation for interactive elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
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

  const playCoachingAudio = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // Bounce animation for feedback
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert(
        'Voice Coaching',
        'Voice coaching would play here. In the full app, this would use ElevenLabs API to convert the coaching text to speech.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Could not play audio');
    }
  };

  const handleFeedback = (isPositive) => {
    if (onFeedback) {
      onFeedback({
        coachingId: coaching.id,
        isPositive,
        timestamp: new Date().toISOString()
      });
    }
    
    Alert.alert(
      'Thank you!',
      isPositive ? 'We\'re glad this was helpful!' : 'We\'ll work on improving this.',
      [{ text: 'OK' }]
    );
  };

  if (!coaching) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="sparkles" size={64} color={theme.colors.tertiary} />
        <Text style={[styles.emptyText, { color: theme.colors.primary }]}>No coaching available yet</Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
          Start using the app to receive personalized AI coaching
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Your Daily Coaching</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Based on your recent activity
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.colors.surface }]}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Day Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}> Day Summary</Text>
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{coaching.summary}</Text>
        </View>
      </View>

      {/* Coaching Tips */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}> Coaching Tips</Text>
        {coaching.tips.map((tip, index) => (
          <View key={index} style={[styles.tipContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.tipNumber}>
              <Text style={[styles.tipNumberText, { color: theme.colors.inverse }]}>{index + 1}</Text>
            </View>
            <Text style={[styles.tipText, { color: theme.colors.primary }]}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Mood Check */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}> Mood Check</Text>
        <View style={styles.moodSection}>
          <View style={[styles.moodContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.moodLabel, { color: theme.colors.textSecondary }]}>Overall Mood:</Text>
            <View style={styles.moodDisplay}>
              <Ionicons name={getMoodIcon(coaching.mood)} size={24} color={theme.colors.primary} />
              <Text style={[styles.moodDescription, { color: theme.colors.textSecondary }]}>
                {getMoodDescription(coaching.mood)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Items */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}> Action Items</Text>
        {coaching.actionItems.map((item, index) => (
          <View key={index} style={[styles.actionContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Feedback */}
      <View style={styles.feedbackSection}>
        <Text style={[styles.feedbackLabel, { color: theme.colors.primary }]}>Was this helpful?</Text>
        <View style={styles.feedbackButtons}>
          <TouchableOpacity style={[styles.feedbackButton, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="thumbs-up" size={16} color={theme.colors.inverse} />
            <Text style={[styles.feedbackText, { color: theme.colors.inverse }]}> Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.feedbackButton, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="thumbs-down" size={16} color={theme.colors.inverse} />
            <Text style={[styles.feedbackText, { color: theme.colors.inverse }]}> No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const getMoodColor = (sentiment) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return '#34C759';
    case 'negative':
      return '#FF3B30';
    case 'neutral':
      return '#8E8E93';
    default:
      return '#007AFF';
  }
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyContainer: {
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  moodValue: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  moodDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    marginLeft: 12,
  },
  feedbackContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  feedbackLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  feedbackButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  refreshButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  moodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
}); 