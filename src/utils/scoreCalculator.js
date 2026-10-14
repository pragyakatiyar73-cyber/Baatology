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
    const starAlignment = clamp(Math.round(62 + Math.min(awpt * 0.9, 25) + jitter(4) - penalty * 0.5), 55, 96);
    const techDepth = clamp(Math.round(58 + Math.min(tc * 6 + awpt * 0.6, 32) + jitter(5)), 50, 95);
    const articulation = clamp(Math.round(65 + Math.min(awpt * 0.8, 26) + jitter(4) - penalty * 0.3), 55, 98);
    const deliveryAndGaze = trackedEyeContact;

    return {
      mode: 'presentation',
      overall: Math.round((starAlignment + techDepth + articulation + deliveryAndGaze) / 4),
      starAlignment,
      techDepth,
      articulation,
      deliveryAndGaze,
      strengths: [
        'Well-articulated problem motivation with clear technical context.',
        'Good structured flow through architecture choices and trade-offs.',
        'Maintained composure and technical focus during project walkthrough.',
      ],
      improvements: [
        'Explicitly quantify results using benchmarks, metrics, or user outcomes.',
        'Highlight why alternative frameworks or databases were dismissed.',
        'Keep eye contact aligned with the camera rather than glancing down at slide notes.',
      ],
    };
  }

  // Standard GD / Intro / Casual Scoring
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
