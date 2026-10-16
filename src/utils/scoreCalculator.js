// ============================================================
// AuraGD – Performance & STAR Framework Score Calculator
// ============================================================

export function calculateScores({
  turnCount = 1,
  wordCounts = [],
  avgWordsPerTurn = 15,
  mode = 'gd',
  postureAlertCount = 0,
  eyeContactPercentage = null,
  fillersCount = 0,
  selfIntroAnalysis = null,
  starAnalysis = null,
  gdAnalysis = null,
  speakingDurationSeconds = 0,
}) {
  const tc = Math.max(turnCount, 1);
  const awpt = Math.max(avgWordsPerTurn, 8);

  // Common baseline calculations
  const penalty = Math.min(postureAlertCount * 3, 20);
  const trackedEyeContact = eyeContactPercentage !== null
    ? clamp(Math.round(eyeContactPercentage), 50, 98)
    : clamp(Math.round(86 - penalty + jitter(3)), 55, 96);

  if (mode === 'presentation') {
    // Project Presentation: STAR & Architecture Scoring
    const starAlignment = starAnalysis?.completenessScore || clamp(Math.round(62 + Math.min(awpt * 0.9, 25) + jitter(4) - penalty * 0.5), 55, 96);
    const techDepth = clamp(Math.round(60 + Math.min(tc * 7 + awpt * 0.6, 32) + (starAnalysis?.hasTech ? 6 : 0) + jitter(4)), 50, 96);
    const articulation = clamp(Math.round(65 + Math.min(awpt * 0.8, 26) + jitter(4) - penalty * 0.3), 55, 98);
    const deliveryAndGaze = trackedEyeContact;

    return {
      mode: 'presentation',
      overall: Math.round((starAlignment + techDepth + articulation + deliveryAndGaze) / 4),
      starAlignment,
      techDepth,
      articulation,
      deliveryAndGaze,
      detectedTech: starAnalysis?.detectedTech || 'Architecture',
      strengths: [
        starAnalysis?.hasTech
          ? `Solid command of your ${starAnalysis.detectedTech} technical architecture and implementation.`
          : 'Well-articulated problem motivation with clear technical context.',
        'Good structured flow through architecture choices, trade-offs, and bottleneck diagnosis.',
        'Maintained composure and technical focus during project walkthrough.',
      ],
      improvements: [
        starAnalysis?.hasResult
          ? 'Great job highlighting performance outcomes; continue measuring throughput in production.'
          : 'Explicitly quantify results using benchmarks, metrics (ms latency, RPS), or user outcomes.',
        'Highlight why alternative frameworks or databases were dismissed.',
        'Keep eye contact aligned with the camera rather than glancing down at slide notes.',
      ],
    };
  }

  if (mode === 'self_intro') {
    // Self-Introduction: Structure and Fluency Scoring
    const structureScore = clamp(Math.round(66 + Math.min(awpt * 0.5, 20) + (selfIntroAnalysis?.openingMistake ? -12 : 6) + jitter(3) - penalty * 0.3), 50, 96);
    const fluencyScore = clamp(Math.round(76 - Math.min((fillersCount || 2) * 3.5, 24) + Math.min(awpt * 0.4, 16) + jitter(3) - penalty * 0.3), 50, 98);
    const deliveryAndGaze = trackedEyeContact;

    const overall = selfIntroAnalysis?.score || Math.round((structureScore * 0.45) + (fluencyScore * 0.35) + (deliveryAndGaze * 0.20));

    return {
      mode: 'self_intro',
      overall,
      structureScore,
      fluencyScore,
      deliveryAndGaze,
      fillersCount: fillersCount || 0,
      strengths: [
        'Engaging narrative connecting engineering background and projects.',
        'Steady vocal clarity and active eye-contact engagement.',
        'Well-sequenced timeline covering past, present, and target roles.',
      ],
      improvements: [
        selfIntroAnalysis?.openingMistake
          ? "Always open with 'I am' or 'My name is' rather than 'Myself'."
          : "Keep the opening line authoritative and crisp.",
        (fillersCount > 2)
          ? "Replace verbal filler tokens ('um', 'uh', 'like') with calm 1-second silence pauses."
          : 'Great filler discipline; maintain this vocal stillness in high-stakes rounds.',
        'Conclude by explicitly stating the technical contribution you want to make.',
      ],
    };
  }

  if (mode === 'gd') {
    // GD Domain Scoring (Feature 7): Combining speaking duration, eye contact percentage, and hesitation filler count
    const totalWordsCount = wordCounts.reduce((a, b) => a + b, 0);
    const durationSec = speakingDurationSeconds || Math.round((totalWordsCount / 130) * 60) || Math.round(awpt * tc * 0.45);
    const durationScore = clamp(Math.round(62 + Math.min(durationSec * 0.7, 30) + jitter(3) - penalty * 0.3), 55, 96);
    const fillerScore = clamp(Math.round(94 - ((fillersCount || 0) * 3.5) + jitter(3) - penalty * 0.2), 50, 98);
    const eyeContact = trackedEyeContact;
    const counterRebuttal = clamp(Math.round(72 + (tc >= 2 ? 16 : 8) + jitter(3)), 60, 96);

    // Calculate GD Domain score (/100) combining speaking duration, eye contact percentage, and hesitation filler count
    const overall = clamp(Math.round((durationScore * 0.35) + (eyeContact * 0.40) + (fillerScore * 0.25)), 52, 98);

    return {
      mode: 'gd',
      overall,
      durationScore,
      speakingDurationSeconds: durationSec,
      eyeContact,
      fillerScore,
      counterRebuttal,
      fillersCount: fillersCount || 0,
      strengths: [
        'Assertive debate presence with clear stance on Agentic AI opportunity and risks.',
        'Balanced counter-argument handling addressing system security and accountability.',
        'High camera focus and composure under real-time debate pressure.',
      ],
      improvements: [
        (fillersCount > 2)
          ? "Replace hesitation fillers ('um', 'uh', 'like') with calm pauses before asserting key debate points."
          : 'Outstanding filler discipline throughout opening and rebuttal turns.',
        (durationSec < 30)
          ? 'Expand debate arguments with concrete industry examples (e.g. automated security audits).'
          : 'Well-paced speaking duration and strong floor command.',
        'Synthesize opposing viewpoints before delivering your final counter-rebuttal.',
      ],
    };
  }

  if (mode === 'casual') {
    // Feature 8: Casual Talk & Empathetic Mental Wellness Mode
    // Disable all numerical scoring, filler penalties, and STAR evaluation logic.
    return {
      mode: 'casual',
      isWellness: true,
      overall: null, // Zero numerical test score
      scoreLabel: 'Mindset Reset 🌿',
      badge: 'Mindset Reset 🌿',
      badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-500/40',
      durationMinutes: Math.max(Math.round(((speakingDurationSeconds || (awpt * tc * 0.45) || 45) / 60) * 10) / 10, 1),
      eyeContact: trackedEyeContact,
      strengths: [
        'Took a deliberate, healthy pause to ground placement stress.',
        'Spoke authentically about thoughts and career emotions without judgment.',
        'Recharged mental energy and vocal rhythm for upcoming technical practice.',
      ],
      improvements: [
        'Take regular 5-minute breathing pauses between long coding sprints.',
        'Celebrate small consistency milestones instead of waiting only for final offers.',
        'Remember that calmness and clear thinking outperform frantic cramming.',
      ],
    };
  }

  // Standard Intro / GD Fallback Scoring
  const articulation = clamp(Math.round(55 + Math.min(awpt * 1.5, 30) + tc * 2.5 + jitter(5) - penalty * 0.4), 48, 96);
  const eyeContact = trackedEyeContact;
  const confidenceAndTurn = clamp(Math.round(60 + Math.min(tc * 5.5, 30) + jitter(5)), 52, 97);

  const overall = Math.round((articulation + eyeContact + confidenceAndTurn) / 3);

  return {
    mode,
    overall,
    articulation,
    eyeContact,
    confidenceAndTurn,
    strengths: [
      'Natural conversational cadence and confident vocal projection.',
      'Active listening and responsive engagement with prompts.',
      'Clear structured thought organization under real-time conditions.',
    ],
    improvements: [
      'Maintain continuous center-camera eye contact when asserting key points.',
      'Incorporate more transition phrases to guide the listener seamlessly.',
      'Keep posture upright and minimize subconscious face-touching gestures.',
    ],
  };
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function jitter(range) {
  return (Math.random() * range * 2) - range;
}
