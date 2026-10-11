// ============================================================
// AuraGD – AI Voice Conversation & Evaluation Engine
// Supports: GD, Self Introduction, Casual Talk & Project Pitch Presentation (STAR)
// ============================================================

export const MODES = {
  GD: 'gd',
  SELF_INTRO: 'self_intro',
  CASUAL: 'casual',
  PRESENTATION: 'presentation',
};

export const GD_TOPICS = [
  'AI replacing human jobs in the next decade',
  'Social media — boon or bane for modern society?',
  'Work from Home vs. Office culture — which is more productive?',
  'Climate change — individual responsibility vs corporate accountability',
  'Is entrepreneurship more valuable than a stable corporate job today?',
  'Ethical considerations in autonomous AI decision making',
];

let _currentTopic = GD_TOPICS[Math.floor(Math.random() * GD_TOPICS.length)];
let _turnCount = 0;

export function getCurrentTopic() {
  return _currentTopic;
}

export function resetConversation() {
  _currentTopic = GD_TOPICS[Math.floor(Math.random() * GD_TOPICS.length)];
  _turnCount = 0;
}

// ── Helpers ──────────────────────────────────────────────────
function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// ── Greetings Handling ───────────────────────────────────────
const GREETINGS_REGEX = /\b(hello|hi|hey|good morning|good afternoon|good evening|namaste|namaskar|whats up|how are you)\b/i;

function getGreetingResponse(mode) {
  if (mode === MODES.PRESENTATION) {
    return `Good day! Welcome to your project pitch session. Whenever you are ready, please walk me through your project. Feel free to explain the problem you solved, your tech stack, and any key architecture choices. I am listening attentively.`;
  }
  if (mode === MODES.SELF_INTRO) {
    return `Hello and welcome! Take a deep breath. Whenever you are ready, please introduce yourself naturally — cover your background, key strengths, and what drives you.`;
  }
  if (mode === MODES.CASUAL) {
    return `Good morning! It is wonderful to connect with you. How are you feeling today? We can chat about whatever is on your mind.`;
  }
  return `Good morning! Great to meet you. I am right here with you as your Group Discussion evaluator. Today's discussion theme is: "${_currentTopic}". Whenever you wish, share your perspective.`;
}

// ── Mode 1: Self Introduction Logic ──────────────────────────
const SELF_INTRO_FEEDBACK = [
  {
    praise: 'Your opening was warm, confident, and you clearly articulated your core background.',
    tips: [
      'Try structuring with the Past-Present-Future model: where you started, what you specialize in now, and what you aim to achieve next.',
      'Quantify your impact — mention specific project numbers or team contributions rather than generic skill lists.',
    ],
  },
  {
    praise: 'You maintained a great natural cadence and showed genuine passion for your domain.',
    tips: [
      'Avoid relying on filler words or repeating skill names; replace them with concrete problem-solving examples.',
      'Wrap up with a crisp hook explaining why you are excited about this specific opportunity or stage.',
    ],
  },
  {
    praise: 'Your tone was authentic and approachable, which immediately builds great rapport with interviewers.',
    tips: [
      'Keep your introduction under 90 seconds to preserve interviewer curiosity for follow-up questions.',
      'Clearly emphasize your unique competitive edge or core engineering philosophy.',
    ],
  },
];

function getSelfIntroResponse(text) {
  const chosen = pickRandom(SELF_INTRO_FEEDBACK);
  const words = text.split(/\s+/).length;

  if (words < 12) {
    return `I heard your initial thoughts! Please feel free to elaborate a bit more on your engineering journey, key milestones, and what inspires you. I am listening.`;
  }

  return `Thank you for sharing your introduction! Here is my feedback: First, ${chosen.praise} For constructive refinement: Number one, ${chosen.tips[0]} Number two, ${chosen.tips[1]} Keep up that great energy! What would you like to discuss next?`;
}

// ── Mode 2: Casual Talk Logic ────────────────────────────────
const CASUAL_RESPONSES = [
  `I completely understand. Balancing interviews, projects, and daily life can feel overwhelming at times. Remember that every mock session is a stepping stone, not a test. How is your preparation feeling right now?`,
  `That makes total sense. Take a slow, calm breath. You are doing great by showing up and practicing out loud. What is something you recently built or learned that you felt proud of?`,
  `I appreciate you sharing that with me. Clear communication comes with consistency and self-kindness. Trust the preparation you have put in. How can I best support you today?`,
  `That is a very human experience. Even the most seasoned engineers feel nervous before presenting or speaking in group discussions. What part of the evaluation process would you like us to practice most?`,
];

