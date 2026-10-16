import confetti from 'canvas-confetti';

/**
 * Requirement 1: Full-Screen Fireworks/Confetti Blast
 * Blasts colorful confetti/fireworks particles from both bottom corners across
 * the entire viewport for 2.5 seconds using AuraGD's theme colors:
 * Teal (#14b8a6), Amber (#f59e0b), Cyan (#06b6d4), Gold (#fbbf24).
 */
export function fireLoginCelebration() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;

  // AuraGD theme colors: teal, amber, cyan, gold (plus accent violet)
  const colors = ['#14b8a6', '#f59e0b', '#06b6d4', '#fbbf24', '#8b5cf6'];

  // Initial energetic burst from both bottom corners
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 65,
    origin: { x: 0.05, y: 0.92 },
    colors,
    zIndex: 99999,
    startVelocity: 55,
    scalar: 1.15,
  });

  confetti({
    particleCount: 50,
    angle: 120,
    spread: 65,
    origin: { x: 0.95, y: 0.92 },
    colors,
    zIndex: 99999,
    startVelocity: 55,
    scalar: 1.15,
  });

  // Continuous fireworks stream for the full 2.5s duration
  const frame = () => {
    // Left bottom corner blast
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0.05, y: 0.95 },
      colors,
      zIndex: 99999,
      startVelocity: 48,
      scalar: 1.05,
      ticks: 200,
    });

    // Right bottom corner blast
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 0.95, y: 0.95 },
      colors,
      zIndex: 99999,
      startVelocity: 48,
      scalar: 1.05,
      ticks: 200,
    });

    // Random sky burst
    if (Math.random() < 0.25) {
      confetti({
        particleCount: 15,
        spread: 90,
        origin: { x: 0.25 + Math.random() * 0.5, y: 0.3 + Math.random() * 0.3 },
        colors,
        zIndex: 99999,
        startVelocity: 30,
      });
    }

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  requestAnimationFrame(frame);
}

/**
 * Requirement 2: Personalized AI Verbal Welcome
 * Automatically triggers browser window.speechSynthesis on login completion:
 * "Welcome, [Candidate Name]! Great to have you in AuraGD. Let's make you placement-ready today!"
 * Warm, enthusiastic, and confident tone.
 */
export function speakWelcomeGreeting(candidateName = 'Pragya') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[AuraGD Celebration] Speech synthesis is not supported in this environment');
    return;
  }

  try {
    // Cancel any active speech to avoid overlaps
    window.speechSynthesis.cancel();

    const name = candidateName.trim() || 'Pragya';
    const text = `Welcome, ${name}! Great to have you in AuraGD. Let's make you placement-ready today!`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.06; // warm and enthusiastic
    utterance.volume = 1.0;

    // Pick natural English voice if available
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      const chosenVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Google US English') ||
              v.name.includes('Google UK English Female') ||
              v.name.includes('Jenny') ||
              v.name.includes('Zira') ||
              v.name.includes('Victoria'))
        ) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
    };

    setVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('[AuraGD Celebration] Voice synthesis error:', err);
  }
}
