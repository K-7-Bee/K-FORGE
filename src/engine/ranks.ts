// Rank mode. A rank needs two things: enough XP (how much you have learned) and a rank test —
// an aptitude test built only from material you have completed — passed at the rank's score
// while you already held that much XP. XP alone never promotes, and a high score on a small
// early test cannot be cashed in for a high rank later.
import { MODULES } from '../data/curriculum';
import { getQuestions } from '../data/questions';
import type { Question } from '../data/types';
import type { AppState, TestAttempt } from '../store/types';
import { shuffle } from './grading';
import { examPassed, lessonDone, totalXp } from './progress';

export interface RankDef {
  n: number;
  id: string;
  name: string;
  title: string;
  xp: number;
  /** Minimum rank-test score (percent) taken at or above this rank's XP. */
  minScore: number;
  tagline: string;
  /** Accent colour for charts and glows. */
  color: string;
  image: string;
}

export const RANKS: RankDef[] = [
  { n: 1, id: 'strawberry', name: 'Crimson Strawberry', title: 'Rookie', xp: 0, minScore: 0, tagline: 'The beginning', color: '#ff3b5c', image: '/ranks/strawberry.webp' },
  { n: 2, id: 'peach', name: 'Golden Peach', title: 'Rising', xp: 1000, minScore: 60, tagline: 'Awakening potential', color: '#ffb347', image: '/ranks/peach.svg' },
  { n: 3, id: 'blueberry', name: 'Frost Blueberry', title: 'Warrior', xp: 2500, minScore: 70, tagline: 'Building strength', color: '#4f8dff', image: '/ranks/blueberry.webp' },
  { n: 4, id: 'dragonfruit', name: 'Dragon Fruit', title: 'Expert', xp: 5500, minScore: 75, tagline: 'Mastering the craft', color: '#ff3fb4', image: '/ranks/dragonfruit.webp' },
  { n: 5, id: 'durian', name: 'Golden Durian', title: 'Master', xp: 9000, minScore: 80, tagline: 'Commanding whole systems', color: '#f5c518', image: '/ranks/durian.webp' },
  { n: 6, id: 'mango', name: 'Mythical Mango', title: 'Legendary', xp: 15000, minScore: 85, tagline: 'Engineering legend', color: '#ff8a00', image: '/ranks/mango.webp' },
];

/** Questions per rank test, the smallest pool that can produce a meaningful test, and time per question. */
export const RANK_TEST = { questions: 20, minPool: 15, minutesPerQuestion: 1.5 } as const;
/** Rank-test XP: score% × factor, awarded for the first rank test of each week only. */
export const RANK_TEST_XP_FACTOR = 1.5;

export interface RankPool {
  questions: Question[];
  modules: { id: string; short: string; questions: Question[] }[];
}

/**
 * Everything the learner has actually covered: the knowledge-check questions of completed lessons,
 * plus the full exam pool of every module whose exam they passed. Self-assessed questions are left
 * out because a rank must be earned on auto-graded answers.
 */
export function rankPool(s: AppState): RankPool {
  const byModule = new Map<string, Set<string>>();
  for (const m of MODULES) {
    const ids = new Set<string>();
    for (const l of m.lessons) if (lessonDone(s, l.id)) for (const q of l.check ?? []) ids.add(q);
    if (examPassed(s, m.id)) for (const q of m.examQuestionIds) ids.add(q);
    if (ids.size) byModule.set(m.id, ids);
  }
  const seen = new Set<string>();
  const questions: Question[] = [];
  const modules: RankPool['modules'] = [];
  for (const [id, ids] of byModule) {
    const qs = getQuestions([...ids]).filter((q) => q.type !== 'short' && !seen.has(q.id));
    qs.forEach((q) => seen.add(q.id));
    if (!qs.length) continue;
    questions.push(...qs);
    modules.push({ id, short: MODULES.find((m) => m.id === id)?.short ?? id, questions: qs });
  }
  return { questions, modules };
}

/** Picks a rank test spread evenly across the covered modules (round-robin), then shuffles the order. */
export function buildRankTest(pool: RankPool, count: number = RANK_TEST.questions): Question[] {
  const groups = pool.modules.map((m) => shuffle(m.questions));
  const picked: Question[] = [];
  while (picked.length < count && groups.some((g) => g.length)) {
    for (const g of groups) {
      const q = g.shift();
      if (q && picked.length < count) picked.push(q);
    }
  }
  return shuffle(picked);
}

/** Rank tests in the order they were taken (attempts merged from another device may arrive out of order). */
export function rankAttempts(s: AppState): TestAttempt[] {
  return s.attempts.filter((a) => a.kind === 'aptitude').sort((a, b) => (a.finishedAt < b.finishedAt ? -1 : a.finishedAt > b.finishedAt ? 1 : 0));
}

/** True when this attempt earns the given rank. */
export function qualifies(a: TestAttempt, r: RankDef): boolean {
  return a.total >= RANK_TEST.minPool && a.percent >= r.minScore && (a.xpAtStart ?? 0) >= r.xp;
}

export interface RankInfo {
  rank: RankDef;
  next?: RankDef;
  xp: number;
  /** When each rank was first earned (rank 1 has none). */
  earnedAt: Record<string, string>;
  /** XP progress toward the next rank, 0–1. */
  xpProgress: number;
  /** Best rank-test score so far. */
  best?: number;
  /** 'earn-xp': keep learning; 'ready': XP reached, pass the rank test; 'max': top rank. */
  status: 'earn-xp' | 'ready' | 'max';
}

export function rankInfo(s: AppState): RankInfo {
  const xp = totalXp(s);
  const attempts = rankAttempts(s);
  const earnedAt: Record<string, string> = {};
  let rank = RANKS[0];
  for (const r of RANKS.slice(1)) {
    const first = attempts.find((a) => qualifies(a, r));
    if (!first) break;
    earnedAt[r.id] = first.finishedAt;
    rank = r;
  }
  const next = RANKS.find((r) => r.n === rank.n + 1);
  const xpProgress = next ? Math.min(1, Math.max(0, (xp - rank.xp) / (next.xp - rank.xp))) : 1;
  const best = attempts.length ? Math.max(...attempts.map((a) => a.percent)) : undefined;
  return { rank, next, xp, earnedAt, xpProgress, best, status: !next ? 'max' : xp >= next.xp ? 'ready' : 'earn-xp' };
}

/** The highest rank a single attempt qualifies for — used for the history table and the result screen. */
export function rankForAttempt(a: TestAttempt): RankDef {
  let best = RANKS[0];
  for (const r of RANKS.slice(1)) if (qualifies(a, r)) best = r;
  return best;
}
