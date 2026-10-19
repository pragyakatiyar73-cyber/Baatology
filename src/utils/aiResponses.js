// ============================================================
// Baatology – Conversational AI Intelligence, Question Answering
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

export const GD_PLACEMENT_TOPIC = 'Agentic AI in Cybersecurity & Engineering: Threat or Massive Opportunity?';
export const GD_ROBOT_OPENING = "Welcome to today's GD on Agentic AI. While autonomous systems boost operational speed, ethical boundaries remain uncertain. Candidate, what is your stance on this?";
export const GD_ROBOT_COUNTER_ARGUMENT = "That is a valid point regarding innovation. However, considering system security and accountability, wouldn't immediate deployment create vulnerabilities? How do you counter that?";

export const GD_TOPICS = [
  GD_PLACEMENT_TOPIC,
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
  _currentTopic = GD_TOPICS[0];
  _turnCount = 0;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// ── Smart Time-Aware Greeting (Feature 4) ────────────────────
export function getSmartMorningGreeting() {
  const hour = new Date().getHours();
  let salutation = 'Good evening';
  if (hour < 12) {
    salutation = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    salutation = 'Good afternoon';
  } else {
    salutation = 'Good evening';
  }
  return `${salutation}! How has your day been going so far? I am right here with you. What would you like to talk about today?`;
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
    response: `For top interview presence: maintain 80%+ eye contact by looking directly at the camera lens rather than looking down; keep your shoulders relaxed and back to avoid slouching; and avoid touching your face, hair, or neck as it signals nervousness to evaluators. Baatology tracks this live in your Vision HUD!`,
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
    return `I am Baatology, your 3D Embodied AI Soft-Skills & Technical Interview Evaluator! I analyze your verbal cadence, evaluate STAR architecture, detect nervous posture mistakes, and answer any engineering question you throw at me.`;
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

// ── 4. Feature 6: Project Pitch & Technical Walkthrough (STAR Framework) ──

const KNOWN_TECH_STACKS = [
  { name: 'React', regex: /\b(react|reactjs|frontend|redux|nextjs|next\.js)\b/i },
  { name: 'Node.js', regex: /\b(node|nodejs|express|backend|expressjs)\b/i },
  { name: 'SQL', regex: /\b(sql|mysql|postgres|postgresql|relational database)\b/i },
  { name: 'MongoDB', regex: /\b(mongo|mongodb|nosql|mongoose)\b/i },
  { name: 'REST APIs', regex: /\b(apis?|rest|restful|endpoints?|graphql|grpc)\b/i },
  { name: 'Python', regex: /\b(python|fastapi|django|flask)\b/i },
  { name: 'Docker', regex: /\b(docker|container|kubernetes|k8s)\b/i },
  { name: 'AWS Cloud', regex: /\b(aws|cloud|s3|ec2|lambda)\b/i },
  { name: 'TypeScript', regex: /\b(typescript|ts)\b/i },
];

export function detectPrimaryTech(text) {
  for (const item of KNOWN_TECH_STACKS) {
    if (item.regex.test(text)) {
      return item.name;
    }
  }
  return null;
}

export function analyzeProjectPitch(text, isFollowUp = false, detectedTechOverride = null, userName = 'Pragya') {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  // 1. Identify primary technology
  const detectedTech = detectedTechOverride || detectPrimaryTech(text) || 'modern web architecture';

  // 2. STAR Framework Analysis Engine
  // a) Problem Statement / Situation
  const hasProblem = /\b(problem|challenge|issue|pain point|situation|inefficiency|bottleneck|manual|difficulty|needed to|aimed to|struggled|legacy|barrier)\b/i.test(lower);

  // b) Personal Action & Specific Tech Stack implementation
  const hasAction = /\b(built|developed|implemented|designed|architected|engineered|integrated|created|wrote|refactored|coded|assembled|deployed)\b/i.test(lower);
  const hasTech = KNOWN_TECH_STACKS.some((t) => t.regex.test(lower)) || /\b(frontend|backend|database|api|architecture|stack)\b/i.test(lower);

  // c) Measurable Result, Deployment, or Performance Metric
  const hasResult = /\b(result|outcome|achieved|deployed|production|metric|latency|throughput|reduced|increased|improved|percent|%|users|scaled|traffic|speed|ms|seconds|benchmark|aws|vercel|live)\b/i.test(lower);

  // Calculate STAR Completeness Score (0 to 100)
  let starScore = 52;
  if (hasProblem) starScore += 14;
  if (hasAction) starScore += 14;
  if (hasTech) starScore += 10;
  if (hasResult) starScore += 10;

  if (words.length >= 35) starScore += 5;
  if (words.length < 12) starScore -= 15;

  const fillerCount = (lower.match(/\b(um|umm|uh|uhh|like|basically|actually|you know)\b/g) || []).length;
  starScore -= Math.min(fillerCount * 2, 8);

  const completenessScore = Math.max(48, Math.min(98, Math.round(starScore)));

  // If candidate utterance is very short (< 8 words)
  if (words.length < 8 && !isFollowUp) {
    return {
      feedback: `I am following you, ${userName}! Walk me through your project: describe the problem you tackled, your tech stack, and what results or benchmarks you achieved. Whenever you are ready, continue speaking.`,
      detectedTech,
      completenessScore: Math.max(60, completenessScore),
      hasProblem,
      hasAction,
      hasTech,
      hasResult,
    };
  }

  // 3. Technical Follow-up Cross-Question or Follow-up Resolution
  let feedback = '';

  if (isFollowUp) {
    // Candidate answered the technical cross-question
    feedback = `Excellent technical explanation of your architectural trade-offs with ${detectedTech}. Clearly describing how you diagnosed and resolved system bottlenecks shows strong engineering maturity. You're well-prepared for technical interview rounds!`;
  } else {
    // Initial Pitch: Robot responds verbally with praise followed by authentic interview follow-up question
    feedback = `Good breakdown of your architecture. Since you mentioned using ${detectedTech}, could you explain why you selected that over alternatives, and what was the biggest technical bottleneck you resolved?`;
  }

  return {
    feedback,
    detectedTech,
    completenessScore,
    hasProblem,
    hasAction,
    hasTech,
    hasResult,
  };
}

export function evaluateProjectPitch(text, isFollowUp = false, detectedTechOverride = null, userName = 'Pragya') {
  const analysis = analyzeProjectPitch(text, isFollowUp, detectedTechOverride, userName);
  return analysis.feedback;
}

// ── 5. Feature 5: Self-Introduction Evaluator & Mistake Detection ──
export function analyzeSelfIntro(text, userName = 'Pragya') {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  // a) Grammatical Openings Check: Detect phrases like "Myself [Name]" or "Me is"
  const hasMyself = /\b(myself|my self)\b/i.test(lower);
  const hasMeIs = /\b(me is|me are|me am|me name)\b/i.test(lower);
  const openingMistake = hasMyself || hasMeIs;

  // b) Vocal Filler Detection: Count instances of 'um', 'uh', 'like', 'basically', 'actually', and 'you know'
  const fillerPatterns = [
    { token: 'um', regex: /\b(um|umm)\b/gi },
    { token: 'uh', regex: /\b(uh|uhh)\b/gi },
    { token: 'like', regex: /\b(like)\b/gi },
    { token: 'basically', regex: /\b(basically)\b/gi },
    { token: 'actually', regex: /\b(actually)\b/gi },
    { token: 'you know', regex: /\b(you know)\b/gi },
  ];

  let fillerCount = 0;
  const fillerBreakdown = {};
  fillerPatterns.forEach(({ token, regex }) => {
    const matches = lower.match(regex);
    const count = matches ? matches.length : 0;
    fillerBreakdown[token] = count;
    fillerCount += count;
  });

  // c) Structural Coverage: Check presence of core keywords (engineering/B.Tech, projects, tech stack, career interest)
  const hasEducation = /\b(engineering|b\.?tech|btech|computer science|cs|bachelor|degree|college|university|student|academics?|graduated?)\b/i.test(lower);
  const hasProjects = /\b(project|projects|built|developed|created|application|app|system|designed|coded|platform)\b/i.test(lower);
  const hasTechStack = /\b(react|node|javascript|python|java|cpp|c\+\+|sql|database|mongo|frontend|backend|fullstack|ml|ai|aws|docker|git|api)\b/i.test(lower);
  const hasCareerInterest = /\b(career|interest|goals?|aspire|role|opportunity|passionate|contribute|internship|vision|future)\b/i.test(lower);

  const coverageCount = [hasEducation, hasProjects, hasTechStack, hasCareerInterest].filter(Boolean).length;

  // Compute structure and fluency score out of 100
  let structureScore = 70;
  if (openingMistake) {
    structureScore -= 12;
  } else {
    structureScore += 8;
  }
  structureScore += coverageCount * 5; // up to +20

  let fluencyScore = 80;
  if (fillerCount === 0) {
    fluencyScore += 10;
  } else if (fillerCount <= 2) {
    fluencyScore += 2;
  } else if (fillerCount <= 4) {
    fluencyScore -= 8;
  } else {
    fluencyScore -= Math.min(fillerCount * 3, 25);
  }

  // Adjust for length (ideal elevator pitch: 50 - 160 words)
  if (words.length >= 50 && words.length <= 160) {
    fluencyScore += 5;
  } else if (words.length < 20) {
    fluencyScore -= 10;
  }

  const score = Math.max(52, Math.min(98, Math.round((structureScore * 0.55) + (fluencyScore * 0.45))));

  // Immediate Verbal Feedback generation
  if (words.length < 10) {
    return {
      feedback: `I am following you, ${userName}! Take a steady breath and deliver your 60-second elevator pitch covering your engineering background, key projects, and career interests. Whenever you are ready, continue speaking.`,
      openingMistake,
      fillerCount,
      fillerBreakdown,
      structuralCoverage: { hasEducation, hasProjects, hasTechStack, hasCareerInterest, coverageCount },
      score: Math.max(60, score),
    };
  }

  // 1. Praise one strong aspect
  let praise = "You communicated with a clear, confident voice and structured your thoughts with good energy.";
  if (hasProjects && hasTechStack) {
    praise = "You projected great vocal confidence and gave a strong walkthrough of your technical projects and stack.";
  } else if (hasEducation && hasProjects) {
    praise = "You spoke with a clear, confident voice and connected your engineering background to your projects very well.";
  } else if (coverageCount >= 3) {
    praise = "Great vocal projection! Your introduction covered multiple essential facets of your engineering profile.";
  }

  // 2. Point out opening mistake if "Myself" was detected
  let openingCorrection = "";
  if (openingMistake) {
    openingCorrection = " Remember to open with 'I am' or 'My name is' instead of 'Myself'.";
  }

  // 3. Mention filler word count
  let fillerFeedback = "";
  if (fillerCount > 0) {
    fillerFeedback = ` You had ${fillerCount} hesitation filler${fillerCount > 1 ? 's' : ''}. Work on taking natural pauses instead.`;
  } else {
    fillerFeedback = " Your delivery was remarkably clean with zero hesitation fillers.";
  }

  // Next step recommendation
  let nextStep = "";
  if (!hasCareerInterest) {
    nextStep = " For a complete elevator pitch, tie your conclusion back to your target engineering roles. What would you like to refine next?";
  } else {
    nextStep = " That was a solid foundation. What technical question or scenario should we practice next?";
  }

  const feedback = `${praise}${openingCorrection}${fillerFeedback}${nextStep}`;

  return {
    feedback,
    openingMistake,
    fillerCount,
    fillerBreakdown,
    structuralCoverage: { hasEducation, hasProjects, hasTechStack, hasCareerInterest, coverageCount },
    score,
  };
}

export function evaluateSelfIntro(text, userName = 'Pragya') {
  const analysis = analyzeSelfIntro(text, userName);
  return analysis.feedback;
}

// ── 6. Group Discussion Engine (Feature 7) ────────────────────
export function analyzeGDArgument(text, turnIndex = 0, userName = 'Pragya') {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  // Detect hesitation filler words
  const fillers = (lower.match(/\b(um|umm|uh|uhh|like|basically|actually|you know)\b/g) || []).length;

  // Stance detection & theme extraction
  const mentionsOpportunity = /\b(opportunity|innovat|advantage|benefit|growth|speed|accelerat|future|promis|empower)\b/i.test(lower);
  const mentionsThreat = /\b(threat|risk|danger|vulnerabilit|attack|exploit|malicious|breach|harm|weapon)\b/i.test(lower);
  const mentionsSecurity = /\b(security|accountability|audit|complian|govern|firewall|guardrail|oversight)\b/i.test(lower);

  // Turn 0: Initial argument delivered by candidate
  if (turnIndex === 0) {
    // If the candidate spoke very few words (< 5), encourage them gently
    if (words.length < 5) {
      return {
        feedback: `I am listening closely, ${userName}. Share your opening perspective on today's topic: Agentic AI in Cybersecurity — do you see it as a threat, or a massive engineering opportunity?`,
        turn: 0,
        fillers,
        isRebuttal: false,
        score: 75,
      };
    }

    // Authentic, polite debate counter-point specified in Feature 7
    const feedback = GD_ROBOT_COUNTER_ARGUMENT;

    return {
      feedback,
      turn: 0,
      fillers,
      isRebuttal: false,
      mentionsOpportunity,
      mentionsThreat,
      mentionsSecurity,
      score: 85,
    };
  }

  // Turn 1: Candidate delivers their rebuttal to the counter-argument
  if (turnIndex === 1) {
    const feedback = `Well-argued rebuttal! You balanced operational speed with cybersecurity defense very effectively. In high-stakes placement discussions, acknowledging security vulnerabilities while championing innovation demonstrates top-tier leadership presence.`;

    return {
      feedback,
      turn: 1,
      fillers,
      isRebuttal: true,
      mentionsOpportunity,
      mentionsThreat,
      mentionsSecurity,
      score: 90,
    };
  }

  // Turn 2+: Continuing placement discussion
  const advancedRebuttals = [
    `Strong technical synthesis, ${userName}! How would you address the software supply chain risks if autonomous AI agents pull unverified third-party libraries into production?`,
    `A solid closing perspective! In real-world enterprise placement GDs, building consensus among divided teams is a hallmark of engineering leadership.`,
  ];

  return {
    feedback: advancedRebuttals[(turnIndex - 2) % advancedRebuttals.length],
    turn: turnIndex,
    fillers,
    isRebuttal: true,
    score: 88,
  };
}

export function evaluateGDStatement(text, userName = 'Pragya') {
  const analysis = analyzeGDArgument(text, _turnCount, userName);
  return analysis.feedback;
}

// ── 7. Casual Talk & Empathetic Mental Wellness Mode (Feature 8) ─────────────
export const CASUAL_ROBOT_WELCOME = "Hey there! Take a deep breath. There is no scoring or judgment in this room today. How are you feeling about your preparations, or what is on your mind?";

export function analyzeCasualWellness(text, turnIndex = 0, userName = 'Pragya') {
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  // Emotional tone and stress markers detection (Feature 8)
  const isStressed = /\b(stressed|stress|anxious|anxiety|worried|worry|worries|afraid|fear|overwhelmed|nervous|pressure|panic|darr|scared|doubt|depressed|fail|failing|exhausted|burnout|tired|confused|stuck|lost|hopeless)\b/i.test(lower);
  const isInterviewFear = /\b(interview|placement|round|rejection|rejected|company|shortlist|coding test|mock|dsa|aptitude|salary|offer|unplaced|companies)\b/i.test(lower);
  const isPreparationDoubt = /\b(not ready|forgot|forgetting|blank|can't remember|lack of confidence|behind|struggling|not enough|lagging|preparation|studying)\b/i.test(lower);
  const isGratitudeOrRelief = /\b(better|relieved|good|calm|calmer|okay|fine|thank|thanks|helped|nice|happy|relaxed|peace|refresh)\b/i.test(lower);

  let feedback = '';

  if (isStressed || isInterviewFear || isPreparationDoubt) {
    // Validate emotions & offer grounded calming encouragement
    const supportiveAdvice = [
      `Placement anxiety is very common, ${userName}, and it is completely okay to feel overwhelmed. Remember, one interview or coding round does not define your worth as an engineer. Focus on one small step at a time. You have the technical skills, trust your preparation.`,
      `I hear you so deeply, ${userName}. Engineering placements bring immense pressure, but feeling anxious simply means you care about your future. You don't have to conquer everything in one day. Focus on one small step at a time, take a slow breath, and be proud of how far you've come.`,
      `Take a gentle, slow breath with me, ${userName}. In moments of high stress, our minds convince us that everyone else has it figured out, but almost every student feels this exact same doubt. Trust your preparation, give yourself grace, and take things one day at a time.`,
    ];
    feedback = supportiveAdvice[turnIndex % supportiveAdvice.length];
  } else if (isGratitudeOrRelief) {
    feedback = `I am so glad to hear that, ${userName}! Giving your mind permission to unwind and speak without judgment is just as crucial for placement success as technical problem-solving. Carry this calm headspace with you today.`;
  } else if (words.length < 5) {
    feedback = `Take all the time you need, ${userName}. There is no timer or score here today. Speak whatever comes to mind—I am right here with you.`;
  } else {
    feedback = `I hear you, ${userName}. Speaking your thoughts aloud helps untangle mental knots and grounds your confidence. How are you feeling right now?`;
  }

  return {
    feedback,
    turn: turnIndex,
    isStressed,
    isInterviewFear,
    isPreparationDoubt,
  };
}

export function evaluateCasualTalk(text, userName = 'Pragya') {
  const analysis = analyzeCasualWellness(text, _turnCount, userName);
  return analysis.feedback;
}

// ── 8. Feature 9: Verbal Reinforcement & Positive Thinking ─────
export function constructVerbalReinforcement({ eyeContact = 88, fillers = 1 }) {
  const safeEye = Math.round(eyeContact || 88);
  const safeFillers = Math.max(fillers ?? 0, 0);
  return `Fantastic effort today! Look at your progress—your eye contact was steady at ${safeEye}%, and you kept vocal hesitations down to just ${safeFillers}. Keep this confidence high for your campus placements!`;
}

// ── 8b. Mode-Specific Verbal Congratulations ─────────────────────────────────
export function generateCongratulationsSpeech(mode, score = 86, userName = 'Pragya') {
  const scoreNum = Math.max(score || 85, 78);
  if (mode === MODES.CASUAL || mode === 'casual') {
    return `Wonderful session, ${userName}! You took a deliberate pause to decompress, reset your mindset, and ground your vocal energy. Taking care of your mental wellness is your secret superpower during placement season. You are doing fantastic!`;
  }
  if (mode === MODES.GD || mode === 'gd') {
    return `Congratulations ${userName}! You completed your Group Discussion round with a solid score of ${scoreNum} percent. You asserted strong points on Agentic AI and handled the debate counter-arguments with great poise and eye contact. Outstanding effort!`;
  }
  if (mode === MODES.PRESENTATION || mode === 'presentation') {
    return `Congratulations ${userName}! You completed your Project Presentation round with a solid score of ${scoreNum} percent. Your STAR structure and architectural trade-off explanations were spot on. Keep this momentum into your placement rounds!`;
  }
  if (mode === MODES.SELF_INTRO || mode === 'self_intro') {
    return `Congratulations ${userName}! You completed your Self-Introduction round with a solid score of ${scoreNum} percent. Your opening structure and vocal clarity were fantastic. Carry this momentum into your placement rounds!`;
  }
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
