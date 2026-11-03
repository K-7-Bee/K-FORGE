import type { Question } from '../types';

export const electronicsQuestions: Question[] = [
  // ---------- Ohm's law & power ----------
  {
    id: 'ohm-1', type: 'numeric', topic: 'ohms-law', difficulty: 1, unit: 'mA',
    prompt: 'A 1 kΩ resistor has 9 V across it. What current flows through it?',
    answer: 9,
    hint: 'Rearrange V = I × R for I, and keep the units consistent.',
    explanation: 'I = V / R = 9 V / 1000 Ω = 0.009 A = **9 mA**.',
  },
  {
    id: 'ohm-2', type: 'numeric', topic: 'ohms-law', difficulty: 1, unit: 'Ω',
    prompt: 'You want about 10 mA through an LED from a 5 V pin. The LED drops about 2 V. What resistance is needed (before picking a standard value)?',
    answer: 300,
    hint: 'First find the voltage left across the resistor.',
    explanation: 'Resistor voltage = 5 V − 2 V = 3 V. R = 3 V / 0.01 A = **300 Ω**. A standard 330 Ω gives about 9 mA.',
  },
  {
    id: 'ohm-3', type: 'numeric', topic: 'power', difficulty: 1, unit: 'W', tolerance: 0.05,
    prompt: 'How much power does a 330 Ω resistor dissipate at 9 mA?',
    answer: 0.0267,
    hint: 'P = I² × R works directly with the values you have.',
    explanation: 'P = I² × R = (0.009)² × 330 ≈ **0.027 W**, comfortably inside a ¼ W rating.',
  },
  {
    id: 'ohm-4', type: 'single', topic: 'ohms-law', difficulty: 1,
    prompt: 'If you double the voltage across a fixed resistor, the current…',
    options: ['halves', 'stays the same', 'doubles', 'quadruples'],
    answer: 2,
    explanation: 'With R fixed, I = V / R is linear in V, so the current **doubles**. (The power quadruples, because P = V² / R.)',
  },
  {
    id: 'ohm-5', type: 'truefalse', topic: 'power', difficulty: 2,
    prompt: 'Doubling the current through a resistor doubles the power it dissipates.',
    answer: false,
    explanation: 'P = I² × R, so doubling I makes the power **four times** larger. This is why resistors that are fine at one current can overheat at twice the current.',
  },
  {
    id: 'ohm-6', type: 'single', topic: 'ohms-law', difficulty: 2,
    prompt: 'You measure 3.0 V across a 330 Ω LED resistor, but the LED is dim and you expected 9 mA. What current is actually flowing?',
    options: ['About 0.9 mA', 'About 9 mA', 'About 90 mA', 'You cannot tell without measuring current directly'],
    answer: 1,
    explanation: 'I = 3.0 V / 330 Ω ≈ 9.1 mA, so the current is what you designed. The dimness has another cause — for example a high-efficiency LED rated at 20 mA, or a viewing-angle issue. Measuring voltage across a known resistor is a safe way to find current without breaking the circuit.',
  },
  {
    id: 'ohm-7', type: 'numeric', topic: 'power', difficulty: 2, unit: 'W',
    prompt: 'A linear regulator drops 8 V to 5 V at 100 mA. How much power does it waste as heat?',
    answer: 0.3,
    hint: 'P_heat = (V_in − V_out) × I',
    explanation: 'P = (8 − 5) V × 0.1 A = **0.3 W**. At 200 mA it would be 0.6 W, which is why the robot uses a buck converter.',
  },
  {
    id: 'ohm-8', type: 'circuit', topic: 'ohms-law', difficulty: 2, diagram: 'led-circuit',
    prompt: 'In the LED circuit shown, the resistor is swapped from 330 Ω to 33 Ω by mistake. What is the most likely result?',
    options: [
      'The LED gets slightly brighter and nothing else changes',
      'About 90 mA flows — likely damaging the LED and overloading the pin',
      'The LED turns off because the resistance is too low',
      'The supply voltage rises to compensate',
    ],
    answer: 1,
    explanation: 'I ≈ 3 V / 33 Ω ≈ 91 mA. That exceeds a typical LED rating (~20 mA) and the ~20–40 mA limit of a microcontroller pin. Always calculate before swapping resistor values.',
  },
  {
    id: 'ohm-9', type: 'short', topic: 'ohms-law', difficulty: 2,
    prompt: 'Explain, in two or three sentences, how you would use Ohm\'s law to check whether a resistor will overheat.',
    modelAnswer: 'Find the voltage across the resistor (or the current through it), then compute the power with P = V × I, P = I² × R or P = V² / R. Compare that power with the resistor\'s rating, leaving a safety margin of about 2×.',
    keywords: ['power', 'rating', 'P = ', 'margin'],
    explanation: 'Power, not resistance, decides whether a resistor overheats. Always compare calculated power with the rating and leave margin.',
  },
  {
    id: 'ohm-10', type: 'numeric', topic: 'ohms-law', difficulty: 3, unit: 'mA', tolerance: 0.03,
    prompt: 'A 3.3 V GPIO pin drives a red LED (V_f ≈ 1.9 V) through 220 Ω. Estimate the current.',
    answer: 6.36,
    explanation: 'I = (3.3 − 1.9) V / 220 Ω ≈ **6.4 mA**. On 3.3 V logic the resistor voltage is small, so the LED forward voltage matters a lot — a blue LED (~3 V) would barely light.',
  },

  // ---------- Kirchhoff ----------
  {
    id: 'kvl-1', type: 'single', topic: 'kirchhoff', difficulty: 1,
    prompt: 'Kirchhoff\'s voltage law states that around any closed loop…',
    options: ['the currents add to zero', 'the voltage rises and drops add to zero', 'the resistances add to zero', 'the power is constant'],
    answer: 1,
    explanation: 'KVL: the sum of voltage rises and drops around a closed loop is zero. KCL is the current version, applied at a junction.',
  },
  {
    id: 'kvl-2', type: 'numeric', topic: 'kirchhoff', difficulty: 1, unit: 'V',
    prompt: 'A 5 V supply feeds a resistor and an LED in series. You measure 2.1 V across the LED. What should the resistor read?',
    answer: 2.9,
    explanation: 'By KVL, 5 V = V_R + V_LED, so V_R = 5 − 2.1 = **2.9 V**. If your meter disagrees, you have found your next clue (a bad connection or wrong supply).',
  },
  {
    id: 'kcl-1', type: 'numeric', topic: 'kirchhoff', difficulty: 2, unit: 'mA',
    prompt: '45 mA enters a junction. Two branches leave it; one carries 18 mA. How much flows in the other?',
    answer: 27,
    explanation: 'KCL: current in = current out, so 45 − 18 = **27 mA**.',
  },

  // ---------- Series & parallel ----------
  {
    id: 'sp-1', type: 'numeric', topic: 'series-parallel', difficulty: 1, unit: 'Ω',
    prompt: 'What is the total resistance of 220 Ω, 330 Ω and 470 Ω in series?',
    answer: 1020,
    explanation: 'Series resistances add: 220 + 330 + 470 = **1020 Ω**.',
  },
  {
    id: 'sp-2', type: 'numeric', topic: 'series-parallel', difficulty: 1, unit: 'Ω',
    prompt: 'Two 1 kΩ resistors are in parallel. What is the equivalent resistance?',
    answer: 500,
    explanation: 'Two equal resistors in parallel give half the value: R = (1000 × 1000) / (1000 + 1000) = **500 Ω**.',
  },
  {
    id: 'sp-3', type: 'numeric', topic: 'series-parallel', difficulty: 2, unit: 'Ω', tolerance: 0.01,
    prompt: '1 kΩ in parallel with 2.2 kΩ. Equivalent resistance?',
    answer: 687.5,
    hint: 'Product over sum: R1·R2 / (R1 + R2).',
    explanation: 'R = (1000 × 2200) / 3200 ≈ **687.5 Ω**. The result is always smaller than the smallest branch.',
  },
  {
    id: 'sp-4', type: 'truefalse', topic: 'series-parallel', difficulty: 1,
    prompt: 'In a parallel circuit, every branch has the same voltage across it.',
    answer: true,
    explanation: 'Parallel branches share the same two nodes, so they have the same voltage. Current divides between them.',
  },
  {
    id: 'sp-5', type: 'single', topic: 'series-parallel', difficulty: 2,
    prompt: 'Three identical LEDs (each with its own resistor) are wired in parallel. One LED fails open-circuit. What happens to the others?',
    options: ['They all go out', 'They stay lit at about the same brightness', 'They get much brighter', 'They flicker'],
    answer: 1,
    explanation: 'Each parallel branch has its own path. Removing one branch does not change the voltage across the others, so they stay lit — the supply simply delivers less total current.',
  },
  {
    id: 'sp-6', type: 'single', topic: 'series-parallel', difficulty: 2,
    prompt: 'Three LEDs are in series on one string. One fails open. What happens?',
    options: ['Only that LED goes out', 'All of them go out', 'The others get brighter', 'Nothing changes'],
    answer: 1,
    explanation: 'A series circuit has only one path. An open anywhere stops current everywhere — the classic old-style Christmas-light fault.',
  },
  {
    id: 'sp-7', type: 'numeric', topic: 'series-parallel', difficulty: 3, unit: 'mA', tolerance: 0.02,
    prompt: 'A 9 V source feeds 1 kΩ in series with a parallel pair of 2 kΩ and 2 kΩ. What is the total current?',
    answer: 4.5,
    explanation: 'The parallel pair is 1 kΩ, so the total is 1 kΩ + 1 kΩ = 2 kΩ. I = 9 V / 2 kΩ = **4.5 mA**.',
  },
  {
    id: 'sp-8', type: 'circuit', topic: 'series-parallel', difficulty: 2, diagram: 'series-parallel',
    prompt: 'In the diagram, which statement is correct?',
    options: [
      'Series resistors share the same current; parallel resistors share the same voltage',
      'Series resistors share the same voltage; parallel resistors share the same current',
      'Both share the same current',
      'Both share the same voltage',
    ],
    answer: 0,
    explanation: 'Series → one path → same current. Parallel → same two nodes → same voltage.',
  },

  // ---------- Voltage divider ----------
  {
    id: 'div-1', type: 'numeric', topic: 'voltage-divider', difficulty: 1, unit: 'V', tolerance: 0.02,
    prompt: 'A divider has R1 = 2 kΩ (top) and R2 = 1 kΩ (bottom), with 5 V at the input. What is V_out?',
    answer: 1.667,
    explanation: 'V_out = 5 × 1 / (2 + 1) ≈ **1.67 V**.',
  },
  {
    id: 'div-2', type: 'numeric', topic: 'voltage-divider', difficulty: 2, unit: 'V', tolerance: 0.02,
    prompt: 'R1 = 1 kΩ (top), R2 = 2 kΩ (bottom), input 5 V. V_out?',
    answer: 3.333,
    explanation: 'V_out = 5 × 2 / 3 ≈ **3.33 V** — a common way to bring a 5 V signal down for a 3.3 V input.',
  },
  {
    id: 'div-3', type: 'single', topic: 'voltage-divider', difficulty: 2,
    prompt: 'Why should a voltage divider not be used to power a motor or a microcontroller board?',
    options: [
      'Resistors cannot handle DC',
      'The output voltage changes when the load draws current, and the resistors waste power',
      'Dividers only work with AC',
      'It would produce too high a voltage',
    ],
    answer: 1,
    explanation: 'A load in parallel with R2 lowers the effective bottom resistance and pulls V_out down. Use a regulator for power; dividers are for signals.',
  },

  // ---------- Components ----------
  {
    id: 'comp-1', type: 'single', topic: 'components', difficulty: 1,
    prompt: 'What is the main purpose of a 100 nF capacitor placed close to a chip\'s power pin?',
    options: ['To store data', 'To reduce supply noise (decoupling)', 'To raise the voltage', 'To limit current'],
    answer: 1,
    explanation: 'A decoupling capacitor supplies brief current bursts and absorbs fast voltage changes right where the chip needs it.',
  },
  {
    id: 'comp-2', type: 'numeric', topic: 'components', difficulty: 2, unit: 'ms',
    prompt: 'What is the RC time constant of 10 kΩ and 100 nF?',
    answer: 1,
    explanation: 'τ = R × C = 10 000 × 100×10⁻⁹ = 0.001 s = **1 ms**. You will see this in button debouncing filters.',
  },
  {
    id: 'comp-3', type: 'single', topic: 'components', difficulty: 2,
    prompt: 'Why is a flyback diode placed across a motor or relay coil?',
    options: [
      'To make the motor spin faster',
      'To give the coil current a safe path when the switch turns off, preventing a damaging voltage spike',
      'To convert AC to DC',
      'To protect against reverse battery connection',
    ],
    answer: 1,
    explanation: 'An inductor resists changes in current. When the switch opens, the coil can produce a large spike; the diode lets that current circulate safely.',
  },
  {
    id: 'comp-4', type: 'truefalse', topic: 'components', difficulty: 2,
    prompt: 'A MOSFET\'s gate threshold voltage (V_GS(th)) is the voltage at which it is fully turned on.',
    answer: false,
    explanation: 'V_GS(th) is where the MOSFET only **starts** to conduct. For 3.3 V control, pick a logic-level MOSFET and check R_DS(on) at your actual gate voltage.',
  },
  {
    id: 'comp-5', type: 'single', topic: 'components', difficulty: 1,
    prompt: 'Roughly what forward voltage does a silicon diode drop?',
    options: ['0.2–0.4 V', '0.6–0.7 V', '1.8–3.3 V', '5 V'],
    answer: 1,
    explanation: 'Silicon ≈ 0.6–0.7 V, Schottky ≈ 0.2–0.4 V, LEDs ≈ 1.8–3.3 V depending on colour.',
  },

  // ---------- Pull-ups ----------
  {
    id: 'pu-1', type: 'single', topic: 'pullups', difficulty: 1, diagram: 'pullup-button',
    prompt: 'A button uses a pull-up resistor and connects the pin to ground when pressed. What does the pin read when pressed?',
    options: ['HIGH', 'LOW', 'It floats', 'It alternates'],
    answer: 1,
    explanation: 'Pressed → the pin is connected directly to ground → **LOW**. Released → the pull-up holds it HIGH. This "active-low" button is very common.',
  },
  {
    id: 'pu-2', type: 'single', topic: 'pullups', difficulty: 1,
    prompt: 'What happens to an input pin that is connected to nothing?',
    options: ['It reads LOW reliably', 'It reads HIGH reliably', 'It floats and can read random values', 'It damages the chip'],
    answer: 2,
    explanation: 'A floating input picks up noise and can read either value. A pull-up or pull-down gives it a defined default state.',
  },
  {
    id: 'pu-3', type: 'numeric', topic: 'pullups', difficulty: 2, unit: 'mA',
    prompt: 'A 10 kΩ pull-up to 5 V. How much current flows when the button pulls the pin to ground?',
    answer: 0.5,
    explanation: 'I = 5 V / 10 kΩ = **0.5 mA** — small, which is why 4.7–10 kΩ pull-ups are common.',
  },

  // ---------- Regulators ----------
  {
    id: 'reg-1', type: 'single', topic: 'regulators', difficulty: 1,
    prompt: 'Which regulator type is the best choice for stepping a 7.4 V battery down to 5 V at 1 A on a robot?',
    options: ['Linear regulator', 'Buck converter', 'Boost converter', 'Voltage divider'],
    answer: 1,
    explanation: 'A buck converter switches efficiently. A linear regulator would waste (7.4 − 5) × 1 = 2.4 W as heat.',
  },
  {
    id: 'reg-2', type: 'numeric', topic: 'regulators', difficulty: 2, unit: 'h', tolerance: 0.03,
    prompt: 'Theoretical runtime of a 2500 mAh battery at an average of 600 mA?',
    answer: 4.17,
    explanation: 'Runtime ≈ 2500 / 600 ≈ **4.2 h** in theory. Plan for less: converters waste power and batteries lose capacity under load.',
  },

  // ---------- Schematics & multimeter ----------
  {
    id: 'sch-1', type: 'single', topic: 'schematics', difficulty: 1,
    prompt: 'On a schematic, two points carry the same net label (e.g. "SDA") but no line joins them. Are they connected?',
    options: ['No, they are separate', 'Yes, the same net label means they are connected', 'Only if they are on the same page', 'Only for power nets'],
    answer: 1,
    explanation: 'Net labels connect points without drawing a wire. This keeps large schematics readable.',
  },
  {
    id: 'sch-2', type: 'single', topic: 'schematics', difficulty: 1,
    prompt: 'What does the reference designator "U1" usually identify?',
    options: ['A resistor', 'A connector', 'An integrated circuit', 'A transistor'],
    answer: 2,
    explanation: 'R = resistor, C = capacitor, D = diode, Q = transistor, U = integrated circuit, J = connector.',
  },
  {
    id: 'mm-1', type: 'single', topic: 'multimeter', difficulty: 1,
    prompt: 'How must a multimeter be connected to measure current?',
    options: ['Across the component', 'In series with the path', 'Between supply and ground', 'It does not matter'],
    answer: 1,
    explanation: 'Current is measured **in series**, with the lead moved to the current socket. Connecting the meter across a supply in current mode can blow its fuse or damage the circuit.',
  },
  {
    id: 'mm-2', type: 'truefalse', topic: 'multimeter', difficulty: 1,
    prompt: 'Resistance should be measured with the circuit powered on.',
    answer: false,
    explanation: 'Measure resistance with power **off**. The meter injects its own small current; an external supply corrupts the reading and can damage the meter.',
  },
  {
    id: 'mm-3', type: 'single', topic: 'multimeter', difficulty: 2,
    prompt: 'Your ESP32 project behaves randomly. Which measurement should you take first?',
    options: ['The I2C clock frequency', 'The supply voltage at the board, and that grounds are common', 'The resistance of every resistor', 'The Wi-Fi signal strength'],
    answer: 1,
    explanation: 'Power and ground first. Unstable inputs and weak power cause many problems that look like software bugs.',
  },
  {
    id: 'gnd-1', type: 'short', topic: 'schematics', difficulty: 2,
    prompt: 'Why do the ESP32, motor driver and sensors on the robot need a common ground?',
    modelAnswer: 'Voltage is always measured between two points. Signals between boards are only meaningful if both boards use the same reference point; without a shared ground, logic levels are undefined and communication becomes unreliable.',
    keywords: ['reference', 'between two points', 'signal', 'logic level'],
    explanation: 'Every signal voltage is relative to ground. A missing common ground is one of the most common bring-up faults.',
  },
];
