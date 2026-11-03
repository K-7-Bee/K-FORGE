// Non-AI mentor: a useful, honest fallback when no Claude API key is configured on the server.
import { ALL_FLASHCARDS, MODULES } from '../data/curriculum';
import { ALL_QUESTIONS, topicLabel } from '../data/questions';
import type { Exercise } from '../data/types';
import { correctAnswerText, shuffle } from '../engine/grading';
import { topicStats } from '../engine/progress';
import type { AppState } from '../store/types';

export const GLOSSARY: Record<string, string> = {
  ack: 'A bit that confirms an I2C byte was received — the receiver pulls SDA low in the ACK slot.',
  adc: 'Converts a voltage into a number. Uno: 10-bit (0–1023); ESP32/STM32: usually 12-bit (0–4095). V = code / max × V_ref.',
  'baud rate': 'Signal rate on a serial link in symbols per second. Both UART ends must match (e.g. 115200).',
  'bit mask': 'A value used to select or change specific bits: set |= mask, clear &= ~mask, flip ^= mask.',
  datasheet: "A manufacturer's technical description of a part. Read features → pinout → absolute max → recommended conditions → electrical characteristics → application circuit.",
  debounce: 'Removing the false changes from a mechanical switch, usually by ignoring changes for 20–50 ms.',
  'decoupling capacitor': 'A capacitor (often 100 nF) close to a chip that steadies its supply.',
  dma: 'Moves data between peripherals and memory without the CPU copying each item.',
  'duty cycle': 'The percentage of time a PWM signal is on. Average voltage ≈ duty × V_high.',
  encoder: 'A sensor that measures rotation; quadrature A/B signals also give direction.',
  firmware: 'Software running on an embedded device.',
  'flyback diode': "Gives a coil's current a safe path when switching off, preventing a damaging voltage spike.",
  freertos: 'A small real-time operating system: tasks, priorities, queues, semaphores and mutexes.',
  gpio: 'A general-purpose digital pin, configured as input or output.',
  'h-bridge': 'A switch circuit that can reverse a motor (e.g. the TB6612).',
  hal: 'Hardware Abstraction Layer — a library that hides many register details (e.g. STM32 HAL).',
  i2c: 'A two-wire bus (SDA, SCL) with pull-ups; devices are selected by 7-bit address.',
  imu: 'A sensor that measures motion and rotation (accelerometer + gyroscope), e.g. MPU6050.',
  interrupt: 'A hardware event that runs a short function (ISR) right away. Keep ISRs short; share data via volatile variables.',
  mosfet: 'A transistor controlled by gate voltage. Use logic-level types for 3.3 V drive.',
  mqtt: 'A lightweight publish–subscribe messaging protocol: publishers → topic on a broker → subscribers.',
  mutex: 'A lock that lets one task use a shared resource at a time, with priority inheritance.',
  odometry: 'Estimating position from wheel movement; errors accumulate over time.',
  pcb: 'A printed circuit board.',
  pid: 'A controller using present (P), past (I) and changing (D) error.',
  'pull-up': 'A resistor that holds an input HIGH by default; a button to ground then reads LOW when pressed.',
  pwm: 'Fast on–off switching to control average power.',
  queue: 'A safe way to pass data between RTOS tasks.',
  register: 'A special memory location that controls or reports hardware.',
  semaphore: 'An RTOS signal used to tell a task that an event happened (e.g. from an ISR).',
  spi: 'A fast four-wire serial bus: SCK, MOSI, MISO and one CS per device. Four clock modes.',
  'state machine': 'A design with explicit states and the events that move between them.',
  uart: 'A serial link using TX and RX, crossed between devices, with a shared ground and matching baud rate.',
  'unit test': 'A small automated check of one piece of code, ideally run on a laptop.',
  volatile: 'Tells the compiler a variable can change outside normal flow (ISR, hardware), so it must be re-read every time.',
  'ohm': "Ohm's law: V = I × R. Power: P = V × I = I²R = V²/R.",
  pointer: 'A variable holding an address. &x takes an address; *p reads/writes the value at it.',
};

const RUBBER_DUCK = [
  '**What did you expect to happen**, exactly? Write the expected value or behaviour.',
  '**What actually happened?** Copy the exact output, error message or measured value.',
  '**What is the smallest change** that reproduces the problem?',
  '**What have you measured?** (supply voltage, ground continuity, signal on the pin, printed variable values)',
  '**What is your one most likely hypothesis**, and what single test would confirm or rule it out?',
];

function words(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s+-]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
}

function findLessons(query: string) {
  const q = words(query);
  const scored = MODULES.flatMap((m) => m.lessons.map((l) => {
    const hay = `${l.title} ${l.topic} ${l.theory}`.toLowerCase();
    const score = q.reduce((a, w) => a + (hay.includes(w) ? (l.title.toLowerCase().includes(w) ? 3 : 1) : 0), 0);
    return { m, l, score };
  }));
  return scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}

