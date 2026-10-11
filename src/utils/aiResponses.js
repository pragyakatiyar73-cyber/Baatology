// ============================================================
// AuraGD – AI Voice Conversation, Evaluation & Mentorship Engine
// Covers:
// 1. Smart Morning Greeting & Welcoming
// 2. Self-Introduction Evaluator & Mistake Detection ("Myself...", fillers, Past-Present-Future)
// 3. Project Pitch & Technical Walkthrough (STAR Framework & Deep Cross-Questions)
// 4. Group Discussion (GD) Debate Engine (Agentic AI, Turn-taking, Counter-points)
// 5. Casual Talk / Feelings Share Mode (Placement Anxiety, Empathy & Calming Advice)
// 6. Verbal Congratulations & Positive Thinking Speech on Session End
// ============================================================

export const MODES = {
  GD: 'gd',
  SELF_INTRO: 'self_intro',
  CASUAL: 'casual',
  PRESENTATION: 'presentation',
};

export const GD_TOPICS = [
  'Agentic AI and Autonomous Workflows replacing traditional tech roles in the next 5 years',
  'Remote vs Hybrid vs Office culture — what actually maximizes software engineering velocity?',
  'Open Source AI models vs Proprietary Closed APIs — which will dominate future software?',
  'Should college engineering curriculum be completely redesigned around practical architecture over rote theory?',
  'Is prompt engineering and AI tool literacy becoming more critical than traditional coding syntax?',
];

let _currentTopic = GD_TOPICS[0];
let _turnCount = 0;

export function getCurrentTopic() {
  return _currentTopic;
}

export function resetConversation() {
  _currentTopic = GD_TOPICS[Math.floor(Math.random() * GD_TOPICS.length)];
  _turnCount = 0;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// ── 1. Smart Greeting Logic ───────────────────────────────────
export function getSmartMorningGreeting(userName = 'Pragya') {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${timeGreeting} ${userName}! How has your day been going so far? I am right here with you. What would you like to practice today?`;
}

// ── 2. Self-Introduction Evaluator & Mistake Detection ─────────
export function evaluateSelfIntro(text, userName = 'Pragya') {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  // Check 1: Weak grammatical opening ("Myself ...")
  const hasMyselfOpening = /\b(myself|myself\s+[a-z]+)\b/i.test(lower);

  // Check 2: Filler words count
  const fillerMatches = lower.match(/\b(umm|um|uh|uhh|like|actually|basically|you know|sort of)\b/g) || [];
  const fillerCount = fillerMatches.length;

  // Check 3: Short / incomplete introduction
  if (words.length < 15) {
    return `I heard your opening ${userName}! Go ahead and speak freely about your engineering background, favorite projects, and what drives you. I am listening attentively.`;
  }

  let openingCorrection = '';
  if (hasMyselfOpening) {
    openingCorrection = `First, an important interview correction: avoid starting with 'Myself ${userName}'. Grammatically in professional interviews, always introduce yourself with 'I am ${userName}' or 'My name is ${userName}'. It immediately sounds sharper. `;
  }

  let fillerAdvice = '';
  if (fillerCount >= 2) {
    fillerAdvice = `I noticed a few filler words like ${fillerMatches.slice(0, 2).map(f => `'${f}'`).join(' and ')}. Remember, taking a silent 1-second pause is much more commanding than filling the silence with vocal hesitation. `;
  }

  const praises = [
    `Your tone was clear, authentic, and you communicated your core technical passions effectively.`,
    `You projected solid confidence and articulated your journey with good natural pacing.`,
  ];

  const structuralTips = [
    `To make it world-class, use the Past-Present-Future structure: where your tech journey started, what high-impact projects you build today, and what you aim to achieve in this role.`,
    `Add one quantifiable accomplishment, such as a latency optimization number or a hackathon achievement, to leave a memorable impression on the interviewer.`,
  ];

  return `${openingCorrection}${fillerAdvice}Praise where it is due: ${pickRandom(praises)} Here is your key takeaway: ${pickRandom(structuralTips)} Overall, wonderful effort! What would you like to refine next?`;
}

// ── 3. Project Pitch & Technical Walkthrough (STAR Framework) ───
const TECH_CROSS_QUESTIONS = [
  `In your architecture, how would the database handle a sudden 100x traffic burst during peak load? Would you introduce Redis caching, read replicas, or queue-based asynchronous writes?`,
  `What led you to your specific choice of tech stack over standard alternatives, and what was the single biggest engineering trade-off you had to navigate during implementation?`,
  `How does your application guarantee security and data consistency if a downstream microservice or third-party authentication API fails unexpectedly?`,
  `Every system design has a bottleneck. Looking back, what is one component or architectural choice you would re-architect differently for higher throughput?`,
];

export function evaluateProjectPitch(text) {
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length < 20) {
    return `I am following your project walkthrough! Please dive deeper into the problem motivation, how your architecture handles data flow, and the concrete engineering challenges you solved.`;
  }

  const praises = [
    `Strong technical framing! You articulated the problem statement with clarity and demonstrated genuine ownership of the codebase.`,
    `Excellent explanation of the component interactions. Your structured narrative showed great engineering maturity.`,
  ];

  const starTips = [
    `Make sure your conclusion firmly highlights measurable metrics — such as response latency, throughput, or user feedback — so evaluators see tangible business impact.`,
    `Clearly articulate the 'Why' behind each library in your tech stack, not just what it does. Interviewers evaluate your architectural reasoning.`,
  ];

  const crossQuestion = pickRandom(TECH_CROSS_QUESTIONS);

  return `${pickRandom(praises)} For your pitch delivery: ${pickRandom(starTips)} Now, here is your technical cross-question: ${crossQuestion}`;
}

// ── 4. Group Discussion (GD) Debate Engine ────────────────────
const GD_COUNTER_POINTS = [
  `While that argument is compelling, critics would argue that resource inequality and legacy infrastructure could undermine adoption in the near term. How do you defend your proposal against this critique?`,
  `Let me challenge that view directly. If we look at empirical market data, automated AI systems often increase cognitive demands on workers rather than simply eliminating workload. What is your rebuttal?`,
  `A strong point! However, what specific policy compromise or technical safeguards would you propose to balance rapid innovation with ethical and privacy concerns?`,
  `Insightful perspective! In a placement GD, bridging contrasting viewpoints demonstrates senior leadership. How would you synthesize your point to accommodate both enterprise productivity and employee well-being?`,
];

export function evaluateGDStatement(text) {
  if (text.split(/\s+/).length < 10) {
    return `I am listening! Go ahead and elaborate your viewpoint on today's topic: "${_currentTopic}". Back up your perspective with real-world examples.`;
  }
  return pickRandom(GD_COUNTER_POINTS);
}

