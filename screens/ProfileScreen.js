import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import AIChatOverlay from '../components/AIChatOverlay';

export default function ProfileScreen({ navigation, route }) {
  // Mock data - in a real app, this would come from your backend
  const userProfile = route.params?.userProfile || {
    name: 'User',
    goals: ['Personal Growth'],
    challenges: ['General Challenges'],
    voiceTone: 'calm'
  };
  
  const userStats = {
    totalSessions: 12,
    currentStreak: 5,
    totalMinutes: 180,
    moodTrend: 'Improving',
    topThemes: ['Growth', 'Resilience', 'Self-awareness']
  };

  const recentSessions = [
    { date: '2024-01-15', duration: '15 min', theme: 'Work stress' },
    { date: '2024-01-14', duration: '12 min', theme: 'Personal growth' },
    { date: '2024-01-13', duration: '18 min', theme: 'Relationships' },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Profile</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Your Profile</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.totalSessions}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userStats.totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Trend</Text>
          <Text style={styles.moodText}>{userStats.moodTrend}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Themes</Text>
          <View style={styles.themesContainer}>
            {userStats.topThemes.map((theme, index) => (
              <View key={index} style={styles.themeTag}>
                <Text style={styles.themeText}>{theme}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {recentSessions.map((session, index) => (
            <View key={index} style={styles.sessionItem}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionDate}>{session.date}</Text>
                <Text style={styles.sessionDuration}>{session.duration}</Text>
              </View>
              <Text style={styles.sessionTheme}>{session.theme}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* AI Chat Overlay */}
      <AIChatOverlay 
        userProfile={userProfile}
        transcript={[]}
        moments={[]}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  moodText: {
    fontSize: 18,
    color: '#34C759',
    fontWeight: '600',
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  themeText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '500',
  },
  sessionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 15,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sessionDuration: {
    fontSize: 14,
    color: '#666',
  },
  sessionTheme: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
  },
}); 