import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'demo-key');

// Demo responses for when no API key is available
const DEMO_RESPONSES = {
  coaching: {
    insights: "You're showing great self-awareness in recognizing your feelings.",
    themes: [
      { name: "Self-awareness", description: "You're developing deeper understanding of yourself" }
    ],
    recommendations: [
      "Take a few deep breaths to help you feel more centered"
    ],
    moodAnalysis: {
      sentiment: "reflective",
      description: "You're showing mindfulness in your reflections"
    },
    actionItems: [
      "Try taking a short break to refresh your mind"
    ]
  },
  questions: {
    questions: [
      "What would you like to explore further about this topic?",
      "How do you feel about the progress you've made?",
      "What would be most helpful for you right now?"
    ]
  },
  patterns: {
    emotionalTrend: "improving",
    recurringThemes: ["Self-reflection", "Personal growth"],
    progressIndicators: ["Consistent reflection practice"],
    growthAreas: ["Emotional awareness"],
    summary: "You're showing commitment to personal development"
  }
};

export const generateCoachingInsights = async (transcript) => {
  try {
    // Check if we have a real API key
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY === 'demo-key') {
      console.log('Using demo mode - no API key provided');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return demo response with some personalization based on transcript content
      const lowerTranscript = transcript.toLowerCase();
      let response = { ...DEMO_RESPONSES.coaching };
      
      // Personalize based on content
      if (lowerTranscript.includes('work') || lowerTranscript.includes('project')) {
        response.themes.push({ name: "Professional growth", description: "You're balancing work and personal development" });
        response.recommendations.push("Set clear boundaries between work and personal time");
      }
      
      if (lowerTranscript.includes('tired') || lowerTranscript.includes('exhausted')) {
        response.moodAnalysis.sentiment = "tired";
        response.moodAnalysis.description = "You're recognizing your energy levels and taking care of yourself";
        response.actionItems.push("Prioritize rest and self-care today");
      }
      
      if (lowerTranscript.includes('stressed') || lowerTranscript.includes('anxious')) {
        response.moodAnalysis.sentiment = "stressed";
        response.moodAnalysis.description = "You're aware of your stress and seeking balance";
        response.recommendations.push("Practice deep breathing when you feel overwhelmed");
      }
      
      return response;
    }

    const prompt = `
You are an empathetic AI mental wellness coach. Analyze the following reflection transcript and provide a short, focused insight and tip.

IMPORTANT: Keep your response SHORT and CONCISE. This will be read aloud as voice feedback, so it should be brief but helpful.

Transcript: "${transcript}"

Please respond in JSON format with SHORT, focused content:
{
  "insights": "One brief insight about what you're going through (1-2 sentences max)",
  "themes": [
    {
      "name": "Main theme",
      "description": "Brief description"
    }
  ],
  "recommendations": [
    "One specific, actionable tip that's easy to follow (1 sentence)"
  ],
  "moodAnalysis": {
    "sentiment": "positive/negative/neutral",
    "description": "Brief mood description (1 sentence)"
  },
  "actionItems": [
    "One simple action you can take right now (1 sentence)"
  ]
}

Keep everything brief and focused. This is for voice feedback, not a long conversation.
`;

    // Try different model names if one fails
    const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Trying Gemini model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        
        // Try to parse JSON response with better error handling
        try {
          // Clean the response to extract JSON
          let cleanedResponse = response.trim();
          
          // Find JSON object in the response
          const jsonStart = cleanedResponse.indexOf('{');
          const jsonEnd = cleanedResponse.lastIndexOf('}');
          
          if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
          }
          
          // Fix common JSON issues
          cleanedResponse = cleanedResponse
            .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
            .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
            .replace(/\n/g, ' ') // Remove newlines
            .replace(/\r/g, '') // Remove carriage returns
            .replace(/\t/g, ' ') // Replace tabs with spaces
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
          
          // Try to parse the cleaned JSON
          const parsedResponse = JSON.parse(cleanedResponse);
          
          // Validate the response structure
          if (parsedResponse && typeof parsedResponse === 'object') {
            return {
              insights: parsedResponse.insights || "You're showing great self-awareness in your reflections.",
              themes: parsedResponse.themes || [{ name: "Personal Growth", description: "You're developing self-awareness" }],
              recommendations: parsedResponse.recommendations || ["Continue your reflection practice", "Be kind to yourself"],
              moodAnalysis: parsedResponse.moodAnalysis || { sentiment: "reflective", description: "You're showing mindfulness" },
              actionItems: parsedResponse.actionItems || ["Take a moment to breathe", "Acknowledge your progress"]
            };
          }
        } catch (parseError) {
          console.error('Error parsing Gemini response:', parseError);
          console.log('Raw response:', response);
          
          // If JSON parsing fails, create a structured response from the text
          return {
            insights: response.substring(0, 200) + "...",
            themes: [{ name: "Personal Reflection", description: "You're engaging in self-reflection" }],
            recommendations: ["Continue your reflection practice", "Be kind to yourself"],
            moodAnalysis: { sentiment: "reflective", description: "You're showing self-awareness" },
            actionItems: ["Take a moment to breathe", "Acknowledge your progress"]
          };
        }
      } catch (error) {
        console.error(`Error with model ${modelName}:`, error);
        lastError = error;
        continue; // Try next model
      }
    }

    // If all models fail, return demo response
    console.error('All Gemini models failed, using demo response:', lastError);
    return DEMO_RESPONSES.coaching;
    
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return DEMO_RESPONSES.coaching;
  }
};

