// ============================================================
// Priya AI – Conversation Engine & Post-Session Analysis
// Supports:
// 1. 100% Free Built-in Mock Mode (zero API key needed)
// 2. Optional Google Gemini Mode (key stored in localStorage only)
// 3. Optional OpenAI Mode (key stored in localStorage only)
// ============================================================

export const AI_MODES = {
  MOCK: 'mock',
  GEMINI: 'gemini',
  OPENAI: 'openai',
};

const STORAGE_KEYS = {
  MODE: 'priya_ai_mode',
  GEMINI_KEY: 'priya_gemini_key',
  OPENAI_KEY: 'priya_openai_key',
};

export function getPriyaSettings() {
  if (typeof window === 'undefined') {
    return { mode: AI_MODES.MOCK, geminiKey: '', openaiKey: '' };
  }
  return {
    mode: localStorage.getItem(STORAGE_KEYS.MODE) || AI_MODES.MOCK,
    geminiKey: localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '',
    openaiKey: localStorage.getItem(STORAGE_KEYS.OPENAI_KEY) || '',
  };
}

export function savePriyaSettings({ mode, geminiKey, openaiKey }) {
  if (typeof window === 'undefined') return;
  if (mode) localStorage.setItem(STORAGE_KEYS.MODE, mode);
  if (geminiKey !== undefined) localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, geminiKey.trim());
  if (openaiKey !== undefined) localStorage.setItem(STORAGE_KEYS.OPENAI_KEY, openaiKey.trim());
}

// ── Built-in Mock Response Knowledge & Follow-ups ────────────
const MOCK_QUESTIONS = [
  "Can you tell me about a time you faced a difficult technical challenge and how you solved it using the STAR framework?",
  "How do you prioritize competing deadlines when multiple critical tasks arise simultaneously?",
  "Tell me about a project you are most proud of: what architectural trade-offs did you make?",
  "How would you explain a complex concept (like asynchronous programming or database indexing) to a non-technical stakeholder?",
  "Describe a situation where you had a disagreement with a team member and how you reached consensus.",
];

export function getRandomPrompt() {
  return MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)];
}

/**
 * Generate AI Mentor Priya's spoken response
 */
export async function getPriyaResponse(studentSpeech, conversationHistory = [], currentPrompt = '') {
  const settings = getPriyaSettings();
  const cleaned = studentSpeech.trim();

  // Mode: Gemini API
  if (settings.mode === AI_MODES.GEMINI && settings.geminiKey) {
    try {
      const response = await callGeminiAPI(cleaned, conversationHistory, settings.geminiKey, currentPrompt);
      if (response) return response;
    } catch (err) {
      console.warn('[Priya Gemini Error] Falling back to Mock mode:', err?.message);
    }
  }

  // Mode: OpenAI API
  if (settings.mode === AI_MODES.OPENAI && settings.openaiKey) {
    try {
      const response = await callOpenAIAPI(cleaned, conversationHistory, settings.openaiKey, currentPrompt);
      if (response) return response;
    } catch (err) {
      console.warn('[Priya OpenAI Error] Falling back to Mock mode:', err?.message);
    }
  }

  // Default: Robust Built-in Mock Mode (100% Free, Instant, No Network Lag)
  return generateMockPriyaResponse(cleaned, currentPrompt);
}

function generateMockPriyaResponse(speech, prompt) {
  const lower = speech.toLowerCase();
  const words = speech.split(/\s+/).filter(Boolean);

  // If very short utterance
  if (words.length < 6) {
    return "I am right here with you! Go ahead and elaborate your thoughts with more details — I want to hear how you approached the challenge.";
  }

  // Detect tech concepts or keywords
  let topicObservation = "You structured your response with good vocal clarity.";
  let followUp = "How did you measure the final impact or success of what you described?";

  if (/\b(database|sql|nosql|mongo|postgres|query)\b/i.test(lower)) {
    topicObservation = "I liked how you highlighted the data storage layer.";
    followUp = "How did you optimize query latency, or how would your schema scale under a 10x traffic spike?";
  } else if (/\b(react|frontend|ui|component|state|css)\b/i.test(lower)) {
    topicObservation = "Great focus on the user interface and frontend component structure.";
    followUp = "What was the biggest state management challenge you solved to keep rendering smooth?";
  } else if (/\b(team|conflict|disagree|communication|lead)\b/i.test(lower)) {
    topicObservation = "That shows thoughtful empathy and maturity in interpersonal collaboration.";
    followUp = "Looking back, what is one communication habit you would adopt earlier to avoid that misunderstanding?";
  } else if (/\b(fail|bug|error|crash|difficult|problem)\b/i.test(lower)) {
    topicObservation = "Demonstrating how you recover from an obstacle is a major strength in interviews.";
    followUp = "What monitoring or testing safeguards did you put in place to ensure that issue never recurs?";
  }

  return `Thank you for sharing that! ${topicObservation} Here is my follow-up for you: ${followUp}`;
}

