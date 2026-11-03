// Store rules: completion must be verified, XP is granted once per activity, and
// advanced levels require assessments — not just XP.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mem = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
});
vi.stubGlobal('document', { documentElement: { dataset: {} } });

const store = await import('../src/store/store');
const { totalXp, examPassed, moduleProgress, streak, dailyMissions, overallCompletion } = await import('../src/engine/progress');
const { levelInfo } = await import('../src/engine/levels');
const { getModule } = await import('../src/data/curriculum');
const { getQuestion, PLACEMENT_AREAS } = await import('../src/data/questions');

function answers(ids: string[], correct: boolean) {
  return ids.map((qid) => ({ qid, topic: getQuestion(qid)!.topic, correct, given: 'x', usedHint: false }));
}

beforeEach(() => store.resetState());

describe('lesson completion', () => {
  it('does not complete or reward a lesson when the check fails', () => {
    store.recordLessonCheck('ohms-law', answers(['ohm-1', 'ohm-2', 'ohm-5'], false));
    const s = store.getState();
    expect(s.lessons['ohms-law'].completedAt).toBeUndefined();
    expect(totalXp(s)).toBe(0);
    expect(s.mistakes).toHaveLength(3);
    expect(Object.keys(s.cards)).toContain('q:ohm-1'); // mistakes become revision cards
  });

  it('awards lesson + check XP exactly once', () => {
    store.recordLessonCheck('ohms-law', answers(['ohm-1', 'ohm-2', 'ohm-5'], true));
    const first = totalXp(store.getState());
    expect(first).toBeGreaterThanOrEqual(20);
    store.recordLessonCheck('ohms-law', answers(['ohm-1', 'ohm-2', 'ohm-5'], true));
    const s = store.getState();
    expect(totalXp(s)).toBe(first); // no farming
    expect(s.practiceCount['lesson:ohms-law']).toBe(1); // repeat practice still tracked
    expect(s.cards['f:fc-ohm']).toBeDefined(); // flashcards enter the SRS queue
  });

  it('marking an outline lesson as studied gives no XP', () => {
    store.markStudied('kirchhoff');
    expect(totalXp(store.getState())).toBe(0);
  });
});

describe('exams, unlocking and levels', () => {
  const exam = (ref: string, mode: 'practice' | 'exam', correct: boolean) =>
    store.recordTestAttempt({ kind: 'module', ref, title: 't', startedAt: new Date().toISOString(), mode, timed: false, answers: answers(getModule(ref)!.examQuestionIds, correct) });

  it('practice-mode passes do not count as exam passes', () => {
    exam('m-electronics', 'practice', true);
    expect(examPassed(store.getState(), 'm-electronics')).toBe(false);
    exam('m-electronics', 'exam', true);
    expect(examPassed(store.getState(), 'm-electronics')).toBe(true);
  });

  it('locks modules until prerequisite exams are passed', () => {
    expect(moduleProgress(store.getState(), getModule('m-digital')!).status).toBe('locked');
    exam('m-electronics', 'exam', true);
    expect(moduleProgress(store.getState(), getModule('m-digital')!).status).not.toBe('locked');
  });

  it('XP alone never raises the level', () => {
    // Give lots of XP through repeated distinct exercises without passing the electronics exam.
    for (const id of ['lab-c-stats', 'lab-c-classify', 'lab-c-swap', 'lab-bitmask', 'lab-binary-print', 'lab-state-machine', 'lab-unit-test', 'lab-encoder-speed']) {
      store.recordExerciseAttempt(id, true, 'compiled');
    }
    const s = store.getState();
    expect(totalXp(s)).toBeGreaterThanOrEqual(150);
    const info = levelInfo(s);
    expect(info.level.n).toBe(1);
    expect(info.blockedBySkills).toBe(true);
    exam('m-electronics', 'exam', true);
    expect(levelInfo(store.getState()).level.n).toBe(2);
  });

  it('placement scores per area and unlocks matching modules without mastering them', () => {
    const ids = PLACEMENT_AREAS.filter((a) => a.id === 'electrical').flatMap((a) => a.questionIds);
    store.recordTestAttempt({ kind: 'placement', ref: 'placement', title: 'p', startedAt: new Date().toISOString(), mode: 'exam', timed: false, answers: answers(ids, true) });
    const s = store.getState();
    expect(s.placement?.perArea.electrical).toBe(100);
    expect(moduleProgress(s, getModule('m-digital')!).status).not.toBe('locked');
    expect(moduleProgress(s, getModule('m-electronics')!).status).not.toBe('mastered');
  });
});

describe('lab & projects', () => {
  it('no-hint bonus only when no hints were revealed', () => {
    store.revealHint('lab-c-swap', 1);
    store.recordExerciseAttempt('lab-c-swap', true, 'compiled');
    expect(store.getState().xp.some((t) => t.key === 'nohint:lab-c-swap')).toBe(false);
    store.recordExerciseAttempt('lab-c-stats', true, 'compiled');
    expect(store.getState().xp.some((t) => t.key === 'nohint:lab-c-stats')).toBe(true);
  });

  it('refuses to complete a milestone without checklist, evidence and measurement', () => {
    store.startProject('p-capstone');
    expect(store.completeMilestone('p-capstone', 'm5')).toMatch(/checklist/i);
    for (let i = 0; i < 3; i++) store.toggleMilestoneCheck('p-capstone', 'm5', i, 3);
    expect(store.completeMilestone('p-capstone', 'm5')).toMatch(/evidence/i);
    store.addMilestoneEvidence('p-capstone', 'm5', 'ev-1', 3);
    expect(store.completeMilestone('p-capstone', 'm5')).toMatch(/measured/i);
    store.addTestRecord('p-capstone', { name: 'Motor speed accuracy', target: '< 5', measured: '3.2', unit: '%', notes: '', milestoneId: 'm5' });
    expect(store.completeMilestone('p-capstone', 'm5')).toBeNull();
    expect(store.getState().xp.some((t) => t.key === 'ms:p-capstone:m5')).toBe(true);
  });
});

describe('regressions', () => {
  it('a fresh profile has 0 % course completion', () => {
    expect(overallCompletion(store.getState())).toBe(0);
  });

  it('progress is persisted immediately after an action (no lost writes on reload)', () => {
    store.recordExerciseAttempt('lab-c-swap', true, 'local-output');
    const saved = JSON.parse(mem.get('kforge-state-v1')!);
    expect(saved.exercises['lab-c-swap'].solvedAt).toBeTruthy();
  });
});

describe('habits', () => {
  it('daily missions award XP once when verified', () => {
    store.recordLessonCheck('ohms-law', answers(['ohm-1', 'ohm-2', 'ohm-5'], true));
    const s = store.getState();
    const learn = dailyMissions(s).find((m) => m.id === 'learn')!;
    expect(learn.done && learn.awarded).toBe(true);
  });

  it('streak tolerates a single rest day', () => {
    const s = store.getState();
    const d = (n: number) => { const x = new Date(); x.setDate(x.getDate() - n); return x.toISOString(); };
    const fake = { ...s, activity: [0, 1, 3, 4].map((n) => ({ at: d(n), type: 'review' as const, ref: 'x' })) };
    expect(streak(fake).days).toBe(4);
    const broken = { ...s, activity: [0, 1, 4, 5].map((n) => ({ at: d(n), type: 'review' as const, ref: 'x' })) };
    expect(streak(broken).days).toBe(2);
  });
});
