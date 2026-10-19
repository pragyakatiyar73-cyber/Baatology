/**
 * presentationSlideDeck.js
 *
 * Slide decks and file parser for AI Smart Presentation Studio:
 * - Default executive slides (matching reference picture)
 * - Dynamic file upload processor for PPTX & PDF files
 */

export const INITIAL_EXECUTIVE_SLIDES = [
  {
    slideNumber: 1,
    title: 'AI Executive Presentation',
    subtitle: 'Aapki uploaded PPT / PDF slides is fixed board par clear HD quality me display hongi.',
    category: 'Title Slide',
    bullets: [
      'Comprehensive Executive Architecture & Strategic Overview',
      'AI-Powered Live Voice Navigation & Hands-Free Interaction',
      'Real-Time Speech Flaws, Filler Words & Delivery Analytics',
    ],
    keyTerms: ['executive', 'presentation', 'ai', 'overview', 'architecture', 'strategy', 'introduction', 'welcome'],
    metrics: { readiness: '98%', accuracy: '60 FPS', mode: 'HD Fixed Board' },
    notes: 'Warmly greet the committee, state the purpose of the presentation, and set a confident, relaxed pace.',
  },
  {
    slideNumber: 2,
    title: 'Problem Statement & Market Need',
    subtitle: 'Bridging the communication gap in high-stakes campus placements and corporate interviews.',
    category: 'Problem & Analysis',
    bullets: [
      'Over 74% of engineering candidates struggle with spontaneous technical explanations under pressure.',
      'Frequent vocal hesitations ("um", "ah", "like") degrade evaluator perception by up to 40%.',
      'Traditional mock interviews lack real-time objective telemetry on speech pacing and content alignment.',
    ],
    keyTerms: ['problem', 'market', 'candidates', 'placement', 'communication', 'hesitations', 'interviews', 'pressure', 'gap'],
    metrics: { candidatesStruggling: '74%', confidenceLoss: '40%', mockGap: '85%' },
    notes: 'Highlight candidate pain points. Speak with empathy and emphasize the scale of the placement preparation challenge.',
  },
  {
    slideNumber: 3,
    title: 'System Architecture & Technical Stack',
    subtitle: 'High-performance, low-latency 2D presentation studio with multimodal voice telemetry.',
    category: 'Technical Architecture',
    bullets: [
      'Frontend: React 18 + Tailwind CSS with fixed 16:9 canvas and responsive visual hierarchy.',
      'Voice Navigation: Web Speech API & STT with dual English-Hindi intent recognition.',
      'Backend Analytics: Node.js Express engine measuring WPM, filler frequency, and slide alignment in sub-50ms.',
    ],
    keyTerms: ['architecture', 'system', 'react', 'tailwind', 'express', 'node', 'latency', 'voice', 'telemetry', 'analytics'],
    metrics: { latency: '< 50ms', canvasRatio: '16:9 HD', accuracy: '96.4%' },
    notes: 'Walk through the three core architectural tiers: presentation board, voice controller, and AI evaluator.',
  },
  {
    slideNumber: 4,
    title: 'Real-Time Mistake Detection Engine',
    subtitle: 'Algorithmic evaluation of vocal clarity, pacing, filler words, and slide relevance.',
    category: 'AI Delivery Analytics',
    bullets: [
      'Filler Detection: Tracks frequency of "um", "ah", "like", "actually", and "basically" across every slide.',
      'Dynamic Pace Telemetry: Flags rushed delivery (>160 WPM) and sluggish pauses (<110 WPM).',
      'Content Alignment Scoring: Cross-references spoken transcript against slide key terms in real-time.',
    ],
    keyTerms: ['mistake', 'detection', 'fillers', 'pace', 'wpm', 'alignment', 'telemetry', 'algorithm', 'speech', 'clarity'],
    metrics: { optimalWPM: '125-155', fillerTolerance: '< 2/min', alignmentGoal: '> 85%' },
    notes: 'Explain how the AI acts as an encouraging co-pilot, alerting the speaker before bad habits affect evaluation.',
  },
  {
    slideNumber: 5,
    title: 'Performance Evaluation & Results',
    subtitle: 'Measurable student outcomes, placement conversion rates, and executive readiness.',
    category: 'Results & Impact',
    bullets: [
      '+52% average increase in student placement interview confidence within 3 practice sessions.',
      '68% reduction in unconscious filler word usage during live project defense.',
      'Post-presentation scorecard provides actionable, personalized delivery recommendations.',
    ],
    keyTerms: ['performance', 'results', 'confidence', 'reduction', 'scorecard', 'outcomes', 'impact', 'readiness', 'improvement'],
    metrics: { confidenceGain: '+52%', fillerReduction: '68%', satisfaction: '99.1%' },
    notes: 'Summarize key takeaways, thank the audience, and invite technical follow-up questions.',
  },
];

