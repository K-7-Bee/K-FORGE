import type { Lesson } from '../types';

export const ohmsLaw: Lesson = {
  id: 'ohms-law',
  title: "Voltage, current, resistance & Ohm's law",
  minutes: 18,
  status: 'full',
  topic: 'ohms-law',
  objectives: [
    'Define voltage, current, resistance and power, and say how each is measured',
    "Apply V = I × R to find any one quantity from the other two",
    'Choose an LED series resistor and check its power rating',
    'Predict what a multimeter should read before measuring',
  ],
  why: `Almost every hardware fault comes down to **voltage, current, or a broken connection**. When an ESP32 resets as the motors start, when an LED is dim, when a sensor reads garbage — the first diagnosis is always an Ohm's-law question: *what voltage should be here, what current should flow, and does the meter agree?*

Firmware engineers use this daily: sizing LED and pull-up resistors, checking that a GPIO pin stays inside its current limit, and estimating battery runtime for the air-quality robot.`,
  visual: { diagram: 'led-circuit', caption: 'A 5 V pin drives an LED through a 330 Ω resistor. The supply voltage splits between the resistor (≈3 V) and the LED (≈2 V); the same current flows through both.' },
  theory: `| Quantity | Symbol, unit | Meaning | How to measure |
|---|---|---|---|
| Voltage | V, volts | Electrical "pressure" between two points | Meter **across** the two points |
| Current | I, amps | Flow of charge through a path | Meter **in series** with the path |
| Resistance | R, ohms (Ω) | How much a part limits current | Meter across the part, **power off** |
| Power | P, watts | Rate energy is used or turned into heat | Calculate from V and I |

**Ohm's law** links the first three:

\`\`\`
V = I × R        I = V / R        R = V / I
\`\`\`

**Power** tells you whether a part will overheat:

\`\`\`
P = V × I = I² × R = V² / R
\`\`\`

Two habits make Ohm's law useful in practice:

1. **Work in base units.** Convert 330 mA → 0.33 A and 4.7 kΩ → 4700 Ω before calculating, then convert back.
2. **Predict, then measure.** Write down what the meter should read. If the reading differs, that difference is your next clue.`,
  worked: {
    problem: 'You want about 10 mA through a red LED from a 5 V Arduino pin. The LED drops about 2 V. Choose a resistor and check its power.',
    steps: [
      "**Resistor voltage:** by Kirchhoff's voltage law the resistor gets what the LED doesn't use: 5 V − 2 V = 3 V.",
      '**Resistance:** R = V / I = 3 V / 0.010 A = 300 Ω.',
      '**Standard value:** 300 Ω is not a common E12 value, so pick the next higher one — 330 Ω. Current becomes 3 V / 330 Ω ≈ 9.1 mA.',
      '**Power check:** P = V × I = 3 V × 0.0091 A ≈ 0.027 W — about 1/9 of a ¼ W resistor\'s rating. Safe.',
    ],
    answer: 'Use **330 Ω**. Expect ≈ 9 mA and ≈ 0.027 W in the resistor.',
  },
  demo: {
    tool: 'ohms-law',
    intro: 'Change any two values and watch the third update. Try to reproduce the worked example, then see what happens to current and power when you halve the resistor.',
  },
  mistakes: [
    { mistake: 'Mixing units, e.g. 3 V / 10 mA = 0.3 Ω', fix: 'Convert to base units first: 10 mA = 0.010 A → 300 Ω.' },
    { mistake: 'Measuring current with the meter across a supply', fix: 'Current is measured in series. Across a supply in current mode, the meter is a near short-circuit and its fuse blows.' },
    { mistake: 'Measuring resistance in a powered circuit', fix: 'Turn power off. The meter uses its own current to measure resistance.' },
    { mistake: 'Ignoring power — "the value is right, so it\'s fine"', fix: 'Always compute P and compare with the rating, leaving about 2× margin.' },
  ],
  check: ['ohm-1', 'ohm-2', 'ohm-5'],
  challenge: {
    prompt: 'Design the LED resistor for a **3.3 V** ESP32 pin and a green LED (V_f ≈ 2.1 V) at 8 mA. Then verify your answer in the lab.',
    exerciseId: 'lab-led-resistor',
  },
  summary: [
    'V = I × R; P = V × I = I²R = V²/R.',
    'Voltage across, current in series, resistance with power off.',
    'Pick the next standard resistor value above the calculated one, then re-check current and power.',
    'Predict every reading before you measure — differences are diagnostic clues.',
  ],
  flashcards: [
    { id: 'fc-ohm', front: "Ohm's law (three forms)", back: 'V = I·R   I = V/R   R = V/I', kind: 'formula', topic: 'ohms-law' },
    { id: 'fc-power', front: 'Electrical power (three forms)', back: 'P = V·I = I²·R = V²/R', kind: 'formula', topic: 'power' },
    { id: 'fc-measure', front: 'How do you connect a meter to measure current?', back: 'In series with the path, with the lead in the current socket.', kind: 'concept', topic: 'multimeter' },
  ],
};

