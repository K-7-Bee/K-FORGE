// Minimal external store: one immutable AppState, updated through actions that enforce
// completion rules (no XP for passive clicking, full XP once per activity).
import { useSyncExternalStore } from 'react';
import { ALL_FLASHCARDS, findLesson, getModule } from '../data/curriculum';
import { getExercise } from '../data/lab';
import { CAPSTONE, getProject } from '../data/projects';
import { getQuestion, PLACEMENT_AREAS } from '../data/questions';
import { findAnyQuestion } from '../data/lookup';
import type { PlacementArea } from '../data/types';
import { dayKey, uid, weekStart } from '../engine/dates';
import { ACHIEVEMENTS, levelInfo, newlyUnlocked } from '../engine/levels';
import { dailyMissions, exerciseXp, placementRecommendation, totalXp, XP_TABLE } from '../engine/progress';
import { RANK_TEST_XP_FACTOR, rankInfo } from '../engine/ranks';
import { type Grade, newCard, review } from '../engine/srs';
import { toast, type ToastKind } from '../lib/toast';
import { localStorageAdapter, migrate, defaultState } from './persistence';
import type {
  ActivityType,
  AnswerRecord,
  AppState,
  CustomProject,
  Note,
  Settings,
  Subject,
  TestAttempt,
  TestRecord,
  Verification,
  XpKind,
} from './types';

const storage = localStorageAdapter;
let state: AppState = migrate(storage.load());
const listeners = new Set<() => void>();

type PendingToast = { kind: ToastKind; title: string; detail?: string };

