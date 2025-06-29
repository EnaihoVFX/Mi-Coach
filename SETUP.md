# MindCoachApp Setup Guide

## 🚀 Quick Start

The enhanced MindCoachApp is now running with **FREE Gemini AI**! Here's how to test it:

### 1. Access the App
- **On your phone**: Download Expo Go app and scan the QR code
- **On iOS Simulator**: Press `i` in the terminal
- **On Android Emulator**: Press `a` in the terminal

### 2. Test the Complete Flow

#### **Step 1: Onboarding**
- Complete the 4-step onboarding process
- Set your name, goals, challenges, and voice preference
- This personalizes your entire experience

#### **Step 2: Daily Reflection**
- Use "Add Reflection" to add text entries
- Try voice recording (requires microphone permission)
- Watch for real-time nudge triggers

#### **Step 3: AI Coaching**
- Generate personalized coaching insights using **Gemini AI**
- Get voice coaching (simulated for demo)
- Provide feedback on coaching quality

#### **Step 4: Nudge Testing**
Add these keywords to trigger nudges:
- "can't focus" → Focus tip
- "tired" → Energy boost tip
- "stressed" → Breathing exercise
- "overwhelmed" → Break it down tip
- "procrastinating" → 2-minute rule
- "doubt" → Confidence boost

### 3. Demo Features

#### **Real-time Nudges**
- Add: "I can't focus on my work"
- Watch: Immediate coaching tip appears
- Result: "Take 5 minutes. Breathe deeply, then refocus on one task."

#### **AI Coaching (FREE with Gemini)**
- Add several reflections
- Click "Get AI Coaching"
- Receive: Summary, tips, mood analysis, action items

#### **Personalization**
- Different voice tones affect nudge style
- Goals and challenges influence AI responses
- Name appears in personalized messages

### 4. Production Setup

#### **Gemini API Key (FREE)**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a free account
3. Generate an API key
4. Create `.env` file in MindCoachApp directory:
```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_ELEVEN_LABS_API_KEY=your_elevenlabs_key_here
```

#### **Why Gemini?**
- ✅ **Completely FREE** - No usage costs
- ✅ **High Quality** - Google's latest AI model
- ✅ **Easy Setup** - Simple API key generation
- ✅ **Reliable** - Google's infrastructure
- ✅ **No Rate Limits** - Generous free tier

#### **Backend Integration**
- Replace mock data with real API calls
- Add user authentication
- Implement data persistence

### 5. Key Features Demonstrated

✅ **User Onboarding** - Complete profile setup
✅ **Real-time Nudges** - Immediate coaching tips
✅ **AI Integration** - FREE Gemini-powered insights
✅ **Voice Features** - Recording and playback
✅ **Modern UI** - Clean, responsive design
✅ **Progress Tracking** - Daily reflection timeline

### 6. File Structure

```
MindCoachApp/
├── screens/
│   ├── OnboardingScreen.js    # User setup
│   ├── HomeScreen.js          # Main dashboard
│   ├── ReflectionScreen.js    # Voice recording
│   └── ProfileScreen.js       # Progress tracking
├── components/
│   ├── Timeline.js            # Daily transcript
│   ├── CoachingCard.js        # AI insights
│   └── AudioPlayer.js         # Voice playback
├── utils/
│   ├── openaiPrompt.js        # Gemini AI coaching (renamed for clarity)
│   ├── elevenLabsAPI.js       # Text-to-speech
│   └── nudgeEngine.js         # Real-time tips
└── data/
    └── mockTranscript.json    # Sample data
```

### 7. Next Steps

1. **Test the app** on your device/simulator
2. **Try different scenarios** with various trigger words
3. **Customize the experience** by changing goals/challenges
4. **Get FREE Gemini API key** for full AI functionality
5. **Integrate with backend** for data persistence

The app now uses **FREE Gemini AI** for all coaching features! 🎉

## 🎯 Demo Scenarios

### **Scenario 1: New User**
1. Complete onboarding
2. Add first reflection
3. See personalized experience

### **Scenario 2: Daily Use**
1. Add multiple reflections
2. Trigger real-time nudges
3. Generate end-of-day coaching with Gemini

### **Scenario 3: Progress Tracking**
1. View daily timeline
2. See mood patterns
3. Track improvement over time

## 💰 Cost Breakdown

- **Gemini AI**: FREE (Google's free tier)
- **ElevenLabs**: Optional (for voice features)
- **App Development**: FREE (React Native + Expo)
- **Total Cost**: $0 for full AI functionality! 🎉 