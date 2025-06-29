import * as FileSystem from 'expo-file-system';

// Speech-to-Text Service
// This service handles real-time audio transcription using OpenAI Whisper API

class SpeechToTextService {
  constructor() {
    this.isProcessing = false;
  }

  // Convert audio to text using OpenAI Whisper API
  async transcribeAudio(audioUri) {
    try {
      this.isProcessing = true;
      console.log('🎤 Starting OpenAI Whisper transcription...');

      // Check if we have OpenAI API key
      const openaiApiKey = process.env.EXPO_PUBLIC_SPEECH_TO_TEXT_API_KEY;
      
      if (!openaiApiKey) {
        console.log('⚠️ No OpenAI API key configured');
        console.log('📝 Add EXPO_PUBLIC_SPEECH_TO_TEXT_API_KEY to your .env file');
        return "Please add OpenAI API key to enable speech-to-text.";
      }

      console.log('📝 Audio URI:', audioUri);

      // Convert file URI to base64
      let base64Audio;
      if (audioUri.startsWith('file://')) {
        console.log('📁 Converting file to base64...');
        base64Audio = await this.fileToBase64(audioUri);
        console.log('✅ File converted to base64, length:', base64Audio.length);
      } else if (audioUri.startsWith('data:audio')) {
        // Already base64
        base64Audio = audioUri.split(',')[1];
        console.log('✅ Base64 audio detected, length:', base64Audio.length);
      } else {
        console.log('⚠️ Unknown audio format:', audioUri.substring(0, 50));
        return "Unsupported audio format.";
      }

      // Call OpenAI Whisper API
      const transcript = await this.callWhisperAPI(base64Audio, openaiApiKey);
      
      console.log('✅ Whisper transcription completed:', transcript);
      return transcript;
      
    } catch (error) {
      console.error('❌ Error in Whisper transcription:', error);
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  // Convert file to base64
  async fileToBase64(fileUri) {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('❌ Error reading file as base64:', error);
      throw error;
    }
  }

  // Call OpenAI Whisper API
  async callWhisperAPI(base64Audio, apiKey) {
    try {
      console.log('🌐 Calling OpenAI Whisper API...');
      
      // For React Native, we need to send the audio data differently
      // Since Blob is not fully supported, we'll use a different approach
      
      // Create a temporary file and send it as form data
      const tempFileUri = `${FileSystem.cacheDirectory}temp_audio_${Date.now()}.m4a`;
      
      // Write base64 to temporary file
      await FileSystem.writeAsStringAsync(tempFileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Create form data with the file
      const formData = new FormData();
      formData.append('file', {
        uri: tempFileUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      });
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      // Clean up temporary file
      try {
        await FileSystem.deleteAsync(tempFileUri);
      } catch (cleanupError) {
        console.log('⚠️ Could not clean up temp file:', cleanupError);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return result.text;
      
    } catch (error) {
      console.error('❌ Error calling Whisper API:', error);
      throw error;
    }
  }

  // Check if transcription is currently processing
  getProcessingStatus() {
    return this.isProcessing;
  }
}

// Create singleton instance
const speechToTextService = new SpeechToTextService();

export default speechToTextService; 