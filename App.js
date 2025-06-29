import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider } from './utils/ThemeContext';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ReflectionScreen from './screens/ReflectionScreen';
import ProfileScreen from './screens/ProfileScreen';
import ContinuousRecordingScreen from './screens/ContinuousRecordingScreen';
import CoachingScreen from './screens/CoachingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Onboarding" 
          screenOptions={{ 
            headerShown: false
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Reflect" component={ReflectionScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ContinuousRecording" component={ContinuousRecordingScreen} />
          <Stack.Screen name="Coaching" component={CoachingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
