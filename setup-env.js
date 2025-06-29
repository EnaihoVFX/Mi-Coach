#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎙️ MindCoachApp Environment Setup\n');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      setupEnvironment();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  setupEnvironment();
}

function setupEnvironment() {
  console.log('\n📝 Setting up your environment file...\n');
  
  let envContent = '# MindCoachApp Environment Configuration\n\n';
  
  // Gemini API Key
  rl.question('🔑 Enter your Gemini AI API key (or press Enter to skip): ', (geminiKey) => {
    if (geminiKey.trim()) {
      envContent += `# FREE Gemini AI API Key (Required for enhanced AI features)\n`;
      envContent += `# Get your FREE key at: https://makersuite.google.com/app/apikey\n`;
      envContent += `EXPO_PUBLIC_GEMINI_API_KEY=${geminiKey.trim()}\n\n`;
    } else {
      envContent += `# FREE Gemini AI API Key (Required for enhanced AI features)\n`;
      envContent += `# Get your FREE key at: https://makersuite.google.com/app/apikey\n`;
      envContent += `EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here\n\n`;
    }
    
    // ElevenLabs API Key
    rl.question('🎤 Enter your ElevenLabs API key (or press Enter to skip): ', (elevenLabsKey) => {
      if (elevenLabsKey.trim()) {
        envContent += `# ElevenLabs API Key (Optional - for voice features)\n`;
        envContent += `# Get your key at: https://elevenlabs.io/\n`;
        envContent += `EXPO_PUBLIC_ELEVEN_LABS_API_KEY=${elevenLabsKey.trim()}\n\n`;
      } else {
        envContent += `# ElevenLabs API Key (Optional - for voice features)\n`;
        envContent += `# Get your key at: https://elevenlabs.io/\n`;
        envContent += `EXPO_PUBLIC_ELEVEN_LABS_API_KEY=your_elevenlabs_api_key_here\n\n`;
      }
      
      // OpenAI API Key (Alternative)
      rl.question('🤖 Enter your OpenAI API key (or press Enter to skip): ', (openaiKey) => {
        if (openaiKey.trim()) {
          envContent += `# OpenAI API Key (Alternative to Gemini - Optional)\n`;
          envContent += `# Get your key at: https://platform.openai.com/\n`;
          envContent += `EXPO_PUBLIC_OPENAI_API_KEY=${openaiKey.trim()}\n\n`;
        } else {
          envContent += `# OpenAI API Key (Alternative to Gemini - Optional)\n`;
          envContent += `# Get your key at: https://platform.openai.com/\n`;
          envContent += `EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here\n\n`;
        }
        
        // App Configuration
        envContent += `# App Configuration\n`;
        envContent += `EXPO_PUBLIC_APP_NAME=MindCoach\n`;
        envContent += `EXPO_PUBLIC_APP_VERSION=1.0.0\n\n`;
        
        // Recording Settings
        envContent += `# Recording Settings\n`;
        envContent += `EXPO_PUBLIC_CONTINUOUS_RECORDING=true\n`;
        envContent += `EXPO_PUBLIC_RECORDING_INTERVAL=30000\n`;
        envContent += `EXPO_PUBLIC_MOMENT_DETECTION=true\n`;
        
        // Write the .env file
        try {
          fs.writeFileSync(envPath, envContent);
          console.log('\n✅ Environment file created successfully!');
          console.log('📁 Location:', envPath);
          
          // Check what was configured
          const hasGemini = geminiKey.trim() !== '';
          const hasElevenLabs = elevenLabsKey.trim() !== '';
          const hasOpenAI = openaiKey.trim() !== '';
          
          console.log('\n🔧 Configuration Summary:');
          console.log(`   Gemini AI: ${hasGemini ? '✅ Configured' : '❌ Not configured'}`);
          console.log(`   ElevenLabs: ${hasElevenLabs ? '✅ Configured' : '❌ Not configured'}`);
          console.log(`   OpenAI: ${hasOpenAI ? '✅ Configured' : '❌ Not configured'}`);
          
          if (!hasGemini) {
            console.log('\n💡 Tip: Get a FREE Gemini API key at https://makersuite.google.com/app/apikey');
            console.log('   This will enable enhanced AI features!');
          }
          
          console.log('\n🚀 Next steps:');
          console.log('   1. Run: npm start');
          console.log('   2. Test the app on your device');
          console.log('   3. Check out the continuous recording feature!');
          
        } catch (error) {
          console.error('❌ Error creating .env file:', error.message);
        }
        
        rl.close();
      });
    });
  });
}

rl.on('close', () => {
  process.exit(0);
}); 