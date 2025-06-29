import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'demo-key');

// Time-based coaching triggers
export const TIME_BASED_COACHING = {
  morning: {
    start: 6, // 6 AM
    end: 10, // 10 AM
    tips: [
      "Good morning! Start your day with 3 deep breaths to set a positive intention.",
      "Morning check-in: How are you feeling today? Take a moment to acknowledge your emotions.",
      "Consider setting one small, achievable goal for today. What would make today feel successful?",
      "Remember to hydrate! Your brain works better when you're well-hydrated."
    ]
  },
  midday: {
    start: 10, // 10 AM
    end: 15, // 3 PM
    tips: [
      "Midday check-in: How's your energy? Consider a quick stretch or walk to refresh.",
      "Take a moment to check in with your body. Are you holding tension anywhere?",
      "If you're feeling overwhelmed, try the 5-4-3-2-1 grounding technique.",
      "Remember to take breaks! Your brain needs rest to maintain focus."
    ]
  },
  afternoon: {
    start: 15, // 3 PM
    end: 18, // 6 PM
    tips: [
      "Afternoon energy dip? Try a 5-minute walk or some gentle stretching.",
      "How are you feeling about your progress today? Celebrate small wins!",
      "Consider what you've accomplished so far. You're doing great!",
      "Take a moment to plan your evening. What would help you wind down?"
    ]
  },
  evening: {
    start: 18, // 6 PM
    end: 22, // 10 PM
    tips: [
      "Evening reflection: What went well today? What are you grateful for?",
      "Start winding down. Consider what would help you relax and prepare for rest.",
      "Take a moment to acknowledge your efforts today. You showed up!",
      "Evening check-in: How are you feeling? What do you need right now?"
    ]
  },
  late_night: {
    start: 22, // 10 PM
    end: 6, // 6 AM
    tips: [
      "It's getting late. Consider what would help you prepare for restful sleep.",
      "Late night thoughts? Try writing them down to clear your mind.",
      "Remember that rest is productive too. Your brain needs sleep to process and grow.",
      "Take a few deep breaths and let go of today's worries. Tomorrow is a new day."
    ]
  }
};

// Activity-based coaching triggers
export const ACTIVITY_BASED_COACHING = {
  work_focus: {
    triggers: ['meeting', 'deadline', 'project', 'work', 'task', 'email'],
    tips: [
      "You're in work mode. Remember to take short breaks every 45 minutes.",
      "Focus on one task at a time. Multitasking can reduce your effectiveness.",
      "If you're feeling stuck, try stepping away for 2 minutes and returning with fresh eyes.",
      "Remember your goals. What's the most important thing to accomplish right now?"
    ]
  },
  social_interaction: {
    triggers: ['friend', 'family', 'colleague', 'talk', 'conversation', 'meeting'],
    tips: [
      "Social interactions can be energizing! How are you feeling about this connection?",
      "Remember to listen actively and be present in the conversation.",
      "If you're feeling anxious about social interaction, take a deep breath. You've got this!",
      "Authentic connections matter. Be yourself and trust the process."
    ]
  },
  physical_activity: {
    triggers: ['exercise', 'workout', 'run', 'walk', 'gym', 'sport'],
    tips: [
      "Great job moving your body! How does it feel?",
      "Remember to stay hydrated during your activity.",
      "Listen to your body. It's okay to adjust intensity as needed.",
      "Movement is medicine for both body and mind. You're doing something great for yourself!"
    ]
  },
  learning: {
    triggers: ['study', 'learn', 'read', 'research', 'course', 'skill'],
    tips: [
      "Learning something new! Take breaks to let information sink in.",
      "Curiosity is a superpower. What interests you most about this topic?",
      "Remember that learning is a process. Be patient with yourself.",
      "Try explaining what you're learning to someone else - it helps retention!"
    ]
  }
};

