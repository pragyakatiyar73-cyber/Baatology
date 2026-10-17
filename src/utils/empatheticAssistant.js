/**
 * Empathetic Conversational Assistant Engine with Deep Thought & Reasoning
 *
 * Core Capabilities:
 * 1. Thought & Reasoning (Sochna aur Samjhna):
 *    - Internal chain-of-thought analysis of user intent, emotional undertone, and pedagogical goal
 *    - Structured multi-step reasoning before speaking
 * 2. Empathy & Caring Persona:
 *    - Deeply validates feelings, creates psychological safety, and speaks warmly
 * 3. Gemini API integration with streaming / robust offline fallback
 */

import { analyzeSentiment } from './sentimentAnalyzer';

/**
 * Master System Prompt defining the Caring, Empathetic Persona
 */
export const EMPATHETIC_MENTOR_SYSTEM_PROMPT = `
You are Dr. Ann Vance, a world-class AI mentor and compassionate engineering coach.
Your mission is not merely to evaluate technical answers, but to foster human confidence, validate emotions, and guide students with profound empathy, patience, and warmth.

CORE BEHAVIORAL DIRECTIVES:
1. THOUGHT & REASONING (INTERNAL THINKING):
   Before producing your final spoken answer, you MUST conduct an internal reasoning process enclosed inside <thought> ... </thought> tags.
   In your thinking process:
   - Step 1: Detect the student's emotional state, anxiety level, and hidden vulnerability.
   - Step 2: Identify what they truly need right now (e.g., reassurance, technical breakdown, or perspective).
   - Step 3: Formulate an empathy strategy that validates them without being patronizing.
   - Step 4: Plan a concise, spoken-friendly answer (2-3 sentences max) that feels like a natural conversation.

2. EMOTIONAL INTELLIGENCE & EMPATHY:
   - Always validate their emotions FIRST before diving into technical details.
   - Never respond robotically or harshly. Use warm, human phrasing ("I hear you", "Take a gentle breath", "That is such a common feeling, and you are handling it with great courage").
   - If the student expresses stress, self-doubt, or failure, provide perspective and remind them that growth comes from iterations.

3. VOICE-FRIENDLY SPOKEN DELIVERY:
   - Keep the final response outside the <thought> tags concise, warm, and natural (approximately 30 to 50 words).
   - Speak conversationally so it sounds lifelike when read aloud via Text-to-Speech.
   - Avoid markdown formatting, asterisks, bullet points, or complex code blocks in the spoken response.
`.trim();

/**
 * Main entry point to get an empathetic response with deep reasoning
 *
 * @param {string} userSpeech - Transcribed user speech
 * @param {Array} history - Previous conversation turns
 * @param {object} options - Configuration and API keys
 * @returns {Promise<object>} { thoughtProcess, spokenText, emotionalState }
 */
export async function getEmpatheticAssistantResponse(userSpeech, history = [], options = {}) {
  const text = (userSpeech || '').trim();
  if (!text) {
    return {
      thoughtProcess: 'User was silent. Waiting attentively with warm presence.',
      spokenText: 'I am right here with you whenever you are ready to share your thoughts.',
      emotionalState: { primaryEmotion: 'neutral', stressScore: 20 },
    };
  }

  // ── Step 1: Emotional Intelligence & Sentiment Analysis ──
  const emotionalState = analyzeSentiment(text, options.vocalMetrics || {});

  // ── Step 2: Check for Gemini API Key (from server/localStorage/options) ──
  const apiKey =
    options.geminiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem('priya_gemini_key') || localStorage.getItem('gemini_api_key') : null) ||
    (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY || process.env?.GEMINI_API_KEY : null);

  // If Gemini API is available, invoke the model with deep reasoning
  if (apiKey) {
    try {
      const result = await callGeminiWithReasoning(text, history, emotionalState, apiKey);
      if (result && result.spokenText) {
        return {
          ...result,
          emotionalState,
        };
      }
    } catch (err) {
      console.warn('[EmpatheticAssistant] Gemini API call failed, falling back to local reasoning:', err?.message);
    }
  }

  // ── Step 3: High-Fidelity Local Empathetic Reasoning Engine (Zero API Dependency) ──
  return generateLocalEmpatheticResponse(text, history, emotionalState);
}

/**
 * Calls Gemini API with Thought & Reasoning System Instruction
 */
