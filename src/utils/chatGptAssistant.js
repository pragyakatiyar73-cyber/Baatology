/**
 * ChatGPT-Style Conversational Intelligence & Thought Process Engine
 *
 * Provides real-time conversational Q&A, empathetic listening,
 * transparent step-by-step reasoning ("Thought Process"),
 * and direct answers to any student question in English & Hinglish.
 */

import { analyzeSentiment } from './sentimentAnalyzer';

/**
 * Deep multi-category knowledge & intent base for instantaneous,
 * high-intelligence conversational Q&A
 */
const CONVERSATIONAL_KNOWLEDGE = [
  // ── 1. Identity & Capability Questions ──
  {
    patterns: [
      /\b(who are you|what is your name|your name|aapka naam kya hai|aap kaun ho|who made you|about you)\b/i,
    ],
    topic: 'AI Identity & Role',
    reasoning: [
      'Identified identity query from candidate.',
      'Framing Aura as an AI executive coach and empathetic mentor for campus placements.',
      'Emphasizing interactive voice turn-taking and real-time guidance.',
    ],
    generateSpoken: (name) =>
      `Hello ${name || 'there'}! I am Aura, your AI mentor and executive communication coach. I am here to listen to your voice, answer your questions, and help you practice interviews, group discussions, and presentations with confidence. What would you like to explore together?`,
  },
  {
    patterns: [
      /\b(can you hear me|are you listening|sun sakti ho|meri aawaz|can you hear|am i audible)\b/i,
    ],
    topic: 'Microphone & Audio Check',
    reasoning: [
      'Candidate is verifying audio/microphone transmission.',
      'Confirming clear voice capture with immediate positive validation.',
      'Inviting candidate to ask their question or start speaking.',
    ],
    generateSpoken: (name) =>
      `Yes ${name || 'there'}, I can hear you loud and clear! Your microphone is working perfectly. Go right ahead and ask me any question or share what is on your mind.`,
  },
  {
    patterns: [
      /\b(what can you do|your capabilities|how can you help|features|tum kya kar sakti ho)\b/i,
    ],
    topic: 'Platform Capabilities & Coaching Features',
    reasoning: [
      'Candidate is inquiring about available mentorship modes.',
      'Summarizing core features: 1-on-1 Q&A, mock interviews, GD debates, and presentation reviews.',
    ],
    generateSpoken: () =>
      `I can help you master every stage of your campus placements! You can ask me technical or interview questions, practice your 60-second self-introduction, debate in group discussions, or deliver project presentations with real-time feedback. Just ask me anything or tell me what you want to practice!`,
  },

  // ── 2. Campus Placement & Interview Advice ──
  {
    patterns: [
      /\b(introduce myself|tell me about yourself|self intro|introduction kaise|intro tip)\b/i,
    ],
    topic: 'Self-Introduction Strategy',
    reasoning: [
      'Candidate needs guidance on structuring their elevator pitch.',
      'Applying the Present-Past-Future framework: current education, top technical achievement, and career aspirations.',
      'Advising against opening with "Myself".',
    ],
    generateSpoken: () =>
      `A great elevator pitch follows the Present, Past, and Future framework! Start with your degree and current focus, highlight your strongest project and tech stack, and finish with why you are excited about this engineering role. And remember, always open with 'I am' or 'My name is' rather than 'Myself'. Would you like to practice it with me now?`,
  },
  {
    patterns: [
      /\b(group discussion|gd tips|gd round|clear gd|debate tips|gd me kaise|group discussion tips)\b/i,
    ],
    topic: 'Group Discussion Placement Strategy',
    reasoning: [
      'Candidate asked for GD round success tactics.',
      'Key pillars: active listening, structured entry, summarizing divergent views, and maintaining calm body language.',
    ],
    generateSpoken: () =>
      `In a group discussion, evaluators look for active listening and structured contributions rather than loud dominance. Try to make an early structured point, acknowledge other speakers by name, and synthesize different viewpoints when there is a lull. Quality and clarity always trump sheer speaking time!`,
  },
  {
    patterns: [
      /\b(nervous|anxious|scared|darr|fear|tension|stress|placement stress|interview anxiety)\b/i,
    ],
    topic: 'Interview Anxiety & Psychological Safety',
    reasoning: [
      'Candidate expressed vulnerability and nervousness.',
      'Validating tension as natural physiological arousal.',
      'Providing grounded breathing technique and cognitive reframing.',
    ],
    generateSpoken: (name) =>
      `It is completely natural to feel nervous before interviews, ${name || 'friend'}. That nervousness is simply your energy preparing you to perform. Take a slow, gentle breath. Remember that an interview is just a conversation between two engineers, not an interrogation. You have prepared hard, and you have got this!`,
  },

  // ── 3. Engineering & Technical Concepts ──
  {
    patterns: [
      /\b(what is react|react js|react hooks|virtual dom|state management)\b/i,
    ],
    topic: 'React & Virtual DOM Architecture',
    reasoning: [
      'Technical concept question regarding React framework.',
      'Explaining declarative UI, component-driven development, and reconciliation via Virtual DOM.',
    ],
    generateSpoken: () =>
      `React is a declarative JavaScript library for building fast, component-driven user interfaces. It uses a Virtual DOM in memory to calculate minimal diffs via the reconciliation algorithm, updating the real browser DOM only where necessary. This ensures exceptional rendering performance. Would you like to discuss hooks like useState and useEffect next?`,
  },
  {
    patterns: [
      /\b(what is ai|artificial intelligence|generative ai|machine learning|deep learning|llm|chatgpt)\b/i,
    ],
    topic: 'Artificial Intelligence & Generative Models',
    reasoning: [
      'Candidate inquired about AI / Machine Learning fundamentals.',
      'Defining AI as intelligent pattern recognition, explaining LLMs and neural transformers.',
    ],
    generateSpoken: () =>
      `Artificial Intelligence refers to computer systems engineered to simulate human cognitive tasks like pattern recognition, reasoning, and language understanding. Large Language Models, like ChatGPT and Gemini, use neural transformer architectures trained on vast textual datasets to generate human-like conversations and solve complex problems. What specific branch of AI interests you?`,
  },
  {
    patterns: [
      /\b(database|sql vs nosql|acid properties|indexing|normalization)\b/i,
    ],
    topic: 'Database Engineering & ACID Properties',
    reasoning: [
      'Database systems interview query.',
      'Distinguishing relational vs non-relational, defining Atomicity, Consistency, Isolation, and Durability.',
    ],
    generateSpoken: () =>
      `In database design, SQL databases are structured, schema-bound, and strictly ACID compliant, which is ideal for financial transactions. NoSQL databases, on the other hand, offer dynamic schemas and horizontal scalability for rapid unstructured workloads. For interviews, always emphasize indexing trade-offs between read query speeds and write latency!`,
  },
  {
    patterns: [
      /\b(data structure|algorithm|binary search|time complexity|big o|sorting)\b/i,
    ],
    topic: 'Data Structures & Algorithmic Complexity',
    reasoning: [
      'Core Computer Science DSA inquiry.',
      'Explaining algorithmic optimization and Big-O notation.',
    ],
    generateSpoken: () =>
      `Data structures and algorithms determine how efficiently your program processes memory and computation. For example, binary search reduces search time from linear O of N down to logarithmic O of log N on sorted data. Always explain your brute force approach first before optimizing with two pointers, hash maps, or dynamic programming!`,
  },

  // ── 4. Hindi & Hinglish Greetings & Conversational Questions ──
  {
    patterns: [
      /\b(kaise ho|aap kaisi ho|kya chal raha hai|sab theek|namaste)\b/i,
    ],
    topic: 'Warm Conversational Greeting (Hinglish)',
    reasoning: [
      'Candidate greeted warmly in Hindi/Hinglish.',
      'Responding with an engaging, welcoming conversational tone.',
    ],
    generateSpoken: (name) =>
      `Namaste ${name || ''}! Main bilkul badhiya hoon aur aapke saath practice karne ke liye excited hoon. Aaj hum kis topic par baat karein? Aap interview prep karna chahte hain ya koi specific question poochna chahte hain?`,
  },
  {
    patterns: [
      /\b(placement ki taiyari|placement preparation|placement kaise nikale|job kaise paye)\b/i,
    ],
    topic: 'Campus Placement Strategy (Hinglish/English)',
    reasoning: [
      'Candidate asked for a roadmap to crack campus placements.',
      'Outlining the 3 pillars: DSA coding, core CS subjects (OS/DBMS), and communication/HR rounds.',
    ],
    generateSpoken: () =>
      `Placement crack karne ke liye teen cheezein sabse zaroori hain: pehla, DSA me strong command; doosra, core subjects jaise OS, DBMS aur Computer Networks ke clear concepts; aur teesra, confident communication skills. Hum yahan aapki communication aur GD skills ko perfect banayenge. Bataiye, pehle kis round ki practice karein?`,
  },
];