// Static nudge triggers for immediate response
export const STATIC_NUDGES = {
  // Focus and productivity triggers
  "can't focus": {
    message: "Take 5 minutes. Breathe deeply, then refocus on one task.",
    category: "focus",
    priority: "high"
  },
  "distracted": {
    message: "Try the 5-4-3-2-1 technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
    category: "focus",
    priority: "medium"
  },
  "procrastinating": {
    message: "Start with just 2 minutes. Often that's all it takes to get going.",
    category: "productivity",
    priority: "high"
  },

  // Energy and motivation triggers
  "tired": {
    message: "Try a quick stretch or walk around. Movement can boost your energy!",
    category: "energy",
    priority: "medium"
  },
  "exhausted": {
    message: "Consider a 10-minute power nap or a short walk outside.",
    category: "energy",
    priority: "high"
  },
  "unmotivated": {
    message: "Break your task into tiny steps. What's the smallest next action?",
    category: "motivation",
    priority: "medium"
  },

  // Stress and anxiety triggers
  "stressed": {
    message: "Take 3 deep breaths. Inhale for 4, hold for 4, exhale for 6.",
    category: "stress",
    priority: "high"
  },
  "anxious": {
    message: "Ground yourself: Name 5 things you can see, 4 you can touch, 3 you can hear.",
    category: "anxiety",
    priority: "high"
  },
  "overwhelmed": {
    message: "Break this down into smaller steps. What's the next right thing?",
    category: "stress",
    priority: "high"
  },

  // Time management triggers
  "late": {
    message: "It's okay. Focus on what you can control right now.",
    category: "time",
    priority: "medium"
  },
  "behind": {
    message: "Prioritize: What's most important right now?",
    category: "time",
    priority: "medium"
  },
  "deadline": {
    message: "Focus on progress, not perfection. What can you complete now?",
    category: "time",
    priority: "high"
  },

  // Self-doubt and confidence triggers
  "doubt": {
    message: "Remember your past successes. You've got this!",
    category: "confidence",
    priority: "medium"
  },
  "can't do this": {
    message: "You don't have to do it perfectly. Just start.",
    category: "confidence",
    priority: "high"
  },
  "not good enough": {
    message: "You are enough. Your effort matters.",
    category: "confidence",
    priority: "high"
  },

  // Relationship and communication triggers
  "argument": {
    message: "Take a moment to breathe. What's really important here?",
    category: "relationships",
    priority: "high"
  },
  "misunderstood": {
    message: "Try expressing your feelings with 'I feel...' statements.",
    category: "communication",
    priority: "medium"
  },
  "conflict": {
    message: "Pause and reflect: What's your goal in this situation?",
    category: "relationships",
    priority: "high"
  }
};

// Generate time-based coaching tip
export const generateTimeBasedCoaching = (userProfile) => {
  const now = new Date();
  const currentHour = now.getHours();
  
  let timeSlot = 'midday'; // default
  
  for (const [slot, config] of Object.entries(TIME_BASED_COACHING)) {
    if (slot === 'late_night') {
      if (currentHour >= config.start || currentHour < config.end) {
        timeSlot = slot;
        break;
      }
    } else if (currentHour >= config.start && currentHour < config.end) {
      timeSlot = slot;
      break;
    }
  }
  
  const tips = TIME_BASED_COACHING[timeSlot].tips;
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  return personalizeNudge({
    message: randomTip,
    category: "time_based",
    priority: "medium"
  }, userProfile);
};

// Generate activity-based coaching tip
export const generateActivityBasedCoaching = (transcript, userProfile) => {
  const recentText = transcript.slice(-3).map(entry => entry.text).join(' ').toLowerCase();
  
  for (const [activity, config] of Object.entries(ACTIVITY_BASED_COACHING)) {
    const hasTrigger = config.triggers.some(trigger => recentText.includes(trigger));
    if (hasTrigger) {
      const tips = config.tips;
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      
      return personalizeNudge({
        message: randomTip,
        category: "activity_based",
        priority: "medium"
      }, userProfile);
    }
  }
  
  return null;
};

// Check for static nudge triggers in text
export const checkStaticNudges = (text, userProfile) => {
  const lowerText = text.toLowerCase();
  const triggers = [];

  for (const [trigger, nudge] of Object.entries(STATIC_NUDGES)) {
    if (lowerText.includes(trigger)) {
      // Personalize the nudge based on user profile
      const personalizedNudge = personalizeNudge(nudge, userProfile);
      triggers.push({
        ...personalizedNudge,
        trigger,
        timestamp: new Date().toISOString()
      });
    }
  }

  return triggers;
};

// Personalize nudge based on user profile
const personalizeNudge = (nudge, userProfile) => {
  if (!userProfile) return nudge;

  let personalizedMessage = nudge.message;

  // Add user's name if available
  if (userProfile.name) {
    personalizedMessage = personalizedMessage.replace(
      /^(Take|Try|Consider|Remember|Focus|Pause|Good morning|Evening reflection|Great job|Learning something new|You're in work mode|Social interactions|Movement is medicine|Curiosity is a superpower|Remember that learning|Start your day|Morning check-in|Midday check-in|Afternoon energy dip|Evening check-in|It's getting late|Late night thoughts)/,
      `${userProfile.name}, $1`
    );
  }

  // Adjust tone based on user preference
  if (userProfile.voiceTone === 'cheerful') {
    personalizedMessage = personalizedMessage.replace(/\.$/, ' 😊');
  } else if (userProfile.voiceTone === 'calm') {
    personalizedMessage = personalizedMessage.replace(/!$/, '.');
  }

  return {
    ...nudge,
    message: personalizedMessage
  };
};

