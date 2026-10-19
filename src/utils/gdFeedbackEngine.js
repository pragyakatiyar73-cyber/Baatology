// ============================================================
// AuraGD – Group Discussion Feedback Engine & Avatar AI Logic
// Handles:
// 1. 3 AI Avatar Profiles (Rohan, Ananya, Vikram) with distinct personalities & voices
// 2. Curated GD Topics (Student topic de OR Avatar topic de)
// 3. Dynamic contextual argument generator for each Avatar
// 4. Detailed mistake detection: Grammar, Vocabulary, Fluency, Point Depth
// 5. Interactive "Sentence Practice / Dubara Bolwaye" accuracy analyzer
// ============================================================

export const GD_AVATARS = [
  {
    id: 'rohan',
    name: 'Rohan Sharma',
    role: 'Tech Optimist',
    perspective: 'Pro-Innovation & Scalability',
    college: 'IIT Bombay',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
    voicePitch: 1.05,
    voiceRate: 1.0,
    voiceGender: 'male',
    colorTheme: 'cyan',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'ananya',
    name: 'Ananya Roy',
    role: 'Balanced Analyst',
    perspective: 'Data, Ethics & Human Impact',
    college: 'BITS Pilani',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    voicePitch: 1.18,
    voiceRate: 1.0,
    voiceGender: 'female',
    colorTheme: 'purple',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    id: 'vikram',
    name: 'Vikram Malhotra',
    role: "Devil's Advocate",
    perspective: 'Risks, Ground Reality & Costs',
    college: 'IIM Ahmedabad',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    voicePitch: 0.88,
    voiceRate: 0.96,
    voiceGender: 'male_deep',
    colorTheme: 'amber',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
];

export const POPULAR_GD_TOPICS = [
  {
    id: 'gd-ai-jobs',
    title: 'Will Artificial Intelligence replace software developers or augment them?',
    category: 'Technology & Career',
    description: 'Debating AI coding agents, architectural complexity, developer productivity, and the future job landscape.',
    keyPoints: [
      'AI tools like GitHub Copilot and ChatGPT increase coding speed by up to 55%.',
      'High-level architecture, business logic, and security verification still need human ingenuity.',
      'Entry-level junior roles will face higher qualification standards.',
    ],
  },
  {
    id: 'gd-wfh-vs-office',
    title: 'Remote Work vs Return-to-Office: What truly drives long-term innovation?',
    category: 'Workplace & Culture',
    description: 'Weighing employee flexibility, work-life balance, serendipitous hallway collaboration, and corporate culture.',
    keyPoints: [
      'Remote work saves 2-3 hours of daily commute and expands talent access globally.',
      'In-person spontaneous interactions spark faster creative breakthroughs.',
      'Hybrid model provides a balanced middle ground for team bonding and deep focus.',
    ],
  },
  {
    id: 'gd-ev-transition',
    title: 'Electric Vehicles: Is India ready for a 100% transition by 2035?',
    category: 'Economy & Sustainability',
    description: 'Examining charging infrastructure, battery supply chains, grid load, and consumer affordability.',
    keyPoints: [
      'Drastic reduction in urban air pollution and crude oil import reliance.',
      'Charging infrastructure outside Tier-1 cities remains severely underdeveloped.',
      'Initial purchase cost of EV battery replacement remains a concern for budget buyers.',
    ],
  },
  {
    id: 'gd-social-media',
    title: 'Social Media Algorithms: Community building or mental health crisis?',
    category: 'Society & Psychology',
    description: 'Analyzing global connectivity, polarization, attention spans, and algorithmic dopamine loops among youth.',
    keyPoints: [
      'Empowers independent creators, democratic discourse, and global professional networking.',
      'Surge in teenage anxiety, shortening attention spans, and echo chamber confirmation bias.',
      'Need for ethical algorithm regulation and digital wellbeing education.',
    ],
  },
  {
    id: 'gd-cashless-economy',
    title: 'Digital Payments & UPI: Blessing for the common man or cybersecurity hazard?',
    category: 'Fintech & Banking',
    description: 'Evaluating financial inclusion, ease of micro-transactions, digital divide, and cyber financial fraud.',
    keyPoints: [
      'India processes over 13 billion UPI transactions monthly, empowering street vendors to large retailers.',
      'Zero MDR fee challenges and transaction failure rates during server downtimes.',
      'Rising phishing scams and digital financial literacy gap among rural populations.',
    ],
  },
];

/**
 * Returns a random popular GD topic (Avatar topic de)
 */
export function getRandomAvatarTopic() {
  const index = Math.floor(Math.random() * POPULAR_GD_TOPICS.length);
  return POPULAR_GD_TOPICS[index];
}

/**
 * Generates an intelligent argument for an avatar responding to the discussion
 */
export function generateAvatarArgument(avatarId, topicTitle, studentSpeech = '', studentName = 'Pragya') {
  const cleanedSpeech = (studentSpeech || '').trim();
  const lower = cleanedSpeech.toLowerCase();

  // Avatar-specific personalized arguments
  if (avatarId === 'rohan') {
    if (lower.includes('agree') || lower.includes('yes') || lower.includes('good') || lower.includes('better')) {
      return `I completely align with ${studentName}'s perspective on ${topicTitle}. If we examine technological precedent, early adopters always reap massive competitive advantages. By scaling this rapidly, we unlock unmatched efficiency and innovation for all stakeholders.`;
    }
    if (lower.includes('risk') || lower.includes('problem') || lower.includes('bad') || lower.includes('cost')) {
      return `While I respect the cautionary points raised by ${studentName}, history shows that every breakthrough faces early resistance. The key is not to halt progress, but to innovate our way through the bottlenecks. On ${topicTitle}, speed and iteration will overcome these initial friction points.`;
    }
    return `Adding to the conversation on ${topicTitle}, we cannot ignore how rapidly global benchmarks are evolving. From an innovation standpoint, adopting modern frameworks gives teams a 10x multiplier in output and quality.`;
  }

  if (avatarId === 'ananya') {
    if (cleanedSpeech.length > 0) {
      return `That is a very thoughtful argument by ${studentName}. However, to make this sustainable, we must look at empirical data and human impact. On ${topicTitle}, technological acceleration must be accompanied by ethical guardrails and continuous user feedback, otherwise we risk widespread user churn.`;
    }
    return `Looking at ${topicTitle} through an analytical lens, empirical studies indicate that a phased hybrid strategy yields 40% better adoption than abrupt extremes. We should focus on measurable KPIs and inclusivity before drawing hard conclusions.`;
  }

  if (avatarId === 'vikram') {
    if (cleanedSpeech.length > 0) {
      return `I would like to play Devil's Advocate here. While ${studentName} and Rohan make optimistic claims, what happens to ground realities and economic costs? On ${topicTitle}, if infrastructure readiness and cybersecurity fail, who takes accountability for the downside?`;
    }
    return `Let's pause and challenge the baseline assumption regarding ${topicTitle}. Are we solving the root problem or merely treating superficial symptoms? Until we address capital expenditure and regulatory compliance, wide-scale adoption will face severe hurdles.`;
  }

  return `Building upon what was just highlighted about ${topicTitle}, balancing execution feasibility with strategic vision is essential for a productive group outcome.`;
}

/**
 * Comprehensive Analyzer for Student's GD Performance
 * Detects:
 * - Real Grammar mistakes with corrections
 * - Vocabulary improvements
 * - Fluency & Fillers
 * - Point Relevance & Structure
 * - Generates "Dubara Bolwaye" interactive practice cards
 */
export function analyzeStudentGDPerformance(studentTranscripts = [], topic = {}) {
  const allStudentText = studentTranscripts
    .map((t) => t.text)
    .join(' ')
    .trim();

  const words = allStudentText.toLowerCase().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Detect Fillers
  const FILLER_WORDS = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'kinda', 'sort of', 'haan', 'matlab'];
  const detectedFillers = words.filter((w) => FILLER_WORDS.includes(w.replace(/[^a-z]/g, '')));
  const fillerCount = detectedFillers.length;

  // 2. Grammar Rules & Pattern Matcher
  const grammarMistakes = [];
  const vocabularyUpgrades = [];
  const practiceSentences = [];

  const GRAMMAR_CHECKS = [
    {
      regex: /\bi\s+am\s+agree\b/i,
      originalPhrase: 'I am agree',
      correctedPhrase: 'I agree / I completely agree',
      reason: "'Agree' is already a verb. Do not use 'am' with 'agree' in present simple.",
      type: 'Grammar',
    },
    {
      regex: /\bdiscuss\s+about\b/i,
      originalPhrase: 'discuss about',
      correctedPhrase: 'discuss',
      reason: "'Discuss' means 'talk about'. Saying 'discuss about' is redundant repetition.",
      type: 'Grammar',
    },
    {
      regex: /\baccording\s+to\s+me\b/i,
      originalPhrase: 'According to me',
      correctedPhrase: 'In my opinion / From my perspective',
      reason: "In formal group discussions, 'According to me' sounds awkward. Use 'In my view' or 'From my perspective'.",
      type: 'Professional Etiquette',
    },
    {
      regex: /\bpeoples\b/i,
      originalPhrase: 'peoples',
      correctedPhrase: 'people',
      reason: "'People' is already plural for persons. 'Peoples' refers only to distinct ethnic nations.",
      type: 'Grammar',
    },
    {
      regex: /\bmore\s+better\b/i,
      originalPhrase: 'more better',
      correctedPhrase: 'much better / significantly better',
      reason: "Double comparatives like 'more better' are incorrect. Use 'much better' or 'superior'.",
      type: 'Grammar',
    },
    {
      regex: /\bdoes\s+not\s+has\b/i,
      originalPhrase: 'does not has',
      correctedPhrase: 'does not have',
      reason: "After auxiliary 'does/do', always use the base form 'have', never 'has'.",
      type: 'Grammar',
    },
    {
      regex: /\bi\s+am\s+having\s+a\s+doubt\b/i,
      originalPhrase: 'I am having a doubt',
      correctedPhrase: 'I have a question / I have a reservation',
      reason: "Use 'I have a question' or 'I have a counter-point' rather than 'having a doubt'.",
      type: 'Vocabulary & Tone',
    },
  ];

  GRAMMAR_CHECKS.forEach((check) => {
    if (check.regex.test(allStudentText)) {
      grammarMistakes.push({
        issue: check.originalPhrase,
        correction: check.correctedPhrase,
        explanation: check.reason,
        type: check.type,
      });
    }
  });

  // 3. Vocabulary Enhancements
  const VOCAB_CHECKS = [
    {
      regex: /\bvery\s+good\b/i,
      found: 'very good',
      suggested: 'highly advantageous / compelling / exemplary',
      example: 'This approach is highly advantageous for long-term scalability.',
    },
    {
      regex: /\bvery\s+bad\b/i,
      found: 'very bad',
      suggested: 'detrimental / counter-productive / adverse',
      example: 'Unregulated deployment can have detrimental consequences.',
    },
    {
      regex: /\bbig\s+problem\b/i,
      found: 'big problem',
      suggested: 'critical challenge / major impediment / bottleneck',
      example: 'Infrastructure readiness remains a critical challenge.',
    },
    {
      regex: /\bi\s+think\b/i,
      found: 'I think',
      suggested: 'I would contend that / Evidence suggests that / In my assessment',
      example: 'In my assessment, balancing security with agility is crucial.',
    },
    {
      regex: /\bmake\s+sure\b/i,
      found: 'make sure',
      suggested: 'ensure / guarantee / verify',
      example: 'We must ensure stringent data governance.',
    },
  ];

  VOCAB_CHECKS.forEach((vocab) => {
    if (vocab.regex.test(allStudentText)) {
      vocabularyUpgrades.push({
        original: vocab.found,
        replacement: vocab.suggested,
        contextExample: vocab.example,
      });
    }
  });

  // 4. Construct "Dubara Bolwaye" Interactive Practice Cards
  // Check student transcripts first
  studentTranscripts.forEach((item, idx) => {
    const text = item.text;
    let corrected = text;
    let modified = false;
    let mistakeDetails = [];

    // Apply grammar fixes
    if (/\bi\s+am\s+agree\b/i.test(corrected)) {
      corrected = corrected.replace(/\bi\s+am\s+agree\b/gi, 'I agree');
      modified = true;
      mistakeDetails.push("Fixed 'I am agree' -> 'I agree'");
    }
    if (/\bdiscuss\s+about\b/i.test(corrected)) {
      corrected = corrected.replace(/\bdiscuss\s+about\b/gi, 'discuss');
      modified = true;
      mistakeDetails.push("Removed redundant 'about' after 'discuss'");
    }
    if (/\baccording\s+to\s+me\b/i.test(corrected)) {
      corrected = corrected.replace(/\baccording\s+to\s+me\b/gi, 'In my opinion');
      modified = true;
      mistakeDetails.push("Replaced 'According to me' with 'In my opinion'");
    }
    if (/\bvery\s+good\b/i.test(corrected)) {
      corrected = corrected.replace(/\bvery\s+good\b/gi, 'highly effective');
      modified = true;
      mistakeDetails.push("Upgraded 'very good' -> 'highly effective'");
    }
    if (/\bbig\s+problem\b/i.test(corrected)) {
      corrected = corrected.replace(/\bbig\s+problem\b/gi, 'critical challenge');
      modified = true;
      mistakeDetails.push("Upgraded 'big problem' -> 'critical challenge'");
    }

    if (modified) {
      practiceSentences.push({
        id: `prac-${idx}`,
        original: text,
        improved: corrected,
        tips: mistakeDetails.join(' • '),
        category: 'Grammar & Vocabulary Refinement',
      });
    }
  });

  // If student didn't make these specific mistakes or spoke too little,
  // provide curated, high-impact GD sentence templates for their topic to practice!
  if (practiceSentences.length === 0) {
    const topicTitle = topic.title || 'the topic';
    practiceSentences.push(
      {
        id: 'prac-default-1',
        original: `I am agree with Rohan point because ${topicTitle} is very good.`,
        improved: `I strongly agree with Rohan's point, as ${topicTitle} offers significant strategic benefits.`,
        tips: "Grammar: Use 'I agree' instead of 'I am agree'. Vocab: 'significant strategic benefits' instead of 'very good'.",
        category: 'Agreement & Elaboration',
      },
      {
        id: 'prac-default-2',
        original: `According to me, there is big problem in this technology.`,
        improved: `From my perspective, implementing this presents several critical challenges that need mitigation.`,
        tips: "Etiquette: 'From my perspective' sounds professional. Vocab: 'critical challenges' upgrades 'big problem'.",
        category: 'Constructive Disagreement',
      },
      {
        id: 'prac-default-3',
        original: `We must discuss about both good and bad things before deciding.`,
        improved: `We must thoroughly evaluate both the advantages and systemic risks before arriving at a consensus.`,
        tips: "Grammar: Say 'evaluate/discuss' without 'about'. Vocab: 'systemic risks' adds executive impact.",
        category: 'Synthesizing & Conclusion',
      }
    );
  }

  // Calculate Scores
  const grammarScore = Math.max(60, Math.min(98, 95 - grammarMistakes.length * 8));
  const vocabScore = Math.max(65, Math.min(96, 75 + vocabularyUpgrades.length * 5 + (wordCount > 30 ? 10 : 0)));
  const fluencyScore = Math.max(60, Math.min(98, 92 - fillerCount * 4));
  const pointDepthScore = wordCount >= 40 ? 94 : wordCount >= 20 ? 84 : 70;

  const overallScore = Math.round((grammarScore + vocabScore + fluencyScore + pointDepthScore) / 4);

  return {
    wordCount,
    fillerCount,
    detectedFillers,
    grammarScore,
    vocabScore,
    fluencyScore,
    pointDepthScore,
    overallScore,
    grammarMistakes,
    vocabularyUpgrades,
    practiceSentences,
    totalContributions: studentTranscripts.length,
    wpm: wordCount > 0 ? Math.min(160, Math.max(90, Math.round(wordCount / 0.5))) : 120,
  };
}

