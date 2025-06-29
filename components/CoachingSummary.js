import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function CoachingSummary({ summary }) {
  if (!summary) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No summary available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Insights</Text>
        <Text style={styles.insightText}>{summary.insights}</Text>
      </View>

      {summary.themes && summary.themes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identified Themes</Text>
          <View style={styles.themesContainer}>
            {summary.themes.map((theme, index) => (
              <View key={index} style={styles.themeItem}>
                <Text style={styles.themeName}>{theme.name}</Text>
                <Text style={styles.themeDescription}>{theme.description}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {summary.recommendations && summary.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {summary.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationNumber}>{index + 1}.</Text>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      )}

      {summary.moodAnalysis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Analysis</Text>
          <View style={styles.moodContainer}>
            <Text style={styles.moodLabel}>Overall Sentiment:</Text>
            <Text style={[styles.moodValue, { color: getMoodColor(summary.moodAnalysis.sentiment) }]}>
              {summary.moodAnalysis.sentiment}
            </Text>
          </View>
          {summary.moodAnalysis.description && (
            <Text style={styles.moodDescription}>{summary.moodAnalysis.description}</Text>
          )}
        </View>
      )}

      {summary.actionItems && summary.actionItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Action Items</Text>
          {summary.actionItems.map((item, index) => (
            <View key={index} style={styles.actionItem}>
              <Text style={styles.actionNumber}>•</Text>
              <Text style={styles.actionText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  insightText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  themesContainer: {
    gap: 15,
  },
  themeItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    paddingLeft: 15,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  themeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  recommendationNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 10,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  moodValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moodDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  actionNumber: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 10,
    marginTop: 2,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
}); 