// Generate AI-powered contextual nudges
export const generateContextualNudge = async (transcript, userProfile) => {
  try {
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
      return null;
    }

    const prompt = `
You are a supportive AI coach for ${userProfile?.name || 'the user'}.
Their goals: ${userProfile?.goals?.join(', ') || 'personal growth'}
Their challenges: ${userProfile?.challenges?.join(', ') || 'general challenges'}
They prefer a ${userProfile?.voiceTone || 'calm'} tone.

Based on this recent transcript entry: "${transcript}"

Generate a brief, actionable coaching tip (max 2 sentences) that:
1. Acknowledges their current situation
2. Provides a specific, doable action
3. Uses their preferred tone
4. Relates to their goals and challenges

Respond with just the coaching tip, no additional text.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    return {
      message: response.trim(),
      category: "ai_generated",
      priority: "medium",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating contextual nudge:', error);
    return null;
  }
};

// Comprehensive background coaching system
export const generateBackgroundCoaching = async (transcript, userProfile, recentNudges = []) => {
  const coachingTips = [];
  
  // 1. Time-based coaching
  const timeBasedTip = generateTimeBasedCoaching(userProfile);
  if (timeBasedTip && shouldShowNudge(timeBasedTip, recentNudges, userProfile)) {
    coachingTips.push({
      ...timeBasedTip,
      timestamp: new Date().toISOString(),
      source: 'time_based'
    });
  }
  
  // 2. Activity-based coaching
  const activityBasedTip = generateActivityBasedCoaching(transcript, userProfile);
  if (activityBasedTip && shouldShowNudge(activityBasedTip, recentNudges, userProfile)) {
    coachingTips.push({
      ...activityBasedTip,
      timestamp: new Date().toISOString(),
      source: 'activity_based'
    });
  }
  
  // 3. AI-generated contextual coaching (if transcript has recent entries)
  if (transcript.length > 0) {
    const recentEntry = transcript[transcript.length - 1];
    const contextualTip = await generateContextualNudge(recentEntry.text, userProfile);
    if (contextualTip && shouldShowNudge(contextualTip, recentNudges, userProfile)) {
      coachingTips.push({
        ...contextualTip,
        source: 'ai_contextual'
      });
    }
  }
  
  // 4. Pattern-based insights (every few hours)
  const lastPatternAnalysis = recentNudges.find(n => n.source === 'pattern_analysis');
  const hoursSinceLastAnalysis = lastPatternAnalysis 
    ? (new Date() - new Date(lastPatternAnalysis.timestamp)) / (1000 * 60 * 60)
    : 24;
    
  if (hoursSinceLastAnalysis >= 4 && transcript.length >= 5) {
    const patternInsights = await analyzeTranscriptPatterns(transcript, userProfile);
    if (patternInsights) {
      coachingTips.push({
        message: patternInsights.encouragement,
        category: "pattern_analysis",
        priority: "low",
        timestamp: new Date().toISOString(),
        source: 'pattern_analysis',
        insights: patternInsights
      });
    }
  }
  
  return coachingTips;
};

// Analyze transcript for patterns and generate insights
export const analyzeTranscriptPatterns = async (transcript, userProfile) => {
  try {
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
      return null;
    }

    const prompt = `
Analyze this daily transcript for patterns and insights:

${transcript.map(entry => `${entry.timestamp}: ${entry.text}`).join('\n')}

User Profile:
- Goals: ${userProfile?.goals?.join(', ') || 'personal growth'}
- Challenges: ${userProfile?.challenges?.join(', ') || 'general challenges'}
- Preferred tone: ${userProfile?.voiceTone || 'calm'}

Provide insights in JSON format:
{
  "patterns": ["pattern1", "pattern2"],
  "mood_trend": "improving/stable/declining",
  "key_themes": ["theme1", "theme2"],
  "suggested_focus": "area to focus on",
  "encouragement": "positive reinforcement message"
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing pattern analysis:', parseError);
      return {
        patterns: ["Daily reflection"],
        mood_trend: "stable",
        key_themes: ["Personal growth"],
        suggested_focus: "Continue your reflection practice",
        encouragement: "You're doing great work on your personal development journey!"
      };
    }
  } catch (error) {
    console.error('Error analyzing transcript patterns:', error);
    return null;
  }
};

// Get nudge frequency recommendations
export const getNudgeFrequency = (userProfile, recentNudges) => {
  const baseFrequency = {
    focus: 3, // times per day
    stress: 2,
    energy: 2,
    confidence: 1,
    relationships: 1,
    ai_generated: 2,
    time_based: 4, // Every 6 hours
    activity_based: 2,
    pattern_analysis: 1 // Once per day
  };

  // Adjust based on user preferences and recent activity
  if (userProfile?.challenges?.includes('Distraction & Procrastination')) {
    baseFrequency.focus += 1;
  }
  
  if (userProfile?.challenges?.includes('Overthinking & Anxiety')) {
    baseFrequency.stress += 1;
  }

  // Reduce frequency if user has received many nudges recently
  const recentCount = recentNudges?.length || 0;
  if (recentCount > 8) {
    Object.keys(baseFrequency).forEach(key => {
      baseFrequency[key] = Math.max(1, baseFrequency[key] - 1);
    });
  }

  return baseFrequency;
};

// Check if nudge should be shown based on frequency limits
export const shouldShowNudge = (nudge, recentNudges, userProfile) => {
  const frequency = getNudgeFrequency(userProfile, recentNudges);
  const category = nudge.category;
  
  if (!frequency[category]) return true;

  const recentCategoryNudges = recentNudges?.filter(
    n => n.category === category && 
    new Date(n.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
  ) || [];

  return recentCategoryNudges.length < frequency[category];
}; 