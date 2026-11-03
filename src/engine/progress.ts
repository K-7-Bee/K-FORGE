// Derived, read-only views over learner state. Pure functions — easy to test and reuse.
import { MODULES, getModule, PHASES } from '../data/curriculum';
import { EXERCISES, getExercise } from '../data/lab';
import { CAPSTONE, PROJECTS } from '../data/projects';
import { PLACEMENT_AREAS } from '../data/questions';
import type { Exercise, Module } from '../data/types';
import type { AppState, Subject, TestAttempt } from '../store/types';
import { addDays, dayKey, isoToDay, weekStart } from './dates';
import { retention } from './srs';

// ---------- XP ----------

export const XP_TABLE = {
  lesson: 10,
  check: 10,
  code: 20,
  debug: 25,
  lab: 30,
  exam: 50,
  miniProject: 75,
  milestone: 100,
  finalProject: 250,
  noHintBonus: 5,
  daily: 5,
  placement: 25,
} as const;

export function totalXp(s: AppState): number {
  return s.xp.reduce((sum, t) => sum + t.amount, 0);
}

export function hasXp(s: AppState, key: string): boolean {
  return s.xp.some((t) => t.key === key);
}

export function exerciseXp(ex: Exercise): { kind: 'code' | 'debug' | 'lab' | 'check'; amount: number } {
  if (ex.level === 'debug') return { kind: 'debug', amount: XP_TABLE.debug };
  if (ex.kind === 'rubric') return { kind: 'lab', amount: XP_TABLE.lab };
  if (ex.kind === 'code') return { kind: 'code', amount: XP_TABLE.code };
  return ex.level === 'understand' ? { kind: 'check', amount: XP_TABLE.check } : { kind: 'code', amount: XP_TABLE.code };
}

// ---------- Lessons, exams, exercises ----------

export function lessonDone(s: AppState, lessonId: string): boolean {
  return Boolean(s.lessons[lessonId]?.completedAt);
}

export function attemptsFor(s: AppState, kind: TestAttempt['kind'], ref: string): TestAttempt[] {
  return s.attempts.filter((a) => a.kind === kind && a.ref === ref);
}

export function bestPercent(s: AppState, kind: TestAttempt['kind'], ref: string): number | undefined {
  const list = attemptsFor(s, kind, ref);
  return list.length ? Math.max(...list.map((a) => a.percent)) : undefined;
}

/** An exam counts as passed only when taken in exam mode (not practice) and scored at or above mastery. */
export function examPassed(s: AppState, moduleId: string): boolean {
  return attemptsFor(s, 'module', moduleId).some((a) => a.passed && a.mode === 'exam');
}

export function finalPassed(s: AppState): boolean {
  return attemptsFor(s, 'final', 'final').some((a) => a.passed && a.mode === 'exam');
}

export function exerciseSolved(s: AppState, id: string): boolean {
  return Boolean(s.exercises[id]?.solvedAt);
}

export function solvedExercises(s: AppState, pred: (e: Exercise) => boolean = () => true): Exercise[] {
  return EXERCISES.filter((e) => pred(e) && exerciseSolved(s, e.id));
}

export function solvedWithoutHints(s: AppState, id: string): boolean {
  const p = s.exercises[id];
  return Boolean(p?.solvedAt && p.hintsUsed === 0 && !p.solutionViewed);
}

// ---------- Projects ----------

export function projectComplete(s: AppState, id: string): boolean {
  return Boolean(s.projects[id]?.completedAt);
}

export function capstoneMilestonesDone(s: AppState): number {
  const p = s.projects[CAPSTONE.id];
  if (!p) return 0;
  return CAPSTONE.milestones.filter((m) => p.milestones[m.id]?.completedAt).length;
}

export function miniProjectsDone(s: AppState): number {
  return PROJECTS.filter((p) => p.kind === 'mini' && projectComplete(s, p.id)).length + s.customProjects.filter((p) => p.completedAt).length;
}

// ---------- Modules & skill tree ----------

export type ModuleStatus = 'locked' | 'available' | 'learning' | 'mastered';

