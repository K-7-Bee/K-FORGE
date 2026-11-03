import type { AppState } from './types';
import { dayKey } from '../engine/dates';

/**
 * Storage adapter. The initial version is local-first (localStorage). A cloud adapter
 * (e.g. Supabase) can implement the same interface and be selected at start-up when
 * credentials are configured; see README → "Cloud sync".
 */
export interface ProgressStorage {
  readonly name: string;
  load(): AppState | null;
  save(state: AppState): void;
  clear(): void;
}

const KEY = 'kforge-state-v1';

export const localStorageAdapter: ProgressStorage = {
  name: 'This device (localStorage)',
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AppState) : null;
    } catch {
      return null;
    }
  },
  save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.error('K-FORGE: could not save progress', e);
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};

export function defaultState(): AppState {
  const now = new Date().toISOString();
  return {
    version: 1,
    profile: { username: 'Engineer', specialization: 'Embedded Systems & Robotics', createdAt: now, onboarded: false },
    settings: {
      theme: 'dark',
      mastery: 80,
      weeklyPreset: 'standard',
      weeklyHours: 14,
      examMode: false,
      examModeHours: 4,
      reminders: { enabled: false, time: '19:00' },
      autoTrack: true,
    },
    xp: [],
    practiceCount: {},
    activity: [],
    lessons: {},
    attempts: [],
    exercises: {},
    mistakes: [],
    cards: {},
    reviews: [],
    sessions: [],
    projects: {},
    customProjects: [],
    notes: [],
    planner: {
      allocation: { programming: 35, electronics: 15, embedded: 25, robotics: 10, german: 15 },
      blocks: [],
      dailyGoals: { [dayKey()]: [] },
      exams: [],
      deadlines: [],
    },
    achievements: {},
    mentor: { conversations: [], hintLevels: {} },
  };
}

/** Merge a loaded (possibly older) state onto current defaults so new fields always exist. */
export function migrate(loaded: Partial<AppState> | null): AppState {
  const base = defaultState();
  if (!loaded || loaded.version !== 1) return base;
  return {
    ...base,
    ...loaded,
    profile: { ...base.profile, ...loaded.profile },
    settings: { ...base.settings, ...loaded.settings, reminders: { ...base.settings.reminders, ...loaded.settings?.reminders } },
    planner: { ...base.planner, ...loaded.planner, allocation: { ...base.planner.allocation, ...loaded.planner?.allocation } },
    mentor: { ...base.mentor, ...loaded.mentor },
  };
}
