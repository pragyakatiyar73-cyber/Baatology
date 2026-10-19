// ============================================================
// AuraGD – Date-Wise Progress & Consistency History Engine
// Persisted in localStorage with dynamic session recording
// ============================================================

const STORAGE_KEY = 'auragd_practice_history_v2';
export const SESSION_HISTORY_KEY = 'aura_gd_session_history_v2';

export const COMMUNICATION_ACTIVITY_SCORES = [
  {
    activity: 'Group Discussion',
    previousScore: 45,
    latestScore: 65,
    growth: '+20%',
  },
  {
    activity: 'Presentation',
    previousScore: 55,
    latestScore: 75,
    growth: '+20%',
  },
  {
    activity: 'Casual Talk',
    previousScore: 60,
    latestScore: 80,
    growth: '+20%',
  },
];

export const INITIAL_HISTORY = [
  {
    id: 'rec-1',
    date: 'Oct 02',
    fullDate: '2026-10-02',
    mode: 'Group Discussion',
    score: 55,
    eyeContact: 62,
    fillers: 8,
    badge: 'Getting Started ⏳',
    badgeColor: 'text-indigo-400 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-2',
    date: 'Oct 05',
    fullDate: '2026-10-05',
    mode: 'Self Introduction',
    score: 68,
    eyeContact: 74,
    fillers: 7,
    badge: 'Structure Built ⚡',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-3',
    date: 'Oct 08',
    fullDate: '2026-10-08',
    mode: 'Project Pitch',
    score: 78,
    eyeContact: 81,
    fillers: 4,
    badge: 'High Confidence 🎯',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-4',
    date: 'Today',
    isToday: true,
    fullDate: '2026-10-14',
    mode: 'GD & Pitch',
    score: 86,
    eyeContact: 88,
    fillers: 1,
    badge: 'Placement Ready 🚀',
    badgeColor: 'text-emerald-700 bg-emerald-100 border-emerald-300',
  },
  {
    id: 'rec-5',
    date: 'Oct 14',
    fullDate: '2026-10-14',
    mode: 'Casual Talk',
    score: 77,
    eyeContact: 84,
    fillers: 1,
    badge: 'Pure Articulation 💎',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-6',
    date: 'Oct 14',
    fullDate: '2026-10-14',
    mode: 'Group Discussion',
    score: 78,
    eyeContact: 83,
    fillers: 1,
    badge: 'Pure Articulation 💎',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-7',
    date: 'Oct 14',
    fullDate: '2026-10-14',
    mode: 'Project Presentation',
    score: 74,
    eyeContact: 82,
    fillers: 1,
    badge: 'Architecture Lead 📊',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-8',
    date: 'Oct 14',
    fullDate: '2026-10-14',
    mode: 'Project Presentation',
    score: 78,
    eyeContact: 88,
    fillers: 1,
    badge: 'Architecture Lead 📊',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-9',
    date: 'Oct 16',
    fullDate: '2026-10-16',
    mode: 'Self Introduction',
    score: 83,
    eyeContact: 98,
    fillers: 0,
    badge: 'High Confidence 🎯',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-10',
    date: 'Oct 16',
    fullDate: '2026-10-16',
    mode: 'Self Introduction',
    score: 83,
    eyeContact: 98,
    fillers: 0,
    badge: 'High Confidence 🎯',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-11',
    date: 'Oct 16',
    fullDate: '2026-10-16',
    mode: 'Self Introduction',
    score: 81,
    eyeContact: 98,
    fillers: 0,
    badge: 'High Confidence 🎯',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-12',
    date: 'Oct 17',
    fullDate: '2026-10-17',
    mode: 'Self Introduction',
    score: 79,
    eyeContact: 90,
    fillers: 0,
    badge: 'High Confidence 🎯',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-13',
    date: 'Oct 17',
    fullDate: '2026-10-17',
    mode: 'Self Introduction',
    score: 80,
    eyeContact: 88,
    fillers: 0,
    badge: 'High Confidence 🎯',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'rec-14',
    date: 'Oct 19',
    fullDate: '2026-10-19',
    mode: 'Casual Talk & Vocal Habit',
    score: 'Reset 🌱',
    eyeContact: 98,
    fillers: 0,
    badge: 'Mindset Reset 🌱',
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
];

export function getPracticeHistory() {
  if (typeof window === 'undefined') return INITIAL_HISTORY;
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(INITIAL_HISTORY));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length < 5) {
      localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(INITIAL_HISTORY));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    return parsed;
  } catch (e) {
    return INITIAL_HISTORY;
  }
}

export function recordNewSession({ mode, score, eyeContact, fillers = 1 }) {
  if (typeof window === 'undefined') return;
  try {
    const current = getPracticeHistory();
    const todayStr = 'Today';

    let badge = 'Placement Ready 🚀';
    let badgeColor = 'text-emerald-700 bg-emerald-100 border-emerald-300';

    if (mode === 'casual' || mode.toLowerCase().includes('casual')) {
      badge = 'Mindset Reset 🌱';
      badgeColor = 'text-indigo-600 bg-indigo-50 border-indigo-200';
    } else if (score >= 85) {
      badge = 'Placement Ready 🚀';
      badgeColor = 'text-emerald-700 bg-emerald-100 border-emerald-300';
    } else if (score >= 75) {
      badge = 'High Confidence 🎯';
      badgeColor = 'text-indigo-600 bg-indigo-50 border-indigo-200';
    } else if (score >= 65) {
      badge = 'Structure Built ⚡';
      badgeColor = 'text-indigo-600 bg-indigo-50 border-indigo-200';
    } else {
      badge = 'Getting Started ⏳';
      badgeColor = 'text-amber-700 bg-amber-50 border-amber-300';
    }

    const recordedScore = (mode === 'casual' || mode.toLowerCase().includes('casual'))
      ? 'Reset 🌱'
      : (score !== null && score !== undefined ? score : 86);

    const newRecord = {
      id: 'rec-' + Date.now(),
      date: todayStr,
      isToday: true,
      fullDate: new Date().toISOString().split('T')[0],
      mode: formatModeName(mode),
      score: recordedScore,
      eyeContact: eyeContact || 88,
      fillers: (mode === 'casual') ? 0 : fillers,
      badge,
      badgeColor,
    };

    // Remove previous "Today" tag if any
    const sanitized = current.map(c => ({ ...c, isToday: false, date: c.date === 'Today' ? 'Oct 14' : c.date }));
    const updated = [newRecord, ...sanitized];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.debug('Failed to persist history:', e);
  }
}

export function getSessionHistory() {
  return getPracticeHistory();
}

function formatModeName(modeKey) {
  if (!modeKey) return 'Group Discussion';
  if (modeKey === 'gd_pitch' || modeKey === 'GD & Pitch') return 'GD & Pitch';
  if (modeKey === 'presentation' || modeKey.toLowerCase().includes('presentation') || modeKey.toLowerCase().includes('pitch')) return 'Project Presentation';
  if (modeKey === 'self_intro' || modeKey.toLowerCase().includes('intro')) return 'Self Introduction';
  if (modeKey === 'casual' || modeKey.toLowerCase().includes('casual')) return 'Casual Talk & Vocal Habit';
  return 'Group Discussion';
}
