// Lightweight localStorage-backed usage tracker.
// Every screen that represents "real" activity in the app (finishing a
// speech analysis, saving a CBT entry, logging sleep, completing a task,
// finishing a focus session, keeping a reminder on) calls bumpStat/setStat
// here. Profile.tsx reads from the same store, so what's shown there is
// always derived from things the person actually did - never random numbers.

export type CountableStat =
  | 'speechAnalysesCompleted'
  | 'cbtEntries'
  | 'sleepRecordsLogged'
  | 'tasksCompleted'
  | 'focusSessionsCompleted'
  | 'remindersActive';

export interface AppStats {
  speechAnalysesCompleted: number;
  cbtEntries: number;
  sleepRecordsLogged: number;
  tasksCompleted: number;
  focusSessionsCompleted: number;
  remindersActive: number;
  visitedDates: string[]; // 'YYYY-MM-DD', most recent 90 kept
  joinedDate: string; // ISO timestamp, set once on first run
}

const STORAGE_KEY = 'helloBuddyStats';
const EVENT_NAME = 'hb-stats-changed';

const defaults: AppStats = {
  speechAnalysesCompleted: 0,
  cbtEntries: 0,
  sleepRecordsLogged: 0,
  tasksCompleted: 0,
  focusSessionsCompleted: 0,
  remindersActive: 0,
  visitedDates: [],
  joinedDate: new Date().toISOString(),
};

function safeParse(raw: string | null): AppStats | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return null;
  }
}

export function getStats(): AppStats {
  if (typeof window === 'undefined') return defaults;
  const existing = safeParse(localStorage.getItem(STORAGE_KEY));
  if (existing) return existing;

  const initial = { ...defaults, joinedDate: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch {
    // localStorage unavailable (private mode, etc.) - fall back to in-memory defaults
  }
  return initial;
}

function saveStats(stats: AppStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore write failures
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

export function bumpStat(key: CountableStat, amount = 1) {
  const stats = getStats();
  stats[key] = (stats[key] || 0) + amount;
  saveStats(stats);
}

export function setStat(key: CountableStat, value: number) {
  const stats = getStats();
  stats[key] = value;
  saveStats(stats);
}

// Call once when the app loads so "day streak" reflects days the person
// actually opened Hello Buddy, not a hardcoded number.
export function recordVisitToday() {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];
  if (!stats.visitedDates.includes(today)) {
    stats.visitedDates = [...stats.visitedDates, today].slice(-90);
    saveStats(stats);
  }
}

export function getCurrentStreak(): number {
  const stats = getStats();
  const dates = new Set(stats.visitedDates);
  let streak = 0;
  const cursor = new Date();

  // If today hasn't been recorded yet (edge case), still allow yesterday
  // to count so the streak doesn't flicker to 0 before recordVisitToday runs.
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().split('T')[0];
    if (dates.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function onStatsChanged(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}