export interface ModuleProgressInfo {
  status: ModuleStatus;
  fullLessons: number;
  completedLessons: number;
  examPassed: boolean;
  examBest?: number;
  practicalDone: boolean;
  practicalLabel: string;
  percent: number;
  unlockedBy?: 'prerequisites' | 'placement' | 'none-required';
  missingPrereqs: Module[];
}

function placementPassedFor(s: AppState, m: Module): boolean {
  if (!s.placement || !m.placementAreas?.length) return false;
  return m.placementAreas.every((a) => (s.placement!.perArea[a] ?? 0) >= s.settings.mastery);
}

/** A prerequisite is satisfied by passing its exam — XP alone never unlocks anything. */
function prereqSatisfied(s: AppState, prereqId: string): boolean {
  const pm = getModule(prereqId);
  if (!pm) return true;
  return examPassed(s, prereqId) || placementPassedFor(s, pm);
}

export function moduleProgress(s: AppState, m: Module): ModuleProgressInfo {
  const full = m.lessons.filter((l) => l.status === 'full');
  const completedLessons = full.filter((l) => lessonDone(s, l.id)).length;
  const passed = examPassed(s, m.id);
  const examBest = bestPercent(s, 'module', m.id);

  let practicalDone: boolean;
  let practicalLabel: string;
  if (m.id === 'm-capstone') {
    practicalDone = projectComplete(s, CAPSTONE.id);
    practicalLabel = `Capstone milestones ${capstoneMilestonesDone(s)}/${CAPSTONE.milestones.length}`;
  } else {
    const solved = m.labIds.filter((id) => exerciseSolved(s, id)).length;
    practicalDone = solved > 0;
    practicalLabel = `Practical labs ${solved}/${m.labIds.length} (1 required)`;
  }

  const missingPrereqs = m.prerequisites.filter((p) => !prereqSatisfied(s, p)).map((p) => getModule(p)!).filter(Boolean);
  let unlockedBy: ModuleProgressInfo['unlockedBy'];
  if (m.prerequisites.length === 0) unlockedBy = 'none-required';
  else if (missingPrereqs.length === 0) unlockedBy = 'prerequisites';
  else if (placementPassedFor(s, m)) unlockedBy = 'placement';

  // Weighted completion: lessons 40 %, exam 35 %, practical 25 %. Modules without interactive
  // lessons are weighted on exam (60 %) and practical work (40 %) only — notes never count as done.
  const capFrac = m.id === 'm-capstone' ? capstoneMilestonesDone(s) / CAPSTONE.milestones.length : practicalDone ? 1 : 0;
  const percent = full.length
    ? Math.round((completedLessons / full.length) * 40 + (passed ? 35 : 0) + capFrac * 25)
    : Math.round((passed ? 60 : 0) + capFrac * 40);

  let status: ModuleStatus;
  if (!unlockedBy) status = 'locked';
  else if (completedLessons === full.length && passed && practicalDone) status = 'mastered';
  else if (percent > 0 || full.some((l) => s.lessons[l.id]?.firstOpenedAt)) status = 'learning';
  else status = 'available';

  return { status, fullLessons: full.length, completedLessons, examPassed: passed, examBest, practicalDone, practicalLabel, percent, unlockedBy, missingPrereqs };
}

export function overallCompletion(s: AppState): number {
  const core = MODULES.filter((m) => m.track === 'core');
  return Math.round(core.reduce((sum, m) => sum + moduleProgress(s, m).percent, 0) / core.length);
}

export function skillsMastered(s: AppState): number {
  return MODULES.filter((m) => m.track === 'core' && moduleProgress(s, m).status === 'mastered').length;
}

/** The next lesson to study: continue the last module, else the first unlocked, unfinished full lesson. */
export function nextLesson(s: AppState): { module: Module; lessonId: string } | undefined {
  const ordered = [...MODULES].sort((a, b) => a.phase - b.phase);
  const last = s.lastLesson ? getModule(s.lastLesson.moduleId) : undefined;
  const candidates = last ? [last, ...ordered.filter((m) => m.id !== last.id)] : ordered;
  for (const m of candidates) {
    if (moduleProgress(s, m).status === 'locked') continue;
    const next = m.lessons.find((l) => l.status === 'full' && !lessonDone(s, l.id));
    if (next) return { module: m, lessonId: next.id };
  }
  return undefined;
}

