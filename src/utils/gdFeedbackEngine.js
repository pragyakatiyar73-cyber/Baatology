// ============================================================
// Baatology – Group Discussion Feedback Engine & Avatar AI Logic
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
    seat: 'Student 2',
    role: 'Tech Optimist',
    perspective: 'Pro-Innovation & Scalability',
    college: 'IIT Delhi',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=300&fit=crop&crop=faces',
    voicePitch: 1.05,
    voiceRate: 1.0,
    voiceGender: 'male',
    colorTheme: 'cyan',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'ananya',
    name: 'Ananya Roy',
    seat: 'Student 3',
    role: 'Balanced Analyst',
    perspective: 'Data, Ethics & Human Impact',
    college: 'BITS Pilani',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces',
    voicePitch: 1.18,
    voiceRate: 1.0,
    voiceGender: 'female',
    colorTheme: 'purple',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    id: 'vikram',
    name: 'Vikram Malhotra',
    seat: 'Student 4',
    role: "Devil's Advocate",
    perspective: 'Risks, Ground Reality & Costs',
    college: 'NIT Trichy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces',
    voicePitch: 0.88,
    voiceRate: 0.96,
    voiceGender: 'male_deep',
    colorTheme: 'amber',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    id: 'sneha',
    name: 'Sneha Patel',
    seat: 'Student 5',
    role: 'Solution Strategist',
    perspective: 'Consensus & Practical Execution',
    college: 'DTU Delhi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=faces',
    voicePitch: 1.12,
    voiceRate: 1.0,
    voiceGender: 'female',
    colorTheme: 'teal',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  },
];