/**
 * Client-Side Presentation File Processor
 * Reads PPTX / PDF metadata or sends to backend upload endpoint
 */
export async function processPresentationFile(file) {
  if (!file) return { success: false, slides: INITIAL_EXECUTIVE_SLIDES };

  const formData = new FormData();
  formData.append('presentation', file);

  try {
    const res = await fetch('http://localhost:3001/api/presentation/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.slides && data.slides.length > 0) {
        return {
          success: true,
          filename: data.filename || file.name,
          originalname: data.originalname || file.name,
          slides: data.slides,
          totalSlides: data.slides.length,
        };
      }
    }
  } catch (err) {
    console.info('[PresentationFile] Backend upload offline, using client-side deck generator:', err?.message);
  }

  // Graceful client-side fallback if backend is unreachable
  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  const fallbackSlides = [
    {
      slideNumber: 1,
      title: cleanTitle.toUpperCase(),
      subtitle: `Uploaded ${file.name} • 16:9 HD Fixed Studio Board`,
      category: 'Uploaded Deck • Title Slide',
      bullets: [
        `File: ${file.name} (${Math.round(file.size / 1024)} KB)`,
        'Full HD presentation board initialized with seamless voice navigation.',
        'Say "Next slide" or "Agli slide" to begin advancing through your presentation.',
      ],
      keyTerms: [cleanTitle.toLowerCase(), 'presentation', 'overview', 'introduction', 'executive'],
      metrics: { fileType: file.type || 'Document', status: 'Ready', pages: '5 Slides' },
      notes: `Welcome your audience and introduce the core goals of ${cleanTitle}.`,
    },
    {
      slideNumber: 2,
      title: 'Strategic Goals & Overview',
      subtitle: `Key themes and objectives for ${cleanTitle}.`,
      category: 'Strategic Vision',
      bullets: [
        'Detailed breakdown of problem formulation and competitive benchmarks.',
        'Technical specifications and implementation milestones.',
        'Target delivery outcomes and stakeholder satisfaction metrics.',
      ],
      keyTerms: ['goals', 'strategic', 'overview', 'milestones', 'specifications', 'benchmarks'],
      metrics: { priority: 'High', alignment: 'Optimal', timeline: 'Active' },
      notes: 'Explain your strategic motivation clearly. Keep your vocal pace between 125-155 WPM.',
    },
    {
      slideNumber: 3,
      title: 'Technical Implementation & Design',
      subtitle: 'System components, algorithmic flow, and data pipelines.',
      category: 'Architecture',
      bullets: [
        'Modular architecture supporting low latency and high availability.',
        'Automated telemetry tracking and real-time validation layers.',
        'Scalable deployment model optimized for production environments.',
      ],
      keyTerms: ['technical', 'implementation', 'architecture', 'pipelines', 'scalability', 'performance'],
      metrics: { latency: '< 50ms', availability: '99.9%', scalability: 'Linear' },
      notes: 'Describe your technical design. Pause between major bullet points to let evaluators absorb the diagram.',
    },
    {
      slideNumber: 4,
      title: 'Experimental Results & Key Metrics',
      subtitle: 'Quantitative validation, user studies, and benchmark comparisons.',
      category: 'Evaluation',
      bullets: [
        'Demonstrated 45% increase in operational throughput under peak loads.',
        'Zero critical regression errors observed across 100+ evaluation test cases.',
        'High candidate satisfaction score validated in user feedback surveys.',
      ],
      keyTerms: ['results', 'metrics', 'validation', 'throughput', 'benchmarks', 'performance'],
      metrics: { throughput: '+45%', errorRate: '0.0%', satisfaction: '98%' },
      notes: 'Emphasize your empirical results with confidence. Avoid filler words when reading numbers.',
    },
    {
      slideNumber: 5,
      title: 'Conclusion & Next Steps',
      subtitle: 'Summary of achievements, strategic takeaways, and Q&A session.',
      category: 'Closing',
      bullets: [
        'Successfully completed all primary deliverables on schedule.',
        'Architecture is primed for enterprise-grade scalability and team adoption.',
        'Thank you! Open for committee questions, technical review, and discussion.',
      ],
      keyTerms: ['conclusion', 'summary', 'takeaways', 'questions', 'thank you', 'future'],
      metrics: { status: 'Delivered', quality: 'Executive', readiness: '100%' },
      notes: 'Deliver a strong, memorable conclusion and invite audience questions with enthusiasm.',
    },
  ];

  return {
    success: true,
    filename: file.name,
    originalname: file.name,
    slides: fallbackSlides,
    totalSlides: fallbackSlides.length,
  };
}

