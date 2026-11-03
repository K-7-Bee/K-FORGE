import { describe, expect, it } from 'vitest';
import { gradeQuestion, parseNumber, shuffle } from '../src/engine/grading';
import { newCard, retention, review } from '../src/engine/srs';
import { parseExpr, sumOfProducts, truthTable } from '../src/engine/logic';
import { addDays, weekStart } from '../src/engine/dates';
import { getQuestion, ALL_QUESTIONS, PLACEMENT_AREAS } from '../src/data/questions';
import { MODULES } from '../src/data/curriculum';
import { EXERCISES, getExercise } from '../src/data/lab';
import { PROJECTS } from '../src/data/projects';
import { RESOURCES } from '../src/data/resources';
import type { Question } from '../src/data/types';
import { TOOLS } from '../src/tools/registry';

const q = (id: string) => getQuestion(id) as Question;

describe('grading', () => {
  it('parses engineering numbers', () => {
    expect(parseNumber('4.7k')).toBeCloseTo(4700);
    expect(parseNumber('1,67')).toBeCloseTo(1.67);
    expect(parseNumber('250u')).toBeCloseTo(0.00025);
    expect(parseNumber('-0.83')).toBeCloseTo(-0.83);
    expect(parseNumber('abc')).toBeNull();
  });

  it('grades numeric answers with relative tolerance', () => {
    expect(gradeQuestion(q('ohm-1'), { kind: 'text', value: '9' }).correct).toBe(true);
    expect(gradeQuestion(q('ohm-1'), { kind: 'text', value: '9.1' }).correct).toBe(true);
    expect(gradeQuestion(q('ohm-1'), { kind: 'text', value: '10' }).correct).toBe(false);
    expect(gradeQuestion(q('bin-1'), { kind: 'text', value: '10' }).correct).toBe(true);
    expect(gradeQuestion(q('bin-1'), { kind: 'text', value: '10.1' }).correct).toBe(false); // tolerance 0
  });

  it('grades choice, multi, true/false and output', () => {
    expect(gradeQuestion(q('ohm-4'), { kind: 'choice', value: 2 }).correct).toBe(true);
    expect(gradeQuestion(q('cpp-4'), { kind: 'multi', value: [3, 0, 2] }).correct).toBe(true);
    expect(gradeQuestion(q('cpp-4'), { kind: 'multi', value: [0, 2] }).correct).toBe(false);
    expect(gradeQuestion(q('ohm-5'), { kind: 'bool', value: false }).correct).toBe(true);
    expect(gradeQuestion(q('ct-1'), { kind: 'text', value: ' 3 \n' }).correct).toBe(true);
  });

  it('grades code fixes by line and whitespace-insensitive text', () => {
    expect(gradeQuestion(q('cl-5'), { kind: 'codefix', line: 2, text: 'for(int i = 0;  i < 3; i++) {' }).correct).toBe(true);
    expect(gradeQuestion(q('cl-5'), { kind: 'codefix', line: 3, text: 'for (int i = 0; i < 3; i++) {' }).correct).toBe(false);
  });

  it('never auto-passes short answers', () => {
    const r = gradeQuestion(q('ohm-9'), { kind: 'self', value: 'compute power and compare with rating', selfGrade: false });
    expect(r.selfAssessed).toBe(true);
    expect(r.correct).toBe(false);
    expect(r.matchedKeywords).toContain('power');
  });

  it('shuffles deterministically with an injected RNG and keeps all items', () => {
    let seed = 1;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const out = shuffle([1, 2, 3, 4, 5], rng);
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('spaced repetition', () => {
  const today = '2026-11-03';
  it('schedules longer intervals for easy cards and resets on failure', () => {
    let c = newCard('q:x', 'question', 'x', 't', 'mistake', today);
    c = review(c, 4, today);
    expect(c.interval).toBe(1);
    c = review(c, 4, today);
    expect(c.interval).toBe(6);
    c = review(c, 4, today);
    expect(c.interval).toBeGreaterThan(6);
    const failed = review(c, 0, today);
    expect(failed.interval).toBe(1);
    expect(failed.lapses).toBe(1);
    expect(failed.ease).toBeLessThan(c.ease);
  });

  it('easy grows faster than hard', () => {
    const base = newCard('q:x', 'question', 'x', 't', 'mistake', today);
    let easy = base;
    let hard = base;
    for (let i = 0; i < 4; i++) { easy = review(easy, 5, today); hard = review(hard, 3, today); }
    expect(easy.interval).toBeGreaterThan(hard.interval);
    expect(hard.ease).toBeGreaterThanOrEqual(1.3);
  });

  it('retention decays over time', () => {
    const c = { ...newCard('q:x', 'question', 'x', 't', 'mistake', today), reps: 2, interval: 6, lastReviewed: new Date(2026, 10, 3).toISOString() };
    expect(retention(c, addDays(today, 1))).toBeGreaterThan(retention(c, addDays(today, 10)));
    expect(retention(c, addDays(today, 6))).toBeCloseTo(0.85, 2);
  });
});

describe('logic parser', () => {
  it('builds truth tables with precedence', () => {
    const tt = truthTable('A & !B');
    expect(tt.vars).toEqual(['A', 'B']);
    expect(tt.rows.map((r) => r.output)).toEqual([false, false, true, false]);
    expect(truthTable('A | B & C').rows.filter((r) => r.output).length).toBe(5); // AND binds tighter
    expect(truthTable("(A+B)'").rows.map((r) => r.output)).toEqual([true, false, false, false]);
    expect(truthTable('A XOR B').rows.map((r) => r.output)).toEqual([false, true, true, false]);
    expect(truthTable('A NAND B').rows.map((r) => r.output)).toEqual([true, true, true, false]);
  });
  it('verifies De Morgan', () => {
    const a = truthTable('!(A & B)').rows.map((r) => r.output);
    const b = truthTable('!A | !B').rows.map((r) => r.output);
    expect(a).toEqual(b);
  });
  it('reports syntax errors', () => {
    expect(() => parseExpr('A & (B')).toThrow();
    expect(() => parseExpr('A $ B')).toThrow();
  });
  it('produces sum of products', () => {
    expect(sumOfProducts(truthTable('A & !B'))).toBe('A·¬B');
  });
});

describe('dates', () => {
  it('finds Monday as week start', () => {
    expect(weekStart(new Date(2026, 10, 5))).toBe('2026-11-02'); // Thu → Mon
    expect(weekStart(new Date(2026, 10, 8))).toBe('2026-11-02'); // Sun → Mon
  });
});

describe('content integrity', () => {
  it('every referenced question id exists', () => {
    for (const m of MODULES) {
      for (const id of m.examQuestionIds) expect(getQuestion(id), `${m.id} exam → ${id}`).toBeDefined();
      for (const l of m.lessons) for (const id of l.check ?? []) expect(getQuestion(id), `${l.id} check → ${id}`).toBeDefined();
    }
    for (const a of PLACEMENT_AREAS) for (const id of a.questionIds) expect(getQuestion(id), `placement → ${id}`).toBeDefined();
  });

  it('every referenced exercise and prerequisite exists', () => {
    const ids = new Set(MODULES.map((m) => m.id));
    for (const m of MODULES) {
      for (const id of m.labIds) expect(getExercise(id), `${m.id} lab → ${id}`).toBeDefined();
      for (const p of m.prerequisites) expect(ids.has(p), `${m.id} prereq → ${p}`).toBe(true);
      for (const l of m.lessons) if (l.challenge?.exerciseId) expect(getExercise(l.challenge.exerciseId), `${l.id} challenge`).toBeDefined();
    }
    for (const e of EXERCISES) expect(ids.has(e.moduleId), `${e.id} module`).toBe(true);
    // The Lab lists exercises in curriculum order.
    const order = EXERCISES.map((e) => MODULES.findIndex((m) => m.id === e.moduleId));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('ids are unique', () => {
    const uniq = (xs: string[]) => new Set(xs).size === xs.length;
    expect(uniq(ALL_QUESTIONS.map((x) => x.id))).toBe(true);
    expect(uniq(EXERCISES.map((x) => x.id))).toBe(true);
    expect(uniq(MODULES.flatMap((m) => m.lessons.map((l) => l.id)))).toBe(true);
    expect(uniq(PROJECTS.map((x) => x.id))).toBe(true);
    expect(uniq(RESOURCES.map((x) => x.id))).toBe(true);
  });

  it('choice answers are valid indexes and seeded lessons are full', () => {
    for (const x of ALL_QUESTIONS) {
      if (x.type === 'single' || x.type === 'circuit') expect(x.answer, x.id).toBeLessThan(x.options.length);
      if (x.type === 'multi') for (const a of x.answers) expect(a, x.id).toBeLessThan(x.options.length);
    }
    const full = MODULES.flatMap((m) => m.lessons).filter((l) => l.status === 'full').map((l) => l.id);
    expect(full).toEqual(expect.arrayContaining(['ohms-law', 'series-parallel', 'binary-numbers', 'c-types', 'c-control', 'c-pointers', 'arduino-gpio', 'esp32-intro']));
  });

  it('every lesson is a full interactive lesson with all ten sections', () => {
    const lessons = MODULES.flatMap((m) => m.lessons);
    expect(lessons).toHaveLength(140);
    const toolIds = new Set(TOOLS.map((t) => t.id));
    for (const l of lessons) {
      expect(l.status, l.id).toBe('full');
      expect(l.objectives.length, `${l.id} objectives`).toBeGreaterThanOrEqual(3);
      expect(l.why.length, `${l.id} why`).toBeGreaterThan(60);
      expect(l.visual, `${l.id} visual`).toBeDefined();
      expect(Boolean(l.visual!.diagram || l.visual!.flow || l.visual!.md), `${l.id} visual content`).toBe(true);
      expect(l.theory.length, `${l.id} theory`).toBeGreaterThan(300);
      expect(l.worked?.steps.length, `${l.id} worked example`).toBeGreaterThanOrEqual(3);
      expect(Boolean(l.demo || l.tryIt), `${l.id} demo or try-it`).toBe(true);
      if (l.demo) expect(toolIds.has(l.demo.tool), `${l.id} tool ${l.demo.tool}`).toBe(true);
      expect(l.mistakes?.length, `${l.id} mistakes`).toBeGreaterThanOrEqual(2);
      expect(l.check?.length, `${l.id} check`).toBe(3);
      expect(new Set(l.check).size, `${l.id} duplicate check questions`).toBe(3);
      expect(l.challenge?.prompt, `${l.id} challenge`).toBeTruthy();
      expect(l.summary.length, `${l.id} summary`).toBeGreaterThanOrEqual(3);
      expect(l.flashcards?.length, `${l.id} flashcards`).toBeGreaterThanOrEqual(1);
    }
  });

  it('every module exam pool includes its lessons’ check questions', () => {
    for (const m of MODULES) for (const l of m.lessons) for (const q of l.check ?? []) expect(m.examQuestionIds, `${m.id} ← ${q}`).toContain(q);
  });

  it('capstone has 15 milestones and every resource has an https/http link', () => {
    expect(PROJECTS.find((p) => p.id === 'p-capstone')!.milestones).toHaveLength(15);
    for (const r of RESOURCES) expect(r.url).toMatch(/^https?:\/\//);
  });
});