function glossaryHits(query: string) {
  const lower = query.toLowerCase();
  return Object.entries(GLOSSARY).filter(([k]) => lower.includes(k) || (k.length > 3 && lower.includes(k.replace(/-/g, ' '))));
}

export function offlineHint(ex: Exercise, level: number, solution: boolean): string {
  if (solution) {
    const code = ex.kind === 'code' ? `\n\n\`\`\`${ex.language}\n${ex.solution}\n\`\`\`` : '';
    return `**Full solution (you asked for it explicitly).**\n\n${ex.explanation}${code}\n\nNow close this, open a blank file and rebuild it without looking. If you can't, you aren't finished yet.`;
  }
  if (level <= 0) return `Before any hint: try alone for 20–30 minutes. ${RUBBER_DUCK[0]} ${RUBBER_DUCK[1]}`;
  const labels = ['Hint 1 — conceptual clue', 'Hint 2 — the method', 'Hint 3 — guided example'];
  return `**${labels[level - 1]}**\n\n${ex.hints[level - 1]}\n\nTry it now, then tell me what you predicted and what you got.`;
}

export function offlineAnswer(mode: string, text: string, s: AppState): string {
  const gl = glossaryHits(text);
  const lessons = findLessons(text);
  const parts: string[] = [];

  if (mode === 'practice') {
    const topicHit = lessons[0]?.l.topic;
    const pool = ALL_QUESTIONS.filter((q) => (topicHit ? q.topic === topicHit : true) && q.type !== 'short');
    const qs = shuffle(pool).slice(0, 3);
    parts.push(`Here are three practice questions${topicHit ? ` on **${topicLabel(topicHit)}**` : ''}. Work them out on paper first.`);
    qs.forEach((q, i) => parts.push(`**${i + 1}.** ${q.prompt}${q.code ? `\n\n\`\`\`c\n${q.code}\n\`\`\`` : ''}${'options' in q ? `\n\n${q.options.map((o, j) => `${String.fromCharCode(65 + j)}) ${o}`).join('  \n')}` : ''}`));
    parts.push(`#### Answers\n${qs.map((q, i) => `${i + 1}. ${correctAnswerText(q)}`).join('  \n')}`);
    return parts.join('\n\n');
  }

  if (mode === 'revision') {
    const weak = topicStats(s).filter((t) => t.weak).slice(0, 5);
    if (!weak.length) return 'No weak topics detected yet. Keep answering quizzes and reviewing your daily revision queue — weak areas will show up here.';
    return `Based on your recent answers, revise these next:\n\n${weak.map((t) => `- **${topicLabel(t.topic)}** — ${t.total ? `${Math.round(t.accuracy * 100)}% recent accuracy` : 'recall fading'}`).join('\n')}\n\nPlan for your next session: 10 minutes of revision cards, re-read the lesson notes for the top topic, then retake its knowledge check.`;
  }

  if (gl.length) parts.push(gl.map(([k, v]) => `**${k}** — ${v}`).join('\n\n'));
  const cards = ALL_FLASHCARDS.filter((f) => words(text).some((w) => `${f.front} ${f.back}`.toLowerCase().includes(w))).slice(0, 3);
  if (cards.length) parts.push(`Related formulas and facts:\n${cards.map((c) => `- ${c.front}: \`${c.back}\``).join('\n')}`);
  if (lessons.length) parts.push(`Study these in K-FORGE:\n${lessons.map(({ m, l }) => `- [${l.title}](/courses/${m.id}/${l.id}) — ${m.short}`).join('\n')}`);

  if (mode === 'code' || mode === 'debug' || !parts.length) {
    parts.push(`Let's debug it methodically. Answer these, and the cause usually appears:\n\n${RUBBER_DUCK.map((r, i) => `${i + 1}. ${r}`).join('\n')}`);
    if (mode === 'code') parts.push('Also compile with `-Wall -Wextra` and read the first warning first. Check array bounds, integer division, `=` vs `==`, and missing `volatile` on ISR-shared variables.');
  }
  if (mode === 'datasheet') parts.push('Datasheet order: features → pinout → absolute maximum ratings (limits, not targets) → recommended operating conditions → electrical characteristics → application circuit → communication section.');
  if (mode === 'circuit') parts.push('Read any schematic in five steps: power rails and ground → main chip → follow each signal → support parts (pull-ups, decoupling, protection) → predict the voltage at key points, then measure.');
  if (mode === 'report') parts.push('A strong report: abstract with the main measured result, system design, method, results with average and spread, honest limitations, conclusion. Use the Projects → Report generator to see which sections still need writing.');
  if (mode === 'project') parts.push('Break the project into milestones that each end in something measurable. For each: required knowledge, components, wiring, tasks, test procedure and a completion checklist.');
  return parts.join('\n\n');
}
