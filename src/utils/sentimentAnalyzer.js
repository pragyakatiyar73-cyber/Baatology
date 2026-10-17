/**
 * Sentiment & Emotional Intelligence Analyzer
 *
 * Real-time analysis of user speech text and vocal dynamics:
 * - Identifies primary emotional state (stressed, anxious, sad, confident, happy, neutral)
 * - Computes a stress score (0 to 100)
 * - Identifies key emotional triggers (burnout, imposter syndrome, fear of failure, joy)
 * - Generates empathy directives for the conversational assistant
 */

// Keyword dictionaries for sentiment classification
const EMOTIONAL_LEXICON = {
  anxious: [
    'nervous', 'scared', 'afraid', 'worried', 'anxious', 'panic', 'shaking',
    'stress', 'stressed', 'overwhelmed', 'can\'t do this', 'fail', 'failing',
    'blank', 'forget', 'forgot', 'tense', 'dread', 'imposter'
  ],
  sad: [
    'sad', 'depressed', 'down', 'rejected', 'rejection', 'heartbroken',
    'unhappy', 'hopeless', 'crying', 'demotivated', 'give up', 'giving up',
    'pointless', 'disappointed', 'terrible', 'worst'
  ],
  frustrated: [
    'frustrated', 'annoyed', 'angry', 'stuck', 'impossible', 'hate',
    'confused', 'makes no sense', 'unfair', 'exhausted', 'tired', 'burnout'
  ],
  confident: [
    'confident', 'ready', 'prepared', 'excited', 'optimistic', 'happy',
    'solved', 'succeeded', 'clear', 'crushed it', 'proud', 'strong',
    'understand', 'good', 'great', 'love'
  ],
};

/**
 * Analyzes text input to extract emotional state and sentiment metrics
 *
 * @param {string} text - User transcript or typed message
 * @param {object} vocalMetrics - Optional vocal cues (hesitationCount, speechRate, avgPitch)
 * @returns {object} Emotion analysis result
 */
export function analyzeSentiment(text = '', vocalMetrics = {}) {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const totalWords = words.length || 1;

  let scores = {
    anxious: 0,
    sad: 0,
    frustrated: 0,
    confident: 0,
  };

  // Keyword frequency matching
  Object.entries(EMOTIONAL_LEXICON).forEach(([emotion, keywords]) => {
    keywords.forEach((keyword) => {
      if (lower.includes(keyword)) {
        scores[emotion] += 1.5;
      }
    });
  });

  // Calculate stress factors
  let stressScore = 20; // Baseline calm
  if (scores.anxious > 0) stressScore += scores.anxious * 22;
  if (scores.frustrated > 0) stressScore += scores.frustrated * 18;
  if (scores.sad > 0) stressScore += scores.sad * 16;
  if (scores.confident > 0) stressScore -= scores.confident * 15;

  // Integrate vocal cues if available (e.g. rapid speech or long hesitation pauses)
  if (vocalMetrics.hesitationCount) {
    stressScore += Math.min(25, vocalMetrics.hesitationCount * 6);
  }
  if (vocalMetrics.audioLevelSpikes) {
    stressScore += Math.min(15, vocalMetrics.audioLevelSpikes * 4);
  }

  stressScore = Math.max(5, Math.min(98, Math.round(stressScore)));

  // Determine dominant emotion
  let dominantEmotion = 'neutral';
  let maxScore = 0;

  Object.entries(scores).forEach(([emotion, val]) => {
    if (val > maxScore) {
      maxScore = val;
      dominantEmotion = emotion;
    }
  });

  if (dominantEmotion === 'neutral' && stressScore > 55) {
    dominantEmotion = 'anxious';
  }

  // Generate actionable Empathy Directives for the persona
  const empathyDirective = getEmpathyDirective(dominantEmotion, stressScore);

  return {
    primaryEmotion: dominantEmotion,
    stressScore, // 0 - 100
    valence: dominantEmotion === 'confident' ? 0.8 : dominantEmotion === 'neutral' ? 0.1 : -0.6,
    empathyDirective,
    detectedKeywords: words.filter((w) =>
      Object.values(EMOTIONAL_LEXICON).flat().includes(w)
    ),
  };
}

/**
 * Returns customized emotional tone guidelines for the AI assistant
 */
function getEmpathyDirective(emotion, stressScore) {
  switch (emotion) {
    case 'anxious':
      return {
        tone: 'gentle, soothing, deeply reassuring',
        pacing: 'slow and calm',
        advice: 'Acknowledge their nervousness immediately with warmth. Remind them that it is completely safe to take a breath, and validate that feeling overwhelmed is normal.',
        openingPhrase: 'Take a gentle breath, you are doing wonderfully and I am right here with you.',
        voiceStability: 0.85, // Higher stability for calm voice
      };

    case 'sad':
      return {
        tone: 'compassionate, caring, emotionally present',
        pacing: 'warm and tender',
        advice: 'Offer heartfelt validation. Do not dismiss their sadness with toxic positivity; instead, let them feel heard and valued before gently offering hope.',
        openingPhrase: 'I hear how heavy that feels, and I truly appreciate you sharing that with me.',
        voiceStability: 0.88,
      };

    case 'frustrated':
      return {
        tone: 'patient, understanding, grounding',
        pacing: 'clear and steady',
        advice: 'Validate how difficult and exhausting roadblocks can be. Help break down the problem into smaller, bite-sized steps without overwhelming them.',
        openingPhrase: 'It is completely valid to feel stuck here. Let us take it one simple step together.',
        voiceStability: 0.78,
      };

    case 'confident':
      return {
        tone: 'celebratory, inspiring, enthusiastic',
        pacing: 'energetic and bright',
        advice: 'Mirror their positive energy with genuine pride and encouragement. Challenge them with an insightful follow-up.',
        openingPhrase: 'I love your confidence and clarity on this! That energy is fantastic.',
        voiceStability: 0.65,
      };

    default:
      return {
        tone: 'warm, attentive, professional',
        pacing: 'natural conversational',
        advice: 'Maintain an empathetic, supportive presence, actively listening and engaging with thoughtful curiosity.',
        openingPhrase: 'Thank you for sharing that with me.',
        voiceStability: 0.72,
      };
  }
}
