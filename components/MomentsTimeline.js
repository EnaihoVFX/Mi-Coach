import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function MomentsTimeline({ moments, onMomentPress }) {
  const getMomentIcon = (type) => {
    switch (type) {
      case 'insight':
        return '💡';
      case 'challenge':
        return '⚡';
      case 'achievement':
        return '🎉';
      case 'struggle':
        return '🤔';
      case 'reflection':
        return '🧠';
      default:
        return '📝';
    }
  };

  const getMomentColor = (type) => {
    switch (type) {
      case 'insight':
        return '#4CAF50';
      case 'challenge':
        return '#FF9800';
      case 'achievement':
        return '#2196F3';
      case 'struggle':
        return '#F44336';
      case 'reflection':
        return '#9C27B0';
      default:
        return '#607D8B';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!moments || moments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Moments Yet</Text>
        <Text style={styles.emptySubtitle}>
          Significant moments will appear here as they're detected during your day
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {moments.map((moment, index) => (
        <TouchableOpacity
          key={moment.id}
          style={styles.momentCard}
          onPress={() => onMomentPress && onMomentPress(moment)}
        >
          <View style={styles.momentHeader}>
            <View style={styles.momentIconContainer}>
              <Text style={styles.momentIcon}>{getMomentIcon(moment.type)}</Text>
            </View>
            <View style={styles.momentInfo}>
              <Text style={styles.momentType}>
                {moment.type.charAt(0).toUpperCase() + moment.type.slice(1)} Moment
              </Text>
              <Text style={styles.momentTime}>
                {formatTime(moment.timestamp)} • {formatDate(moment.timestamp)}
              </Text>
            </View>
            <View style={styles.significanceContainer}>
              <View 
                style={[
                  styles.significanceBar, 
                  { 
                    backgroundColor: getMomentColor(moment.type),
                    width: `${moment.significance * 100}%`
                  }
                ]} 
              />
              <Text style={styles.significanceText}>
                {Math.round(moment.significance * 100)}%
              </Text>
            </View>
          </View>
          
          <Text style={styles.momentText} numberOfLines={3}>
            "{moment.transcript}"
          </Text>
          
          {moment.keywords && moment.keywords.length > 0 && (
            <View style={styles.keywordsContainer}>
              {moment.keywords.map((keyword, idx) => (
                <View 
                  key={idx} 
                  style={[
                    styles.keywordTag,
                    { backgroundColor: getMomentColor(moment.type) + '20' }
                  ]}
                >
                  <Text style={[
                    styles.keywordText,
                    { color: getMomentColor(moment.type) }
                  ]}>
                    {keyword}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
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
  momentCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  momentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  momentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  momentIcon: {
    fontSize: 20,
  },
  momentInfo: {
    flex: 1,
  },
  momentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  momentTime: {
    fontSize: 12,
    color: '#666',
  },
  significanceContainer: {
    alignItems: 'flex-end',
  },
  significanceBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
    minWidth: 20,
  },
  significanceText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  momentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keywordTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordText: {
    fontSize: 11,
    fontWeight: '500',
  },
}); 