/**
 * Calculates similarity score between student's spoken attempt and target sentence
 * Returns match percentage (0-100) and feedback
 */
export function calculateSentenceAccuracy(spokenText = '', targetText = '') {
  if (!spokenText.trim() || !targetText.trim()) {
    return { accuracy: 0, isPassed: false, feedback: 'Please speak into your microphone.' };
  }

  const clean = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

  const spokenWords = clean(spokenText);
  const targetWords = clean(targetText);

  if (targetWords.length === 0) {
    return { accuracy: 100, isPassed: true, feedback: 'Perfect!' };
  }

  // Count how many target words were spoken
  let matchCount = 0;
  const targetSet = [...targetWords];

  spokenWords.forEach((word) => {
    const idx = targetSet.indexOf(word);
    if (idx !== -1) {
      matchCount++;
      targetSet.splice(idx, 1);
    }
  });

  const accuracy = Math.min(100, Math.round((matchCount / targetWords.length) * 100));
  const isPassed = accuracy >= 68;

  let feedback = '';
  if (accuracy >= 90) {
    feedback = 'Outstanding pronunciation and fluency! 100% on point! 🎉';
  } else if (accuracy >= 70) {
    feedback = 'Well done! Very close and grammatically fluent. 👍';
  } else if (accuracy >= 45) {
    feedback = 'Good attempt! Try to speak a bit clearer and pronounce all keywords.';
  } else {
    feedback = 'Sentence missed several words. Listen to the avatar and try once again!';
  }

  return {
    accuracy,
    isPassed,
    feedback,
    matchedCount: matchCount,
    totalTargetWords: targetWords.length,
  };
}
