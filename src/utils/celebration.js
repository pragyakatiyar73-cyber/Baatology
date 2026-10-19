import confetti from 'canvas-confetti';
import { getBestFemaleVoice, configureFemaleUtterance } from './femaleVoiceManager';

/**
 * Requirement 1: Full-Screen Fireworks/Confetti Blast
 * Blasts colorful confetti/fireworks particles from both bottom corners across
 * the entire viewport for 2.5 seconds using Baatology's theme colors:
 * Teal (#14b8a6), Amber (#f59e0b), Cyan (#06b6d4), Gold (#fbbf24).
 */
export function fireLoginCelebration() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;

  // Baatology theme colors: teal, amber, cyan, gold (plus accent violet)
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
 * "Welcome, [Candidate Name]! Great to have you in Baatology. Let's make you placement-ready today!"
 * Warm, enthusiastic, and confident tone.
 */
export function speakWelcomeGreeting(candidateName = 'Pragya') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[Baatology Celebration] Speech synthesis is not supported in this environment');
    return;
  }

  try {
    // Cancel any active speech to avoid overlaps
    window.speechSynthesis.cancel();

    const name = candidateName.trim() || 'Pragya';
    const text = `Welcome, ${name}! Great to have you in Baatology. Let's make you placement-ready today!`;

    const utterance = new SpeechSynthesisUtterance(text);
    configureFemaleUtterance(utterance);

    // Pick natural female English voice if available
    const setVoice = () => {
      const femaleVoice = getBestFemaleVoice();
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        if (femaleVoice.lang) utterance.lang = femaleVoice.lang;
      }
    };

    setVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('[Baatology Celebration] Voice synthesis error:', err);
  }
}

/**
 * Requirement: GD Completion Celebration with Fireworks and AI Congratulations
 * - Fires vibrant multi-angle fireworks and confetti across viewport
 * - Speaks personalized warm congratulations aloud
 * - Automatically transitions to the feedback report
 */
export function fireGDFinishCelebration(candidateName = 'Pragya', onComplete) {
  // 1. Blast fireworks
  fireLoginCelebration();

  // Secondary delayed fireworks burst
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      zIndex: 99999,
    });
  }, 1200);

  // 2. Speak AI congratulations
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const name = candidateName.trim() || 'Pragya';
      const text = `Congratulations ${name}! You have successfully completed your 15-minute Group Discussion round with great confidence and active participation! Let's review your speech mistakes and sentence practice now.`;

      const utterance = new SpeechSynthesisUtterance(text);
      configureFemaleUtterance(utterance);

      const setVoice = () => {
        const femaleVoice = getBestFemaleVoice();
        if (femaleVoice) {
          utterance.voice = femaleVoice;
          if (femaleVoice.lang) utterance.lang = femaleVoice.lang;
        }
      };

      setVoice();
      utterance.onend = () => {
        onComplete?.();
      };
      utterance.onerror = () => {
        onComplete?.();
      };

      window.speechSynthesis.speak(utterance);
      return;
    } catch (e) {
      console.warn('[GD Celebration] Speech failed:', e);
    }
  }

  // Fallback if speech not supported or finishes immediately
  setTimeout(() => {
    onComplete?.();
  }, 3500);
}

import { playApplauseSound } from './applauseAudio';

/**
 * Requirement: Presentation & Q&A Completion Celebration
 * - Real clapping / applause sound effect ("claping ke aawaz aaye")
 * - Multi-angle fireworks blast across viewport
 * - Speaks personalized warm congratulations aloud
 * - Automatically transitions to presentation feedback report
 */
export function firePresentationCelebration(candidateName = 'Pragya', onComplete) {
  // 1. Play authentic crowd applause & clapping sound
  playApplauseSound(3.8);

  // 2. Blast fireworks & confetti
  fireLoginCelebration();

  setTimeout(() => {
    confetti({
      particleCount: 85,
      spread: 110,
      origin: { y: 0.6 },
      zIndex: 99999,
    });
  }, 1200);

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const name = candidateName.trim() || 'Pragya';
      const text = `Congratulations ${name}! You have successfully presented your project and answered the technical questions with great confidence! Opening your presentation feedback and sentence practice report now.`;

      const utterance = new SpeechSynthesisUtterance(text);
      configureFemaleUtterance(utterance);

      const femaleVoice = getBestFemaleVoice();
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        if (femaleVoice.lang) utterance.lang = femaleVoice.lang;
      }

      utterance.onend = () => onComplete?.();
      utterance.onerror = () => onComplete?.();

      window.speechSynthesis.speak(utterance);
      return;
    } catch (e) {
      console.warn('[Presentation Celebration] Speech failed:', e);
    }
  }

  setTimeout(() => {
    onComplete?.();
  }, 3200);
}

