// ============================================================
// AuraGD – Date-Wise Progress & Consistency History Engine
// Persisted in localStorage with dynamic session recording
// ============================================================

const STORAGE_KEY = 'auragd_practice_history_v1';
export const SESSION_HISTORY_KEY = 'aura_gd_session_history';

const INITIAL_HISTORY = [
  {
    id: 'rec-1',
    date: 'Oct 02',
    fullDate: '2026-10-02',
    mode: 'Group Discussion',
    score: 55,
    eyeContact: 62,
    fillers: 8,
    badge: 'Getting Started 🌱',
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
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
    badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/40',
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
    badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/40',
  },
  {
    id: 'rec-4',
    date: 'Today',
    fullDate: '2026-10-14',
    mode: 'GD & Pitch',
    score: 86,
    eyeContact: 88,
    fillers: 1,
    badge: 'Placement Ready 🚀',
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
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
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(INITIAL_HISTORY));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }

    // Upgrade baseline placeholder records to match required Feature 10 data points
    const upgraded = parsed.map((item) => {
      if (item.id === 'rec-1') {
        return { ...item, mode: 'Group Discussion', score: 55, eyeContact: 62, fillers: 8, badge: 'Getting Started 🌱', badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/40' };
      }
      if (item.id === 'rec-2') {
        return { ...item, mode: 'Self Introduction', score: 68, eyeContact: 74, fillers: 7, badge: 'Structure Built ⚡', badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/40' };
      }
      if (item.id === 'rec-3') {
        return { ...item, mode: 'Project Pitch', score: 78, eyeContact: 81, fillers: 4, badge: 'High Confidence 🎯', badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/40' };
      }
      if (item.id === 'rec-4') {
        return { ...item, date: 'Today', mode: 'GD & Pitch', score: 86, eyeContact: 88, fillers: 1, badge: 'Placement Ready 🚀', badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40' };
      }
      return item;
    });

    return upgraded;
  } catch (e) {
    return INITIAL_HISTORY;
  }
}

export function recordNewSession({ mode, score, eyeContact, fillers = 2 }) {
  if (typeof window === 'undefined') return;
  try {
    const current = getPracticeHistory();
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

    let badge = '🚀 Leadership Ready';
    let badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40';

    if (mode === 'casual' || mode.toLowerCase().includes('casual') || mode.toLowerCase().includes('wellness')) {
      badge = 'Mindset Reset 🌿';
      badgeColor = 'text-amber-300 bg-amber-950/60 border-amber-500/40';
    } else if (score >= 85) {
      badge = 'Placement Ready 🚀';
      badgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40';
    } else if (score >= 75) {
      badge = 'High Confidence 🎯';
      badgeColor = 'text-indigo-400 bg-indigo-950/60 border-indigo-800/40';
    } else if (score >= 65) {
      badge = 'Structure Built ⚡';
      badgeColor = 'text-sky-400 bg-sky-950/60 border-sky-800/40';
    } else {
      badge = 'Getting Started 🌱';
      badgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800/40';
    }

    const recordedScore = (mode === 'casual' || mode.toLowerCase().includes('casual'))
      ? 'Reset 🌿'
      : (score !== null && score !== undefined ? score : 85);

    const newRecord = {
      id: 'rec-' + Date.now(),
      date: todayStr,
      fullDate: new Date().toISOString().split('T')[0],
      mode: formatModeName(mode),
      score: recordedScore,
      eyeContact,
      fillers: (mode === 'casual') ? 0 : fillers,
      badge,
      badgeColor,
    };

    const updated = [...current, newRecord];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.debug('Failed to persist history:', e);
  }
}

export function getSessionHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY) || localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function formatModeName(modeKey) {
  if (!modeKey) return 'Group Discussion';
  if (modeKey === 'gd_pitch' || modeKey === 'GD & Pitch') return 'GD & Pitch';
  if (modeKey === 'presentation' || modeKey.toLowerCase().includes('presentation') || modeKey.toLowerCase().includes('pitch')) return 'Project Pitch';
  if (modeKey === 'self_intro' || modeKey.toLowerCase().includes('intro')) return 'Self Introduction';
  if (modeKey === 'casual' || modeKey.toLowerCase().includes('casual')) return 'Casual Talk & Vocal Habit';
  return 'Group Discussion';
}