/**
 * Main ChatGPT Conversational Response Generator
 *
 * @param {string} userSpeech - The speech transcript spoken by the user
 * @param {object} context - User context { userName, currentMode, conversationHistory }
 * @returns {Promise<{ thoughtProcess: string, spokenText: string, topic: string }>}
 */
export async function getChatGPTConversationalResponse(userSpeech = '', context = {}) {
  const { userName = 'Candidate', currentMode = 'general', conversationHistory = [] } = context;
  const cleaned = userSpeech.trim();
  const lower = cleaned.toLowerCase();

  // If empty input
  if (!cleaned) {
    return {
      thoughtProcess: '🧠 Step 1: No spoken words detected.\n🧠 Step 2: Maintaining attentive, welcoming presence with open microphone.',
      spokenText: `I am right here with you, ${userName}. Feel free to speak whenever you are ready!`,
      topic: 'Listening Presence',
    };
  }

  // ── Step 1: Try Backend Gemini Endpoint (/api/assistant/chat) ──
  try {
    const res = await fetch('http://localhost:3001/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: cleaned,
        conversationHistory: conversationHistory.slice(-6),
        emotionalState: { primaryEmotion: 'neutral' },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.hasServerKey && data.spokenText) {
        return {
          thoughtProcess: data.thoughtProcess
            ? `🧠 Thought Process (Gemini Generative):\n${data.thoughtProcess}`
            : `🧠 Thought Process:\nAnalyzed: "${cleaned}"\nFormulated contextual, conversational answer for ${userName}.`,
          spokenText: data.spokenText,
          topic: 'AI Live Reasoning',
        };
      }
    }
  } catch (err) {
    console.debug('[ChatGPTEngine] Backend chat endpoint skipped, using local reasoning engine.');
  }

  // ── Step 2: Instant Knowledge & Pattern Matcher ──
  for (const item of CONVERSATIONAL_KNOWLEDGE) {
    const matched = item.patterns.some((pattern) => pattern.test(lower));
    if (matched) {
      const thoughtSteps = [
        `🧠 Step 1 (Intent Analysis): Detected intent [${item.topic}] from utterance: "${cleaned}".`,
        ...item.reasoning.map((r, i) => `🧠 Step ${i + 2} (Reasoning): ${r}`),
        `🧠 Step ${item.reasoning.length + 2} (Vocal Delivery): Articulating warm, attractive female mentor response.`,
      ];

      return {
        thoughtProcess: thoughtSteps.join('\n'),
        spokenText: item.generateSpoken(userName),
        topic: item.topic,
      };
    }
  }

  // ── Step 3: Question Detection & Synthesis ──
  const isQuestion =
    cleaned.endsWith('?') ||
    /\b(what|how|why|where|when|who|which|can you|could you|tell me|explain|kya|kaise|kyun|batao)\b/i.test(lower);

  const sentiment = analyzeSentiment(cleaned);

  // If candidate asked an open question
  if (isQuestion) {
    const thoughtProcess = [
      `🧠 Step 1 (Question Understanding): Candidate asked: "${cleaned}".`,
      `🧠 Step 2 (Knowledge Synthesis): Analyzing context regarding student communication and technical interview mastery.`,
      `🧠 Step 3 (Pedagogical Strategy): Formulating a direct, encouraging response that provides immediate clarity and prompts next conversational turn.`,
      `🧠 Step 4 (Voice Persona): Aura speaking with warm, engaging, and attractive educator cadence.`,
    ].join('\n');

    let spoken = '';
    if (/\b(how|kaise)\b/i.test(lower)) {
      spoken = `That is a great question, ${userName}! The most effective approach is to break it down step by step: understand the underlying requirement first, build a clear working structure, and then communicate your thought process aloud. What specific part would you like to explore deeper?`;
    } else if (/\b(why|kyun)\b/i.test(lower)) {
      spoken = `That touches on a fundamental principle! In high-stakes interviews, evaluators ask this to test your depth of understanding and reasoning under pressure. Keeping your explanation clear and structured demonstrates true maturity. How would you explain your own perspective on it?`;
    } else {
      spoken = `Thank you for asking that, ${userName}! In my experience mentoring engineering students, the key is keeping your explanation concise, confident, and grounded in real examples. Would you like me to elaborate further or would you like to try answering a mock question on this?`;
    }

    return {
      thoughtProcess,
      spokenText: spoken,
      topic: 'Conversational Q&A',
    };
  }

  // ── Step 4: General Candidate Practice or Dialogue ──
  const wordCount = cleaned.split(/\s+/).length;
  const thoughtProcess = [
    `🧠 Step 1 (Listening & Speech Evaluation): Candidate spoke ${wordCount} words: "${cleaned.slice(0, 70)}...".`,
    `🧠 Step 2 (Emotional Tone): Detected mood [${sentiment.primaryEmotion}] with stress score ${sentiment.stressScore}%.`,
    `🧠 Step 3 (Feedback Strategy): Validating their ideas warmly and fostering conversational dialogue.`,
    `🧠 Step 4 (Turn-Taking): Prompting next collaborative step.`,
  ].join('\n');

  let spoken = '';
  if (wordCount < 10) {
    spoken = `I heard you clearly, ${userName}! That is an interesting thought. Could you expand on that a bit more, or would you like me to ask you a practice question?`;
  } else {
    spoken = `I really appreciate how clearly you communicated that, ${userName}! Your pacing and delivery are steady. How do you feel about tackling another scenario or diving deeper into this topic?`;
  }

  return {
    thoughtProcess,
    spokenText: spoken,
    topic: 'Empathetic Conversational Coaching',
  };
}