export const generateFollowUpQuestions = async (transcript, previousInsights) => {
  try {
    // Check if we have a real API key
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY === 'demo-key') {
      console.log('Using demo mode for follow-up questions');
      await new Promise(resolve => setTimeout(resolve, 500));
      return DEMO_RESPONSES.questions;
    }

    const prompt = `
Based on this reflection: "${transcript}"

And previous insights: "${JSON.stringify(previousInsights)}"

Generate 3-4 thoughtful follow-up questions to help the person explore deeper. 
Questions should be open-ended and encourage self-reflection.

Respond in JSON format:
{
  "questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?"
  ]
}
`;

    // Try different model names if one fails
    const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`Trying Gemini model for questions: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        
        try {
          return JSON.parse(response);
        } catch (parseError) {
          console.error('Error parsing follow-up questions:', parseError);
          return DEMO_RESPONSES.questions;
        }
      } catch (error) {
        console.error(`Error with model ${modelName} for questions:`, error);
        lastError = error;
        continue; // Try next model
      }
    }

    // If all models fail, return demo response
    console.error('All Gemini models failed for questions, using demo response:', lastError);
    return DEMO_RESPONSES.questions;
    
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    return DEMO_RESPONSES.questions;
  }
};

export const analyzeEmotionalPatterns = async (transcripts) => {
  try {
    // Check if we have a real API key
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY === 'demo-key') {
      console.log('Using demo mode for pattern analysis');
      await new Promise(resolve => setTimeout(resolve, 800));
      return DEMO_RESPONSES.patterns;
    }

    const prompt = `
Analyze these reflection transcripts for emotional patterns and trends:

${transcripts.map(t => `Date: ${t.date}\nContent: ${t.text}`).join('\n\n')}

Provide insights about:
1. Emotional trends over time
2. Recurring themes
3. Progress indicators
4. Areas for continued growth

Respond in JSON format:
{
  "emotionalTrend": "improving/stable/declining",
  "recurringThemes": ["theme1", "theme2"],
  "progressIndicators": ["indicator1", "indicator2"],
  "growthAreas": ["area1", "area2"],
  "summary": "Overall assessment"
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      return DEMO_RESPONSES.patterns;
    }
  } catch (error) {
    console.error('Error analyzing emotional patterns:', error);
    return DEMO_RESPONSES.patterns;
  }
}; 