// ════════════════════════════════════════════════════════════════════
// 4. POPULAR COLLEGE ENGINEERING PROJECT TEMPLATES
// ════════════════════════════════════════════════════════════════════
export const POPULAR_PROJECT_TEMPLATES = [
  {
    id: 'ai-face-attendance',
    title: 'AI Smart Facial Recognition Attendance System',
    domain: 'Artificial Intelligence & Computer Vision',
    icon: 'Camera',
    badge: 'AI / Computer Vision',
    color: 'emerald',
    problem: 'Manual paper roll calls consume 15 minutes of precious classroom time and are vulnerable to proxy attendance by peers.',
    techStack: 'Python 3.11, OpenCV, FaceNet / YOLOv8, React 18, SQLite, Flask',
    features: 'Real-time multi-face detection, liveness verification via blink detection to prevent photo spoofing, automated CSV & PDF export to faculty.',
    results: 'Achieved 98.4% detection accuracy under varying classroom lighting; reduced total attendance logging time from 15 minutes to under 8 seconds.',
    futureScope: 'Integrating mobile notification push for parents and edge deployment on Raspberry Pi cameras.',
    questions: [
      {
        question: 'What method did your system use to prevent students from marking proxy attendance with a printed photo or phone screen?',
        hint: 'Mention blink detection, eye aspect ratio (EAR), or depth analysis for liveness verification.',
        idealAnswer: 'We implemented liveness detection by tracking eye-blink aspect ratios across consecutive frames to confirm a live human face.',
      },
      {
        question: 'Why did you choose OpenCV and Python instead of building a native mobile app from scratch?',
        hint: 'Explain Python\'s rich computer vision ecosystem, pre-trained neural weights, and rapid prototyping speed.',
        idealAnswer: 'Python offers mature computer vision libraries like OpenCV and FaceNet, which allowed high frame rates and sub-second inference.',
      },
    ],
  },
  {
    id: 'iot-smart-irrigation',
    title: 'IoT-Enabled Automated Crop Irrigation & Soil Monitor',
    domain: 'Internet of Things (IoT) & Smart Agriculture',
    icon: 'Sprout',
    badge: 'IoT & Embedded',
    color: 'teal',
    problem: 'Traditional timed watering leads to over 40% agricultural water loss and root rot due to unmonitored soil moisture levels.',
    techStack: 'ESP32 Microcontroller, Capacitive Soil Moisture Sensors, DHT22, MQTT Protocol, Node.js, Tailwind CSS',
    features: 'Dynamic solenoid valve activation based on real-time soil moisture thresholds, rainfall prediction API integration, low-power sleep mode.',
    results: 'Demonstrated 35% reduction in farm water consumption while increasing crop yield efficiency by 22% across 3 experimental field plots.',
    futureScope: 'Adding solar battery power modules and LoRaWAN long-range telemetry for large acreage farms.',
    questions: [
      {
        question: 'How does your ESP32 microcontroller decide when and for how long to turn on the irrigation pump?',
        hint: 'Mention moisture percentage thresholds (e.g. below 35%) and timer-based relay switching.',
        idealAnswer: 'When soil moisture drops below 35%, the ESP32 sends a signal to trigger the 5V relay module for 45 seconds until moisture reaches 65%.',
      },
      {
        question: 'What happens if the farm loses Wi-Fi or cellular connectivity during operation?',
        hint: 'Explain local microcontroller fail-safe logic and offline sensor data caching.',
        idealAnswer: 'The ESP32 runs standalone firmware with local threshold rules, so irrigation continues normally even without active internet.',
      },
    ],
  },
  {
    id: 'telemedicine-app',
    title: 'Healthcare Telemedicine & AI Symptom Screening',
    domain: 'Full-Stack Web & Healthcare Informatics',
    icon: 'Stethoscope',
    badge: 'Healthcare & Web',
    color: 'blue',
    problem: 'Patients in rural and semi-urban communities face 4+ hour journeys and long hospital queues to consult specialist doctors.',
    techStack: 'React 18, Node.js Express, WebRTC Peer-to-Peer Video, MongoDB, Python NLP Triage, Tailwind CSS',
    features: 'End-to-end encrypted HD video consultations, instant digital prescription issuance, AI symptom triage to recommend the right specialist.',
    results: 'Facilitated over 500 successful test consultations with 92% doctor satisfaction and zero video latency drops on 4G networks.',
    futureScope: 'Adding multi-lingual Hindi & regional voice transcription for patient consultations.',
    questions: [
      {
        question: 'How did you ensure video consultations remain clear and stutter-free on slower 4G mobile networks?',
        hint: 'Talk about WebRTC adaptive bitrate streaming and peer-to-peer direct connections.',
        idealAnswer: 'We utilized WebRTC with dynamic bitrate throttling and VP8 compression to adapt video quality based on current network bandwidth.',
      },
      {
        question: 'How do you safeguard patient health records and prescriptions against unauthorized access?',
        hint: 'Mention AES-256 database encryption, HTTPS/TLS, and JWT role-based access control.',
        idealAnswer: 'All medical records are encrypted using AES-256 in MongoDB, with strict JWT role-based authorization separating doctors and patients.',
      },
    ],
  },
  {
    id: 'ecommerce-microservices',
    title: 'Scalable E-Commerce Engine on Event Microservices',
    domain: 'Distributed Cloud Systems & Microservices',
    icon: 'Cpu',
    badge: 'Cloud & Distributed',
    color: 'indigo',
    problem: 'Monolithic online shopping backends crash under flash-sale traffic surges and require full codebase restarts for minor bug fixes.',
    techStack: 'Java Spring Boot, Node.js, Apache Kafka, Redis Caching, PostgreSQL, Docker, Kubernetes',
    features: 'Decoupled services for catalog, cart, and orders; Kafka event-driven payment validation; Redis distributed inventory locking.',
    results: 'Successfully handled 5,000 concurrent checkout requests per second with 99.98% uptime and sub-45ms average response latency.',
    futureScope: 'Implementing AI-driven personalized product recommendations and multi-region AWS replication.',
    questions: [
      {
        question: 'How does Kafka event messaging prevent inventory overselling during simultaneous flash-sale checkouts?',
        hint: 'Explain queue-based sequential order processing and distributed inventory reservation.',
        idealAnswer: 'Every checkout event is published to an ordered Kafka topic, ensuring inventory is reserved strictly in FIFO sequence before payment.',
      },
      {
        question: 'Why did you use Redis caching instead of reading directly from PostgreSQL for every product catalog view?',
        hint: 'Mention in-memory RAM access speed (under 5ms) versus expensive disk database queries.',
        idealAnswer: 'Redis stores product data in-memory, serving requests in under 3ms and eliminating 85% of read queries to the primary PostgreSQL database.',
      },
    ],
  },
];

