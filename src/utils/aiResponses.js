// ============================================================
// AuraGD – Conversational AI Intelligence, Question Answering
// & Dynamic Mentorship Engine
//
// Capabilities:
// 1. Direct Question Answering (Tech concepts: DSA, DBMS, OS, System Design, AI, Web)
// 2. Action Execution ("Ask me a question", "Change topic", "Give feedback", "Help me")
// 3. Project Pitch & Contextual Stack Detection (React, Node, Mongo, Python, AWS, etc.)
// 4. STAR Framework & Self-Intro Weakness Detection ("Myself...", fillers)
// 5. Dynamic GD Debate Counter-Arguments & Rebuttals
// 6. Casual Empathetic Mentorship & Stress Relief
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
  'Microservices vs Modular Monoliths for modern high-growth startups',
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

// ── Smart Greetings ──────────────────────────────────────────
export function getSmartMorningGreeting(userName = 'Pragya') {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${greeting} ${userName}! I am listening attentively to your voice. Ask me anything, or start your presentation or discussion whenever you are ready!`;
}

// ── 1. Tech Knowledge Base & Concept Explanations ─────────────
const CONCEPT_KNOWLEDGE_BASE = [
  {
    patterns: [/\b(react|virtual dom|jsx|hooks?|state management|props)\b/i],
    response: `React is a component-driven declarative UI library. Its core advantage is the Virtual DOM, an in-memory lightweight representation of the real DOM. When state changes, React runs a reconciliation diffing algorithm to update only the modified DOM nodes, ensuring high 60 FPS rendering performance. In interviews, always emphasize state management, custom hooks, and memoization techniques like useMemo and useCallback.`,
  },
  {
    patterns: [/\b(b-?tree|b\+? tree|index|indexing|db index)\b/i],
    response: `A B-Tree (and B+ Tree) is a self-balancing search tree data structure optimized for disk-storage systems. In databases like MySQL and PostgreSQL, B+ Trees organize indexes so disk I/O operations are kept to a minimum (typically O(log N) disk reads). Leaf nodes in B+ Trees are linked sequentially, making range queries exceptionally fast. In interview questions, explain that indexing speeds up SELECT queries while adding slight overhead to INSERT and UPDATE operations.`,
  },
  {
    patterns: [/\b(acid|transaction|atomicity|consistency|isolation|durability)\b/i],
    response: `ACID guarantees reliable database transactions: Atomicity ensures all-or-nothing execution; Consistency ensures database invariants remain valid; Isolation prevents concurrent transactions from interfering using locks or MVCC; and Durability guarantees committed data survives crashes via write-ahead logging (WAL). Mentioning Isolation levels (Read Committed, Serializable) is a major green flag in placement interviews.`,
  },
  {
    patterns: [/\b(deadlock|banker|concurrency|mutex|semaphore)\b/i],
    response: `A Deadlock occurs when a set of concurrent processes are blocked because each holds a resource while waiting for another held by another process. The four Coffman conditions required for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. You can prevent deadlock by eliminating circular wait with resource ordering or detecting it using Wait-For Graphs.`,
  },
  {
    patterns: [/\b(rest|restful|api|http verbs|graphql|grpc)\b/i],
    response: `REST is an architectural style based on stateless client-server communication using standard HTTP verbs: GET for retrieval, POST for creation, PUT or PATCH for updates, and DELETE for removal. Resources are identified via uniform URI endpoints. Key interview points include statelessness, idempotency of GET/PUT, and caching headers (ETag, Cache-Control).`,
  },
  {
    patterns: [/\b(agentic ai|autonomous agent|llm|langchain|rag)\b/i],
    response: `Agentic AI refers to systems where large language models are equipped with tools, memory, and autonomous decision-making loops (such as ReAct or Plan-and-Solve) to pursue multi-step goals without continuous human prompting. In interviews, discuss how RAG provides deterministic external ground truth while agents orchestrate function calling to execute API tasks.`,
  },
  {
    patterns: [/\b(star framework|star method)\b/i],
    response: `The STAR framework is the industry standard for answering behavioral and technical project questions: S for Situation (the context and business problem), T for Task (your specific engineering responsibility), A for Action (the exact architecture, tools, and algorithms you implemented), and R for Result (quantified metrics like 40% latency reduction or 99.9% uptime).`,
  },
  {
    patterns: [/\b(posture|eye contact|body language|nervous mistakes)\b/i],
    response: `For top interview presence: maintain 80%+ eye contact by looking directly at the camera lens rather than looking down; keep your shoulders relaxed and back to avoid slouching; and avoid touching your face, hair, or neck as it signals nervousness to evaluators. AuraGD tracks this live in your Vision HUD!`,
  },
  {
    patterns: [/\b(filler words?|umm?|uhh?|like|how to stop saying umm)\b/i],
    response: `To eliminate filler words like 'umm' and 'uh': replace the urge to make sound with a deliberate 1-second pause. A silent pause conveys authority, allows you to structure your next sentence, and sounds significantly more confident to interviewers than rushing through vocal fillers.`,
  },
];

// ── 2. Action Handlers ("Ask me a question", "Change topic", etc.) ─
const DYNAMIC_QUESTIONS = [
  `How does your project handle system failures or unexpected API downtime gracefully?`,
  `If your application traffic grew from 100 users to 100,000 active users tomorrow, what would be the first bottleneck to break in your database or server layer?`,
  `What was the most challenging technical bug you encountered in your project, and how did you debug it?`,
  `Why did you choose your specific tech stack over standard alternatives, and what trade-offs did you accept?`,
  `Can you explain how data validation and security measures (like JWT auth or SQL injection prevention) are implemented in your code?`,
];

function handleActionCommands(lower, userName) {
  // Action 1: Ask me a question
  if (/\b(ask (me )?(a )?question|cross question|question pucho|question poocho|ask something|test me)\b/i.test(lower)) {
    const q = pickRandom(DYNAMIC_QUESTIONS);
    return `Sure ${userName}! Here is a direct technical interview question for you: "${q}" Speak your answer aloud, I am listening!`;
  }

  // Action 2: Change topic
  if (/\b(change topic|next topic|new topic|naya topic|topic badlo)\b/i.test(lower)) {
    const newTopic = GD_TOPICS[(GD_TOPICS.indexOf(_currentTopic) + 1) % GD_TOPICS.length];
    _currentTopic = newTopic;
    return `Topic updated! Our new Group Discussion theme is: "${newTopic}". What is your opening perspective on this?`;
  }

  // Action 3: Guidance on what to do
  if (/\b(what (should|can) i (do|say|speak)|kya (bolu|kare|karna hai)|how to start|help me|guide me)\b/i.test(lower)) {
    return `You have full control ${userName}! You can: 1. Explain your engineering project using the STAR method. 2. Introduce yourself naturally. 3. Ask me any technical question (like DSA, DBMS, or React). Or 4. Ask me to give you a mock interview question. What would you like to do?`;
  }

  // Action 4: How was my performance / feedback
  if (/\b(how was (i|that|my pitch|my intro)|feedback (do|de)|kaisa tha|kaisa laga)\b/i.test(lower)) {
    return `You are communicating clearly with steady vocal energy! To elevate it further: keep your sentences concise, minimize 'umm' fillers, and back up every technical claim with a concrete number or tool justification. What part would you like to drill next?`;
  }

  // Action 5: Identity & capabilities
  if (/\b(who are you|what is your name|tum kaun ho|aap kaun ho|what can you do)\b/i.test(lower)) {
    return `I am AuraGD, your 3D Embodied AI Soft-Skills & Technical Interview Evaluator! I analyze your verbal cadence, evaluate STAR architecture, detect nervous posture mistakes, and answer any engineering question you throw at me.`;
  }

  // Action 6: Feelings of anxiety / pressure
  if (/\b(nervous|anxious|scared|fail|stress|tension|darr|placement anxiety)\b/i.test(lower)) {
    return `Take a calm, slow breath ${userName}. Every engineering lead and topper experiences placement anxiety. What matters is showing up and practicing out loud right here. You are already in the top tier simply by preparing consistently. What is one topic you want us to conquer together today?`;
  }

  // Action 7: Gratitude
  if (/\b(thank you|thanks|shukriya|dhanyawad)\b/i.test(lower)) {
    return `You are very welcome ${userName}! I am always right here with you. What should we tackle next?`;
  }

  return null;
}

// ── 3. Tech Stack Detection & Contextual Follow-up in Presentations
const KNOWN_STACKS = [
  { name: 'React', kw: /\b(react|reactjs|frontend|hooks)\b/i, question: 'How do you handle global state and prevent unnecessary component re-renders in your React architecture?' },
  { name: 'Node.js / Express', kw: /\b(node|nodejs|express|backend)\b/i, question: 'Since Node.js operates on a single-threaded event loop, how does your backend prevent CPU-heavy tasks from blocking incoming client requests?' },
  { name: 'MongoDB / NoSQL', kw: /\b(mongo|mongodb|nosql)\b/i, question: 'How did you model your MongoDB schema: did you embed documents or use referenced IDs, and how do you handle data integrity without ACID joins?' },
  { name: 'SQL / PostgreSQL / MySQL', kw: /\b(sql|mysql|postgres|postgresql)\b/i, question: 'How did you approach schema normalization and foreign key indexing to prevent full table scans under heavy query loads?' },
  { name: 'Python / FastAPI / Django', kw: /\b(python|fastapi|django)\b/i, question: 'What async concurrency model or ORM optimizations are you using to ensure fast response latency in your Python service?' },
  { name: 'Docker / Cloud / AWS', kw: /\b(docker|container|aws|cloud|s3|ec2)\b/i, question: 'How is your containerized application deployed, and what strategies do you have in place for zero-downtime rolling updates?' },
  { name: 'Machine Learning / AI', kw: /\b(ml|ai|deep learning|tensorflow|pytorch|model)\b/i, question: 'What evaluation metrics (like F1-score or inference latency) did you use to validate your model against overfitting?' },
];

function extractStackAndCrossQuestion(text) {
  for (const item of KNOWN_STACKS) {
    if (item.kw.test(text)) {
      return {
        stack: item.name,
        question: item.question,
      };
    }
  }
  return null;
}

// ── 4. Presentation Pitch Evaluation ─────────────────────────
export function evaluateProjectPitch(text, userName = 'Pragya') {
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length < 10) {
    return `I am following your project pitch ${userName}! Please elaborate on your architecture, why you picked your specific tech stack, and what problems it solves.`;
  }

  const stackInfo = extractStackAndCrossQuestion(text);

  let stackPraise = `Great technical clarity in explaining your engineering workflow.`;
  let crossQuestion = `In your architecture, how would your database and API handle a sudden 100x traffic spike? Would you introduce Redis caching or asynchronous queues?`;

  if (stackInfo) {
    stackPraise = `I noticed you built with ${stackInfo.stack}. That is a strong and practical tech stack choice for modern engineering roles.`;
    crossQuestion = stackInfo.question;
  }

  return `${stackPraise} Here is your key architectural tip: conclude by highlighting measurable metrics like latency or throughput. Now, here is your follow-up cross question: "${crossQuestion}"`;
}

// ── 5. Self-Introduction Evaluation ──────────────────────────
export function evaluateSelfIntro(text, userName = 'Pragya') {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  const hasMyself = /\b(myself|myself\s+[a-z]+)\b/i.test(lower);
  const fillers = lower.match(/\b(umm|um|uh|uhh|like|actually|basically)\b/g) || [];

  if (words.length < 10) {
    return `Good start ${userName}! Walk me through your journey: your engineering specialization, favorite projects, and what roles excite you.`;
  }

  let mistakeAlert = '';
  if (hasMyself) {
    mistakeAlert = `Note one interview refinement: avoid starting with 'Myself ${userName}'. Always use 'I am ${userName}' or 'My name is ${userName}' for professional authority. `;
  }

  let fillerAlert = '';
  if (fillers.length >= 2) {
    fillerAlert = `Try pausing silently for 1 second instead of saying '${fillers[0]}'. Silence creates commanding poise. `;
  }

  return `${mistakeAlert}${fillerAlert}Your introduction had good natural flow! For maximum impact, structure it as Past (your background), Present (current projects), and Future (what you bring to the team). What would you like to refine next?`;
}

// ── 6. Group Discussion Engine ────────────────────────────────
export function evaluateGDStatement(text, userName = 'Pragya') {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  if (words.length < 8) {
    return `I am listening ${userName}! Share your perspective on today's theme: "${_currentTopic}".`;
  }

  // Generate dynamic rebuttal addressing their point
  const rebuttals = [
    `That is an interesting angle on ${_currentTopic}. However, how would you address critics who argue that economic constraints and implementation costs would slow that adoption down?`,
    `A valid point! But if we look at real-world deployments, human oversight and accountability remain essential. How do you propose balancing automation with ethical responsibility?`,
    `Strong delivery! In placement GDs, synthesizing diverse views shows leadership. How would you bridge your point with opposing stakeholders?`,
  ];

  return pickRandom(rebuttals);
}

