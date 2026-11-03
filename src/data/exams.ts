import { MODULES } from './curriculum';
import { EXERCISES } from './lab';
import { ALL_QUESTIONS, getQuestions } from './questions';
import type { Question } from './types';

/** Final exam pool: theory, calculations, programming and practical reasoning from every core module. */
export function finalExamPool(): Question[] {
  const ids = new Set(MODULES.filter((m) => m.track === 'core').flatMap((m) => m.examQuestionIds));
  return getQuestions([...ids]);
}

/** Debugging exam pool: broken code, wrong outputs and faulty circuits. */
export function debuggingPool(): Question[] {
  const bank = getQuestions(['ct-8', 'cl-2', 'cl-4', 'cl-5', 'ptr-5', 'ptr-6', 'mm-3', 'tool-3', 'proto-3', 'proto-5', 'proto-6', 'ohm-8', 'gpio-6', 'gpio-8', 'sp-6', 'div-3', 'esp-2', 'rtos-2', 'rtos-4', 'ctl-7']);
  const fromLab = EXERCISES.filter((e) => e.kind === 'question' && e.level === 'debug').map((e) => (e.kind === 'question' ? e.question : null)).filter((q): q is Question => Boolean(q));
  return [...bank, ...fromLab];
}

export function diagnosticPool(moduleId: string): Question[] {
  const m = MODULES.find((x) => x.id === moduleId);
  if (!m) return [];
  const topics = new Set(getQuestions(m.examQuestionIds).map((q) => q.topic));
  return ALL_QUESTIONS.filter((q) => topics.has(q.topic));
}

export interface PracticalExam {
  id: string;
  title: string;
  moduleId: string;
  task: string;
  requirements: string[];
  constraints: string[];
  rubric: { criterion: string; points: number }[];
  evidence: string;
}

export const PRACTICAL_EXAMS: PracticalExam[] = [
  {
    id: 'px-sensor-logger',
    title: 'Non-blocking sensor logger',
    moduleId: 'm-arduino',
    task: 'Build firmware that samples an analog sensor every 100 ms, prints min/max/average every 10 samples as CSV, and toggles an LED at 2 Hz — all at the same time.',
    requirements: ['Sampling period 100 ms ± 5 %', 'CSV line every 10 samples: time_ms,min,max,avg', 'LED toggles at 2 Hz throughout', 'Statistics computed in a separate module (stats.h / stats.c)'],
    constraints: ['No delay() anywhere', 'No dynamic memory allocation', 'Uno or ESP32'],
    rubric: [
      { criterion: 'Timing verified (logic analyzer, timestamps or scope) and within tolerance', points: 25 },
      { criterion: 'Correct statistics, checked against a hand calculation', points: 20 },
      { criterion: 'LED never stalls while sampling/printing', points: 15 },
      { criterion: 'Clean module split with header guard and static state', points: 20 },
      { criterion: 'README with wiring, test method and measured results', points: 20 },
    ],
    evidence: 'Code files, a serial log, and a timing measurement screenshot.',
  },
  {
    id: 'px-i2c-bringup',
    title: 'Bring up an unfamiliar I2C sensor from its datasheet',
    moduleId: 'm-esp32',
    task: 'Given a sensor you have not used before, wire it, find its address and register map in the datasheet, read one value in real units, and handle the sensor disappearing at runtime.',
    requirements: ['Address and key registers cited from the datasheet', 'Raw value converted to real units', 'Detects and reports a missing sensor without hanging', 'Reading compared against a reference'],
    constraints: ['No ready-made library for the sensor', 'ESP32, 3.3 V logic'],
    rubric: [
      { criterion: 'Correct wiring and pull-ups justified', points: 15 },
      { criterion: 'Datasheet facts cited correctly (page/section)', points: 20 },
      { criterion: 'Correct conversion to real units', points: 25 },
      { criterion: 'Robust error handling (unplug test passes)', points: 20 },
      { criterion: 'Logic-analyzer capture of one transaction, decoded', points: 20 },
    ],
    evidence: 'Code, datasheet excerpt references, logic analyzer screenshot, unplug-test log.',
  },
  {
    id: 'px-speed-loop',
    title: 'Closed-loop wheel speed controller',
    moduleId: 'm-control',
    task: 'Implement PID speed control for one wheel and demonstrate it against a step change and a load disturbance.',
    requirements: ['Encoder-based speed in m/s', 'PID with output clamping and anti-windup', 'Step response logged and plotted', 'Disturbance rejection demonstrated'],
    constraints: ['Fixed control period (10–50 ms)', 'Motor task must not block on serial or Wi-Fi'],
    rubric: [
      { criterion: 'Speed measurement verified against distance/time', points: 20 },
      { criterion: 'Controller meets a self-set spec (overshoot, settling, error)', points: 30 },
      { criterion: 'Anti-windup demonstrated (saturation test)', points: 15 },
      { criterion: 'Plots with labelled axes and units', points: 15 },
      { criterion: 'Explains the effect of each gain change', points: 20 },
    ],
    evidence: 'Code, CSV logs, plots and a short write-up.',
  },
];