export const POPULAR_GD_TOPICS = [
  {
    id: 'gd-ai-jobs',
    title: 'Will Artificial Intelligence replace software developers or augment them?',
    category: 'Technology & Career',
    description: 'Debating AI coding tools, developer productivity, and the future of entry-level engineering jobs.',
    simpleOverview: 'This topic discusses whether AI tools like ChatGPT and GitHub Copilot will take away programmers\' jobs or help them work faster and become more creative.',
    pros: [
      'High Productivity: AI helps developers write repetitive boilerplate code, test cases, and documentation in minutes.',
      'Accessibility: Even beginners can learn to build applications faster by asking AI for code explanations.',
      'Better Focus: Programmers can spend more time on complex business logic and system design rather than syntax bugs.',
    ],
    cons: [
      'Fresher Hiring Risk: Companies may hire fewer entry-level junior developers if senior engineers do more with AI.',
      'Weak Fundamentals: Relying on AI without understanding underlying algorithms can lead to insecure and buggy code.',
      'Over-Dependence: If AI systems fail or hallucinate wrong answers, developers who don\'t know core basics cannot debug them.',
    ],
    starterLines: [
      'In my opinion, AI will not replace good software developers, but developers who use AI will replace those who don\'t.',
      'I believe AI is an assistant, not a full replacement, because human logic and critical thinking are still needed.',
      'While AI helps in coding speed, my biggest concern is how fresh college graduates will get their first job experience.',
    ],
  },
  {
    id: 'gd-wfh-vs-office',
    title: 'Remote Work vs Return-to-Office: What truly drives long-term innovation?',
    category: 'Workplace & Culture',
    description: 'Weighing employee flexibility, work-life balance, spontaneous hallway collaboration, and corporate culture.',
    simpleOverview: 'This topic evaluates whether working from home is better for productivity and life, or if coming to the office in person is needed for team bonding and learning.',
    pros: [
      'Zero Commute: Saves 2 to 3 hours of tiring daily travel, giving employees more time for health, family, and rest.',
      'Global Opportunities: Talented engineers from Tier-2 and Tier-3 cities can work for top international companies without relocating.',
      'High Focus: Deep coding and solo tasks often happen faster without noisy office interruptions.',
    ],
    cons: [
      'Less Mentorship for Freshers: New college graduates learn much faster by sitting next to seniors and watching them solve problems.',
      'Lack of Spontaneous Ideas: Creative brainstorms and accidental hallway chats rarely happen over scheduled video calls.',
      'Burnout & Isolation: When working from the bedroom, the boundary between work and personal life often gets blurred.',
    ],
    starterLines: [
      'I would like to support the hybrid model, as it gives the flexibility of remote work alongside in-person collaboration.',
      'From a student perspective, office interaction is crucial in the first two years of a career to build a strong network.',
      'Remote work has proven that productivity does not drop, provided teams have clear goals and transparent communication.',
    ],
  },
  {
    id: 'gd-ev-transition',
    title: 'Electric Vehicles: Is India ready for a 100% transition by 2035?',
    category: 'Economy & Sustainability',
    description: 'Examining charging infrastructure, battery costs, power grid capacity, and consumer affordability.',
    simpleOverview: 'This topic looks at whether India can replace all petrol and diesel cars/bikes with electric vehicles by 2035, considering charging points, battery prices, and power supply.',
    pros: [
      'Clean Air & Health: Reduces severe air pollution in major Indian cities and cuts oil import bills by billions of dollars.',
      'Lower Running Cost: Running an EV costs less than ₹1 per kilometer compared to ₹7-8 for petrol vehicles.',
      'Local Manufacturing Boost: Growing EV battery and motor manufacturing under \'Make in India\' creates new engineering jobs.',
    ],
    cons: [
      'Charging Infrastructure Gap: Outside Tier-1 metro cities and highways, public fast-charging stations are still very rare.',
      'High Initial Purchase Price: EV battery replacements after 5-7 years are expensive, making budget consumers hesitant.',
      'Grid Load & Coal Power: If our electricity still comes from burning coal, EVs are simply shifting pollution from tailpipes to power plants.',
    ],
    starterLines: [
      'In my view, while two-wheelers and city buses can transition fast, a 100% switch for commercial trucks and rural areas will take longer.',
      'The biggest hurdle today is not vehicle technology, but building charging stations across highways and smaller towns.',
      'I believe government subsidies and battery-swapping stations will be the game changer for EV adoption in India.',
    ],
  },
  {
    id: 'gd-social-media',
    title: 'Social Media: Connecting people or creating digital isolation?',
    category: 'Society & Psychology',
    description: 'Analyzing global connectivity, polarization, attention spans, and genuine real-world empathy among youth.',
    simpleOverview: 'This topic debates whether apps like Instagram, LinkedIn, and YouTube bring people closer together or make teenagers feel lonely, distracted, and anxious.',
    pros: [
      'Instant Global Reach: Connects students with global mentors, study resources, campus opportunities, and job openings.',
      'Creator Economy: Millions of young creators, educators, and small businesses earn their livelihood through social media.',
      'Community Building: People with rare hobbies or specialized tech interests can easily find supportive peer communities.',
    ],
    cons: [
      'Addictive Algorithms: Endless scrolling feeds reduce human attention spans and hurt students\' focus on studies and exams.',
      'Comparison & Anxiety: Constantly watching others\' highlight reels leads to FOMO, low self-esteem, and sleep deprivation.',
      'Shallow Relationships: Having hundreds of online followers does not replace real face-to-face emotional support.',
    ],
    starterLines: [
      'In my opinion, social media is a powerful tool; whether it connects or isolates depends on how consciously we use it.',
      'I believe social media has made global networking effortless, but excessive passive scrolling hurts mental health.',
      'To build a healthy relationship with technology, digital wellness and time boundaries must be practiced by students.',
    ],
  },
  {
    id: 'gd-cashless-economy',
    title: 'Digital Payments & UPI: Blessing for the common man or cybersecurity hazard?',
    category: 'Fintech & Banking',
    description: 'Evaluating financial inclusion, ease of micro-transactions, digital divide, and cyber financial fraud.',
    simpleOverview: 'This topic explores how UPI and phone payments have made daily shopping simple in India, but also highlights rising cyber scams and server failure risks.',
    pros: [
      'Unmatched Convenience: Even a ₹5 tea or vegetable purchase can be paid instantly with a QR code scan without loose change.',
      'Financial Inclusion: Street vendors and small shopkeepers now have digital credit histories, making bank loans accessible.',
      'Transparency: Reduces black money and cash leakages while increasing direct benefit transfers to citizens.',
    ],
    cons: [
      'Cyber Fraud & Phishing: Innocent and rural citizens often fall victim to fake payment links, QR code scams, and OTP fraud.',
      'Server Failures: When bank servers go down during peak shopping hours, transactions get stuck and cause distress.',
      'Privacy Concerns: Every single purchase is logged and tracked, raising questions about data security and financial profiling.',
    ],
    starterLines: [
      'I strongly believe UPI is one of India\'s greatest technological innovations, making daily life hassle-free for everyone.',
      'While digital convenience is unmatched, banks and police must step up consumer awareness against cyber fraud.',
      'In my view, we must keep cash and digital options both active so no citizen gets stranded during server downtime.',
    ],
  },
];

/**
 * Returns complete 5-Minute Topic Prep Guide for any topic (Popular or Custom)
 */