// ── Gemini API Integration ────────────────────────────────────
async function callGeminiAPI(text, history, apiKey, prompt) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemInstruction = `You are Priya, an expert and empathetic communication mentor for university engineering students. 
Keep your response concise (2-3 sentences max) so it sounds natural when spoken aloud via text-to-speech. 
1. Validate what the student said with specific praise. 
2. Offer 1 constructive communication observation. 
3. Ask 1 engaging follow-up question related to their answer. 
Current practice topic: "${prompt}".`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\nStudent just said: "${text}"` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 120,
    },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Gemini status ${res.status}`);
  const data = await res.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return reply ? reply.trim() : null;
}

// ── OpenAI API Integration ────────────────────────────────────
async function callOpenAIAPI(text, history, apiKey, prompt) {
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const messages = [
    {
      role: 'system',
      content: `You are Priya, an expert communication mentor for students. Respond in 2-3 concise conversational sentences suitable for speech synthesis: 1 specific praise, 1 quick speaking tip, and 1 relevant follow-up question. Current context: "${prompt}".`,
    },
    { role: 'user', content: text },
  ];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 120,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI status ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

// ── Post-Session Analysis & Polished Answer Generator ─────────
export function generateSessionScorecard({
  totalWords = 0,
  wpm = 125,
  fillersCount = 0,
  fillerDetails = {},
  longPausesCount = 0,
  durationSeconds = 60,
  eyeContactPct = 85,
  posturePct = 88,
  transcript = '',
  prompt = '',
}) {
  // Score calculations
  const wpmScore = clamp(Math.round(100 - Math.abs(wpm - 135) * 0.8), 50, 98);
  const fillerPenalty = Math.min(fillersCount * 3.5, 30);
  const pausePenalty = Math.min(longPausesCount * 4, 25);

  const structureScore = clamp(Math.round(82 - fillerPenalty * 0.3 + (totalWords > 50 ? 8 : 0)), 55, 96);
  const engagementScore = clamp(Math.round((eyeContactPct * 0.6) + (posturePct * 0.4)), 50, 98);
  const evidenceScore = clamp(Math.round(75 + (totalWords > 70 ? 12 : -10) - fillerPenalty * 0.2), 48, 95);
  const precisionScore = clamp(Math.round(88 - fillerPenalty * 0.6 - pausePenalty * 0.4), 45, 96);

  const overall = Math.round(
    structureScore * 0.25 +
    engagementScore * 0.25 +
    evidenceScore * 0.25 +
    precisionScore * 0.25
  );

  // Dynamic actionable fixes based on biomarkers
  const mistakes = [];
  if (fillersCount >= 3) {
    const topFiller = Object.entries(fillerDetails).sort((a, b) => b[1] - a[1])[0]?.[0] || 'fillers';
    mistakes.push({
      issue: `Frequent use of filler word "${topFiller}" (${fillersCount} total occurrences).`,
      fix: `Substitute vocal fillers with a deliberate 1-second silent pause. Silence sounds confident and buys you time to organize your thoughts.`,
    });
  } else {
    mistakes.push({
      issue: `Minor verbal hesitations during transitions.`,
      fix: `Use bridge phrases like "Furthermore", "In addition to this", or "The key takeaway was".`,
    });
  }

  if (wpm > 165) {
    mistakes.push({
      issue: `Speaking pace was too fast (${wpm} WPM).`,
      fix: `Slow down to 125-145 WPM. Fast delivery makes technical arguments harder for interviewers to absorb.`,
    });
  } else if (wpm < 100 && totalWords > 20) {
    mistakes.push({
      issue: `Speaking pace was slightly hesitant (${wpm} WPM).`,
      fix: `Practice stringing 3-part bullet points together without waiting between sentences.`,
    });
  }

  if (longPausesCount >= 3) {
    mistakes.push({
      issue: `${longPausesCount} long pauses over 2.5 seconds detected.`,
      fix: `If you need time to think, use executive fillers like "That's a thoughtful question, let's break that down into two components".`,
    });
  }

  if (eyeContactPct < 75) {
    mistakes.push({
      issue: `Eye contact dipped to ${eyeContactPct}%.`,
      fix: `Look straight into the webcam lens rather than glancing down at notes or looking at your own PIP preview.`,
    });
  }

  // Generate polished version of the student's answer
  const rawExcerpt = transcript.trim() || "I worked on a project with React and database. It was kind of difficult but basically we solved the bugs and launched it.";
  const polishedVersion = createPolishedAnswer(rawExcerpt, prompt);

  return {
    overall,
    structureScore,
    engagementScore,
    evidenceScore,
    precisionScore,
    wpm,
    fillersCount,
    longPausesCount,
    totalWords,
    eyeContactPct,
    posturePct,
    durationSeconds,
    mistakes,
    originalAnswer: rawExcerpt,
    polishedVersion,
  };
}

function createPolishedAnswer(raw, prompt) {
  // Cleans fillers
  const cleaned = raw
    .replace(/\b(umm?|uhh?|like|basically|actually|you know|sort of)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return `In addressing this challenge, my primary objective was to deliver a scalable and reliable outcome. 

I initiated the implementation by analyzing the core architecture and identifying the key bottlenecks. Specifically, ${cleaned.length > 20 ? cleaned.slice(0, 180) + '...' : 'I established clear component boundaries, optimized the database read/write queries, and implemented automated regression testing.'}

As a result, we successfully reduced latency by 35%, improved system reliability, and delivered the feature on schedule with zero critical production bugs.`;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
