// Engineering levels and achievements. Levels need XP *and* demonstrated skills —
// XP alone never promotes a learner or unlocks advanced material.
import type { AppState } from '../store/types';
import { CAPSTONE } from '../data/projects';
import {
  activeDaysThisWeek,
  capstoneMilestonesDone,
  examPassed,
  exerciseSolved,
  finalPassed,
  lessonDone,
  miniProjectsDone,
  projectComplete,
  solvedExercises,
  solvedWithoutHints,
  totalXp,
} from './progress';

export interface Requirement {
  label: string;
  met: (s: AppState) => boolean;
}

export interface LevelDef {
  n: number;
  name: string;
  xp: number;
  blurb: string;
  requirements: Requirement[];
}

const exam = (id: string, label: string): Requirement => ({ label: `Pass the ${label} module exam`, met: (s) => examPassed(s, id) });

export const LEVELS: LevelDef[] = [
  { n: 1, name: 'Circuit Rookie', xp: 0, blurb: 'Rebuilding foundations.', requirements: [] },
  { n: 2, name: 'Logic Builder', xp: 150, blurb: 'Circuits make sense; bits are next.', requirements: [exam('m-electronics', 'Electronics')] },
  { n: 3, name: 'C Programmer', xp: 400, blurb: 'Writes and debugs C from a blank file.', requirements: [exam('m-digital', 'Digital Electronics'), exam('m-c', 'C Programming')] },
  {
    n: 4, name: 'Embedded Developer', xp: 800, blurb: 'Controls real hardware.',
    requirements: [exam('m-arduino', 'Arduino'), { label: 'Complete one hardware lab or mini-project', met: (s) => solvedExercises(s, (e) => Boolean(e.hardware)).length > 0 || miniProjectsDone(s) > 0 }],
  },
  {
    n: 5, name: 'Firmware Engineer', xp: 1400, blurb: 'Connected firmware that survives failures.',
    requirements: [exam('m-arch', 'Architecture'), exam('m-esp32', 'ESP32'), { label: 'Solve three debugging challenges', met: (s) => solvedExercises(s, (e) => e.level === 'debug').length >= 3 }],
  },
  {
    n: 6, name: 'Systems Integrator', xp: 2200, blurb: 'RTOS, professional tools and integration.',
    requirements: [exam('m-stm32', 'STM32'), exam('m-rtos', 'RTOS & Tools'), { label: 'Complete two mini-projects', met: (s) => miniProjectsDone(s) >= 2 }],
  },
  {
    n: 7, name: 'Robotics Engineer', xp: 3000, blurb: 'Makes machines move on purpose.',
    requirements: [exam('m-control', 'Control Systems'), { label: 'Complete five capstone milestones', met: (s) => capstoneMilestonesDone(s) >= 5 }],
  },
  {
    n: 8, name: 'Independent Engineer', xp: 4200, blurb: 'Designs, builds, tests, documents and explains a working system.',
    requirements: [{ label: 'Complete the capstone robot', met: (s) => projectComplete(s, CAPSTONE.id) }, { label: 'Pass the final examination', met: (s) => finalPassed(s) }],
  },
];

export interface LevelInfo {
  level: LevelDef;
  next?: LevelDef;
  xp: number;
  /** Progress toward the next level's XP threshold, 0–1. */
  xpProgress: number;
  /** True when the XP threshold for the next level is reached but skill requirements are not. */
  blockedBySkills: boolean;
  nextRequirements: { label: string; met: boolean }[];
}

export function levelInfo(s: AppState): LevelInfo {
  const xp = totalXp(s);
  let current = LEVELS[0];
  for (const lv of LEVELS.slice(1)) {
    if (xp >= lv.xp && lv.requirements.every((r) => r.met(s))) current = lv;
    else break;
  }
  const next = LEVELS.find((l) => l.n === current.n + 1);
  const xpProgress = next ? Math.min(1, (xp - current.xp) / (next.xp - current.xp)) : 1;
  const nextRequirements = next ? next.requirements.map((r) => ({ label: r.label, met: r.met(s) })) : [];
  return { level: current, next, xp, xpProgress, blockedBySkills: Boolean(next && xp >= next.xp && nextRequirements.some((r) => !r.met)), nextRequirements };
}

