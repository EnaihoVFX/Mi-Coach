# MindCoach App

An AI-powered mental wellness companion built with React Native, Expo, and **FREE Gemini AI**.

## 🆕 New Features

- **🎙️ Continuous Background Recording**: Always-on recording with automatic transcript generation
- **💡 AI-Powered Moment Detection**: Automatically identifies significant insights and breakthroughs
- **🧠 Enhanced AI Coaching**: Get personalized insights using **FREE Gemini AI**
- **📊 Real-time Analytics**: Track your mental wellness journey with detailed insights
- **🔔 Smart Notifications**: Get notified when important moments are detected
- **🎯 Personalized Nudges**: Real-time coaching tips based on your content

## Features

- **Voice Recording**: Record your reflections and thoughts
- **Continuous Recording**: Background recording with automatic processing
- **AI Coaching**: Get personalized insights using **FREE Gemini AI**
- **Progress Tracking**: Monitor your mental wellness journey
- **Audio Playback**: Listen to your recorded reflections
- **Profile Analytics**: View your progress and patterns over time
- **Real-time Nudges**: Get immediate coaching tips during reflection
- **Moment Detection**: AI-powered identification of significant insights
- **Voice Synthesis**: Hear AI responses with ElevenLabs TTS
- **Siri-like Chat**: AI chat overlay accessible from any screen

## Project Structure

```
MindCoachApp/
├── App.js                 # Main app with navigation
├── assets/               # Images, fonts, and other assets
├── components/           # Reusable UI components
│   ├── TranscriptTimeline.js
│   ├── CoachingSummary.js
│   ├── AudioPlayer.js
│   └── MomentsTimeline.js
├── screens/             # App screens
│   ├── OnboardingScreen.js
│   ├── HomeScreen.js
│   ├── ProfileScreen.js
│   ├── ReflectionScreen.js
│   └── ContinuousRecordingScreen.js
├── utils/               # Utility functions and API integrations
│   ├── geminiPrompt.js
│   ├── elevenLabsAPI.js
│   ├── nudgeEngine.js
│   └── continuousRecordingService.js
└── data/                # Mock data and configurations
    └── mockTranscript.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Expo CLI globally:**
   ```bash
   npm install -g expo-cli
   ```

3. **Start the development server:**
   ```bash
   expo start
   ```

4. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 🔧 API Setup

### Demo Mode (No Setup Required)
The app works **immediately** without any API keys! It includes:
- ✅ Realistic AI coaching responses
- ✅ Personalized insights based on your content
- ✅ Real-time nudge triggers
- ✅ Continuous recording simulation
- ✅ Complete user experience

### Enhanced AI Mode (Optional)
For enhanced AI responses, get a **FREE Gemini API key**:

1. **Get FREE Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a free account
   - Generate an API key (completely free!)

2. **Add to environment:**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   EXPO_PUBLIC_ELEVEN_LABS_API_KEY=your_elevenlabs_api_key_here
   ```

📖 **For detailed API setup instructions, see [API_SETUP.md](./API_SETUP.md)**

## 🎯 Key Features Explained

### 1. Continuous Background Recording
- **Always-on recording**: Captures your thoughts throughout the day
- **Automatic processing**: Generates transcripts every 30 seconds
- **Smart storage**: Efficiently manages audio files and transcripts
- **Privacy-focused**: All processing happens locally

### 2. AI-Powered Moment Detection
- **Significant insights**: Automatically identifies breakthroughs and realizations
- **Emotional patterns**: Detects stress, achievements, and challenges
- **Smart categorization**: Organizes moments by type (insight, challenge, achievement)
- **Confidence scoring**: Shows how significant each moment is

### 3. AI Coaching (FREE!)
- Integrates with Google's Gemini AI
- Generates personalized recommendations
- Analyzes emotional patterns and themes
- Works in demo mode without API keys

### 4. Real-time Nudges
- Immediate coaching tips during reflection
- Triggered by keywords (stress, tired, focus, etc.)
- Personalized based on user profile

### 5. Progress Tracking
- Tracks reflection sessions over time
- Monitors mood trends
- Identifies recurring themes
- Visualizes your mental wellness journey

## 📱 Screens

### **OnboardingScreen**: Complete user profile setup
### **HomeScreen**: Main dashboard with timeline and coaching
### **ReflectionScreen**: Manual voice recording with AI integration
### **ContinuousRecordingScreen**: Background recording management and moments
### **ProfileScreen**: Progress tracking and analytics

