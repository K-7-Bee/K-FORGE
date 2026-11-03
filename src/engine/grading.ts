import type { Question, Response } from '../data/types';

export interface GradeResult {
  correct: boolean;
  /** Short-answer questions are self-assessed against a model answer; never auto-passed. */
  selfAssessed?: boolean;
  /** Keywords from the model answer the learner mentioned (guidance only). */
  matchedKeywords?: string[];
  feedback?: string;
}

/** Parse numbers like "1.67", "1,67", "4.7k", "250u", "-0.83". */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(',', '.').replace(/\s+/g, '');
  const m = s.match(/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)([kmuµMG]?)/i);
  if (!m) return null;
  const base = Number(m[1]);
  if (!Number.isFinite(base)) return null;
  const suffix = m[2];
  const mult: Record<string, number> = { k: 1e3, K: 1e3, M: 1e6, G: 1e9, m: 1e-3, u: 1e-6, µ: 1e-6 };
  return suffix ? base * (mult[suffix] ?? 1) : base;
}

export function normalizeOutput(s: string): string {
  return s.replace(/\r/g, '').split('\n').map((l) => l.trimEnd()).join('\n').trim();
}

export function normalizeCode(s: string): string {
  return s.replace(/\s+/g, '').replace(/;+$/, ';');
}

export function numericMatches(expected: number, given: number, tolerance = 0.02): boolean {
  if (tolerance === 0 || expected === 0) {
    return Math.abs(given - expected) <= (expected === 0 ? 1e-9 + tolerance : 1e-9);
  }
  return Math.abs(given - expected) <= Math.abs(expected) * tolerance;
}

export function gradeQuestion(q: Question, r: Response): GradeResult {
  switch (q.type) {
    case 'single':
    case 'circuit':
      return { correct: r.kind === 'choice' && r.value === q.answer };
    case 'truefalse':
      return { correct: r.kind === 'bool' && r.value === q.answer };
    case 'multi': {
      if (r.kind !== 'multi') return { correct: false };
      const a = [...r.value].sort((x, y) => x - y);
      const b = [...q.answers].sort((x, y) => x - y);
      return { correct: a.length === b.length && a.every((v, i) => v === b[i]) };
    }
    case 'numeric': {
      if (r.kind !== 'text') return { correct: false };
      const n = parseNumber(r.value);
      if (n === null) return { correct: false, feedback: 'Enter a number.' };
      return { correct: numericMatches(q.answer, n, q.tolerance ?? 0.02) };
    }
    case 'output': {
      if (r.kind !== 'text') return { correct: false };
      const given = normalizeOutput(r.value);
      return { correct: q.accepted.some((a) => normalizeOutput(a) === given) };
    }
    case 'codefix': {
      if (r.kind !== 'codefix') return { correct: false };
      if (r.line !== q.bugLine) return { correct: false, feedback: `The bug is not on line ${r.line}.` };
      const given = normalizeCode(r.text);
      const ok = q.accepted.some((a) => normalizeCode(a) === given);
      return { correct: ok, feedback: ok ? undefined : 'Right line — but the corrected code does not match an accepted fix.' };
    }
    case 'short': {
      if (r.kind !== 'self') return { correct: false, selfAssessed: true };
      const text = r.value.toLowerCase();
      const matched = q.keywords.filter((k) => text.includes(k.toLowerCase().replace(/\s*=\s*$/, '').trim()));
      return { correct: r.selfGrade, selfAssessed: true, matchedKeywords: matched };
    }
  }
}

export function describeResponse(q: Question, r: Response): string {
  switch (r.kind) {
    case 'choice':
      return 'options' in q ? q.options[r.value] ?? String(r.value) : String(r.value);
    case 'multi':
      return 'options' in q ? r.value.map((i) => q.options[i]).join(', ') : r.value.join(',');
    case 'bool':
      return r.value ? 'True' : 'False';
    case 'text':
      return r.value;
    case 'codefix':
      return `line ${r.line}: ${r.text}`;
    case 'self':
      return r.value;
  }
}

export function correctAnswerText(q: Question): string {
  switch (q.type) {
    case 'single':
    case 'circuit':
      return q.options[q.answer];
    case 'multi':
      return q.answers.map((i) => q.options[i]).join(', ');
    case 'truefalse':
      return q.answer ? 'True' : 'False';
    case 'numeric':
      return `${q.answer}${q.unit ? ` ${q.unit}` : ''}`;
    case 'output':
      return q.accepted[0];
    case 'codefix':
      return `line ${q.bugLine}: ${q.accepted[0]}`;
    case 'short':
      return q.modelAnswer;
  }
}

/** Fisher–Yates shuffle with an injectable RNG (deterministic in tests). */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
