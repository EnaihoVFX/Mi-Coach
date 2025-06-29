# MindCoachApp API Setup Guide

## 🚀 Quick Setup

### 1. Create Environment File
Copy the example environment file and add your API keys:

```bash
cp env.example .env
```

### 2. Get FREE API Keys

#### **Gemini AI (FREE - Recommended)**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a free Google account
3. Generate an API key (completely free!)
4. Add to `.env`: `EXPO_PUBLIC_GEMINI_API_KEY=your_key_here`

#### **ElevenLabs (Optional - Voice Features)**
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Create account and get API key
3. Add to `.env`: `EXPO_PUBLIC_ELEVEN_LABS_API_KEY=your_key_here`

#### **OpenAI (Alternative to Gemini)**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create account and get API key
3. Add to `.env`: `EXPO_PUBLIC_OPENAI_API_KEY=your_key_here`

## 🔧 Configuration Options

### Environment Variables

```env
# Required for enhanced AI features
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Optional - for voice features
EXPO_PUBLIC_ELEVEN_LABS_API_KEY=your_elevenlabs_api_key_here

# Alternative AI provider
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
EXPO_PUBLIC_APP_NAME=MindCoach
EXPO_PUBLIC_APP_VERSION=1.0.0

# Recording Settings
EXPO_PUBLIC_CONTINUOUS_RECORDING=true
EXPO_PUBLIC_RECORDING_INTERVAL=30000
EXPO_PUBLIC_MOMENT_DETECTION=true
```

### Recording Settings Explained

- **CONTINUOUS_RECORDING**: Enable/disable background recording
- **RECORDING_INTERVAL**: How often to process recordings (milliseconds)
- **MOMENT_DETECTION**: Enable AI-powered significant moment detection

## 🎯 Features by API Level

### Demo Mode (No API Keys)
✅ Basic app functionality
✅ Mock AI responses
✅ Static nudge triggers
✅ Voice recording simulation

### Gemini AI Only
✅ Enhanced AI coaching
✅ Personalized insights
✅ Contextual nudges
✅ Pattern analysis
✅ Moment detection

### Full Setup (Gemini + ElevenLabs)
✅ All above features
✅ Text-to-speech coaching
✅ Voice feedback
✅ Audio playback

## 💰 Cost Breakdown

| Service | Cost | Usage |
|---------|------|-------|
| **Gemini AI** | **FREE** | Unlimited |
| **ElevenLabs** | Free tier: 10,000 chars/month | Voice features |
| **OpenAI** | Pay per use | Alternative AI |

**Total Cost: $0 for full AI functionality!** 🎉

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate keys regularly** for production apps
4. **Monitor usage** to prevent unexpected charges
5. **Use API key restrictions** when available

## 🚨 Troubleshooting

### Common Issues

#### "API key not found"
- Check that `.env` file exists in project root
- Verify environment variable names start with `EXPO_PUBLIC_`
- Restart Expo development server after adding keys

#### "Permission denied"
- Ensure microphone permissions are granted
- Check device settings for app permissions

#### "Recording not working"
- Test on physical device (simulators have limitations)
- Verify audio permissions in device settings
- Check that no other apps are using microphone

#### "AI features not working"
- Verify API key is valid and active
- Check internet connection
- Review API usage limits and quotas

### Debug Mode

Enable debug logging by adding to `.env`:
```env
EXPO_PUBLIC_DEBUG=true
```

## 📱 Production Deployment

### 1. Environment Setup
```bash
# Create production environment
cp env.example .env.production

# Add production API keys
EXPO_PUBLIC_GEMINI_API_KEY=your_production_key
EXPO_PUBLIC_ELEVEN_LABS_API_KEY=your_production_key
```

### 2. Build Configuration
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

### 3. App Store Deployment
- Configure app signing certificates
- Set up app store connect
- Submit for review

## 🔄 API Integration Details

### Gemini AI Integration
- **Model**: gemini-2.0-flash
- **Rate Limits**: Generous free tier
- **Features**: Text generation, analysis, insights

### ElevenLabs Integration
- **Model**: eleven_monolingual_v1
- **Voice**: Rachel (default)
- **Features**: Text-to-speech, voice cloning

### Continuous Recording
- **Format**: High quality audio
- **Interval**: Configurable (default: 30 seconds)
- **Processing**: Real-time transcript generation
- **Storage**: Local device storage

## 📊 Analytics & Monitoring

### Recommended Tools
- **Firebase Analytics**: User behavior tracking
- **Sentry**: Error monitoring
- **Google Analytics**: App performance

### Key Metrics to Track
- Daily active users
- Recording session duration
- AI coaching usage
- Moment detection accuracy
- User feedback scores

## 🆘 Support

### Getting Help
1. Check troubleshooting section above
2. Review Expo documentation
3. Check API provider documentation
4. Open issue on GitHub

### Community Resources
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://github.com/react-native-community)
- [Google AI Community](https://ai.google.dev/community)

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time transcription with Whisper API
- [ ] Advanced sentiment analysis
- [ ] Multi-language support
- [ ] Offline mode with local AI
- [ ] Integration with health apps
- [ ] Group coaching sessions

### API Roadmap
- [ ] OpenAI Whisper for transcription
- [ ] Anthropic Claude for advanced analysis
- [ ] Local AI models for privacy
- [ ] Custom voice training

---

**Need help?** Check the troubleshooting section or open an issue on GitHub! 