function getCasualResponse(text) {
  if (/stress|nervous|anxious|tired|pressure|scared|worried/i.test(text)) {
    return `It is completely normal to feel that way. Take a relaxed breath. You are in a safe, judgment-free space to build confidence. Let us take it one step at a time. What would help you feel more grounded right now?`;
  }
  return pickRandom(CASUAL_RESPONSES);
}

// ── Mode 3: Project Presentation (STAR Framework & Cross-Questions) ──
const TECHNICAL_CROSS_QUESTIONS = [
  {
    topic: 'scalability & concurrency',
    question: `How would your architecture handle a sudden 100x spike in concurrent read and write operations? Would you introduce asynchronous queueing or read replicas?`,
  },
  {
    topic: 'database & latency',
    question: `What led to your choice of database storage model, and how did you approach indexing or caching to keep endpoint latencies under control?`,
  },
  {
    topic: 'security & resilience',
    question: `If an external third-party API or downstream microservice fails unexpectedly, how does your system gracefully degrade without cascading downtime?`,
  },
  {
    topic: 'trade-offs & constraints',
    question: `Every architecture involves trade-offs. Looking back, what is one technical decision or library you would rethink if you had to rebuild this from scratch?`,
  },
];

const PRESENTATION_PRAISES = [
  'You did a solid job outlining the core problem motivation and making the business context clear.',
  'Your walkthrough of the architecture flow was coherent and showed good engineering ownership.',
  'You clearly highlighted the technical challenges and showed practical problem-solving initiative.',
  'Your explanation of the component interactions was crisp and easy to visualize.',
];

const PRESENTATION_TIPS = [
  'Remember to explicitly justify why this specific tech stack was chosen over simpler or standard alternatives.',
  'Ground your conclusion with measurable impact or performance metrics, such as latency reduction or throughput numbers.',
  'Keep your gaze centered on the camera rather than glancing down at slide notes to convey natural conviction.',
  'Structure your narrative cleanly using the STAR model: Situation, Task, Action, and Measurable Result.',
];

function getPresentationResponse(text) {
  const words = text.split(/\s+/).length;

  if (words < 18) {
    return `I am following your project pitch! Please dive deeper into the technical architecture, why you chose your specific tools, and the challenges you tackled during implementation.`;
  }

  const praise = pickRandom(PRESENTATION_PRAISES);
  const tip = pickRandom(PRESENTATION_TIPS);
  const crossQ = pickRandom(TECHNICAL_CROSS_QUESTIONS);

  return `Great walkthrough! Here is my evaluation of your project pitch: To begin with praise, ${praise} For your pitch refinement: ${tip} Now, for your technical cross-question: ${crossQ.question}`;
}

// ── Mode 4: Group Discussion Logic ───────────────────────────
const GD_RESPONSES = [
  `That is a very structured viewpoint. However, how would you address the counterargument that resource inequality could undermine that solution in the short term?`,
  `Strong point! In a competitive GD, acknowledging both stakeholder perspectives gives you immense leadership presence. What actionable policy or technical compromise would you suggest?`,
  `I appreciate your analytical framing. What real-world empirical case study or data point would you cite to convince skeptical panel evaluators?`,
  `Interesting perspective! Disagreement is healthy in a discussion. Can you synthesize how this would impact grassroots adoption versus enterprise scale?`,
];

function getGDResponse(text) {
  if (text.length < 15) {
    return `I am listening! Go ahead and elaborate your stance on "${_currentTopic}". What is your foundational argument?`;
  }
  return pickRandom(GD_RESPONSES);
}

// ── Main Response Dispatcher ─────────────────────────────────
export function getAIResponse(userInput = '', mode = MODES.GD) {
  _turnCount++;
  const cleaned = userInput.trim();

  // If greeting detected, answer naturally in all modes
  if (GREETINGS_REGEX.test(cleaned) && cleaned.split(/\s+/).length <= 6) {
    return getGreetingResponse(mode);
  }

  switch (mode) {
    case MODES.PRESENTATION:
      return getPresentationResponse(cleaned);
    case MODES.SELF_INTRO:
      return getSelfIntroResponse(cleaned);
    case MODES.CASUAL:
      return getCasualResponse(cleaned);
    case MODES.GD:
    default:
      return getGDResponse(cleaned);
  }
}
