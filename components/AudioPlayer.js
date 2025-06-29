import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTheme } from '../utils/ThemeContext';
import continuousRecordingService from '../utils/continuousRecordingService';

const AudioPlayer = forwardRef(({ audioUri, onPlay, onStop, style }, ref) => {
  const { theme } = useTheme();
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAndPlayAudio = async () => {
    try {
      setIsLoading(true);
      
      // Pause recording while audio is playing
      continuousRecordingService.pauseRecording();
      
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
      }

      // Load the audio from base64 URI
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);

      // Set up event listeners
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          // Resume recording when audio finishes
          setTimeout(() => {
            continuousRecordingService.resumeRecording();
          }, 1000); // Small delay to ensure audio is fully stopped
          if (onStop) onStop();
        }
      });

      if (onPlay) onPlay();

    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
      // Resume recording on error
      continuousRecordingService.resumeRecording();
      Alert.alert('Error', 'Failed to play audio feedback');
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
        // Resume recording when audio is stopped
        setTimeout(() => {
          continuousRecordingService.resumeRecording();
        }, 1000); // Small delay to ensure audio is fully stopped
        if (onStop) onStop();
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const handlePress = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      loadAndPlayAudio();
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    loadAndPlayAudio,
    stopAudio,
    isPlaying,
    isLoading
  }));

  return (
    <TouchableOpacity
      style={[
        styles.container,
        style,
        {
          backgroundColor: theme?.colors?.primary || '#007AFF',
          shadowColor: theme?.colors?.shadow || 'rgba(0, 0, 0, 0.1)',
        }
      ]}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <Ionicons
        name={isLoading ? "hourglass" : isPlaying ? "pause" : "play"}
        size={24}
        color="#FFFFFF"
      />
      <Text style={styles.text}>
        {isLoading ? "Loading..." : isPlaying ? "Stop" : "Play Voice"}
      </Text>
    </TouchableOpacity>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 120,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AudioPlayer; 