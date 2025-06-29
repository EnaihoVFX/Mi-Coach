import axios from 'axios';
import { encode as base64Encode } from 'base-64';

// ElevenLabs API configuration
const ELEVEN_LABS_API_KEY = process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Default voice ID for a warm, empathetic voice
const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam voice (much louder)

export const textToSpeech = async (text, voiceId = DEFAULT_VOICE_ID) => {
  try {
    if (!ELEVEN_LABS_API_KEY) {
      console.warn('ElevenLabs API key not found. Skipping text-to-speech.');
      return null;
    }

    console.log('🎤 Generating speech for text:', text.substring(0, 50) + '...');
    console.log('🎤 Using voice ID:', voiceId);

    const response = await axios({
      method: 'POST',
      url: `${ELEVEN_LABS_BASE_URL}/text-to-speech/${voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
      data: {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.7,
          style: 0.8,
          use_speaker_boost: true,
        },
      },
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    });

    console.log('✅ ElevenLabs API response received, size:', response.data.byteLength);

    // Convert array buffer to base64 using React Native compatible method
    const uint8Array = new Uint8Array(response.data);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = base64Encode(binaryString);
    const audioUri = `data:audio/mpeg;base64,${base64Audio}`;
    
    console.log('✅ Audio generated successfully, URI length:', audioUri.length);
    return audioUri;
  } catch (error) {
    console.error('❌ Error with ElevenLabs text-to-speech:', error.message);
    
    if (error.response) {
      console.error('❌ ElevenLabs API error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      if (error.response.status === 401) {
        console.error('❌ Invalid ElevenLabs API key');
      } else if (error.response.status === 429) {
        console.error('❌ ElevenLabs API rate limit exceeded');
      }
    }
    
    return null;
  }
};

export const getAvailableVoices = async () => {
  try {
    if (!ELEVEN_LABS_API_KEY) {
      console.warn('ElevenLabs API key not found. Cannot fetch voices.');
      return [];
    }

    console.log('🎤 Fetching available voices from ElevenLabs...');

    const response = await axios.get(`${ELEVEN_LABS_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('✅ Voices fetched successfully, count:', response.data.voices.length);

    return response.data.voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      description: voice.labels?.description || '',
    }));
  } catch (error) {
    console.error('❌ Error fetching voices:', error.message);
    
    if (error.response) {
      console.error('❌ ElevenLabs voices API error:', {
        status: error.response.status,
        statusText: error.response.statusText
      });
      
      if (error.response.status === 401) {
        console.error('❌ Invalid ElevenLabs API key for voices endpoint');
      }
    }
    
    return [];
  }
};

export const generateCoachingAudio = async (insights) => {
  try {
    // Create a natural-sounding coaching response
    const coachingText = `
      ${insights.insights}
      
      ${insights.recommendations ? `Here are some suggestions: ${insights.recommendations.join('. ')}` : ''}
      
      ${insights.actionItems ? `You might want to try: ${insights.actionItems.join('. ')}` : ''}
      
      Remember, you're doing great work on your personal growth journey.
    `;

    return await textToSpeech(coachingText);
  } catch (error) {
    console.error('Error generating coaching audio:', error);
    return null;
  }
};

export const generateFollowUpAudio = async (questions) => {
  try {
    const questionText = `
      Here are some questions to help you reflect deeper:
      
      ${questions.join('. ')}
      
      Take your time with these questions. There are no right or wrong answers.
    `;

    return await textToSpeech(questionText);
  } catch (error) {
    console.error('Error generating follow-up audio:', error);
    return null;
  }
};

// Voice settings for different coaching contexts
export const VOICE_SETTINGS = {
  empathetic: {
    stability: 0.5,
    similarity_boost: 0.5,
  },
  encouraging: {
    stability: 0.7,
    similarity_boost: 0.3,
  },
  calming: {
    stability: 0.8,
    similarity_boost: 0.2,
  },
};

export const textToSpeechWithSettings = async (text, voiceId = DEFAULT_VOICE_ID, settings = VOICE_SETTINGS.empathetic) => {
  try {
    if (!ELEVEN_LABS_API_KEY) {
      return null;
    }

    const response = await axios({
      method: 'POST',
      url: `${ELEVEN_LABS_BASE_URL}/text-to-speech/${voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
      data: {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: settings,
      },
      responseType: 'arraybuffer',
    });

    const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
    return `data:audio/mpeg;base64,${base64Audio}`;
  } catch (error) {
    console.error('Error with ElevenLabs text-to-speech:', error);
    return null;
  }
}; 