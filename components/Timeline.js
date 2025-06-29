import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

export default function Timeline({ transcript, onNudgeTrigger, userProfile }) {
  const { theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const checkForNudgeTriggers = (text) => {
    const triggers = {
      "can't focus": "Take 5 minutes. Breathe deeply, then refocus on one task.",
      "tired": "Try a quick stretch or walk around. Movement can boost your energy!",
      "stressed": "Take 3 deep breaths. Inhale for 4, hold for 4, exhale for 6.",
      "overwhelmed": "Break this down into smaller steps. What's the next right thing?",
      "anxious": "Ground yourself: Name 5 things you can see, 4 you can touch, 3 you can hear.",
      "procrastinating": "Start with just 2 minutes. Often that's all it takes to get going.",
      "doubt": "Remember your past successes. You've got this!",
      "late": "It's okay. Focus on what you can control right now."
    };

    const lowerText = text.toLowerCase();
    for (const [trigger, response] of Object.entries(triggers)) {
      if (lowerText.includes(trigger)) {
        return { trigger, response };
      }
    }
    return null;
  };

  const handleNudgePress = (nudge) => {
    Alert.alert(
      'Mindful Moment 💭',
      nudge.response,
      [
        { text: 'Thanks!', style: 'default' },
        { text: 'Save Tip', onPress: () => console.log('Tip saved') }
      ]
    );
    
    if (onNudgeTrigger) {
      onNudgeTrigger(nudge);
    }
  };

  const getMoodIcon = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('happy')) {
      return 'happy';
    } else if (lowerText.includes('tired') || lowerText.includes('exhausted')) {
      return 'bed';
    } else if (lowerText.includes('stressed') || lowerText.includes('anxious')) {
      return 'alert-circle';
    } else if (lowerText.includes('frustrated') || lowerText.includes('angry')) {
      return 'flame';
    } else if (lowerText.includes('sad') || lowerText.includes('down')) {
      return 'sad';
    }
    return 'chatbubble';
  };

  if (!transcript || transcript.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="document-text" size={64} color={theme.colors.tertiary} />
        <Text style={[styles.emptyTitle, { color: theme.colors.primary }]}>No transcript yet</Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
          Start recording to see your journey here
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Today's Journey</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {transcript.length} reflections • {formatDuration(totalDuration)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.colors.card }]}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Timeline Entries */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {transcript.map((entry, index) => (
          <View key={entry.id} style={[styles.timelineEntry, { backgroundColor: theme.colors.card }]}>
            {/* Time Stamp */}
            <View style={styles.timeContainer}>
              <Ionicons name="time" size={16} color={theme.colors.primary} />
              <Text style={[styles.timeText, { color: theme.colors.primary }]}>{entry.timestamp}</Text>
            </View>

            {/* Transcript Text */}
            <View style={styles.transcriptContainer}>
              <Ionicons name="chatbubble" size={16} color={theme.colors.textSecondary} />
              <Text 
                style={[styles.transcriptText, { color: theme.colors.primary }]}
                numberOfLines={3}
              >
                {entry.text}
              </Text>
            </View>

            {/* Mood and Insights */}
            {entry.mood && (
              <View style={styles.moodContainer}>
                <Ionicons name={getMoodIcon(entry.mood)} size={16} color={theme.colors.inverse} />
                <Text style={[styles.moodText, { color: theme.colors.textSecondary }]}>
                  {getMoodDescription(entry.mood)}
                </Text>
              </View>
            )}

            {/* AI Nudges */}
            {entry.nudges && entry.nudges.length > 0 && (
              <View style={styles.nudgeContainer}>
                <Ionicons name="bulb" size={16} color={theme.colors.inverse} />
                <Text style={[styles.nudgeText, { color: theme.colors.primary }]}>{entry.nudges[0].response}</Text>
              </View>
            )}

            {/* Divider */}
            {index < transcript.length - 1 && (
              <View style={[styles.divider, { backgroundColor: theme.colors.tertiary }]} />
            )}
          </View>
        ))}

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="analytics" size={24} color={theme.colors.primary} />
          <Text style={[styles.summaryTitle, { color: theme.colors.primary }]}>Ready for your reflection?</Text>
          <Text style={[styles.summarySubtitle, { color: theme.colors.textSecondary }]}>
            Take a moment to reflect on your day and receive personalized insights
          </Text>
          <TouchableOpacity
            style={[styles.reflectButton, { backgroundColor: theme.colors.primary }]}
            onPress={onReflect}
          >
            <Text style={[styles.reflectButtonText, { color: theme.colors.inverse }]}>Start Reflection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 24,
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
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  timelineItem: {
    marginHorizontal: 0,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  moodContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nudgeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    marginBottom: 16,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  nudgeContainer: {
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  nudgeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nudgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nudgeText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 20,
    opacity: 0.3,
  },
  summaryContainer: {
    marginHorizontal: 0,
    marginTop: 24,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  summarySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 24,
  },
}); 