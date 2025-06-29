import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function TranscriptTimeline({ transcripts }) {
  if (!transcripts || transcripts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reflection sessions yet</Text>
        <Text style={styles.emptySubtext}>Start your first session to see your timeline</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {transcripts.map((transcript, index) => (
        <View key={index} style={styles.timelineItem}>
          <View style={styles.timelineHeader}>
            <Text style={styles.date}>{transcript.date}</Text>
            <Text style={styles.duration}>{transcript.duration}</Text>
          </View>
          
          <View style={styles.contentContainer}>
            <Text style={styles.speaker}>You:</Text>
            <Text style={styles.userText}>{transcript.userText}</Text>
            
            {transcript.aiResponse && (
              <>
                <Text style={styles.speaker}>AI Coach:</Text>
                <Text style={styles.aiText}>{transcript.aiResponse}</Text>
              </>
            )}
          </View>
          
          {transcript.themes && transcript.themes.length > 0 && (
            <View style={styles.themesContainer}>
              {transcript.themes.map((theme, themeIndex) => (
                <View key={themeIndex} style={styles.themeTag}>
                  <Text style={styles.themeText}>{theme}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
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
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  timelineItem: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
  contentContainer: {
    marginBottom: 10,
  },
  speaker: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 8,
    marginBottom: 4,
  },
  userText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  aiText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '500',
  },
}); 