import type { Lesson, Module } from './types';
import { ohmsLaw, seriesParallel } from './lessons/electronics';
import { binaryNumbers } from './lessons/digital';
import { cControl, cPointers, cTypes } from './lessons/c';
import { arduinoGpio, esp32Intro } from './lessons/mcu';
import { UPGRADED_LESSONS } from './lessons';

const LESSON_BY_ID = new Map(UPGRADED_LESSONS.map((l) => [l.id, l]));
/** Full interactive lesson by id (authored in src/data/lessons/m-*.ts). */
function U(id: string): Lesson {
  const l = LESSON_BY_ID.get(id);
  if (!l) throw new Error(`Lesson "${id}" is not defined`);
  return l;
}

export const PHASES: { number: number; title: string; blurb: string }[] = [
  { number: 0, title: 'Initial Engineering Assessment', blurb: 'Find your starting point. A high score unlocks modules early — it never hides foundational material.' },
  { number: 1, title: 'Electrical & Electronics Fundamentals', blurb: 'Voltage, current, components and the measurements behind every hardware fault.' },
  { number: 2, title: 'Digital Electronics', blurb: 'Bits, number systems, gates and the clocked logic inside every microcontroller.' },
  { number: 3, title: 'C Programming', blurb: 'The primary language of firmware — understanding over syntax.' },
  { number: 4, title: 'Essential C++', blurb: 'Only the C++ that helps embedded work.' },
  { number: 5, title: 'Computer & Microcontroller Architecture', blurb: 'Registers, memory, clocks, interrupts — and how to read a datasheet.' },
  { number: 6, title: 'Arduino Development', blurb: 'Learn every core peripheral on the simplest board.' },
  { number: 7, title: 'ESP32 Development', blurb: 'Connected firmware: protocols, Wi-Fi, MQTT and FreeRTOS basics.' },
  { number: 8, title: 'STM32 Development', blurb: 'The professional workflow: CubeIDE, HAL, DMA and a real debugger.' },
  { number: 9, title: 'Embedded Systems & Professional Tools', blurb: 'RTOS design, Git, testing, instruments, Linux and PCB basics.' },
  { number: 10, title: 'Control Systems & Robotics', blurb: 'Make the robot move on purpose: feedback, PID, kinematics and fusion.' },
  { number: 11, title: 'Python for Engineering', blurb: 'Turn raw readings into evidence.' },
  { number: 12, title: 'Engineering Capstone Project', blurb: 'The air-quality monitoring mobile robot — 15 measured milestones.' },
  { number: 13, title: 'Career & Professional Development', blurb: 'German, portfolio and job preparation — kept separate from the skill tree.' },
];

