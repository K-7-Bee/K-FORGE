import type { PlacementArea, Question } from '../types';
import { electronicsQuestions } from './electronics';
import { digitalQuestions } from './digital';
import { programmingQuestions } from './programming';
import { embeddedQuestions } from './embedded';
import { careerQuestions, controlQuestions, mathQuestions, pythonQuestions } from './other';
import { LESSON_QUESTIONS } from '../lessons';

export const ALL_QUESTIONS: Question[] = [
  ...electronicsQuestions,
  ...digitalQuestions,
  ...programmingQuestions,
  ...embeddedQuestions,
  ...controlQuestions,
  ...pythonQuestions,
  ...careerQuestions,
  ...mathQuestions,
  ...LESSON_QUESTIONS,
];

const byId = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return byId.get(id);
}

export function getQuestions(ids: string[]): Question[] {
  return ids.map((id) => byId.get(id)).filter((q): q is Question => Boolean(q));
}

export function questionsForTopics(topics: string[]): Question[] {
  const set = new Set(topics);
  return ALL_QUESTIONS.filter((q) => set.has(q.topic));
}

export const TOPIC_LABEL: Record<string, string> = {
  'ohms-law': "Ohm's law",
  power: 'Electrical power',
  kirchhoff: "Kirchhoff's laws",
  'series-parallel': 'Series & parallel',
  'voltage-divider': 'Voltage dividers',
  components: 'Passive & active components',
  pullups: 'Pull-up / pull-down',
  regulators: 'Regulators & power',
  schematics: 'Schematics',
  multimeter: 'Multimeter',
  binary: 'Binary numbers',
  hex: 'Hexadecimal',
  'logic-gates': 'Logic gates',
  boolean: 'Boolean algebra',
  sequential: 'Sequential logic',
  'c-types': 'C variables & types',
  'c-control': 'C conditions & loops',
  'c-pointers': 'C pointers',
  'c-bitwise': 'Bitwise operations',
  'c-keywords': 'const / volatile / static',
  'c-structs': 'Structs & enums',
  'c-modules': 'Modules & headers',
  'state-machines': 'State machines',
  'c-debugging': 'Debugging method',
  cpp: 'Essential C++',
  'mcu-arch': 'MCU architecture',
  datasheets: 'Datasheets',
  interrupts: 'Interrupts',
  timers: 'Timers',
  'arduino-gpio': 'Arduino GPIO',
  adc: 'ADC',
  pwm: 'PWM',
  esp32: 'ESP32',
  'wifi-mqtt': 'Wi-Fi & MQTT',
  uart: 'UART',
  i2c: 'I2C',
  spi: 'SPI',
  stm32: 'STM32',
  dma: 'DMA',
  rtos: 'RTOS',
  git: 'Git',
  testing: 'Unit testing',
  'debugging-tools': 'Debug instruments',
  pcb: 'PCB design',
  linux: 'Linux',
  control: 'Control basics',
  encoders: 'Encoders',
  pid: 'PID control',
  kinematics: 'Kinematics',
  imu: 'IMU & fusion',
  python: 'Python',
  pandas: 'pandas & data',
  german: 'German',
  career: 'Career',
  math: 'Engineering maths',
};

export function topicLabel(topic: string): string {
  return TOPIC_LABEL[topic] ?? topic;
}

export const PLACEMENT_AREAS: { id: PlacementArea; label: string; questionIds: string[] }[] = [
  { id: 'electrical', label: 'Electrical fundamentals', questionIds: ['ohm-1', 'sp-2', 'div-1', 'pu-1', 'comp-3'] },
  { id: 'math', label: 'Basic mathematics', questionIds: ['math-1', 'math-2', 'math-3', 'math-4'] },
  { id: 'logic', label: 'Programming logic', questionIds: ['cl-1', 'cl-3', 'cl-7', 'cl-8'] },
  { id: 'c', label: 'C programming', questionIds: ['ct-1', 'ct-2', 'ptr-2', 'ptr-1', 'kw-1'] },
  { id: 'digital', label: 'Digital electronics', questionIds: ['bin-1', 'bin-4', 'gate-3', 'seq-1'] },
  { id: 'mcu', label: 'Microcontroller knowledge', questionIds: ['gpio-1', 'gpio-3', 'arch-6', 'esp-1', 'proto-1'] },
];