export function lastCompletedLesson(s: AppState): string | undefined {
  const done = Object.entries(s.lessons).filter(([, p]) => p.completedAt).sort((a, b) => (a[1].completedAt! < b[1].completedAt! ? 1 : -1));
  return done[0]?.[0];
}

export function recommendedPhase(s: AppState): number {
  if (!s.placement) return 0;
  return getModule(s.placement.recommendation)?.phase ?? 1;
}

export function phaseTitle(n: number): string {
  return PHASES.find((p) => p.number === n)?.title ?? `Phase ${n}`;
}

// ---------- Study time ----------

export function minutesInRange(s: AppState, fromDay: string, toDayExclusive: string): number {
  return s.sessions.filter((x) => { const d = isoToDay(x.start); return d >= fromDay && d < toDayExclusive; }).reduce((sum, x) => sum + x.minutes, 0);
}

export function weekMinutes(s: AppState, ref = new Date()): number {
  const start = weekStart(ref);
  return minutesInRange(s, start, addDays(start, 7));
}

export function totalMinutes(s: AppState): number {
  return s.sessions.reduce((sum, x) => sum + x.minutes, 0);
}

export function weekMinutesBySubject(s: AppState, ref = new Date()): Record<Subject, number> {
  const start = weekStart(ref);
  const end = addDays(start, 7);
  const out: Record<Subject, number> = { programming: 0, electronics: 0, embedded: 0, robotics: 0, german: 0 };
  for (const x of s.sessions) {
    const d = isoToDay(x.start);
    if (d >= start && d < end) out[x.subject] += x.minutes;
  }
  return out;
}

export function effectiveWeeklyTarget(s: AppState): number {
  return s.settings.examMode ? s.settings.examModeHours : s.settings.weeklyHours;
}

export function weeklyHistory(s: AppState, weeks = 8): { week: string; hours: number; target: number }[] {
  const out = [];
  const thisWeek = weekStart();
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addDays(thisWeek, -7 * i);
    const min = minutesInRange(s, start, addDays(start, 7));
    out.push({ week: start.slice(5), hours: Math.round((min / 60) * 10) / 10, target: s.settings.weeklyHours });
  }
  return out;
}

export function xpHistory(s: AppState, days = 30): { day: string; xp: number; total: number }[] {
  const today = dayKey();
  const start = addDays(today, -(days - 1));
  let running = s.xp.filter((t) => isoToDay(t.at) < start).reduce((a, t) => a + t.amount, 0);
  const out = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    const gained = s.xp.filter((t) => isoToDay(t.at) === d).reduce((a, t) => a + t.amount, 0);
    running += gained;
    out.push({ day: d.slice(5), xp: gained, total: running });
  }
  return out;
}

// ---------- Activity & streak ----------

export function activeDays(s: AppState): Set<string> {
  const days = new Set<string>();
  for (const e of s.activity) days.add(isoToDay(e.at));
  for (const x of s.sessions) if (x.minutes >= 10) days.add(isoToDay(x.start));
  return days;
}

/**
 * Gentle streak: consecutive active days counted back from today, where one rest day per
 * 7-day window is allowed and an unfinished "today" never breaks the streak.
 */
export function streak(s: AppState, today = dayKey()): { days: number; restDayUsed: boolean } {
  const active = activeDays(s);
  let day = active.has(today) ? today : addDays(today, -1);
  let count = 0;
  let lastRest: string | undefined;
  let restDayUsed = false;
  for (let guard = 0; guard < 400; guard++) {
    if (active.has(day)) { count++; day = addDays(day, -1); continue; }
    const canRest = (!lastRest || Math.abs(Number(new Date(lastRest)) - Number(new Date(day))) >= 7 * 86_400_000) && active.has(addDays(day, -1)) && count > 0;
    if (canRest) { lastRest = day; restDayUsed = true; day = addDays(day, -1); continue; }
    break;
  }
  return { days: count, restDayUsed };
}

export function activeDaysThisWeek(s: AppState): number {
  const start = weekStart();
  const active = activeDays(s);
  let n = 0;
  for (let i = 0; i < 7; i++) if (active.has(addDays(start, i))) n++;
  return n;
}

// ---------- Daily missions ----------

