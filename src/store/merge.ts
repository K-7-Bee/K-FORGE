// Merges two learner states (e.g. this device and the cloud copy) without losing work from either.
// Earned things are unioned (XP once per key, completions keep the earliest date, best scores the max);
// preferences and plans come from whichever state was edited more recently.
import type { AppState, ExerciseProgress, LessonProgress, MilestoneProgress, ProjectProgress, SrsCard } from './types';

const earliest = (a?: string, b?: string) => (!a ? b : !b ? a : a < b ? a : b);
const latest = (a?: string, b?: string) => (!a ? b : !b ? a : a > b ? a : b);
const union = <T,>(a: T[], b: T[], key: (x: T) => string): T[] => {
  const m = new Map<string, T>();
  for (const x of [...a, ...b]) if (!m.has(key(x))) m.set(key(x), x);
  return [...m.values()];
};
const uniq = (a: string[], b: string[]) => [...new Set([...a, ...b])];
const orArr = (a: boolean[] = [], b: boolean[] = []) => Array.from({ length: Math.max(a.length, b.length) }, (_, i) => Boolean(a[i] || b[i]));

function mergeRecord<T>(a: Record<string, T>, b: Record<string, T>, f: (x: T, y: T) => T): Record<string, T> {
  const out: Record<string, T> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = k in a ? f(a[k], v) : v;
  return out;
}

function mergeLesson(x: LessonProgress, y: LessonProgress): LessonProgress {
  return {
    firstOpenedAt: earliest(x.firstOpenedAt, y.firstOpenedAt),
    completedAt: earliest(x.completedAt, y.completedAt),
    bestCheck: Math.max(x.bestCheck ?? 0, y.bestCheck ?? 0) || undefined,
    studiedAt: earliest(x.studiedAt, y.studiedAt),
  };
}

function mergeExercise(x: ExerciseProgress, y: ExerciseProgress): ExerciseProgress {
  const solvedFirst = !x.solvedAt ? y : !y.solvedAt ? x : x.solvedAt <= y.solvedAt ? x : y;
  return {
    ...solvedFirst,
    attempts: Math.max(x.attempts, y.attempts),
    solvedAt: earliest(x.solvedAt, y.solvedAt),
    hintsUsed: Math.max(x.hintsUsed, y.hintsUsed),
    solutionViewed: Boolean(x.solutionViewed || y.solutionViewed) || undefined,
    verification: solvedFirst.verification,
    rubric: orArr(x.rubric, y.rubric),
    evidence: uniq(x.evidence, y.evidence),
    lastCode: x.lastCode ?? y.lastCode,
  };
}

function mergeMilestone(x: MilestoneProgress, y: MilestoneProgress): MilestoneProgress {
  return { checklist: orArr(x.checklist, y.checklist), evidence: uniq(x.evidence, y.evidence), notes: x.notes.length >= y.notes.length ? x.notes : y.notes, completedAt: earliest(x.completedAt, y.completedAt) };
}

function mergeProject(x: ProjectProgress, y: ProjectProgress): ProjectProgress {
  return {
    startedAt: earliest(x.startedAt, y.startedAt)!,
    milestones: mergeRecord(x.milestones, y.milestones, mergeMilestone),
    tests: union(x.tests, y.tests, (t) => t.id),
    documentation: x.documentation.length >= y.documentation.length ? x.documentation : y.documentation,
    completedAt: earliest(x.completedAt, y.completedAt),
    finalEvaluation: orArr(x.finalEvaluation, y.finalEvaluation),
  };
}

const mergeCard = (x: SrsCard, y: SrsCard): SrsCard => ((latest(x.lastReviewed, y.lastReviewed) ?? '') === (x.lastReviewed ?? '') ? x : y);

export function mergeStates(a: AppState, b: AppState): AppState {
  const newer = (a.updatedAt ?? '') >= (b.updatedAt ?? '') ? a : b;
  const xpByKey = new Map<string, AppState['xp'][number]>();
  for (const t of [...a.xp, ...b.xp]) {
    const cur = xpByKey.get(t.key);
    if (!cur || t.at < cur.at) xpByKey.set(t.key, t);
  }
  const achievements = mergeRecord(a.achievements, b.achievements, (x, y) => earliest(x, y)!);
  const practiceCount = mergeRecord(a.practiceCount, b.practiceCount, (x, y) => Math.max(x, y));
  const byTime = <T extends { at: string }>(xs: T[]) => xs.sort((p, q) => (p.at < q.at ? -1 : p.at > q.at ? 1 : 0));

  return {
    ...newer,
    version: 1,
    profile: { ...newer.profile, createdAt: earliest(a.profile.createdAt, b.profile.createdAt)!, onboarded: a.profile.onboarded || b.profile.onboarded },
    xp: [...xpByKey.values()].sort((p, q) => (p.at < q.at ? -1 : 1)),
    practiceCount,
    activity: byTime(union(a.activity, b.activity, (e) => `${e.at}|${e.type}|${e.ref}`)).slice(-5000),
    lessons: mergeRecord(a.lessons, b.lessons, mergeLesson),
    attempts: union(a.attempts, b.attempts, (x) => x.id).sort((p, q) => (p.finishedAt < q.finishedAt ? -1 : 1)),
    exercises: mergeRecord(a.exercises, b.exercises, mergeExercise),
    mistakes: union(a.mistakes, b.mistakes, (m) => m.id).sort((p, q) => (p.at > q.at ? -1 : 1)).slice(0, 500),
    cards: mergeRecord(a.cards, b.cards, mergeCard),
    reviews: byTime(union(a.reviews, b.reviews, (r) => `${r.at}|${r.cardId}`)),
    sessions: union(a.sessions, b.sessions, (x) => x.id),
    projects: mergeRecord(a.projects, b.projects, mergeProject),
    customProjects: union(newer.customProjects, newer === a ? b.customProjects : a.customProjects, (p) => p.id),
    notes: Object.values(mergeRecord(Object.fromEntries(a.notes.map((n) => [n.id, n])), Object.fromEntries(b.notes.map((n) => [n.id, n])), (x, y) => (x.updatedAt >= y.updatedAt ? x : y))).sort((p, q) => (p.updatedAt > q.updatedAt ? -1 : 1)),
    placement: !a.placement ? b.placement : !b.placement ? a.placement : a.placement.at >= b.placement.at ? a.placement : b.placement,
    achievements,
    mentor: {
      conversations: Object.values(mergeRecord(Object.fromEntries(a.mentor.conversations.map((c) => [c.id, c])), Object.fromEntries(b.mentor.conversations.map((c) => [c.id, c])), (x, y) => (x.updatedAt >= y.updatedAt ? x : y))).sort((p, q) => (p.updatedAt > q.updatedAt ? -1 : 1)).slice(0, 40),
      hintLevels: mergeRecord(a.mentor.hintLevels, b.mentor.hintLevels, (x, y) => Math.max(x, y)),
    },
    updatedAt: latest(a.updatedAt, b.updatedAt),
  };
}
