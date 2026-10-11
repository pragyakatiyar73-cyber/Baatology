// ============================================================
// AuraGD – Date-Wise Progress & Consistency History Engine
// Persisted in localStorage with dynamic session recording
// ============================================================

const STORAGE_KEY = 'auragd_practice_history_v1';

const INITIAL_HISTORY = [
  {
    id: 'rec-1',
    date: 'Oct 02',
    fullDate: '2026-10-02',
    mode: 'Group Discussion',
    score: 55,
    eyeContact: 62,
    fillers: 8,
    badge: '🌱 Getting Started',
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
  },
  {
    id: 'rec-2',
    date: 'Oct 05',
    fullDate: '2026-10-05',
    mode: 'Self Introduction',
    score: 50,
    eyeContact: 58,
    fillers: 11,
    badge: '🎯 Structure Built',
    badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/40',
  },
  {
    id: 'rec-3',
    date: 'Oct 08',
    fullDate: '2026-10-08',
    mode: 'Group Discussion',
    score: 55,
    eyeContact: 69,
    fillers: 7,
    badge: '💎 Clear Articulation',
    badgeColor: 'text-teal-400 bg-teal-950/60 border-teal-800/40',
  },
  {
    id: 'rec-4',
    date: 'Today',
    fullDate: '2026-10-11',
    mode: 'Project Presentation',
    score: 86,
    eyeContact: 88,
    fillers: 2,
    badge: '🌟 STAR Master',
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
  },
];

export function getPracticeHistory() {
  if (typeof window === 'undefined') return INITIAL_HISTORY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HISTORY));
      return INITIAL_HISTORY;
    }
    return JSON.parse(raw);
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

    if (mode === 'presentation' || mode.toLowerCase().includes('project')) {
      badge = score >= 80 ? '🌟 STAR Master' : '📽️ Architecture Lead';
      badgeColor = 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40';
    } else if (eyeContact >= 85) {
      badge = '🔥 High Focus';
      badgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800/40';
    } else if (fillers <= 3) {
      badge = '💎 Pure Articulation';
      badgeColor = 'text-teal-400 bg-teal-950/60 border-teal-800/40';
    }

    const newRecord = {
      id: 'rec-' + Date.now(),
      date: todayStr,
      fullDate: new Date().toISOString().split('T')[0],
      mode: formatModeName(mode),
      score,
      eyeContact,
      fillers,
      badge,
      badgeColor,
    };

    const updated = [...current, newRecord];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.debug('Failed to persist history:', e);
  }
}

function formatModeName(modeKey) {
  if (modeKey === 'presentation') return 'Project Presentation';
  if (modeKey === 'self_intro') return 'Self Introduction';
  if (modeKey === 'casual') return 'Casual Talk';
  return 'Group Discussion';
}