export interface DailyMission {
  id: 'learn' | 'practice' | 'review';
  title: string;
  detail: string;
  done: boolean;
  awarded: boolean;
}

export function dailyMissions(s: AppState, today = dayKey()): DailyMission[] {
  const todays = s.activity.filter((e) => isoToDay(e.at) === today);
  const learn = todays.some((e) => e.type === 'lesson_complete');
  const practice = todays.some((e) => e.type === 'exercise_solved' || e.type === 'milestone_complete');
  const reviewed = todays.filter((e) => e.type === 'review').length;
  return [
    { id: 'learn', title: 'Learn one new concept', detail: 'Complete a lesson by passing its knowledge check.', done: learn, awarded: hasXp(s, `daily:${today}:learn`) },
    { id: 'practice', title: 'Complete one practical challenge', detail: 'Solve an Engineering Lab exercise or a project milestone.', done: practice, awarded: hasXp(s, `daily:${today}:practice`) },
    { id: 'review', title: 'Review one previously learned concept', detail: `Review at least 3 revision cards (${Math.min(reviewed, 3)}/3).`, done: reviewed >= 3, awarded: hasXp(s, `daily:${today}:review`) },
  ];
}

// ---------- Topic performance ----------

export interface TopicStat {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
  retention?: number;
  weak: boolean;
}

export function topicStats(s: AppState, recent = 20): TopicStat[] {
  const map = new Map<string, { c: number; t: number }>();
  const answers = s.attempts.flatMap((a) => a.answers);
  // Use only the most recent N answers per topic so old mistakes stop counting once fixed.
  const byTopic = new Map<string, typeof answers>();
  for (const a of answers) byTopic.set(a.topic, [...(byTopic.get(a.topic) ?? []), a]);
  for (const [topic, list] of byTopic) {
    const slice = list.slice(-recent);
    map.set(topic, { c: slice.filter((a) => a.correct).length, t: slice.length });
  }
  const cards = Object.values(s.cards);
  const out: TopicStat[] = [];
  const topics = new Set([...map.keys(), ...cards.map((c) => c.topic)]);
  for (const topic of topics) {
    const st = map.get(topic) ?? { c: 0, t: 0 };
    const tc = cards.filter((c) => c.topic === topic);
    const ret = tc.length ? tc.reduce((a, c) => a + retention(c), 0) / tc.length : undefined;
    const accuracy = st.t ? st.c / st.t : 1;
    out.push({ topic, correct: st.c, total: st.t, accuracy, retention: ret, weak: (st.t >= 2 && accuracy < s.settings.mastery / 100) || (ret !== undefined && ret < 0.7) });
  }
  return out.sort((a, b) => Number(b.weak) - Number(a.weak) || a.accuracy - b.accuracy);
}

// ---------- Headline statistics ----------

export function headlineStats(s: AppState) {
  const tests = s.attempts.filter((a) => a.kind !== 'placement');
  return {
    hours: Math.round((totalMinutes(s) / 60) * 10) / 10,
    lessons: Object.values(s.lessons).filter((l) => l.completedAt).length,
    tests: tests.length,
    avgScore: tests.length ? Math.round(tests.reduce((a, t) => a + t.percent, 0) / tests.length) : 0,
    coding: solvedExercises(s, (e) => e.kind === 'code').length,
    labs: solvedExercises(s, (e) => e.kind === 'rubric' || e.kind === 'question').length,
    projects: PROJECTS.filter((p) => projectComplete(s, p.id)).length + s.customProjects.filter((p) => p.completedAt).length,
    skills: skillsMastered(s),
  };
}

export function placementRecommendation(perArea: Record<string, number>, mastery: number): string {
  const order: [string, string][] = [
    ['electrical', 'm-electronics'],
    ['digital', 'm-digital'],
    ['logic', 'm-c'],
    ['c', 'm-c'],
    ['mcu', 'm-arduino'],
  ];
  for (const [area, mod] of order) if ((perArea[area] ?? 0) < mastery) return mod;
  return 'm-esp32';
}

export function placementAreaLabel(id: string): string {
  return PLACEMENT_AREAS.find((a) => a.id === id)?.label ?? id;
}

export function exerciseTitle(id: string): string {
  return getExercise(id)?.title ?? id;
}
