// Rank mode: a rank needs its XP *and* a rank test passed at its score while holding that XP.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mem = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
});
vi.stubGlobal('document', { documentElement: { dataset: {} } });

const store = await import('../src/store/store');
const { totalXp } = await import('../src/engine/progress');
const { rankInfo, rankPool, buildRankTest, RANKS, RANK_TEST } = await import('../src/engine/ranks');
const { getModule } = await import('../src/data/curriculum');
const { getQuestion } = await import('../src/data/questions');

const ELECTRONICS = getModule('m-electronics')!;
const QIDS = ELECTRONICS.examQuestionIds.slice(0, 20);

/** A rank test of `n` questions with `correct` of them right. */
function rankTest(correct: number, n = 20) {
  const answers = QIDS.slice(0, n).map((qid, i) => ({ qid, topic: getQuestion(qid)!.topic, correct: i < correct, given: 'x', usedHint: false }));
  return store.recordTestAttempt({ kind: 'aptitude', ref: 'rank', title: 'Rank test', startedAt: new Date().toISOString(), mode: 'exam', timed: true, answers });
}

/** Replaces the XP ledger with a single grant so tests can sit at an exact XP level. */
function setXp(amount: number) {
  const s = store.getState();
  store.replaceState({ ...s, xp: [{ key: 'seed', kind: 'lesson', amount, label: 'seed', at: new Date().toISOString() }] });
}

beforeEach(() => store.resetState());

describe('rank ladder', () => {
  it('matches the six ranks with rising XP and score requirements', () => {
    expect(RANKS.map((r) => [r.name, r.xp])).toEqual([
      ['Crimson Strawberry', 0], ['Golden Peach', 1000], ['Frost Blueberry', 2500], ['Dragon Fruit', 5500], ['Golden Durian', 9000], ['Mythical Mango', 15000],
    ]);
    for (let i = 1; i < RANKS.length; i++) expect(RANKS[i].minScore).toBeGreaterThan(RANKS[i - 1].minScore);
  });

  it('starts every learner as a Crimson Strawberry', () => {
    const info = rankInfo(store.getState());
    expect(info.rank.id).toBe('strawberry');
    expect(info.status).toBe('earn-xp');
  });
});

describe('promotion rules', () => {
  it('never promotes on XP alone', () => {
    setXp(20000);
    const info = rankInfo(store.getState());
    expect(info.rank.id).toBe('strawberry');
    expect(info.status).toBe('ready');
  });

  it('promotes when a rank test meets the score at the required XP, and records XP at the start', () => {
    setXp(1200);
    const a = rankTest(12); // 60 %
    expect(a.xpAtStart).toBe(1200);
    expect(rankInfo(store.getState()).rank.id).toBe('peach');
  });

  it('does not let an early high score count for a higher rank later', () => {
    setXp(500);
    rankTest(20); // 100 % at 500 XP: qualifies for nothing above rank 1
    setXp(3000);
    expect(rankInfo(store.getState()).rank.id).toBe('strawberry');
    rankTest(15); // 75 % at 3000 XP: meets Peach (60 %) and Blueberry (70 %)
    expect(rankInfo(store.getState()).rank.id).toBe('blueberry');
  });

  it('a low score at high XP does not promote, and ranks are climbed in order', () => {
    setXp(16000);
    rankTest(11); // 55 %: below even Golden Peach
    expect(rankInfo(store.getState()).rank.id).toBe('strawberry');
    rankTest(16); // 80 %: Peach, Blueberry, Dragon Fruit and Durian, but not Mango (85 %)
    expect(rankInfo(store.getState()).rank.id).toBe('durian');
    rankTest(18); // 90 %
    expect(rankInfo(store.getState()).rank.id).toBe('mango');
    expect(rankInfo(store.getState()).status).toBe('max');
  });

  it('ignores tests with too few questions', () => {
    setXp(1200);
    rankTest(RANK_TEST.minPool - 1, RANK_TEST.minPool - 1); // 100 % but too short
    expect(rankInfo(store.getState()).rank.id).toBe('strawberry');
  });

  it('awards rank-test XP once per week only', () => {
    rankTest(10); // 50 % → 75 XP
    expect(totalXp(store.getState())).toBe(75);
    rankTest(20);
    expect(totalXp(store.getState())).toBe(75);
  });
});

describe('rank test content', () => {
  it('draws only from completed lessons and passed modules, without self-assessed questions', () => {
    expect(rankPool(store.getState()).questions).toHaveLength(0);
    const lessons = ELECTRONICS.lessons.slice(0, 3);
    for (const l of lessons) {
      store.recordLessonCheck(l.id, (l.check ?? []).map((qid) => ({ qid, topic: getQuestion(qid)!.topic, correct: true, given: 'x', usedHint: false })));
    }
    const pool = rankPool(store.getState());
    const allowed = new Set(lessons.flatMap((l) => l.check ?? []));
    expect(pool.questions.length).toBeGreaterThan(0);
    for (const q of pool.questions) {
      expect(allowed.has(q.id)).toBe(true);
      expect(q.type).not.toBe('short');
    }
  });

  it('builds a test of unique questions spread across every covered module', () => {
    for (const id of ['m-electronics', 'm-digital', 'm-c']) {
      const m = getModule(id)!;
      store.recordTestAttempt({ kind: 'module', ref: id, title: 't', startedAt: new Date().toISOString(), mode: 'exam', timed: false, answers: m.examQuestionIds.map((qid) => ({ qid, topic: getQuestion(qid)!.topic, correct: true, given: 'x', usedHint: false })) });
    }
    const pool = rankPool(store.getState());
    expect(pool.modules.map((m) => m.id)).toEqual(['m-electronics', 'm-digital', 'm-c']);
    const test = buildRankTest(pool);
    expect(test).toHaveLength(RANK_TEST.questions);
    expect(new Set(test.map((q) => q.id)).size).toBe(test.length);
    for (const m of pool.modules) expect(test.filter((q) => m.questions.includes(q)).length).toBeGreaterThanOrEqual(6);
  });
});