export function getTopicPrepGuide(topicObj = {}) {
  const title = topicObj.title || 'General Discussion Topic';
  const found = POPULAR_GD_TOPICS.find((t) => t.id === topicObj.id || t.title === title);

  if (found) {
    return {
      title: found.title,
      category: found.category,
      simpleOverview: found.simpleOverview,
      pros: found.pros,
      cons: found.cons,
      starterLines: found.starterLines,
    };
  }

  // Generates intelligent, simple points for custom student topics
  return {
    title: title,
    category: topicObj.category || 'Custom Discussion Topic',
    simpleOverview: topicObj.description || `This discussion focuses on analyzing the opportunities, practical challenges, and real-world impact of ${title}.`,
    pros: [
      `Opportunity & Growth: Implementing progressive ideas on ${title} can improve speed, efficiency, and positive outcomes.`,
      `Modern Relevance: Addressing ${title} helps students and organizations stay aligned with current industry standards.`,
      `Practical Benefits: Encourages constructive teamwork and opens up fresh perspectives for problem solving.`,
    ],
    cons: [
      `Implementation Challenges: Budget constraints, infrastructure readiness, and setup time can slow down progress.`,
      `Risk of Imbalance: Moving too fast without proper guidelines can lead to unintended complications.`,
      `Need for Training: People require proper awareness, education, and support to adapt comfortably.`,
    ],
    starterLines: [
      `I would like to initiate by stating that ${title} is a very relevant topic in today's context with both advantages and challenges.`,
      `In my opinion, the strongest point in favor of this is the potential for long-term efficiency and growth.`,
      `While I see the benefits, I also believe we must address practical bottlenecks before drawing conclusions.`,
    ],
  };
}

/**
 * Returns a random popular GD topic (Avatar topic de)
 */
export function getRandomAvatarTopic() {
  const index = Math.floor(Math.random() * POPULAR_GD_TOPICS.length);
  return POPULAR_GD_TOPICS[index];
}

/**
 * Generates an intelligent argument in SIMPLE, STUDENT-FRIENDLY ENGLISH
 */
export function generateAvatarArgument(avatarId, topicTitle, studentSpeech = '', studentName = 'Pragya') {
  const cleanedSpeech = (studentSpeech || '').trim();
  const lower = cleanedSpeech.toLowerCase();

  // 1. Rohan Sharma (Student 2 - Tech Optimist, simple friendly English)
  if (avatarId === 'rohan') {
    if (lower.includes('agree') || lower.includes('yes') || lower.includes('good') || lower.includes('better')) {
      return `I completely agree with ${studentName}! Technology helps us work so much faster and makes things simple. For example, modern tools help developers and students finish projects in hours instead of weeks. If we adopt this early, it gives us a huge advantage in our careers. What do you think, team?`;
    }
    if (lower.includes('risk') || lower.includes('problem') || lower.includes('bad') || lower.includes('cost')) {
      return `That is a fair concern raised by ${studentName}, but every new technology has some initial challenges. Instead of stopping progress, we should learn how to manage these risks. With time and better tools, these problems can definitely be solved.`;
    }
    return `Adding to what ${studentName} just said about ${topicTitle}, I feel innovation is always the way forward. In college and jobs, using modern tools boosts our productivity by at least two times. We should embrace it with an open mindset.`;
  }

  // 2. Ananya Roy (Student 3 - Balanced Analyst, clear thoughtful English)
  if (avatarId === 'ananya') {
    if (cleanedSpeech.length > 0) {
      return `That is a really good point by ${studentName}. But along with speed, we also need to think about quality and human empathy. If we rely too much on technology, students might miss out on understanding basic core concepts. So I feel a balanced, step-by-step approach is the smartest way.`;
    }
    return `Looking at ${topicTitle} from a practical angle, we cannot look at only one side. Recent studies show that a hybrid method—combining human judgment with smart tools—always gives the most reliable results. We should look at both pros and cons before deciding.`;
  }

  // 3. Vikram Malhotra (Student 4 - Devil's Advocate, realistic challenging English)
  if (avatarId === 'vikram') {
    if (cleanedSpeech.length > 0) {
      return `I want to bring in a ground reality check here. What ${studentName} and Rohan are saying sounds good in theory, but what about the costs and internet infrastructure in small towns? Not everyone has expensive devices or high-speed connectivity. Who takes care of that gap?`;
    }
    return `Let's pause and question the basic problem on ${topicTitle}. If automated tools do all the entry-level work, how will fresh college graduates get their first internship or job experience? Companies should train beginners rather than just replacing them.`;
  }

  // 4. Sneha Patel (Student 5 - Solution Strategist, practical consensus English)
  if (avatarId === 'sneha') {
    if (cleanedSpeech.length > 0) {
      return `I really appreciate the points made by ${studentName} and Vikram. To bridge the gap, my solution is a structured phased rollout. We should provide college level subsidized labs and mentorship first, so every student is well-equipped before full industry transformation occurs.`;
    }
    return `To build a realistic consensus on ${topicTitle}, we must focus on actionable solutions. Instead of debating extremes, having clear industry guidelines and academic training will ensure smooth adoption for everyone.`;
  }

  return `Building upon what ${studentName} mentioned about ${topicTitle}, finding a practical balance between speed and ground reality is the key to a good group discussion.`;
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
