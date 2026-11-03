// Shared, type-safe content model for K-FORGE. Curriculum data is static and bundled;
// learner progress lives in the store (src/store) and references content by id.

export type Difficulty = 1 | 2 | 3;
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { 1: 'Foundation', 2: 'Intermediate', 3: 'Advanced' };

export type DiagramId =
  | 'led-circuit'
  | 'ohm-triangle'
  | 'series-parallel'
  | 'voltage-divider'
  | 'pullup-button'
  | 'mosfet-switch'
  | 'binary-byte'
  | 'c-types'
  | 'loop-flow'
  | 'pointer-memory'
  | 'gpio-pin'
  | 'esp32-block'
  | 'i2c-bus'
  | 'state-machine'
  | 'memory-layout'
  | 'pid-loop'
  | 'robot-top'
  | 'mcu-block'
  | 'rtos-tasks'
  | 'kvl-loop'
  | 'rc-charge'
  | 'rectifier'
  | 'h-bridge'
  | 'spi-bus'
  | 'diff-drive'
  | 'gate-symbols'
  | 'clock-wave'
  | 'open-closed'
  | 'quadrature';

export type ToolId =
  | 'ohms-law'
  | 'voltage-divider'
  | 'resistor-color'
  | 'series-parallel'
  | 'power'
  | 'circuit-builder'
  | 'base-converter'
  | 'logic-gates'
  | 'truth-table'
  | 'bitwise'
  | 'pwm'
  | 'adc'
  | 'uart'
  | 'i2c'
  | 'spi'
  | 'interrupts'
  | 'memory-layout'
  | 'pid'
  | 'motor-speed'
  | 'feedback-loop'
  | 'encoder';

// ---------- Questions ----------

interface QuestionBase {
  id: string;
  topic: string; // topic id, e.g. 'ohms-law'
  difficulty: Difficulty;
  prompt: string; // markdown
  code?: string; // optional code listing shown with the prompt
  diagram?: DiagramId;
  hint?: string;
  explanation: string; // markdown, shown after answering
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single' | 'circuit';
  options: string[];
  answer: number;
}
export interface MultiChoiceQuestion extends QuestionBase {
  type: 'multi';
  options: string[];
  answers: number[];
}
export interface TrueFalseQuestion extends QuestionBase {
  type: 'truefalse';
  answer: boolean;
}
export interface NumericQuestion extends QuestionBase {
  type: 'numeric';
  answer: number;
  unit?: string;
  /** Relative tolerance (0.02 = ±2 %). Defaults to 0.02. */
  tolerance?: number;
}
export interface OutputQuestion extends QuestionBase {
  type: 'output';
  code: string;
  accepted: string[];
}
export interface CodeFixQuestion extends QuestionBase {
  type: 'codefix';
  code: string;
  /** 1-based line number containing the bug. */
  bugLine: number;
  /** Accepted corrected versions of that line, compared whitespace-insensitively. */
  accepted: string[];
}
export interface ShortAnswerQuestion extends QuestionBase {
  type: 'short';
  modelAnswer: string;
  /** Key ideas a good answer mentions; used to guide self-assessment, never as an auto-pass. */
  keywords: string[];
}

export type Question =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | TrueFalseQuestion
  | NumericQuestion
  | OutputQuestion
  | CodeFixQuestion
  | ShortAnswerQuestion;

export type QuestionType = Question['type'];

export type Response =
  | { kind: 'choice'; value: number }
  | { kind: 'multi'; value: number[] }
  | { kind: 'bool'; value: boolean }
  | { kind: 'text'; value: string }
  | { kind: 'codefix'; line: number; text: string }
  | { kind: 'self'; value: string; selfGrade: boolean };

// ---------- Curriculum ----------