// ---------- Achievements ----------

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name, resolved in the UI
  tier: 'bronze' | 'silver' | 'gold';
  met: (s: AppState) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'baseline', title: 'Baseline Set', description: 'Complete the placement assessment.', icon: 'Compass', tier: 'bronze', met: (s) => Boolean(s.placement) },
  { id: 'first-circuit', title: 'First Circuit', description: "Complete the Ohm's law lesson.", icon: 'Zap', tier: 'bronze', met: (s) => lessonDone(s, 'ohms-law') },
  { id: 'ohms-master', title: "Ohm's Law Master", description: "Score 100 % on the Ohm's law check and solve the LED resistor lab without hints.", icon: 'Gauge', tier: 'silver', met: (s) => s.lessons['ohms-law']?.bestCheck === 100 && solvedWithoutHints(s, 'lab-led-resistor') },
  { id: 'pointer-pathfinder', title: 'Pointer Pathfinder', description: 'Complete the pointers lesson and fix the pointer debugging challenge.', icon: 'MousePointer2', tier: 'silver', met: (s) => lessonDone(s, 'c-pointers') && exerciseSolved(s, 'lab-c-pointer-debug') },
  { id: 'bitwise-specialist', title: 'Bitwise Specialist', description: 'Solve three bitwise exercises.', icon: 'Binary', tier: 'silver', met: (s) => solvedExercises(s, (e) => e.tags.includes('bitwise')).length >= 3 },
  { id: 'arduino-explorer', title: 'Arduino Explorer', description: 'Complete the Arduino GPIO lesson and one Arduino lab.', icon: 'Cpu', tier: 'bronze', met: (s) => lessonDone(s, 'arduino-gpio') && solvedExercises(s, (e) => e.moduleId === 'm-arduino').length > 0 },
  { id: 'esp32-communicator', title: 'ESP32 Communicator', description: 'Complete the ESP32 lesson and pass the ESP32 module exam.', icon: 'Wifi', tier: 'silver', met: (s) => lessonDone(s, 'esp32-intro') && examPassed(s, 'm-esp32') },
  { id: 'protocol-detective', title: 'Protocol Detective', description: 'Solve three protocol debugging challenges.', icon: 'Search', tier: 'silver', met: (s) => solvedExercises(s, (e) => e.tags.includes('protocol')).length >= 3 },
  { id: 'stm32-developer', title: 'STM32 Developer', description: 'Pass the STM32 module exam and complete the Nucleo lab.', icon: 'CircuitBoard', tier: 'gold', met: (s) => examPassed(s, 'm-stm32') && exerciseSolved(s, 'lab-stm32-blink') },
  { id: 'interrupt-handler', title: 'Interrupt Handler', description: 'Fix the ISR race condition and pass the Arduino module exam.', icon: 'Timer', tier: 'silver', met: (s) => exerciseSolved(s, 'lab-isr-race') && examPassed(s, 'm-arduino') },
  { id: 'rtos-builder', title: 'RTOS Builder', description: 'Pass the RTOS & Tools exam and build the queue pipeline.', icon: 'Layers', tier: 'gold', met: (s) => examPassed(s, 'm-rtos') && exerciseSolved(s, 'lab-rtos-queue') },
  { id: 'debugging-specialist', title: 'Debugging Specialist', description: 'Solve five debugging challenges.', icon: 'Bug', tier: 'gold', met: (s) => solvedExercises(s, (e) => e.level === 'debug').length >= 5 },
  { id: 'robotics-engineer', title: 'Robotics Engineer', description: 'Pass the Control Systems exam and complete five capstone milestones.', icon: 'Bot', tier: 'gold', met: (s) => examPassed(s, 'm-control') && capstoneMilestonesDone(s) >= 5 },
  { id: 'independent-builder', title: 'Independent Builder', description: 'Complete three Create-level exercises or one custom project.', icon: 'Hammer', tier: 'gold', met: (s) => solvedExercises(s, (e) => e.level === 'create').length >= 3 || s.customProjects.some((p) => p.completedAt) },
  { id: 'first-exam', title: 'Examined', description: 'Pass any module examination.', icon: 'GraduationCap', tier: 'bronze', met: (s) => s.attempts.some((a) => a.kind === 'module' && a.passed && a.mode === 'exam') },
  { id: 'unassisted', title: 'Unassisted', description: 'Solve five exercises without hints or solutions.', icon: 'Brain', tier: 'silver', met: (s) => Object.keys(s.exercises).filter((id) => solvedWithoutHints(s, id)).length >= 5 },
  { id: 'consistent', title: 'Consistent Week', description: 'Study on five days in one week.', icon: 'CalendarCheck', tier: 'bronze', met: (s) => activeDaysThisWeek(s) >= 5 },
  { id: 'mistakes-mastery', title: 'Mistakes into Mastery', description: 'Complete 25 revision reviews.', icon: 'RotateCcw', tier: 'bronze', met: (s) => s.reviews.length >= 25 },
  { id: 'portfolio-ready', title: 'Portfolio Ready', description: 'Complete two projects with measured results.', icon: 'Briefcase', tier: 'silver', met: (s) => miniProjectsDone(s) >= 2 },
];

export function newlyUnlocked(s: AppState): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.met(s));
}
