/**
 * Centralized High-Quality Female Voice Manager
 *
 * Ensures Aura always speaks with an attractive, natural, warm, and engaging
 * female voice suited for student mentorship, never robotic or male.
 */

// Highly prioritized natural, warm female voices across all platforms
export const PREFERRED_FEMALE_VOICES = [
  // 1. Windows Microsoft Edge / Chrome Natural Neural Voices (Best in class)
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Neerja Online (Natural) - English (India)',
  'Microsoft Sonia Online (Natural) - English (United Kingdom)',
  'Microsoft Libby Online (Natural) - English (United Kingdom)',
  'Microsoft Steffan Online (Natural) - English (United States)',

  // 2. Google Natural Voices in Chrome (Female)
  'Google UK English Female',
  'Google US English Female',

  // 3. Apple macOS / iOS Natural Voices
  'Samantha',
  'Victoria',
  'Karen',
  'Moira',
  'Tessa',
  'Serena',

  // 4. Windows Built-in Desktop Female Voices
  'Microsoft Zira - English (United States)',
  'Microsoft Neerja - English (India)',
  'Microsoft Hazel - English (Great Britain)',
  'Microsoft Susan - English (Great Britain)',
  'Microsoft Heera - English (India)',
];

// Explicit male voice filters to avoid male or robotic baritone tones
const MALE_VOICE_PATTERNS = [
  /\bdavid\b/i,
  /\bmark\b/i,
  /\bgeorge\b/i,
  /\bguy\b/i,
  /\bryan\b/i,
  /\bchristopher\b/i,
  /\beric\b/i,
  /\bravi\b/i,
  /\bsean\b/i,
  /\brichard\b/i,
  /\bjames\b/i,
  /\bmale\b/i,
  /^Google US English$/i, // In Chrome on Windows, 'Google US English' is a monotone male voice
];

/**
 * Checks if a given voice is male
 */
export function isMaleVoice(voice) {
  if (!voice) return false;
  const name = voice.name || '';
  return MALE_VOICE_PATTERNS.some((pattern) => pattern.test(name));
}

/**
 * Checks if a voice is confirmed or likely female
 */
export function isFemaleVoice(voice) {
  if (!voice) return false;
  if (isMaleVoice(voice)) return false;
  const name = voice.name.toLowerCase();
  const femaleKeywords = [
    'female', 'woman', 'girl', 'jenny', 'aria', 'zira', 'samantha',
    'victoria', 'neerja', 'karen', 'sonia', 'libby', 'hazel', 'susan', 'heera'
  ];
  return femaleKeywords.some((kw) => name.includes(kw));
}

/**
 * Selects the absolute best attractive female educator voice available in the browser
 */
export function getBestFemaleVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  // 1. Try exact or substring matches from PREFERRED_FEMALE_VOICES
  for (const preferred of PREFERRED_FEMALE_VOICES) {
    const v = voices.find(
      (voice) => voice.name === preferred || voice.name.toLowerCase().includes(preferred.toLowerCase())
    );
    if (v && !isMaleVoice(v)) return v;
  }

  // 2. Try any English voice with female keywords
  const femaleEn = voices.find((v) => v.lang?.startsWith('en') && isFemaleVoice(v));
  if (femaleEn) return femaleEn;

  // 3. Try any English voice that is NOT male
  const nonMaleEn = voices.find((v) => v.lang?.startsWith('en') && !isMaleVoice(v));
  if (nonMaleEn) return nonMaleEn;

  // 4. Any voice that is not male
  const nonMaleAny = voices.find((v) => !isMaleVoice(v));
  if (nonMaleAny) return nonMaleAny;

  // 5. Ultimate fallback
  return voices.find((v) => v.lang?.startsWith('en')) || voices[0] || null;
}

/**
 * Formats utterance with sweet, warm, natural female cadence and pitch
 */
export function configureFemaleUtterance(utterance) {
  if (!utterance) return;
  // Natural feminine pitch (slightly lifted for friendliness and warmth)
  utterance.pitch = 1.06;
  // Relaxed, articulate pacing (neither rushed nor sluggish)
  utterance.rate = 0.98;
  utterance.volume = 1.0;

  const voice = getBestFemaleVoice();
  if (voice) {
    utterance.voice = voice;
    if (voice.lang) utterance.lang = voice.lang;
  }
}