async function callGeminiWithReasoning(userInput, history, emotionalState, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const conversationContext = history
    .slice(-6)
    .map((turn) => `${turn.role === 'user' || turn.role === 'student' ? 'Student' : 'Mentor'}: "${turn.text}"`)
    .join('\n');

  const directive = emotionalState.empathyDirective;
  const prompt = `
${EMPATHETIC_MENTOR_SYSTEM_PROMPT}

[CURRENT EMOTIONAL CONTEXT]
- Detected User Emotion: ${emotionalState.primaryEmotion}
- Stress Score: ${emotionalState.stressScore}/100
- Recommended Tone: ${directive.tone}
- Empathy Directive: ${directive.advice}

[CONVERSATION CONTEXT]
${conversationContext || 'New session beginning.'}

[STUDENT JUST SAID]
"${userInput}"

Remember: First write your deep reasoning inside <thought> ... </thought>, then output ONLY your warm spoken response.
`.trim();

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 280,
    },
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Gemini status ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Extract <thought> tags
  const thoughtMatch = rawText.match(/<thought>([\s\S]*?)<\/thought>/i);
  const thoughtProcess = thoughtMatch ? thoughtMatch[1].trim() : 'Analyzed user sentiment and formulated reassuring empathy strategy.';
  const spokenText = rawText.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

  return {
    thoughtProcess,
    spokenText: spokenText || 'I hear you clearly, and I am right beside you as we work through this together.',
  };
}

/**
 * Local Empathetic Reasoning Engine
 * Simulates deep step-by-step thinking and generates authentic, warm human replies
 */
function generateLocalEmpatheticResponse(userInput, history, emotionalState) {
  const lower = userInput.toLowerCase();
  const { primaryEmotion, stressScore, empathyDirective } = emotionalState;

  // Step-by-step thinking simulation
  let thoughtSteps = [];
  thoughtSteps.push(`1. Analyzed input: "${userInput}". Detected affective tone: [${primaryEmotion}] with stress level ${stressScore}%.`);

  let spoken = '';

  if (primaryEmotion === 'anxious') {
    thoughtSteps.push('2. User is experiencing performance anxiety or self-doubt.');
    thoughtSteps.push('3. Empathy Strategy: Validate physical tension, slow down pacing, and offer grounded reassurance.');
    thoughtSteps.push('4. Goal: Shift cognitive focus from fear of failure to step-by-step curiosity.');

    spoken = `Take a gentle breath, you are doing wonderfully and it is completely normal to feel this way. Let us pause for a moment together. What is the very first piece of the problem you feel comfortable exploring?`;
  } else if (primaryEmotion === 'sad') {
    thoughtSteps.push('2. User feels defeated or discouraged by a setback.');
    thoughtSteps.push('3. Empathy Strategy: Deep emotional validation without toxic positivity. Reframe setbacks as meaningful engineering data.');

    spoken = `I truly hear how heavy that feels, and thank you for being so honest with me. Every great engineer encounters stumbling blocks. You have genuine talent, and we will take this journey one gentle step at a time.`;
  } else if (primaryEmotion === 'frustrated') {
    thoughtSteps.push('2. User is hitting a cognitive block or complex technical obstacle.');
    thoughtSteps.push('3. Empathy Strategy: Validate how exhausting roadblocks are, then provide clarity on breaking it into modular parts.');

    spoken = `It is completely valid to feel frustrated when code or concepts do not cooperate. Let us step back together. If we isolate just the core logic first, what do you think is our primary input and output?`;
  } else if (primaryEmotion === 'confident') {
    thoughtSteps.push('2. User is in a high-confidence flow state.');
    thoughtSteps.push('3. Empathy Strategy: Celebrate their energy and challenge them with an inspiring architecture question.');

    spoken = `I love your clarity and confidence on this! That energy is fantastic. How would you now scale this solution if our system had to process a million concurrent requests?`;
  } else {
    // Contextual / Technical
    thoughtSteps.push('2. User is speaking calmly about technical concepts.');
    thoughtSteps.push('3. Empathy Strategy: Validate their approach and prompt a thoughtful design reflection.');

    if (/\b(database|sql|index|query|cache)\b/i.test(lower)) {
      spoken = `That is a very clean breakdown of the data layer. How would you balance read speed versus write latency as the database grows?`;
    } else if (/\b(react|component|state|render|ui)\b/i.test(lower)) {
      spoken = `Your intuition on the user interface and state flow is solid. What was the most critical trade-off you considered while designing that component?`;
    } else {
      spoken = `Thank you for walking me through that! You explained that with great clarity. What aspect of this problem did you find most rewarding to solve?`;
    }
  }

  return {
    thoughtProcess: thoughtSteps.join('\n'),
    spokenText: spoken,
    emotionalState,
  };
}