// ════════════════════════════════════════════════════════════════════
// 5. GENERATE PRESENTATION SLIDES FROM PROJECT DETAILS
// ════════════════════════════════════════════════════════════════════
export function generateSlidesFromProjectDetails(project) {
  const title = project?.title?.trim() || 'Engineering Project Presentation';
  const domain = project?.domain || 'Engineering & Computer Science';
  const problem = project?.problem || 'Addressing real-world efficiency challenges through innovative software engineering.';
  const techStack = project?.techStack || 'React, Node.js, Python, Cloud APIs';
  const features = project?.features || 'Real-time telemetry, automated data processing, and user-centric interactive workflows.';
  const results = project?.results || 'High empirical accuracy, reduced processing latency, and validated user satisfaction.';
  const futureScope = project?.futureScope || 'Scalable cloud deployment, mobile app expansion, and advanced machine learning integration.';

  const techList = techStack.split(',').map((s) => s.trim()).filter(Boolean);

  return [
    // Slide 1: Title & Executive Overview
    {
      slideNumber: 1,
      title: title.toUpperCase(),
      subtitle: `${domain} • Engineering Defense Deck`,
      category: 'Project Overview • Title Slide',
      bullets: [
        `Domain: ${domain}`,
        `Core Technical Stack: ${techStack}`,
        'Structured presentation covering Problem Formulation, Architecture, Implementation, and Final Results.',
      ],
      keyTerms: [title.toLowerCase(), 'project', 'overview', 'introduction', 'engineering', 'architecture', 'technology'],
      metrics: { domain: domain.split(' ')[0], status: 'Completed', stage: 'Final Review' },
      notes: `Welcome your evaluator warmly. Introduce ${title} with confidence and state your primary motivation in 2 clear sentences.`,
    },
    // Slide 2: Problem Statement & Motivation
    {
      slideNumber: 2,
      title: 'Problem Statement & Motivation',
      subtitle: 'Understanding the industry challenge, user pain points, and why this solution matters.',
      category: 'Problem Formulation',
      bullets: [
        problem,
        'Existing solutions suffer from high manual intervention, error-prone processes, and poor scalability.',
        'Our objective: Build an automated, reliable, and accessible end-to-end technological solution.',
      ],
      keyTerms: ['problem', 'challenge', 'motivation', 'scalability', 'objective', 'manual', 'automation', 'need'],
      metrics: { impact: 'High Priority', focus: 'Automation', targetAudience: 'End Users' },
      notes: 'Clearly articulate the pain point. Use a measured pace and emphasize the exact consequences of the existing problem.',
    },
    // Slide 3: Technical Architecture & System Design
    {
      slideNumber: 3,
      title: 'System Architecture & Tech Stack',
      subtitle: 'High-performance modular architecture designed for stability and responsiveness.',
      category: 'System Architecture',
      bullets: [
        `Core Technologies: ${techStack}`,
        'Modular tiered design separating data capture, algorithmic processing, and presentation layers.',
        'Optimized for low-latency execution and high fault-tolerance under real-world testing conditions.',
      ],
      keyTerms: ['architecture', 'tech stack', 'design', 'components', 'frontend', 'backend', 'database', ...techList.map((t) => t.toLowerCase())],
      metrics: { techModules: `${techList.length} Components`, architecture: 'Modular', latency: '< 100ms' },
      notes: 'Explain how each component in your tech stack coordinates with the next. Avoid saying "we did code"—say "we implemented".',
    },
    // Slide 4: Key Features & Working Mechanism
    {
      slideNumber: 4,
      title: 'Key Features & Implementation',
      subtitle: 'Algorithmic pipeline, core functional capabilities, and technical highlights.',
      category: 'Implementation & Features',
      bullets: [
        features,
        'Robust error handling and automated validation preventing edge-case failures.',
        'Intuitive user interface enabling seamless real-time monitoring and reporting.',
      ],
      keyTerms: ['features', 'implementation', 'algorithm', 'pipeline', 'processing', 'validation', 'functionality'],
      metrics: { stability: '99.8%', executionSpeed: 'Real-Time', usability: 'Intuitive' },
      notes: 'Walk through the core algorithmic workflow step-by-step. Speak deliberately and highlight your individual engineering contribution.',
    },
    // Slide 5: Experimental Results & Benchmarks
    {
      slideNumber: 5,
      title: 'Results, Impact & Benchmarks',
      subtitle: 'Empirical validation metrics, efficiency improvements, and measured outcomes.',
      category: 'Results & Evaluation',
      bullets: [
        results,
        'Demonstrated measurable efficiency gains over conventional baseline approaches.',
        'Stress-tested across realistic usage scenarios with zero critical system failures.',
      ],
      keyTerms: ['results', 'metrics', 'accuracy', 'benchmarks', 'efficiency', 'outcomes', 'validation', 'performance'],
      metrics: { accuracy: '98%', testCases: '50+ Runs', throughput: 'Optimal' },
      notes: 'Highlight your quantitative metrics with pride. Numbers and benchmarks prove the engineering rigor behind your project.',
    },
    // Slide 6: Conclusion, Future Scope & Q&A
    {
      slideNumber: 6,
      title: 'Conclusion, Future Scope & Q&A',
      subtitle: 'Strategic achievements, future roadmap, and welcoming evaluator questions.',
      category: 'Closing & Defense',
      bullets: [
        `Future Roadmap: ${futureScope}`,
        'Delivered a complete, functioning prototype adhering to industry engineering standards.',
        'Thank you! I warmly welcome your questions and feedback on the project architecture.',
      ],
      keyTerms: ['conclusion', 'future scope', 'roadmap', 'questions', 'thank you', 'summary', 'evaluation'],
      metrics: { deliverable: 'Fully Functional', readiness: 'Ready', nextPhase: 'Production' },
      notes: 'Conclude with strong posture and eye contact. Thank your evaluator and smoothly invite technical follow-up questions.',
    },
  ];
}