export interface WorkedExample {
  problem: string;
  steps: string[];
  answer: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  kind: 'formula' | 'concept' | 'code' | 'vocab';
  topic: string;
}

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  /** 'full' lessons have all ten sections and a graded knowledge check; 'outline' lessons are study notes. */
  status: 'full' | 'outline';
  topic: string;
  objectives: string[];
  why: string;
  /** Section 3: an SVG diagram, a step flow chart, or a markdown table/listing. */
  visual?: { diagram?: DiagramId; flow?: string[]; md?: string; caption: string };
  theory: string;
  worked?: WorkedExample;
  demo?: { tool: ToolId; intro: string };
  /** Section 6 when no interactive tool fits: a hands-on or paper activity. */
  tryIt?: string;
  mistakes?: { mistake: string; fix: string }[];
  check?: string[]; // question ids
  challenge?: { prompt: string; exerciseId?: string };
  summary: string[];
  flashcards?: Flashcard[];
}

export type SkillId = string;

export interface Module {
  id: string;
  phase: number;
  track: 'core' | 'career';
  title: string;
  short: string; // skill tree label
  summary: string;
  objectives: string[];
  prerequisites: string[]; // module ids
  lessons: Lesson[];
  examQuestionIds: string[];
  labIds: string[]; // practical lab exercises that satisfy the practical requirement
  /** Placement areas that can unlock this module (not master it). */
  placementAreas?: PlacementArea[];
  realWorld: string;
  color: 'cyan' | 'blue' | 'purple' | 'green' | 'amber';
}

export type PlacementArea = 'electrical' | 'math' | 'logic' | 'c' | 'digital' | 'mcu';

// ---------- Lab ----------

export type LabLevel = 'understand' | 'implement' | 'debug' | 'create';

export interface TestCase {
  stdin: string;
  expected: string;
  label: string;
  hidden?: boolean;
}

interface ExerciseBase {
  id: string;
  title: string;
  level: LabLevel;
  difficulty: Difficulty;
  moduleId: string;
  tags: string[];
  objective: string;
  description: string; // markdown
  io?: string; // input/output requirements, markdown
  hints: [string, string, string]; // concept clue, method, guided example
  explanation: string; // shown after a verified submission
  hardware?: boolean;
}

/** Auto-graded with the question engine. */
export interface QuestionExercise extends ExerciseBase {
  kind: 'question';
  question: Question;
}

/** Program checked by running test cases on a real compiler when the execution service is configured. */
export interface CodeExercise extends ExerciseBase {
  kind: 'code';
  language: 'c' | 'cpp' | 'python';
  starter: string;
  tests: TestCase[];
  solution: string;
}

/** Open-ended or hardware work: rubric self-assessment plus required evidence. */
export interface RubricExercise extends ExerciseBase {
  kind: 'rubric';
  rubric: string[];
  evidence: string; // what to upload
}

export type Exercise = QuestionExercise | CodeExercise | RubricExercise;

// ---------- Projects ----------

export interface ProjectMilestone {
  id: string;
  title: string;
  knowledge: string[];
  components: string[];
  wiring: string; // markdown / ascii wiring table
  tasks: string[];
  testing: string[];
  checklist: string[];
  metric?: { name: string; unit: string; target: string };
  xp: number;
}

export interface ProjectDef {
  id: string;
  title: string;
  kind: 'mini' | 'capstone';
  difficulty: Difficulty;
  description: string;
  skills: string[];
  components: { name: string; qty: number; note?: string }[];
  budget: string;
  wiring: string;
  programming: string[];
  milestones: ProjectMilestone[];
  evaluation: string[];
  metrics: { name: string; unit: string }[];
}

// ---------- Resources ----------

export type ResourceType =
  | 'Course notes'
  | 'Reference'
  | 'Formula sheet'
  | 'Datasheet'
  | 'Programming examples'
  | 'Official documentation'
  | 'Textbook'
  | 'Video'
  | 'Website'
  | 'Project reference';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  topic: string;
  difficulty: Difficulty;
  description: string;
  url: string;
  source: string;
}