export const seriesParallel: Lesson = {
  id: 'series-parallel',
  title: 'Series and parallel circuits',
  minutes: 16,
  status: 'full',
  topic: 'series-parallel',
  objectives: [
    'Recognise series and parallel connections in a schematic',
    'Calculate equivalent resistance of series, parallel and mixed networks',
    'Predict how voltage and current divide',
    'Explain how one failed component affects series vs parallel loads',
  ],
  why: `Every circuit you build is a mix of series and parallel paths. **Voltage dividers** that bring a 5 V sensor output down to 3.3 V for the ESP32, **pull-up resistors** in parallel on an I2C bus, multiple **LEDs** on one supply, and **battery packs** (2S = two cells in series) all depend on these rules.

Getting it wrong has real consequences: three sensor boards each with their own 4.7 kΩ I2C pull-ups are effectively 1.57 kΩ in parallel — sometimes too strong for the bus.`,
  visual: { diagram: 'series-parallel', caption: 'Left: series — one path, same current, voltages add. Right: parallel — same two nodes, same voltage, currents add.' },
  theory: `#### Series: one path

- The **same current** flows through every part.
- Voltages **add** up to the supply (KVL).
- Resistances **add**: \`R_total = R1 + R2 + R3\`
- One open part stops current everywhere.

#### Parallel: same two nodes

- Every branch has the **same voltage**.
- Branch currents **add** up to the total (KCL).
- Conductances add: \`1/R_total = 1/R1 + 1/R2 + …\`
- For exactly two resistors: \`R_total = (R1 × R2) / (R1 + R2)\` ("product over sum").
- The result is always **smaller than the smallest branch**.
- One open branch leaves the others working.

#### Mixed networks

Reduce step by step: find a group that is purely series or purely parallel, replace it with its equivalent, and repeat until one resistor is left. Then work back out to find each branch's voltage and current.

#### The voltage divider

Two series resistors form a divider:

\`\`\`
V_out = V_in × R2 / (R1 + R2)
\`\`\`

Use it for **signals** (e.g. 5 V → 3.3 V), never as a power supply — the output sags when a load draws current.`,
  worked: {
    problem: 'A 9 V source feeds R1 = 1 kΩ in series with a parallel pair R2 = R3 = 2 kΩ. Find the total current and the voltage across the parallel pair.',
    steps: [
      '**Reduce the parallel pair:** two equal 2 kΩ resistors in parallel = 2 kΩ / 2 = 1 kΩ.',
      '**Total resistance:** R1 + 1 kΩ = 2 kΩ.',
      '**Total current:** I = 9 V / 2 kΩ = 4.5 mA.',
      '**Voltage across the pair:** V = 4.5 mA × 1 kΩ = 4.5 V. (R1 gets the other 4.5 V — check: 4.5 + 4.5 = 9 V ✓)',
      '**Each branch:** 4.5 V / 2 kΩ = 2.25 mA, and 2.25 + 2.25 = 4.5 mA ✓ (KCL).',
    ],
    answer: 'I_total = **4.5 mA**; V_pair = **4.5 V**; each 2 kΩ branch carries **2.25 mA**.',
  },
  demo: {
    tool: 'series-parallel',
    intro: 'Add resistors to the list and switch between series and parallel. Notice the parallel total always falls below the smallest resistor.',
  },
  mistakes: [
    { mistake: 'Adding parallel resistances directly (1 kΩ ∥ 1 kΩ = 2 kΩ)', fix: 'Parallel resistance goes **down**: 1 kΩ ∥ 1 kΩ = 500 Ω.' },
    { mistake: 'Using the product-over-sum formula for three resistors at once', fix: 'Apply it pairwise, or use 1/R = 1/R1 + 1/R2 + 1/R3.' },
    { mistake: 'Powering a module from a voltage divider', fix: 'Use a regulator. Dividers are for signals only.' },
    { mistake: 'Forgetting that every sensor board may already have I2C pull-ups', fix: 'Check each board; parallel pull-ups combine into a smaller resistance.' },
  ],
  check: ['sp-1', 'sp-3', 'sp-6'],
  challenge: {
    prompt: 'A network: 470 Ω in series with (1 kΩ ∥ 1 kΩ), supplied with 5 V. Find the total current. Then solve the circuit-diagnosis lab.',
    exerciseId: 'lab-series-current',
  },
  summary: [
    'Series: same current, voltages add, R adds.',
    'Parallel: same voltage, currents add, 1/R adds; result < smallest branch.',
    'Reduce mixed networks step by step; check answers with KVL and KCL.',
    'V_out = V_in × R2/(R1+R2) — for signals, not power.',
  ],
  flashcards: [
    { id: 'fc-series', front: 'Equivalent resistance in series', back: 'R = R1 + R2 + …', kind: 'formula', topic: 'series-parallel' },
    { id: 'fc-parallel', front: 'Two resistors in parallel', back: 'R = R1·R2 / (R1 + R2) — always smaller than the smallest', kind: 'formula', topic: 'series-parallel' },
    { id: 'fc-divider', front: 'Voltage divider output', back: 'V_out = V_in · R2 / (R1 + R2)', kind: 'formula', topic: 'voltage-divider' },
  ],
};