// ════════════════════════════════════════════════════════════════════
// 6. GENERATE EASY PROJECT QUESTIONS FOR Q&A ROUND
// ════════════════════════════════════════════════════════════════════
export function getProjectQuestions(project) {
  // If template has specific questions, use them
  if (project?.questions && project.questions.length > 0) {
    return project.questions;
  }

  const title = project?.title || 'your engineering project';
  const tech = project?.techStack || 'your chosen technology';

  return [
    {
      question: `What inspired you to build "${title}", and what was the main problem you wanted to solve?`,
      hint: 'Mention who suffers from the problem and how your solution helps them save time or improve efficiency.',
      idealAnswer: 'I noticed real-world manual inefficiencies in this area, so I wanted to create an automated software solution that makes life easier for users.',
    },
    {
      question: `What was the most challenging technical hurdle you faced while working with ${tech.split(',')[0] || 'your tech stack'}, and how did you resolve it?`,
      hint: 'Discuss a specific bug, library integration issue, or performance delay you debugged.',
      idealAnswer: 'Integrating the real-time data flow caused initial latency, so we optimized the API payload and added caching to resolve the bottleneck.',
    },
  ];
}

// ════════════════════════════════════════════════════════════════════
// 7. DETECTED MISTAKES & SENTENCE RE-PRACTICE DATA
// ════════════════════════════════════════════════════════════════════
export const SAMPLE_MISTAKE_CORRECTIONS = [
  {
    id: 'm1',
    category: 'Vocabulary Enhancement',
    studentSentence: 'We did code in Python for face recognition.',
    correctedSentence: 'We implemented the core computer vision algorithms using Python and OpenCV.',
    explanation: 'Avoid saying "did code"—use professional engineering verbs like "implemented", "developed", or "architected".',
    audioTip: 'Stress "implemented" with a clear, steady voice.',
  },
  {
    id: 'm2',
    category: 'Grammar & Clarity',
    studentSentence: 'Our project is very good and having high speed.',
    correctedSentence: 'Our system delivers high throughput with sub-second response latency.',
    explanation: 'Avoid subjective words like "very good". Use concrete engineering metrics like "high throughput" and "sub-second latency".',
    audioTip: 'Pause slightly after "throughput" to let the metric stand out.',
  },
  {
    id: 'm3',
    category: 'Sentence Structure',
    studentSentence: 'Because of internet is slow so error coming.',
    correctedSentence: 'To handle slow network conditions, we incorporated offline caching and retry logic.',
    explanation: 'Never start with "Because of internet is slow so". Formulate with cause and proactive engineering mitigation.',
    audioTip: 'Keep a calm, authoritative pitch while explaining error handling.',
  },
  {
    id: 'm4',
    category: 'Fluency & Filler Reduction',
    studentSentence: 'Actually basically we used like MongoDB database.',
    correctedSentence: 'We selected MongoDB as our primary document database to manage unstructured data efficiently.',
    explanation: 'Eliminate filler words ("actually", "basically", "like"). State your technical choice directly.',
    audioTip: 'Say "We selected MongoDB" without any introductory filler.',
  },
];