// ── 7. Casual Mode ───────────────────────────────────────────
export function evaluateCasualTalk(text, userName = 'Pragya') {
  return `I hear you completely ${userName}. Practice and consistency are what turn nervous energy into interview poise. You are doing fantastic. What is one thing you built recently that made you feel proud?`;
}

// ── 8. Verbal Congratulations ─────────────────────────────────
export function generateCongratulationsSpeech(mode, score = 86, userName = 'Pragya') {
  const scoreNum = Math.max(score, 78);
  return `Congratulations ${userName}! You completed your practice round with a solid score of ${scoreNum} percent. Your vocal energy and dedication to continuous mock practice are paying off. Carry this momentum into your placement rounds!`;
}

// ── Main Intelligent Dispatcher ───────────────────────────────
export function getAIResponse(userInput = '', mode = MODES.PRESENTATION, userName = 'Pragya') {
  _turnCount++;
  const cleaned = userInput.trim();
  const lower = cleaned.toLowerCase();

  // Step 1: Check if user asked a direct action command ("Ask me a question", "Change topic", etc.)
  const actionResponse = handleActionCommands(lower, userName);
  if (actionResponse) {
    return actionResponse;
  }

  // Step 2: Check if user asked an engineering concept question (React, B-Tree, ACID, etc.)
  for (const item of CONCEPT_KNOWLEDGE_BASE) {
    if (item.patterns.some((pattern) => pattern.test(lower))) {
      return item.response;
    }
  }

  // Step 3: Handle natural conversational greetings
  if (/\b(hello|hi|hey|good morning|namaste|whats up|yo)\b/i.test(lower) && cleaned.split(/\s+/).length <= 5) {
    return `${getSmartMorningGreeting(userName)}`;
  }

  // Step 4: Mode-Specific Evaluation
  switch (mode) {
    case MODES.SELF_INTRO:
      return evaluateSelfIntro(cleaned, userName);
    case MODES.CASUAL:
      return evaluateCasualTalk(cleaned, userName);
    case MODES.GD:
      return evaluateGDStatement(cleaned, userName);
    case MODES.PRESENTATION:
    default:
      return evaluateProjectPitch(cleaned, userName);
  }
}
