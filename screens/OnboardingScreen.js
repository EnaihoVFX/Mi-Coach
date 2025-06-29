import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { getNeumorphicShadows, getButtonStyles, getCardStyles, getTextStyles, getTheme } from '../utils/theme';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const { theme, setTheme: setGlobalTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [userProfile, setUserProfile] = useState({
    name: '',
    goals: [],
    challenges: [],
    voiceTone: 'calm',
    theme: 'light'
  });

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
    }
  };

  const textStyles = getTextStyles(safeTheme);

  const availableGoals = [
    'Focus & Productivity',
    'Confidence Building',
    'Stress Management',
    'Work-Life Balance',
    'Personal Growth',
    'Better Communication'
  ];

  const availableChallenges = [
    'Distraction & Procrastination',
    'Low Energy & Motivation',
    'Overthinking & Anxiety',
    'Time Management',
    'Self-Doubt',
    'Work Pressure'
  ];

  const voiceTones = [
    { id: 'calm', label: 'Calm & Gentle', emoji: '😌', description: 'Soothing and peaceful' },
    { id: 'direct', label: 'Direct & Clear', emoji: '🎯', description: 'Straightforward and actionable' },
    { id: 'cheerful', label: 'Cheerful & Encouraging', emoji: '😊', description: 'Positive and motivating' },
    { id: 'wise', label: 'Wise & Thoughtful', emoji: '🧠', description: 'Insightful and reflective' }
  ];

  const themes = [
    { 
      id: 'light', 
      label: 'Light Mode', 
      emoji: '☀️', 
      description: 'Clean and bright interface',
      preview: {
        background: '#F0F0F3',
        card: '#F0F0F3',
        text: '#1C1C1E',
        accent: '#007AFF'
      }
    },
    { 
      id: 'dark', 
      label: 'Dark Mode', 
      emoji: '🌙', 
      description: 'Easy on the eyes',
      preview: {
        background: '#1C1C1E',
        card: '#2C2C2E',
        text: '#FFFFFF',
        accent: '#0A84FF'
      }
    }
  ];

  const toggleGoal = (goal) => {
    setUserProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const toggleChallenge = (challenge) => {
    setUserProfile(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge]
    }));
  };

  const setVoiceTone = (tone) => {
    setUserProfile(prev => ({ ...prev, voiceTone: tone }));
  };

  const setTheme = (themeId) => {
    setSelectedTheme(themeId);
    setUserProfile(prev => ({ ...prev, theme: themeId }));
    setGlobalTheme(themeId);
  };

  const handleNext = () => {
    if (step === 1 && !userProfile.name.trim()) {
      Alert.alert('Please enter your name');
      return;
    }
    if (step === 2 && userProfile.goals.length === 0) {
      Alert.alert('Please select at least one goal');
      return;
    }
    if (step === 3 && userProfile.challenges.length === 0) {
      Alert.alert('Please select at least one challenge');
      return;
    }
    
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Save profile and navigate to home
      // In a real app, you'd save this to AsyncStorage or your backend
      navigation.replace('Home', { userProfile });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <View style={[styles.stepContainer, { backgroundColor: safeTheme.colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: safeTheme.colors.surface }]}>
        <Text style={[styles.stepTitle, { color: safeTheme.colors.primary }]}>Welcome to MindCoach! 👋</Text>
        <Text style={[styles.stepSubtitle, { color: safeTheme.colors.textSecondary }]}>Let's personalize your experience</Text>
      </View>
      
      <View style={[styles.inputContainer, { backgroundColor: safeTheme.colors.card }]}>
        <Text style={[styles.inputLabel, { color: safeTheme.colors.primary }]}>What should I call you?</Text>
        <TextInput
          style={[styles.textInput, { 
            backgroundColor: safeTheme.colors.surface,
            borderColor: safeTheme.colors.border,
            color: safeTheme.colors.text
          }]}
          placeholder="Enter your name or nickname"
          placeholderTextColor={safeTheme.colors.textSecondary}
          value={userProfile.name}
          onChangeText={(text) => setUserProfile(prev => ({ ...prev, name: text }))}
          autoFocus
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={[styles.stepContainer, { backgroundColor: safeTheme.colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: safeTheme.colors.surface }]}>
        <Text style={[styles.stepTitle, { color: safeTheme.colors.primary }]}>What are your goals? 🎯</Text>
        <Text style={[styles.stepSubtitle, { color: safeTheme.colors.textSecondary }]}>Select all that apply</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {availableGoals.map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[
              styles.optionButton,
              { 
                backgroundColor: safeTheme.colors.card,
                shadowColor: safeTheme.colors.shadow,
              },
              userProfile.goals.includes(goal) && { 
                backgroundColor: safeTheme.colors.primary,
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 8,
              }
            ]}
            onPress={() => toggleGoal(goal)}
          >
            <Text style={[
              styles.optionText,
              { color: userProfile.goals.includes(goal) ? '#FFFFFF' : safeTheme.colors.text }
            ]}>
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={[styles.stepContainer, { backgroundColor: safeTheme.colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: safeTheme.colors.surface }]}>
        <Text style={[styles.stepTitle, { color: safeTheme.colors.primary }]}>What challenges you? 💪</Text>
        <Text style={[styles.stepSubtitle, { color: safeTheme.colors.textSecondary }]}>This helps me provide better support</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {availableChallenges.map((challenge) => (
          <TouchableOpacity
            key={challenge}
            style={[
              styles.optionButton,
              { 
                backgroundColor: safeTheme.colors.card,
                shadowColor: safeTheme.colors.shadow,
              },
              userProfile.challenges.includes(challenge) && { 
                backgroundColor: safeTheme.colors.primary,
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 8,
              }
            ]}
            onPress={() => toggleChallenge(challenge)}
          >
            <Text style={[
              styles.optionText,
              { color: userProfile.challenges.includes(challenge) ? '#FFFFFF' : safeTheme.colors.text }
            ]}>
              {challenge}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={[styles.stepContainer, { backgroundColor: safeTheme.colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: safeTheme.colors.surface }]}>
        <Text style={[styles.stepTitle, { color: safeTheme.colors.primary }]}>Choose your coaching voice 🎙️</Text>
        <Text style={[styles.stepSubtitle, { color: safeTheme.colors.textSecondary }]}>How would you like me to sound?</Text>
      </View>
      
      <View style={styles.voiceContainer}>
        <View style={styles.voiceRow}>
          {voiceTones.slice(0, 2).map((tone) => (
            <TouchableOpacity
              key={tone.id}
              style={[
                styles.voiceOption,
                { 
                  backgroundColor: safeTheme.colors.card,
                  shadowColor: safeTheme.colors.shadow,
                },
                userProfile.voiceTone === tone.id && { 
                  backgroundColor: safeTheme.colors.primary,
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 8,
                }
              ]}
              onPress={() => setVoiceTone(tone.id)}
            >
              <Text style={styles.voiceEmoji}>{tone.emoji}</Text>
              <Text style={[
                styles.voiceLabel,
                { color: userProfile.voiceTone === tone.id ? '#FFFFFF' : safeTheme.colors.text }
              ]}>
                {tone.label}
              </Text>
              <Text style={[
                styles.voiceDescription,
                { color: userProfile.voiceTone === tone.id ? 'rgba(255,255,255,0.8)' : safeTheme.colors.textSecondary }
              ]}>
                {tone.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.voiceRow}>
          {voiceTones.slice(2, 4).map((tone) => (
            <TouchableOpacity
              key={tone.id}
              style={[
                styles.voiceOption,
                { 
                  backgroundColor: safeTheme.colors.card,
                  shadowColor: safeTheme.colors.shadow,
                },
                userProfile.voiceTone === tone.id && { 
                  backgroundColor: safeTheme.colors.primary,
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 8,
                }
              ]}
              onPress={() => setVoiceTone(tone.id)}
            >
              <Text style={styles.voiceEmoji}>{tone.emoji}</Text>
              <Text style={[
                styles.voiceLabel,
                { color: userProfile.voiceTone === tone.id ? '#FFFFFF' : safeTheme.colors.text }
              ]}>
                {tone.label}
              </Text>
              <Text style={[
                styles.voiceDescription,
                { color: userProfile.voiceTone === tone.id ? 'rgba(255,255,255,0.8)' : safeTheme.colors.textSecondary }
              ]}>
                {tone.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep5 = () => {
    // Use the selected theme for the entire screen
    const previewTheme = getTheme(selectedTheme);
    
    return (
      <View style={[styles.stepContainer, { backgroundColor: previewTheme.colors.background }]}>
        <View style={[styles.headerContainer, { backgroundColor: previewTheme.colors.surface }]}>
          <Text style={[styles.stepTitle, { color: previewTheme.colors.primary }]}>Choose your theme 🎨</Text>
          <Text style={[styles.stepSubtitle, { color: previewTheme.colors.textSecondary }]}>Pick your preferred visual style</Text>
        </View>
        
        <View style={styles.themeContainer}>
          {themes.map((themeOption) => {
            // Use light theme for unselected buttons, selected theme for selected button
            const buttonTheme = selectedTheme === themeOption.id ? previewTheme : getTheme('light');
            
            return (
              <TouchableOpacity
                key={themeOption.id}
                style={[
                  styles.themeOption,
                  { 
                    backgroundColor: buttonTheme.colors.card,
                    shadowColor: buttonTheme.colors.shadow,
                  },
                  selectedTheme === themeOption.id && { 
                    backgroundColor: buttonTheme.colors.primary,
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 8,
                  }
                ]}
                onPress={() => setTheme(themeOption.id)}
              >
                <View style={styles.themeHeader}>
                  <Text style={styles.themeEmoji}>{themeOption.emoji}</Text>
                  <Text style={[
                    styles.themeLabel,
                    { color: selectedTheme === themeOption.id ? '#FFFFFF' : buttonTheme.colors.text }
                  ]}>
                    {themeOption.label}
                  </Text>
                </View>
                <Text style={[
                  styles.themeDescription,
                  { color: selectedTheme === themeOption.id ? 'rgba(255,255,255,0.8)' : buttonTheme.colors.textSecondary }
                ]}>
                  {themeOption.description}
                </Text>
                <View style={[
                  styles.themePreview, 
                  { 
                    backgroundColor: themeOption.preview.background,
                    shadowColor: selectedTheme === themeOption.id ? buttonTheme.colors.shadow : '#000',
                    shadowOffset: { width: 1, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }
                ]}>
                  <View style={[
                    styles.previewCard, 
                    { 
                      backgroundColor: themeOption.preview.card,
                      shadowColor: selectedTheme === themeOption.id ? buttonTheme.colors.shadow : '#000',
                      shadowOffset: { width: 1, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }
                  ]}>
                    <View style={[styles.previewDot, { backgroundColor: themeOption.preview.accent }]} />
                    <View style={[styles.previewBar, { backgroundColor: themeOption.preview.text }]} />
                    <View style={[styles.previewBar, { backgroundColor: themeOption.preview.text, width: '60%' }]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: safeTheme.colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: safeTheme.colors.border }]}>
            <View style={[styles.progressFill, { 
              width: `${(step / 5) * 100}%`,
              backgroundColor: safeTheme.colors.primary
            }]} />
          </View>
          <Text style={[styles.progressText, { color: safeTheme.colors.textSecondary }]}>{step} of 5</Text>
        </View>

        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navigation, { backgroundColor: safeTheme.colors.surface }]}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.backButton, { 
              backgroundColor: safeTheme.colors.card,
              shadowColor: safeTheme.colors.shadow,
            }]}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={20} color={safeTheme.colors.textSecondary} />
            <Text style={[styles.backButtonText, { color: safeTheme.colors.textSecondary }]}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: safeTheme.colors.primary }]}
          onPress={handleNext}
        >
          <Text style={[styles.nextButtonText, { color: '#FFFFFF' }]}>
            {step === 5 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name={step === 5 ? "checkmark" : "arrow-forward"} 
            size={20} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  headerContainer: {
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 38,
  },
  stepSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  textInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  optionsContainer: {
    gap: 12,
    paddingHorizontal: 10,
  },
  optionButton: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  voiceContainer: {
    paddingHorizontal: 10,
  },
  voiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  voiceOption: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    aspectRatio: 1,
    justifyContent: 'center',
  },
  voiceEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  voiceLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  voiceDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  themeOption: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '48%',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  themeHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  themeEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 15,
  },
  themePreview: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  previewBar: {
    height: 3,
    borderRadius: 2,
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 