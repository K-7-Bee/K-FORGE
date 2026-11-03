// Persisted learner state. Every record references static content by id.
import type { PlacementArea } from '../data/types';

export type Subject = 'programming' | 'electronics' | 'embedded' | 'robotics' | 'german';
export const SUBJECTS: { id: Subject; label: string }[] = [
  { id: 'programming', label: 'Programming' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'embedded', label: 'Embedded systems' },
  { id: 'robotics', label: 'Robotics' },
  { id: 'german', label: 'German' },
];

export type XpKind =
  | 'lesson'
  | 'check'
  | 'code'
  | 'debug'
  | 'lab'
  | 'exam'
  | 'miniProject'
  | 'milestone'
  | 'finalProject'
  | 'noHintBonus'
  | 'daily'
  | 'placement';

export interface XpTransaction {
  /** Unique activity key; full XP is awarded at most once per key. */
  key: string;
  kind: XpKind;
  amount: number;
  label: string;
  at: string; // ISO
}

export type ActivityType =
  | 'lesson_complete'
  | 'check_attempt'
  | 'exercise_attempt'
  | 'exercise_solved'
  | 'test_attempt'
  | 'review'
  | 'milestone_complete'
  | 'project_complete'
  | 'note';

export interface ActivityEvent {
  at: string;
  type: ActivityType;
  ref: string;
  detail?: string;
}

export interface LessonProgress {
  firstOpenedAt?: string;
  completedAt?: string;
  bestCheck?: number; // percent
  studiedAt?: string; // outline lessons: marked as studied (no XP)
}

export type TestKind = 'diagnostic' | 'placement' | 'quiz' | 'module' | 'final' | 'debugging' | 'practice' | 'practical';

export interface AnswerRecord {
  qid: string;
  topic: string;
  correct: boolean;
  given: string;
  usedHint: boolean;
}

export interface TestAttempt {
  id: string;
  kind: TestKind;
  ref: string; // module id / lesson id / 'final' / etc.
  title: string;
  startedAt: string;
  finishedAt: string;
  mode: 'practice' | 'exam';
  timed: boolean;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  mastery: number;
  answers: AnswerRecord[];
}

export type Verification = 'auto' | 'compiled' | 'local-output' | 'self-assessed';

export interface ExerciseProgress {
  attempts: number;
  solvedAt?: string;
  hintsUsed: number; // highest hint level revealed (0–3)
  solutionViewed?: boolean;
  verification?: Verification;
  lastCode?: string;
  lastAnswer?: string;
  rubric?: boolean[];
  evidence: string[]; // evidence ids (IndexedDB)
  notes?: string;
}

export interface MistakeEntry {
  id: string;
  qid: string;
  topic: string;
  at: string;
  given: string;
  note: string;
  resolved: boolean;
}

export interface SrsCard {
  id: string; // 'q:<questionId>' or 'f:<flashcardId>'
  kind: 'question' | 'flashcard';
  refId: string;
  topic: string;
  ease: number;
  interval: number; // days
  reps: number;
  lapses: number;
  due: string; // YYYY-MM-DD
  lastReviewed?: string; // ISO
  addedAt: string;
  source: 'mistake' | 'lesson' | 'manual';
}

export interface ReviewRecord {
  at: string;
  cardId: string;
  grade: 0 | 3 | 4 | 5;
}

export interface StudySession {
  id: string;
  start: string; // ISO
  minutes: number;
  subject: Subject;
  source: 'auto' | 'manual' | 'timer';
  note?: string;
}

export interface TestRecord {
  id: string;
  name: string;
  target: string;
  measured: string;
  unit: string;
  at: string;
  notes: string;
  milestoneId?: string;
}

export interface MilestoneProgress {
  checklist: boolean[];
  evidence: string[];
  notes: string;
  completedAt?: string;
}

export interface ProjectProgress {
  startedAt: string;
  milestones: Record<string, MilestoneProgress>;
  tests: TestRecord[];
  documentation: string;
  completedAt?: string;
  finalEvaluation?: boolean[];
}

export interface CustomProject {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  skills: string[];
  components: string;
  budget: string;
  milestones: { id: string; title: string; done: boolean; evidence: string[] }[];
  tests: TestRecord[];
  documentation: string;
  createdAt: string;
  completedAt?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  lessonId?: string;
  updatedAt: string;
}

export interface PlanBlock {
  id: string;
  day: number; // 0 = Monday
  subject: Subject;
  hours: number;
  label: string;
}

export interface DailyGoal {
  id: string;
  text: string;
  done: boolean;
}

export interface ExamPlan {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  topics: string[];
  done?: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  date: string;
  projectId?: string;
  done: boolean;
}

export interface MentorMessage {
  role: 'user' | 'assistant';
  content: string;
  at: string;
  offline?: boolean;
}

export interface MentorConversation {
  id: string;
  title: string;
  mode: string;
  challengeId?: string;
  messages: MentorMessage[];
  updatedAt: string;
}

export type WeeklyPreset = 'flexible' | 'standard' | 'intensive' | 'custom';

export interface Settings {
  theme: 'dark' | 'light';
  mastery: number; // percent, default 80
  weeklyPreset: WeeklyPreset;
  weeklyHours: number;
  examMode: boolean; // university exam period: reduced workload, streak protected
  examModeHours: number;
  /** enabled: in-app notifications while open; push: background Web Push via the server. */
  reminders: { enabled: boolean; time: string; push?: boolean };
  autoTrack: boolean;
}

export interface AppState {
  version: 1;
  profile: {
    username: string;
    specialization: string;
    createdAt: string;
    onboarded: boolean;
  };
  settings: Settings;
  xp: XpTransaction[];
  practiceCount: Record<string, number>;
  activity: ActivityEvent[];
  lessons: Record<string, LessonProgress>;
  attempts: TestAttempt[];
  exercises: Record<string, ExerciseProgress>;
  mistakes: MistakeEntry[];
  cards: Record<string, SrsCard>;
  reviews: ReviewRecord[];
  sessions: StudySession[];
  projects: Record<string, ProjectProgress>;
  customProjects: CustomProject[];
  notes: Note[];
  planner: {
    allocation: Record<Subject, number>; // percent of weekly hours
    blocks: PlanBlock[];
    dailyGoals: Record<string, DailyGoal[]>;
    exams: ExamPlan[];
    deadlines: Deadline[];
  };
  placement?: {
    at: string;
    perArea: Record<PlacementArea, number>;
    recommendation: string; // module id
  };
  achievements: Record<string, string>; // id → unlockedAt
  mentor: {
    conversations: MentorConversation[];
    hintLevels: Record<string, number>;
  };
  lastLesson?: { moduleId: string; lessonId: string; at: string };
  /** Set on every local change; used to pick preferences when merging devices. */
  updatedAt?: string;
}