## 🧩 Components

### **Timeline**: Displays daily transcript with nudge triggers
### **CoachingCard**: Shows AI-generated insights
### **AudioPlayer**: Handles audio playback
### **MomentsTimeline**: Displays detected significant moments

## 🔧 Utilities

### **geminiPrompt.js**: FREE Gemini AI integration
### **elevenLabsAPI.js**: Text-to-speech functionality (optional)
### **nudgeEngine.js**: Real-time coaching system
### **continuousRecordingService.js**: Background recording and processing

## 💰 Cost Breakdown

| Service | Cost | Usage |
|---------|------|-------|
| **Gemini AI** | **FREE** | Unlimited |
| **ElevenLabs** | Free tier: 10,000 chars/month | Voice features |
| **App Development** | **FREE** | React Native + Expo |

**Total Cost: $0 for full AI functionality!** 🎉

## 🚨 Troubleshooting

### Common Issues

1. **Audio Recording Not Working:**
   - Check microphone permissions
   - Ensure device supports audio recording
   - Test on physical device (simulators have limitations)

2. **AI Features Not Working:**
   - Demo mode works without API keys
   - For enhanced AI, check Gemini API key
   - Ensure environment variables are loaded

3. **Continuous Recording Issues:**
   - Grant microphone permissions
   - Check background app refresh settings
   - Ensure device has sufficient storage

4. **Navigation Issues:**
   - Make sure all screen components are properly exported
   - Check that navigation dependencies are installed

### Performance Tips
- Use React.memo for expensive components
- Optimize images and assets
- Implement proper error boundaries
- Use lazy loading for large components

## 🔮 Future Enhancements

- [ ] Real-time transcription with Whisper API
- [ ] Advanced sentiment analysis
- [ ] Multi-language support
- [ ] Offline mode with local AI
- [ ] Integration with health apps
- [ ] Group coaching sessions

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review [API_SETUP.md](./API_SETUP.md) for detailed setup instructions
- Review Expo documentation
- Open an issue on GitHub

---

**Ready to start?** Run `expo start` and begin your mental wellness journey! 🚀 

## Testing Integrations

The app includes a built-in test system to verify that all integrations work properly:

### Manual Testing
1. Open the app and tap the "🧪 Test Integration" button
2. Check the console logs for detailed results
3. Verify that transcripts and ElevenLabs TTS are working

### Console Test Results
The test will show:
- ✅ **Transcripts**: Gemini AI processing works
- ✅ **ElevenLabs**: Text-to-speech generation works  
- ✅ **Continuous Recording**: Background recording service works
- ⚠️ **Issues**: Any problems found with detailed error messages

### Common Issues & Solutions

**ElevenLabs not working:**
- Check your API key in `.env`
- Verify the key is valid at [ElevenLabs dashboard](https://elevenlabs.io/)
- Check console for specific error messages

**Transcripts not working:**
- Verify Gemini API key in `.env`
- Check internet connection
- Review console logs for API errors

**Audio recording issues:**
- Grant microphone permissions when prompted
- Check device audio settings
- Restart the app if permissions are denied

## Environment Setup

### Required API Keys

1. **Gemini AI (FREE)**
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Add to `.env`: `EXPO_PUBLIC_GEMINI_API_KEY=your_key_here`

2. **ElevenLabs**
   - Visit: https://elevenlabs.io/
   - Sign up and get your API key
   - Add to `.env`: `EXPO_PUBLIC_ELEVEN_LABS_API_KEY=your_key_here`

### Optional Features

- **OpenAI**: Alternative to Gemini AI
- **Continuous Recording**: Background audio processing
- **Moment Detection**: AI-powered insight detection

## Architecture

```
MindCoachApp/
├── components/          # Reusable UI components
├── screens/            # Main app screens
├── utils/              # Business logic and API integrations
├── data/               # Mock data and configurations
└── assets/             # Images and static files
```

### Key Components

- **AIChatOverlay**: Siri-like AI chat interface
- **ContinuousRecordingService**: Background audio processing
- **GeminiPrompt**: AI coaching and insights generation
- **ElevenLabsAPI**: Text-to-speech integration

## Troubleshooting

### Audio Issues
- Ensure microphone permissions are granted
- Check device volume settings
- Restart app if audio stops working

### API Errors
- Verify API keys are correct
- Check internet connection
- Review console logs for specific errors

### Performance Issues
- Close other apps using audio
- Restart the development server
- Clear app cache if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 