export function getState(): AppState {
  return state;
}

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useApp(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export const storageName = storage.name;

function now(): string {
  return new Date().toISOString();
}

function commit(next: AppState, toasts: PendingToast[]) {
  state = next;
  // Save synchronously: a debounced write loses the last action if the tab closes or reloads right after it.
  storage.save(state);
  listeners.forEach((l) => l());
  toasts.forEach((t) => toast(t.kind, t.title, t.detail));
}

/** Apply a mutation to a cloned draft, then run the post-processors (daily missions, achievements, level-ups). */
function update(fn: (d: AppState, toasts: PendingToast[]) => void): void {
  const before = levelInfo(state).level.n;
  const rankBefore = rankInfo(state).rank.n;
  const d = structuredClone(state);
  const toasts: PendingToast[] = [];
  fn(d, toasts);
  d.updatedAt = now();

  for (const m of dailyMissions(d)) {
    if (m.done && !m.awarded) award(d, toasts, `daily:${dayKey()}:${m.id}`, 'daily', XP_TABLE.daily, `Daily mission: ${m.title}`);
  }
  for (const a of newlyUnlocked(d)) {
    d.achievements[a.id] = now();
    toasts.push({ kind: 'achievement', title: `Achievement unlocked: ${a.title}`, detail: a.description });
  }
  const after = levelInfo(d).level;
  if (after.n > before) toasts.push({ kind: 'level', title: `Level ${after.n}: ${after.name}`, detail: after.blurb });
  const rank = rankInfo(d).rank;
  if (rank.n > rankBefore) toasts.push({ kind: 'level', title: `Rank up: ${rank.name}`, detail: `${rank.title} — ${rank.tagline}` });

  commit(d, toasts);
}

function award(d: AppState, toasts: PendingToast[], key: string, kind: XpKind, amount: number, label: string): boolean {
  if (d.xp.some((t) => t.key === key)) {
    d.practiceCount[key] = (d.practiceCount[key] ?? 0) + 1; // repeated practice is tracked, not rewarded
    return false;
  }
  d.xp.push({ key, kind, amount, label, at: now() });
  toasts.push({ kind: 'xp', title: `+${amount} XP`, detail: label });
  return true;
}

function log(d: AppState, type: ActivityType, ref: string, detail?: string) {
  d.activity.push({ at: now(), type, ref, detail });
  if (d.activity.length > 5000) d.activity.splice(0, d.activity.length - 5000);
}

function addMistakes(d: AppState, answers: AnswerRecord[]) {
  for (const a of answers) {
    if (a.correct || !findAnyQuestion(a.qid)) continue; // rubric criteria etc. are not revision cards
    d.mistakes.unshift({ id: uid('mk'), qid: a.qid, topic: a.topic, at: now(), given: a.given, note: '', resolved: false });
    const cardId = `q:${a.qid}`;
    const existing = d.cards[cardId];
    if (existing) {
      d.cards[cardId] = { ...existing, due: dayKey(), interval: 1, reps: 0 }; // difficult again → bring it back now
    } else {
      d.cards[cardId] = newCard(cardId, 'question', a.qid, a.topic, 'mistake');
    }
  }
  if (d.mistakes.length > 500) d.mistakes.length = 500;
}

// ======================= Profile & settings =======================

export function setProfile(p: Partial<AppState['profile']>) {
  update((d) => {
    d.profile = { ...d.profile, ...p };
  });
}

export function setSettings(p: Partial<Settings>) {
  update((d) => {
    d.settings = { ...d.settings, ...p };
  });
  if (p.theme) {
    document.documentElement.dataset.theme = p.theme;
    try {
      localStorage.setItem('kforge-theme', p.theme);
    } catch {
      /* ignore */
    }
  }
}

// ======================= Lessons =======================

export function openLesson(moduleId: string, lessonId: string) {
  update((d) => {
    d.lessons[lessonId] = { ...d.lessons[lessonId], firstOpenedAt: d.lessons[lessonId]?.firstOpenedAt ?? now() };
    d.lastLesson = { moduleId, lessonId, at: now() };
  });
}

/** Outline lessons can be marked as studied for tracking — this awards no XP by design. */
export function markStudied(lessonId: string) {
  update((d) => {
    d.lessons[lessonId] = { ...d.lessons[lessonId], studiedAt: now() };
  });
}

/** A lesson is completed only by passing its knowledge check at the mastery threshold. */
export function recordLessonCheck(lessonId: string, answers: AnswerRecord[]) {
  const found = findLesson(lessonId);
  if (!found) return;
  update((d, toasts) => {
    const correct = answers.filter((a) => a.correct).length;
    const percent = answers.length ? Math.round((correct / answers.length) * 100) : 0;
    const passed = percent >= d.settings.mastery;
    const lp = d.lessons[lessonId] ?? {};
    d.lessons[lessonId] = { ...lp, bestCheck: Math.max(lp.bestCheck ?? 0, percent) };
    d.attempts.push({
      id: uid('att'), kind: 'quiz', ref: lessonId, title: `Knowledge check · ${found.lesson.title}`,
      startedAt: now(), finishedAt: now(), mode: 'practice', timed: false,
      score: correct, total: answers.length, percent, passed, mastery: d.settings.mastery, answers,
    });
    log(d, 'check_attempt', lessonId, `${percent}%`);
    addMistakes(d, answers);
    if (passed) {
      if (!lp.completedAt) {
        d.lessons[lessonId].completedAt = now();
        log(d, 'lesson_complete', lessonId);
        // Lesson flashcards join the spaced-repetition queue once the lesson is learned.
        for (const fc of found.lesson.flashcards ?? []) {
          const id = `f:${fc.id}`;
          if (!d.cards[id]) d.cards[id] = newCard(id, 'flashcard', fc.id, fc.topic, 'lesson');
        }
      }
      award(d, toasts, `lesson:${lessonId}`, 'lesson', XP_TABLE.lesson, `Lesson complete: ${found.lesson.title}`);
      award(d, toasts, `check:${lessonId}`, 'check', XP_TABLE.check, 'Knowledge check passed');
    }
  });
}

// ======================= Tests =======================

export interface AttemptInput {
  kind: TestAttempt['kind'];
  ref: string;
  title: string;
  startedAt: string;
  mode: 'practice' | 'exam';
  timed: boolean;
  answers: AnswerRecord[];
  /** Weighted scoring (practical exams): overrides the 1-point-per-answer default. */
  points?: { score: number; total: number };
}

export function recordTestAttempt(input: AttemptInput): TestAttempt {
  let result!: TestAttempt;
  update((d, toasts) => {
    const { points, ...rest } = input;
    const score = points?.score ?? input.answers.filter((a) => a.correct).length;
    const total = points?.total ?? input.answers.length;
    const percent = total ? Math.round((score / total) * 100) : 0;
    const passed = percent >= d.settings.mastery;
    result = { ...rest, id: uid('att'), finishedAt: now(), score, total, percent, passed, mastery: d.settings.mastery };
    if (input.kind === 'aptitude') result.xpAtStart = totalXp(d); // before this test's own XP
    d.attempts.push(result);
    log(d, 'test_attempt', input.ref, `${input.kind}:${percent}%`);
    addMistakes(d, input.answers);

    if (input.kind === 'placement') {
      const perArea = {} as Record<PlacementArea, number>;
      const areas = new Map<string, { c: number; t: number }>();
      for (const a of input.answers) {
        const area = PLACEMENT_AREAS.find((p) => p.questionIds.includes(a.qid))?.id;
        if (!area) continue;
        const st = areas.get(area) ?? { c: 0, t: 0 };
        st.t++;
        if (a.correct) st.c++;
        areas.set(area, st);
      }
      for (const [area, st] of areas) perArea[area as PlacementArea] = Math.round((st.c / st.t) * 100);
      d.placement = { at: now(), perArea, recommendation: placementRecommendation(perArea, d.settings.mastery) };
      award(d, toasts, 'placement', 'placement', XP_TABLE.placement, 'Placement assessment completed');
    }
    if (input.kind === 'aptitude') {
      // Only the week's first rank test earns XP, so retakes are for practice and rank, not farming.
      if (percent > 0) award(d, toasts, `rank-test:${weekStart()}`, 'aptitude', Math.round(percent * RANK_TEST_XP_FACTOR), `Weekly rank test: ${percent}%`);
    }
    if (passed && input.mode === 'exam') {
      if (input.kind === 'module') {
        const m = getModule(input.ref);
        award(d, toasts, `exam:${input.ref}`, 'exam', XP_TABLE.exam, `Module exam passed: ${m?.short ?? input.ref}`);
      } else if (input.kind === 'final') {
        award(d, toasts, 'exam:final', 'exam', XP_TABLE.exam, 'Final examination passed');
      } else if (input.kind === 'debugging') {
        award(d, toasts, `exam:debug:${input.ref}`, 'exam', XP_TABLE.exam, 'Debugging examination passed');
      } else if (input.kind === 'practical') {
        award(d, toasts, `practical:${input.ref}`, 'lab', XP_TABLE.lab, `Practical examination: ${input.title}`);
      }
    }
  });
  return result;
}

// ======================= Engineering Lab =======================

export function revealHint(exerciseId: string, level: number) {
  update((d) => {
    const p = d.exercises[exerciseId] ?? { attempts: 0, hintsUsed: 0, evidence: [] };
    d.exercises[exerciseId] = { ...p, hintsUsed: Math.max(p.hintsUsed, level) };
  });
}

export function viewSolution(exerciseId: string) {
  update((d) => {
    const p = d.exercises[exerciseId] ?? { attempts: 0, hintsUsed: 0, evidence: [] };
    d.exercises[exerciseId] = { ...p, solutionViewed: true };
  });
}

export function saveExerciseDraft(exerciseId: string, patch: { lastCode?: string; lastAnswer?: string; notes?: string }) {
  update((d) => {
    const p = d.exercises[exerciseId] ?? { attempts: 0, hintsUsed: 0, evidence: [] };
    d.exercises[exerciseId] = { ...p, ...patch };
  });
}

/** Record an attempt. Completion XP is granted only when `correct` was verified (auto-graded, compiled tests, or evidence-backed). */
export function recordExerciseAttempt(exerciseId: string, correct: boolean, verification: Verification, answer?: AnswerRecord) {
  const ex = getExercise(exerciseId);
  if (!ex) return;
  update((d, toasts) => {
    const p = d.exercises[exerciseId] ?? { attempts: 0, hintsUsed: 0, evidence: [] };
    const next = { ...p, attempts: p.attempts + 1 };
    log(d, 'exercise_attempt', exerciseId, correct ? 'pass' : 'fail');
    if (answer) addMistakes(d, [answer]);
    if (correct) {
      if (!p.solvedAt) {
        next.solvedAt = now();
        next.verification = verification;
        log(d, 'exercise_solved', exerciseId);
      }
      const { kind, amount } = exerciseXp(ex);
      award(d, toasts, `ex:${exerciseId}`, kind === 'check' ? 'check' : kind, amount, `${ex.title}`);
      if (p.hintsUsed === 0 && !p.solutionViewed) award(d, toasts, `nohint:${exerciseId}`, 'noHintBonus', XP_TABLE.noHintBonus, 'Solved without hints');
    }
    d.exercises[exerciseId] = next;
  });
}

export function setRubric(exerciseId: string, rubric: boolean[]) {
  update((d) => {
    const p = d.exercises[exerciseId] ?? { attempts: 0, hintsUsed: 0, evidence: [] };
    d.exercises[exerciseId] = { ...p, rubric };
  });
}

export function addExerciseEvidence(exerciseId: string, evidenceId: string) {
  update((d) => {
    const p = d.exercises[exerciseId] ?? { attempts: 0, hintsUsed: 0, evidence: [] };
    d.exercises[exerciseId] = { ...p, evidence: [...p.evidence, evidenceId] };
  });
}

export function removeExerciseEvidence(exerciseId: string, evidenceId: string) {
  update((d) => {
    const p = d.exercises[exerciseId];
    if (p) p.evidence = p.evidence.filter((e) => e !== evidenceId);
  });
}

// ======================= Revision =======================

export function reviewCard(cardId: string, grade: Grade) {
  update((d) => {
    const c = d.cards[cardId];
    if (!c) return;
    d.cards[cardId] = review(c, grade);
    d.reviews.push({ at: now(), cardId, grade });
    log(d, 'review', cardId, String(grade));
  });
}

export function addFlashcardsForTopic(topic: string) {
  update((d) => {
    for (const fc of ALL_FLASHCARDS.filter((f) => f.topic === topic || topic === '*')) {
      const id = `f:${fc.id}`;
      if (!d.cards[id]) d.cards[id] = newCard(id, 'flashcard', fc.id, fc.topic, 'manual');
    }
  });
}

export function addQuestionCard(qid: string) {
  const q = getQuestion(qid);
  if (!q) return;
  update((d) => {
    const id = `q:${qid}`;
    if (!d.cards[id]) d.cards[id] = newCard(id, 'question', qid, q.topic, 'manual');
  });
}

export function removeCard(cardId: string) {
  update((d) => {
    delete d.cards[cardId];
  });
}

export function updateMistake(id: string, patch: { note?: string; resolved?: boolean }) {
  update((d) => {
    const m = d.mistakes.find((x) => x.id === id);
    if (m) Object.assign(m, patch);
  });
}

// ======================= Study time =======================

export function addSession(minutes: number, subject: Subject, source: 'manual' | 'timer', note?: string, start = now()) {
  update((d) => {
    d.sessions.push({ id: uid('ss'), start, minutes: Math.round(minutes), subject, source, note });
  });
}

export function removeSession(id: string) {
  update((d) => {
    d.sessions = d.sessions.filter((s) => s.id !== id);
  });
}

/** Called once per active minute on learning pages. Accumulates into today's auto session per subject. */
export function trackMinute(subject: Subject) {
  update((d) => {
    const today = dayKey();
    const s = d.sessions.find((x) => x.source === 'auto' && x.subject === subject && dayKey(new Date(x.start)) === today);
    if (s) s.minutes += 1;
    else d.sessions.push({ id: uid('ss'), start: now(), minutes: 1, subject, source: 'auto' });
  });
}

// ======================= Projects =======================

function ensureProject(d: AppState, projectId: string) {
  if (!d.projects[projectId]) d.projects[projectId] = { startedAt: now(), milestones: {}, tests: [], documentation: '' };
  return d.projects[projectId];
}

export function startProject(projectId: string) {
  update((d) => {
    ensureProject(d, projectId);
  });
}

export function toggleMilestoneCheck(projectId: string, milestoneId: string, index: number, size: number) {
  update((d) => {
    const p = ensureProject(d, projectId);
    const m = p.milestones[milestoneId] ?? { checklist: Array(size).fill(false), evidence: [], notes: '' };
    m.checklist = Array.from({ length: size }, (_, i) => (i === index ? !m.checklist[i] : Boolean(m.checklist[i])));
    p.milestones[milestoneId] = m;
  });
}

export function addMilestoneEvidence(projectId: string, milestoneId: string, evidenceId: string, size: number) {
  update((d) => {
    const p = ensureProject(d, projectId);
    const m = p.milestones[milestoneId] ?? { checklist: Array(size).fill(false), evidence: [], notes: '' };
    m.evidence = [...m.evidence, evidenceId];
    p.milestones[milestoneId] = m;
  });
}

export function removeMilestoneEvidence(projectId: string, milestoneId: string, evidenceId: string) {
  update((d) => {
    const m = d.projects[projectId]?.milestones[milestoneId];
    if (m) m.evidence = m.evidence.filter((e) => e !== evidenceId);
  });
}

export function setMilestoneNotes(projectId: string, milestoneId: string, notes: string, size: number) {
  update((d) => {
    const p = ensureProject(d, projectId);
    const m = p.milestones[milestoneId] ?? { checklist: Array(size).fill(false), evidence: [], notes: '' };
    m.notes = notes;
    p.milestones[milestoneId] = m;
  });
}

/** Returns an error message when completion requirements are not met. */
export function completeMilestone(projectId: string, milestoneId: string): string | null {
  const def = getProject(projectId);
  const ms = def?.milestones.find((m) => m.id === milestoneId);
  if (!def || !ms) return 'Unknown milestone.';
  const p = state.projects[projectId];
  const m = p?.milestones[milestoneId];
  if (!m || ms.checklist.some((_, i) => !m.checklist[i])) return 'Tick every checklist item first.';
  if (m.evidence.length === 0) return 'Upload at least one piece of evidence (photo, code, diagram or test log).';
  if (ms.metric && !p.tests.some((t) => t.milestoneId === milestoneId && t.measured.trim())) return `Record a measured result for "${ms.metric.name}" in Testing records.`;
  update((d, toasts) => {
    const mp = d.projects[projectId].milestones[milestoneId];
    if (mp.completedAt) return;
    mp.completedAt = now();
    log(d, 'milestone_complete', `${projectId}:${milestoneId}`);
    if (def.kind === 'capstone') award(d, toasts, `ms:${projectId}:${milestoneId}`, 'milestone', ms.xp, `Milestone: ${ms.title}`);
  });
  return null;
}

export function addTestRecord(projectId: string, rec: Omit<TestRecord, 'id' | 'at'>) {
  update((d) => {
    ensureProject(d, projectId).tests.push({ ...rec, id: uid('tr'), at: now() });
  });
}

export function removeTestRecord(projectId: string, id: string) {
  update((d) => {
    const p = d.projects[projectId];
    if (p) p.tests = p.tests.filter((t) => t.id !== id);
  });
}

export function setProjectDocumentation(projectId: string, text: string) {
  update((d) => {
    ensureProject(d, projectId).documentation = text;
  });
}

export function setFinalEvaluation(projectId: string, values: boolean[]) {
  update((d) => {
    ensureProject(d, projectId).finalEvaluation = values;
  });
}

export function completeProject(projectId: string): string | null {
  const def = getProject(projectId);
  const p = state.projects[projectId];
  if (!def || !p) return 'Start the project first.';
  const missing = def.milestones.filter((m) => !p.milestones[m.id]?.completedAt);
  if (missing.length) return `Complete every milestone first (${missing.length} remaining).`;
  if (p.tests.filter((t) => t.measured.trim()).length === 0) return 'Record at least one measured test result.';
  if (!p.documentation.trim()) return 'Write the project documentation first.';
  if (def.evaluation.some((_, i) => !p.finalEvaluation?.[i])) return 'Confirm every final evaluation criterion.';
  update((d, toasts) => {
    const pp = d.projects[projectId];
    if (pp.completedAt) return;
    pp.completedAt = now();
    log(d, 'project_complete', projectId);
    if (projectId === CAPSTONE.id) award(d, toasts, `project:${projectId}`, 'finalProject', XP_TABLE.finalProject, `Final project: ${def.title}`);
    else award(d, toasts, `project:${projectId}`, 'miniProject', XP_TABLE.miniProject, `Mini-project: ${def.title}`);
  });
  return null;
}

export function saveCustomProject(p: CustomProject) {
  update((d) => {
    const i = d.customProjects.findIndex((x) => x.id === p.id);
    if (i >= 0) d.customProjects[i] = p;
    else d.customProjects.push(p);
  });
}

export function deleteCustomProject(id: string) {
  update((d) => {
    d.customProjects = d.customProjects.filter((p) => p.id !== id);
  });
}

export function completeCustomProject(id: string): string | null {
  const p = state.customProjects.find((x) => x.id === id);
  if (!p) return 'Unknown project.';
  if (p.milestones.length === 0 || p.milestones.some((m) => !m.done)) return 'Complete every milestone first.';
  if (p.milestones.every((m) => m.evidence.length === 0)) return 'Upload evidence for at least one milestone.';
  if (p.tests.filter((t) => t.measured.trim()).length === 0) return 'Record at least one measured result.';
  if (!p.documentation.trim()) return 'Write the documentation first.';
  update((d, toasts) => {
    const cp = d.customProjects.find((x) => x.id === id)!;
    if (cp.completedAt) return;
    cp.completedAt = now();
    log(d, 'project_complete', id);
    award(d, toasts, `project:${id}`, 'miniProject', XP_TABLE.miniProject, `Project: ${cp.title}`);
  });
  return null;
}

// ======================= Notes =======================

export function saveNote(n: Omit<Note, 'updatedAt'>) {
  update((d) => {
    const i = d.notes.findIndex((x) => x.id === n.id);
    const note = { ...n, updatedAt: now() };
    if (i >= 0) d.notes[i] = note;
    else d.notes.unshift(note);
  });
}

export function deleteNote(id: string) {
  update((d) => {
    d.notes = d.notes.filter((n) => n.id !== id);
  });
}

// ======================= Planner =======================

export function setPlanner(patch: Partial<AppState['planner']>) {
  update((d) => {
    d.planner = { ...d.planner, ...patch };
  });
}

export function setDailyGoals(day: string, goals: AppState['planner']['dailyGoals'][string]) {
  update((d) => {
    d.planner.dailyGoals = { ...d.planner.dailyGoals, [day]: goals };
  });
}

// ======================= Mentor =======================

export function saveConversation(c: AppState['mentor']['conversations'][number]) {
  update((d) => {
    const i = d.mentor.conversations.findIndex((x) => x.id === c.id);
    if (i >= 0) d.mentor.conversations[i] = c;
    else d.mentor.conversations.unshift(c);
    if (d.mentor.conversations.length > 40) d.mentor.conversations.length = 40;
  });
}

export function deleteConversation(id: string) {
  update((d) => {
    d.mentor.conversations = d.mentor.conversations.filter((c) => c.id !== id);
  });
}

export function setMentorHintLevel(challengeId: string, level: number) {
  update((d) => {
    d.mentor.hintLevels[challengeId] = level;
  });
}

// ======================= Data management =======================

export function exportState(): string {
  return JSON.stringify(state, null, 2);
}

export function importState(json: string): string | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed?.version !== 1) return 'This file is not a K-FORGE progress export.';
    commit(migrate(parsed), [{ kind: 'success', title: 'Progress imported' }]);
    return null;
  } catch {
    return 'Could not read that file.';
  }
}

/** Replace the whole state (used by cloud sync after merging). Achievements are re-checked. */
export function replaceState(next: AppState) {
  const d = migrate(next);
  const toasts: PendingToast[] = [];
  for (const a of newlyUnlocked(d)) {
    d.achievements[a.id] = now();
    toasts.push({ kind: 'achievement', title: `Achievement unlocked: ${a.title}`, detail: a.description });
  }
  commit(d, toasts);
}

export function resetState() {
  storage.clear();
  commit(defaultState(), [{ kind: 'info', title: 'Progress reset' }]);
}

export const ACHIEVEMENT_COUNT = ACHIEVEMENTS.length;