export const MODULES: Module[] = [
  {
    id: 'm-electronics', phase: 1, track: 'core', color: 'cyan',
    title: 'Electrical & Electronics Fundamentals', short: 'Electronics',
    summary: 'Rebuild circuit fundamentals fast and test them with real measurements. Skip quickly through anything you can already calculate and verify.',
    objectives: ['Apply Ohm\'s and Kirchhoff\'s laws to real circuits', 'Choose resistors, pull-ups and regulators with power checks', 'Read schematics and predict meter readings', 'Diagnose broken and mis-wired circuits'],
    prerequisites: [], placementAreas: ['electrical'],
    realWorld: 'Sizing LED and pull-up resistors, building the robot power layout, and diagnosing resets caused by supply dips.',
    lessons: [
      ohmsLaw,
      U('kirchhoff'),
      seriesParallel,
      U('caps-inductors'),
      U('diodes'),
      U('transistors'),
      U('pullups'),
      U('regulators'),
      U('circuit-diagrams'),
      U('schematic-interpretation'),
      U('multimeter'),
    ],
    examQuestionIds: ['ohm-1', 'ohm-3', 'ohm-7', 'ohm-8', 'kvl-2', 'kcl-1', 'sp-3', 'sp-5', 'sp-7', 'div-2', 'div-3', 'comp-2', 'comp-3', 'comp-4', 'pu-1', 'pu-2', 'reg-1', 'reg-2', 'sch-1', 'mm-1', 'mm-2', 'gnd-1'],
    labIds: ['lab-led-resistor', 'lab-series-current', 'lab-broken-circuit', 'lab-multimeter-reading', 'lab-divider-hardware'],
  },
  {
    id: 'm-digital', phase: 2, track: 'core', color: 'blue',
    title: 'Digital Electronics', short: 'Digital Logic',
    summary: 'Number systems, gates, Boolean algebra and clocked logic — the foundation of registers and bit manipulation.',
    objectives: ['Convert fluently between binary, decimal and hex', 'Build truth tables and simplify with Boolean algebra', 'Explain flip-flops, registers and clocks', 'Read logic levels from datasheets'],
    prerequisites: ['m-electronics'], placementAreas: ['digital'],
    realWorld: 'Decoding register maps, sensor bytes and protocol traces on a logic analyzer.',
    lessons: [
      binaryNumbers,
      U('conversions'),
      U('logic-gates'),
      U('truth-tables'),
      U('boolean-algebra'),
      U('combinational'),
      U('sequential'),
      U('flip-flops'),
      U('digital-signals'),
      U('clock-signals'),
    ],
    examQuestionIds: ['bin-1', 'bin-2', 'bin-3', 'bin-4', 'bin-6', 'bin-7', 'bin-8', 'bin-9', 'bin-10', 'gate-1', 'gate-2', 'gate-3', 'gate-4', 'gate-5', 'seq-1', 'seq-2', 'seq-3', 'lvl-1'],
    labIds: ['lab-register-decode', 'lab-gate-design', 'lab-binary-print'],
  },
  {
    id: 'm-c', phase: 3, track: 'core', color: 'cyan',
    title: 'C Programming', short: 'C Programming',
    summary: 'C gives direct control over numbers, memory and hardware. Practise on your laptop first, then move the same ideas to the board.',
    objectives: ['Write C programs with functions, arrays and structs from a blank file', 'Reason precisely about types, pointers and memory', 'Manipulate bits in registers', 'Structure code into modules and state machines, and debug systematically'],
    prerequisites: [], placementAreas: ['c', 'logic'],
    realWorld: 'Every driver, ISR and control loop in the robot firmware is written in C.',
    lessons: [
      U('c-fundamentals'),
      cTypes,
      cControl,
      U('c-functions'),
      U('c-arrays-strings'),
      cPointers,
      U('c-structs'),
      U('c-memory'),
      U('c-stack-heap'),
      U('c-bitwise'),
      U('c-headers'),
      U('c-modular'),
      U('c-keywords'),
      U('c-state-machines'),
      U('c-debugging'),
    ],
    examQuestionIds: ['ct-1', 'ct-2', 'ct-4', 'ct-5', 'ct-6', 'ct-8', 'cl-2', 'cl-3', 'cl-4', 'cl-5', 'cl-7', 'ptr-1', 'ptr-3', 'ptr-5', 'ptr-6', 'ptr-7', 'ptr-8', 'bit-1', 'bit-2', 'bit-3', 'bit-4', 'bit-5', 'kw-1', 'kw-2', 'kw-3', 'kw-4', 'sm-1'],
    labIds: ['lab-c-stats', 'lab-c-classify', 'lab-c-pointer-debug', 'lab-c-swap', 'lab-bitmask', 'lab-state-machine'],
  },
  {
    id: 'm-cpp', phase: 4, track: 'core', color: 'purple',
    title: 'Essential C++ for Embedded', short: 'Embedded C/C++',
    summary: 'A useful subset of C++: classes, references, constexpr and enum class — and when to avoid the rest.',
    objectives: ['Write small classes with clear public interfaces', 'Use references, constexpr and enum class', 'Judge the RAM and timing cost of C++ features'],
    prerequisites: ['m-c'],
    realWorld: 'Arduino and ESP32 libraries are C++; motor and sensor drivers are natural classes.',
    lessons: [
      U('cpp-differences'),
      U('cpp-classes'),
      U('cpp-constructors'),
      U('cpp-encapsulation'),
      U('cpp-inheritance'),
      U('cpp-references'),
      U('cpp-templates'),
      U('cpp-stl'),
      U('cpp-oop-embedded'),
    ],
    examQuestionIds: ['cpp-1', 'cpp-2', 'cpp-3', 'cpp-4', 'cpp-5', 'kw-2', 'ct-3'],
    labIds: ['lab-cpp-led-class'],
  },
  {
    id: 'm-arch', phase: 5, track: 'core', color: 'blue',
    title: 'Computer & Microcontroller Architecture', short: 'MCU Architecture',
    summary: 'How a microcontroller combines a CPU, memory and peripherals — and how to find answers in a datasheet quickly.',
    objectives: ['Explain CPU, registers and memory types', 'Control peripherals through registers', 'Configure clocks, interrupts and timers conceptually', 'Read a datasheet in the right order'],
    prerequisites: ['m-digital', 'm-c'], placementAreas: ['mcu'],
    realWorld: 'Register-level debugging and choosing the right MCU for a job.',
    lessons: [
      U('how-computers-work'),
      U('cpu-architecture'),
      U('registers'),
      U('memory-types'),
      U('mcu-architecture'),
      U('gpio-registers'),
      U('clock-systems'),
      U('interrupts'),
      U('timers'),
      U('datasheets'),
    ],
    examQuestionIds: ['arch-1', 'arch-2', 'arch-3', 'arch-4', 'arch-5', 'arch-6', 'stm-5', 'gpio-8'],
    labIds: ['lab-datasheet-mpu', 'lab-register-blink'],
  },
  {
    id: 'm-arduino', phase: 6, track: 'core', color: 'green',
    title: 'Arduino Development', short: 'Microcontrollers',
    summary: 'Learn GPIO, ADC, PWM, timers and interrupts on the simplest board, then repeat them on the ESP32 and STM32.',
    objectives: ['Control GPIO, ADC and PWM', 'Use timers and interrupts safely', 'Drive DC motors through a driver', 'Write non-blocking firmware'],
    prerequisites: ['m-electronics', 'm-c'], placementAreas: ['mcu'],
    realWorld: 'Prototype every robot subsystem on the Uno before moving it to the ESP32.',
    lessons: [
      U('uno-intro'),
      U('uno-ide'),
      arduinoGpio,
      U('leds-buttons'),
      U('analog-inputs'),
      U('pwm'),
      U('sensors'),
      U('dc-motors'),
      U('motor-drivers'),
      U('uno-timers-interrupts'),
    ],
    examQuestionIds: ['gpio-1', 'gpio-2', 'gpio-3', 'gpio-4', 'gpio-5', 'gpio-6', 'gpio-7', 'gpio-8', 'gpio-9', 'arch-3', 'cl-6'],
    labIds: ['lab-uno-debounce', 'lab-adc-pot', 'lab-motor-driver'],
  },
  {
    id: 'm-esp32', phase: 7, track: 'core', color: 'cyan',
    title: 'ESP32 Development', short: 'Comms & IoT',
    summary: 'The robot\'s main controller: protocols, Wi-Fi, MQTT, dashboards and a first look at FreeRTOS.',
    objectives: ['Respect ESP32 pin and voltage rules', 'Use UART, I2C and SPI and debug them', 'Publish data over MQTT and recover from failures', 'Run simple FreeRTOS tasks'],
    prerequisites: ['m-arduino'],
    realWorld: 'Streaming air-quality readings from the robot to a dashboard.',
    lessons: [
      esp32Intro,
      U('esp32-gpio'),
      U('esp32-adc-pwm'),
      U('uart'),
      U('i2c'),
      U('spi'),
      U('wifi'),
      U('bluetooth'),
      U('mqtt'),
      U('web-dashboards'),
      U('freertos-intro'),
    ],
    examQuestionIds: ['esp-1', 'esp-2', 'esp-3', 'esp-4', 'esp-5', 'mqtt-1', 'mqtt-2', 'mqtt-3', 'proto-1', 'proto-2', 'proto-3', 'proto-4', 'proto-5', 'proto-6', 'rtos-1'],
    labIds: ['lab-esp32-pinmap', 'lab-level-debug', 'lab-i2c-debug', 'lab-mqtt-reconnect'],
  },
  {
    id: 'm-stm32', phase: 8, track: 'core', color: 'purple',
    title: 'STM32 Development', short: 'STM32 Pro',
    summary: 'The professional workflow employers look for: CubeMX configuration, HAL, timers, DMA and a hardware debugger.',
    objectives: ['Generate and extend a CubeIDE project safely', 'Use timers, PWM, encoder mode and interrupts', 'Move data with DMA', 'Debug with breakpoints and register views'],
    prerequisites: ['m-arch', 'm-arduino'],
    realWorld: 'Most German automotive and industrial embedded roles use STM32-class Cortex-M parts.',
    lessons: [
      U('stm32-arch'),
      U('nucleo'),
      U('cubeide'),
      U('cubemx'),
      U('hal'),
      U('stm32-gpio'),
      U('stm32-timers'),
      U('stm32-adc-pwm'),
      U('dma'),
      U('stm32-comms'),
      U('hw-debugging'),
      U('stm32-project'),
    ],
    examQuestionIds: ['stm-1', 'stm-2', 'stm-3', 'stm-4', 'stm-5', 'stm-6', 'arch-4', 'tool-1'],
    labIds: ['lab-timer-calc', 'lab-stm32-blink'],
  },
  {
    id: 'm-rtos', phase: 9, track: 'core', color: 'blue',
    title: 'Embedded Systems & Professional Tools', short: 'RTOS & Tools',
    summary: 'RTOS design, version control, testing, instruments, Linux and PCB basics — the habits that make work professional.',
    objectives: ['Design tasks, queues, semaphores and mutexes', 'Use Git branches and pull requests', 'Unit-test logic on a laptop', 'Debug with meters, logic analyzers and scopes', 'Design a first PCB'],
    prerequisites: ['m-esp32'],
    realWorld: 'Professional embedded teams expect RTOS, Git and test discipline from juniors.',
    lessons: [
      U('emb-architecture'),
      U('rtos-concepts'),
      U('rtos-scheduling'),
      U('rtos-queues'),
      U('rtos-mutex'),
      U('rtos-sync'),
      U('freertos-practical'),
      U('git'),
      U('unit-testing'),
      U('hw-debugging-2'),
      U('logic-analyzer'),
      U('oscilloscope'),
      U('linux'),
      U('pcb'),
    ],
    examQuestionIds: ['rtos-1', 'rtos-2', 'rtos-3', 'rtos-4', 'rtos-5', 'git-1', 'test-1', 'tool-1', 'tool-2', 'tool-3', 'pcb-1', 'lin-1', 'mqtt-3'],
    labIds: ['lab-rtos-queue', 'lab-uart-garbled', 'lab-unit-test'],
  },
  {
    id: 'm-control', phase: 10, track: 'core', color: 'amber',
    title: 'Control Systems & Robotics', short: 'Control Systems',
    summary: 'Make the robot move on purpose: closed-loop speed control, PID tuning, kinematics, odometry and IMU fusion.',
    objectives: ['Explain open vs closed loop', 'Measure speed with encoders', 'Implement and tune PID with anti-windup', 'Apply differential-drive kinematics and odometry', 'Calibrate and fuse IMU data'],
    prerequisites: ['m-arduino'],
    realWorld: 'Driving straight, turning accurately and mapping a room with the capstone robot.',
    lessons: [
      U('open-closed'),
      U('feedback'),
      U('dc-motor-control'),
      U('encoders'),
      U('pid'),
      U('pwm-motor-control'),
      U('calibration'),
      U('imu'),
      U('sensor-fusion'),
      U('kinematics'),
      U('obstacles'),
      U('navigation'),
    ],
    examQuestionIds: ['ctl-1', 'ctl-2', 'ctl-3', 'ctl-4', 'ctl-5', 'ctl-6', 'ctl-7', 'kin-1', 'kin-2', 'kin-3', 'imu-1', 'imu-2'],
    labIds: ['lab-pid-tune', 'lab-encoder-speed', 'lab-kinematics'],
  },
  {
    id: 'm-python', phase: 11, track: 'core', color: 'green',
    title: 'Python for Engineering', short: 'Python Data',
    summary: 'Python as a support tool: capture, clean, analyse and plot sensor data honestly.',
    objectives: ['Write clean Python scripts', 'Analyse data with NumPy and pandas', 'Plot with labelled axes and units', 'Capture serial data and keep analysis honest'],
    prerequisites: [],
    realWorld: 'Turning robot logs into the plots and tables of your technical report.',
    lessons: [
      U('py-fundamentals'),
      U('numpy'),
      U('pandas'),
      U('matplotlib'),
      U('dataviz'),
      U('sensor-analysis'),
      U('csv'),
      U('automation'),
      U('dashboards'),
    ],
    examQuestionIds: ['py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6'],
    labIds: ['lab-py-csv', 'lab-py-stats'],
  },
  {
    id: 'm-capstone', phase: 12, track: 'core', color: 'cyan',
    title: 'Engineering Capstone: Air-Quality Robot', short: 'Robotics',
    summary: 'Combine hardware, firmware, control, data and documentation into one measured, documented robot. The work happens in the Projects workspace.',
    objectives: ['Integrate every subsystem in tested stages', 'Measure performance against targets', 'Document the system in a technical report'],
    prerequisites: ['m-esp32', 'm-control'],
    realWorld: 'The centrepiece of your portfolio and job applications.',
    lessons: [
      U('capstone-overview'),
    ],
    examQuestionIds: ['kin-3', 'ctl-3', 'rtos-5', 'mqtt-2', 'tool-3', 'reg-2', 'proto-3', 'imu-1'],
    labIds: [],
  },
  {
    id: 'm-german', phase: 13, track: 'career', color: 'amber',
    title: 'German for Engineers', short: 'German',
    summary: 'Start German now — it cannot be crammed. A1 → A2 → B1 with engineering vocabulary and interview language.',
    objectives: ['Reach A1, then A2, and prepare for B1', 'Use core technical vocabulary', 'Describe your project and yourself in simple German'],
    prerequisites: [],
    realWorld: 'Many German job listings require or prefer German; B1 also shortens some residence timelines.',
    lessons: [
      U('de-a1'),
      U('de-a2'),
      U('de-b1'),
      U('de-vocab'),
      U('de-technical'),
      U('de-interview'),
    ],
    examQuestionIds: ['de-1', 'de-2', 'de-3', 'de-4'],
    labIds: ['lab-german-intro'],
  },
  {
    id: 'm-career', phase: 13, track: 'career', color: 'purple',
    title: 'Engineering Career', short: 'Career',
    summary: 'Portfolio, GitHub, CV, interviews, Germany applications and the long-term freelance path.',
    objectives: ['Build a verifiable portfolio', 'Write a results-focused CV', 'Answer common embedded interview questions', 'Plan Germany applications and first freelance offers'],
    prerequisites: [],
    realWorld: 'Turning skills into a job first, independent income later.',
    lessons: [
      U('portfolio'),
      U('github-presentation'),
      U('cv'),
      U('tech-interviews'),
      U('embedded-interview-q'),
      U('germany-apps'),
      U('freelancing'),
      U('client-comms'),
      U('tech-docs'),
      U('long-term'),
    ],
    examQuestionIds: ['car-1', 'car-2'],
    labIds: ['lab-cv-line'],
  },
];

// Grow each module exam pool with its lessons' knowledge-check questions.
for (const m of MODULES) {
  m.examQuestionIds = [...new Set([...m.examQuestionIds, ...m.lessons.flatMap((l) => l.check ?? [])])];
}

const moduleById = new Map(MODULES.map((m) => [m.id, m]));

export function getModule(id: string): Module | undefined {
  return moduleById.get(id);
}

export function findLesson(lessonId: string): { module: Module; lesson: Lesson; index: number } | undefined {
  for (const module of MODULES) {
    const index = module.lessons.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { module, lesson: module.lessons[index], index };
  }
  return undefined;
}

export const CORE_MODULES = MODULES.filter((m) => m.track === 'core');
export const CAREER_MODULES = MODULES.filter((m) => m.track === 'career');

export const FULL_LESSONS = MODULES.flatMap((m) => m.lessons.filter((l) => l.status === 'full').map((l) => ({ module: m, lesson: l })));

export const ALL_FLASHCARDS = MODULES.flatMap((m) => m.lessons.flatMap((l) => l.flashcards ?? []));