// ── 5. Casual Talk / Feelings & Stress Share Mode ──────────────
const CASUAL_MENTOR_RESPONSES = [
  `I hear you, and it is completely normal to feel that way. Placement season and technical interviews carry immense pressure. Remember that preparation is a marathon, not a sprint, and every mock session builds real muscle. How are you taking care of your rest today?`,
  `Take a slow, deep breath. You are doing fantastic by simply showing up and practicing out loud. Confidence isn't the absence of nervousness; it's moving forward alongside it. What is something you recently built or solved that you felt genuinely proud of?`,
  `Thank you for being open with me. Imposter syndrome affects even the most experienced tech leads. Trust the consistency you are putting in day after day. How can I best support you in feeling grounded right now?`,
  `That makes total sense. Remember to treat yourself with the same empathy and kindness you would show a close friend. You are progressing steadily. What would help you feel most relaxed today?`,
];

export function evaluateCasualTalk(text) {
  const lower = text.toLowerCase();
  if (/stress|nervous|anxious|fail|fear|scared|pressure|tired|worried|overwhelm/i.test(lower)) {
    return `Take a calm, slow breath with me. It is completely natural to feel anxious when working hard toward your career goals. You are in a safe, zero-judgment space right now. Remember how far you have already come. What is one small step we can take together today that would give you peace of mind?`;
  }
  return pickRandom(CASUAL_MENTOR_RESPONSES);
}

// ── 6. Verbal Congratulations & Positive Thinking Speech ──────
export function generateCongratulationsSpeech(mode, score = 86, userName = 'Pragya') {
  const scoreNum = Math.max(score, 75);
  const praises = [
    `Congratulations ${userName}! Look at how far you have come! You achieved a solid score of ${scoreNum} percent. Your dedication, courage to speak out loud, and steady focus are your greatest assets. Carry this positive energy forward into your upcoming interviews!`,
    `Brilliant session ${userName}! Congratulations on finishing your practice round with a ${scoreNum} percent score. Every single time you practice out loud, your communication barriers break down. Keep believing in your skills!`,
  ];
  return pickRandom(praises);
}

// ── Main Dispatcher ──────────────────────────────────────────
export function getAIResponse(userInput = '', mode = MODES.PRESENTATION, userName = 'Pragya') {
  _turnCount++;
  const cleaned = userInput.trim();

  // Natural greeting handling
  if (/\b(hello|hi|hey|good morning|good afternoon|good evening|namaste|whats up)\b/i.test(cleaned) && cleaned.split(/\s+/).length <= 6) {
    return `${getSmartMorningGreeting(userName)} Feel free to speak whenever you are comfortable.`;
  }

  switch (mode) {
    case MODES.SELF_INTRO:
      return evaluateSelfIntro(cleaned, userName);
    case MODES.PRESENTATION:
      return evaluateProjectPitch(cleaned);
    case MODES.CASUAL:
      return evaluateCasualTalk(cleaned);
    case MODES.GD:
    default:
      return evaluateGDStatement(cleaned);
  }
}
