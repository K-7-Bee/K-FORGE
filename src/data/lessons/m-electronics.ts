import type { Question } from '../types';
import { L, mc, num, sc, tf } from './helpers';

export const electronicsLessonQuestions: Question[] = [
  num('kv-a', 'kirchhoff', 2, 'In the KVL diagram, 9 V feeds R1 = 1 kΩ in series with R2 ∥ R3 (2 kΩ each). What voltage appears across R1?', 4.5, 'V', 'R2 ∥ R3 = 1 kΩ, so the 9 V splits equally: 4.5 V across R1 and 4.5 V across the pair.'),
  sc('cap-a', 'components', 2, 'A 10 kΩ / 1 µF RC filter is charged from 0 V. After about how long is the capacitor above 99 %?', ['1 ms', '5 ms', '10 ms', '50 ms'], 3, 'τ = RC = 10 ms. After 5τ ≈ 50 ms the capacitor is above 99 % charged.'),
  num('di-a', 'components', 2, 'A 5 V supply feeds a red LED (V_f ≈ 1.9 V) through a silicon reverse-protection diode (≈ 0.7 V) and a resistor for 10 mA. What resistance is needed?', 240, 'Ω', 'V_R = 5 − 0.7 − 1.9 = 2.4 V; R = 2.4 / 0.010 = 240 Ω. Every diode in the path takes its forward drop.'),
  sc('di-b', 'components', 1, 'Why does a full-wave rectifier produce less ripple than a half-wave rectifier with the same capacitor?', ['It uses a higher voltage', 'It refills the capacitor twice per AC cycle instead of once', 'It has no diodes', 'It converts DC to AC'], 1, 'Full-wave conduction on both half-cycles halves the time the capacitor must hold the load up, so ripple roughly halves.'),
  num('tr-a', 'components', 2, 'A BJT switch must carry 100 mA with a current gain β of about 100. Designers overdrive the base by about 5× for saturation. What base current should you target?', 5, 'mA', 'Minimum I_B = 100 mA / 100 = 1 mA; overdriving ×5 gives ≈ 5 mA, so the transistor saturates with margin.'),
  sc('tr-b', 'components', 2, 'Why do MOSFET gate circuits include a pull-down resistor from gate to source?', ['To limit drain current', 'So the MOSFET stays off while the MCU pin is floating during reset', 'To raise the threshold voltage', 'To protect against reverse polarity'], 1, 'At power-up or reset, GPIO pins are inputs (floating). The pull-down holds V_GS at 0 V, keeping the motor off.'),
  sc('pu-b', 'pullups', 2, 'Three I2C sensor boards each have 4.7 kΩ pull-ups on SDA. What is the effective pull-up?', ['4.7 kΩ', '14.1 kΩ', '≈ 1.57 kΩ', '≈ 0.5 kΩ'], 2, 'Parallel resistors: 4.7 kΩ / 3 ≈ 1.57 kΩ. Strong pull-ups increase sink current; remove extras if the total is too low.'),
  num('rg-a', 'regulators', 2, 'A buck converter turns 7.4 V into 5 V at 1 A with 90 % efficiency. What input current does it draw (approximately)?', 0.75, 'A', 'P_out = 5 W; P_in = 5 / 0.9 ≈ 5.56 W; I_in = 5.56 / 7.4 ≈ 0.75 A — less than the output current, unlike a linear regulator.', 0.03),
  sc('sc-a', 'schematics', 1, 'In the five-step method for reading a schematic, what do you do first?', ['Trace every signal', 'Find the power rails and ground', 'Measure with a scope', 'Identify the connectors'], 1, 'Power and ground first — almost every fault and every signal level is relative to them.'),
  mc('sc-b', 'schematics', 2, 'Which checks belong in the "before applying power" list for a breadboard? (select all)', ['Supply not shorted to ground', 'Polarised parts in the right direction', 'Common ground between modules', 'Measure resistance with power on'], [0, 1, 2], 'Resistance is always measured with power off. The other three catch the most common bring-up faults.'),
  num('mm-b', 'multimeter', 2, 'Your meter in series reads 23.0 mA for an LED circuit fed from 5 V with an LED drop of 2.0 V. What is the actual series resistance?', 130.4, 'Ω', 'R = (5 − 2) / 0.023 ≈ 130 Ω — probably a 130 Ω or a mis-read 1.3 kΩ part; compare with the colour code.', 0.02),
  tf('mm-c', 'multimeter', 1, 'Continuity mode is a safe way to check for a short between the supply rail and ground, with the circuit unpowered.', true, 'Continuity is a low-current resistance test — always unpowered. A beep between VCC and GND means a short (or a large discharged capacitor, which beeps briefly).'),
];

export const kirchhoff = L({
  id: 'kirchhoff', title: "Kirchhoff's voltage and current laws", topic: 'kirchhoff', minutes: 15,
  objectives: ['State KVL and KCL and apply them to series-parallel circuits', 'Predict meter readings at nodes and across components', 'Use differences between prediction and measurement as debugging clues'],
  why: `Ohm's law tells you about one component; Kirchhoff's laws tell you about the **whole circuit**. When a sensor reads wrong, you predict what each node *should* measure using KVL and KCL — then the first point where meter and prediction disagree is where the fault is. This is the core of hardware debugging.`,
  visual: { diagram: 'kvl-loop', caption: 'KVL: voltages around a loop sum to zero. KCL: current into node A equals current out through R2 and R3.' },
  theory: `**Kirchhoff's voltage law (KVL):** around any closed loop, the sum of voltage rises equals the sum of drops:

\`\`\`
V_source − V_R1 − V_R2 = 0
\`\`\`

**Kirchhoff's current law (KCL):** at any node (junction), current in equals current out:

\`\`\`
I_in = I_2 + I_3
\`\`\`

Both follow from conservation: energy around a loop, charge at a node.

#### Using them in practice

1. Label the nodes (points between components) and pick a reference — **ground**.
2. Reduce the circuit or write one KVL equation per loop and one KCL equation per node.
3. Solve, then write the predicted voltage at each node *relative to ground*.
4. Measure node by node. A node that reads 0 V when you expect 4.5 V points to an open connection upstream; a node that reads the full supply points to an open component downstream.

#### Sign conventions

Pick a direction for each current. If the answer comes out negative, the real current flows the other way — the maths still works.`,
  worked: {
    problem: 'In the diagram, 9 V feeds R1 = 1 kΩ, then node A splits into R2 = 2 kΩ and R3 = 2 kΩ to ground. Find every current and voltage.',
    steps: ['R2 ∥ R3 = 1 kΩ, so the total resistance is 2 kΩ.', 'Total current I = 9 V / 2 kΩ = 4.5 mA.', 'V_R1 = 4.5 mA × 1 kΩ = 4.5 V, so node A sits at 9 − 4.5 = 4.5 V.', 'KCL at node A: I2 = I3 = 4.5 V / 2 kΩ = 2.25 mA, and 2.25 + 2.25 = 4.5 mA ✓.'],
    answer: 'I = **4.5 mA**; V_A = **4.5 V**; I2 = I3 = **2.25 mA**. KVL: 9 − 4.5 − 4.5 = 0 ✓.',
  },
  demo: { tool: 'circuit-builder', intro: 'Build the worked example: a series resistor feeding parallel branches. Check that the branch currents add up to the total (KCL).' },
  mistakes: [['Measuring "the voltage" of a node without saying relative to what', 'Always measure node to ground (black probe on GND) unless you mean the voltage across a part.'], ['Forgetting a parallel branch when applying KCL', 'List every wire leaving the node before writing the equation.'], ['Assuming a dead circuit means a dead supply', 'Measure node by node from the supply outward — KVL tells you where the voltage disappears.']],
  check: ['kvl-1', 'kcl-1', 'kv-a'],
  challenge: { prompt: 'Diagnose the dead LED circuit in the lab using only the three meter readings and KVL.', exerciseId: 'lab-broken-circuit' },
  summary: ['KVL: rises = drops around any loop.', 'KCL: current in = current out at any node.', 'Predict node voltages relative to ground, then measure; the first disagreement locates the fault.'],
  cards: [['KVL', 'The sum of voltages around any closed loop is zero.', 'concept'], ['KCL', 'Current entering a node equals current leaving it.', 'concept']],
});

export const capsInductors = L({
  id: 'caps-inductors', title: 'Capacitors and inductors', topic: 'components', minutes: 16,
  objectives: ['Explain how capacitors and inductors store energy', 'Calculate an RC time constant and use the 5τ rule', 'Explain decoupling capacitors and inductive flyback spikes'],
  why: `Every microcontroller board has dozens of capacitors, and every motor is an inductor. Missing decoupling capacitors cause random resets; a missing flyback diode destroys transistors. Debounce filters and power supplies rely on both parts.`,
  visual: { diagram: 'rc-charge', caption: 'An RC circuit charges to 63 % in one time constant τ = RC and to over 99 % in 5τ.' },
  theory: `#### Capacitors

A capacitor stores charge: \`Q = C × V\`. Its current depends on how fast its voltage changes: \`I = C × dV/dt\`. So a capacitor **resists sudden voltage changes** — it supplies current when the voltage dips and absorbs it when the voltage spikes.

- **Decoupling:** place 100 nF ceramic capacitors right at each chip's power pins; add a bulk capacitor (10–100 µF) where power enters the board or near a motor driver.
- **RC timing:** charging through a resistor follows \`V_C = V_s(1 − e^(−t/RC))\`. One time constant \`τ = R × C\` reaches 63 %; 5τ is "fully" charged.
- **Polarised** electrolytic and tantalum capacitors must be connected the right way round — reversed, they can fail violently.

#### Inductors

An inductor stores energy in a magnetic field and **resists sudden current changes**: \`V = L × dI/dt\`. Switch off the current quickly and dI/dt is huge, so the voltage spikes — this is the flyback spike from motor and relay coils. A flyback diode across the coil gives the current a safe path.

Inductors are also the heart of buck and boost converters, and appear as ferrite beads that filter noise.`,
  worked: {
    problem: 'A button debounce filter uses 10 kΩ and 100 nF. How long until the capacitor reaches 99 % after the button is released?',
    steps: ['τ = R × C = 10 000 Ω × 100 × 10⁻⁹ F = 1 ms.', '99 % needs about 5τ (99.3 %).', '5 × 1 ms = 5 ms — longer than typical contact bounce of 1–5 ms, so the bounces are smoothed out.'],
    answer: 'About **5 ms** (5τ). Pair the filter with a Schmitt-trigger input or software debounce for a clean edge.',
  },
  tryIt: 'Charge a 100 µF capacitor through a 10 kΩ resistor from your Uno\'s 5 V (τ = 1 s) and log `analogRead()` every 100 ms. Plot the curve and find the time at 63 % (≈ 3.16 V). Compare with τ = RC and explain any difference (capacitor tolerance is often ±20 %).',
  mistakes: [['Placing the decoupling capacitor far from the chip', 'Keep it within a few millimetres of the power pin, with a short path to ground.'], ['Reversing an electrolytic capacitor', 'Check the stripe (negative) or the + marking before power-up.'], ['Switching a relay coil without a flyback diode', 'Add a diode across the coil, cathode to the positive side.']],
  check: ['comp-1', 'comp-2', 'cap-a'],
  challenge: { prompt: 'Measure the RC charging curve described in "Try it yourself" and record your measured τ against the calculated value in your notes.' },
  summary: ['Capacitors resist voltage changes; inductors resist current changes.', 'τ = RC; 63 % at τ, > 99 % at 5τ.', 'Decouple every chip; protect every coil with a flyback diode.'],
  cards: [['RC time constant', 'τ = R × C (63 % at τ, ≈ 99 % at 5τ)', 'formula'], ['Why a flyback diode?', 'A coil resists current change; switching it off causes a voltage spike the diode absorbs.', 'concept']],
});

export const diodes = L({
  id: 'diodes', title: 'Diodes and rectifiers', topic: 'components', minutes: 15,
  objectives: ['Use diode forward drops in circuit calculations', 'Explain half-wave and full-wave rectification and smoothing', 'Choose diodes for reverse protection and flyback paths'],
  why: `Diodes protect your robot from a reversed battery, absorb motor spikes, and turn AC adapters into DC. LEDs are diodes too — their forward voltage sets your resistor calculation.`,
  visual: { diagram: 'rectifier', caption: 'Half-wave rectification passes one half of each cycle; full-wave flips the negative half up. A capacitor smooths the result.' },
  theory: `A diode conducts mainly from **anode to cathode** (the stripe marks the cathode). When conducting it drops roughly a fixed voltage:

| Type | Forward drop | Typical use |
|---|---|---|
| Silicon (1N4148, 1N400x) | 0.6–0.7 V | Signals, rectifiers, flyback |
| Schottky (1N5819) | 0.2–0.4 V | Low-loss power paths, reverse protection |
| LED | 1.8–3.3 V by colour | Indicators |
| Zener | set breakdown V_Z | Voltage clamps and references (reverse-biased) |

#### Rectifiers and smoothing

- **Half-wave:** one diode, conducts on positive half-cycles only.
- **Full-wave bridge:** four diodes, both half-cycles flow the same direction — but current passes through **two** diodes, so you lose ~1.4 V.
- A smoothing capacitor holds the voltage between peaks; the remaining sag is the **ripple**.

#### Protection

- **Reverse polarity:** a series Schottky blocks current if the battery is reversed (costs ~0.3 V). A P-MOSFET does the same with almost no drop.
- **Flyback:** a diode across a coil carries the collapsing current safely.`,
  worked: {
    problem: 'A 5 V supply feeds a red LED (≈ 1.9 V) through a series silicon protection diode (≈ 0.7 V). Choose the resistor for 10 mA.',
    steps: ['Every diode in the loop takes its forward drop (KVL).', 'V_R = 5 − 0.7 − 1.9 = 2.4 V.', 'R = 2.4 V / 0.010 A = 240 Ω → choose 240 Ω (E24) or 270 Ω (E12, ≈ 8.9 mA).'],
    answer: '**240 Ω** for 10 mA (or 270 Ω for a little less). Forgetting the protection diode would give a 310 Ω answer and a dimmer LED than expected — a subtle but real bug.',
  },
  tryIt: 'Use your meter\'s diode test on a 1N4148 or 1N4007 in both directions, then on an LED (red, then another colour). Record each forward voltage. Which way does the meter show "OL"?',
  mistakes: [['Ignoring the forward drop of a series diode', 'Subtract every diode drop in the path when sizing resistors or checking supply headroom.'], ['Installing a diode backwards', 'The stripe is the cathode; the arrow in the symbol points toward it.'], ['Using a slow rectifier diode for fast switching', 'Use fast or Schottky diodes in switching converters and PWM flyback paths.']],
  check: ['comp-5', 'di-a', 'di-b'],
  challenge: { prompt: 'Design reverse-polarity protection for the robot\'s 2S battery input. Compare a series Schottky diode with a P-MOSFET: voltage lost and power wasted at 1 A.' },
  summary: ['Diodes conduct anode → cathode with a near-fixed drop.', 'Silicon ≈ 0.7 V, Schottky ≈ 0.3 V, LEDs 1.8–3.3 V.', 'Bridges lose two drops; capacitors smooth rectified ripple.'],
  cards: [['Forward drops', 'Si ≈ 0.7 V · Schottky ≈ 0.3 V · LED 1.8–3.3 V', 'concept']],
});

export const transistors = L({
  id: 'transistors', title: 'Transistors and MOSFETs', topic: 'components', minutes: 18,
  objectives: ['Use a BJT or MOSFET as a low-side switch', 'Size a BJT base resistor for saturation', 'Choose a logic-level MOSFET using R_DS(on) at the actual gate voltage'],
  why: `A GPIO pin can supply about 20 mA; a motor needs amps. Transistors let a 3.3 V signal control large loads — LEDs strips, solenoids, fans and the H-bridge inside your motor driver.`,
  visual: { diagram: 'mosfet-switch', caption: 'Low-side MOSFET switch: gate resistor, gate pull-down and a flyback diode across the motor.' },
  theory: `#### BJT (bipolar junction transistor)

A small **base current** controls a larger collector current: \`I_C ≈ β × I_B\` in the active region. As a switch you want **saturation** — overdrive the base (typically 3–10× the minimum) so V_CE drops to ~0.2 V.

\`\`\`
R_B = (V_GPIO − 0.7 V) / I_B
\`\`\`

#### MOSFET

A **gate voltage** controls the channel; the gate draws almost no steady current. Key datasheet values:

| Parameter | Meaning |
|---|---|
| V_GS(th) | Where it *starts* to conduct — not fully on |
| R_DS(on) @ V_GS | On-resistance at a given gate voltage — use your actual 3.3 V or 5 V |
| V_DS(max), I_D(max) | Voltage and current limits |

Power lost in the switch: \`P = I² × R_DS(on)\`.

#### Low-side switch checklist

- Gate (or base) resistor: 100–220 Ω limits inrush into the gate capacitance.
- Pull-down (10–100 kΩ) keeps it off while the pin floats at reset.
- Flyback diode across inductive loads.
- Common ground between the MCU and the load supply.`,
  worked: {
    problem: 'An Uno pin (5 V) drives a 12 V, 100 mA relay coil through an NPN BJT with β ≈ 100. Size the base resistor.',
    steps: ['Minimum I_B = 100 mA / 100 = 1 mA.', 'Overdrive ×5 for saturation → I_B ≈ 5 mA (still safe for the pin).', 'R_B = (5 − 0.7) V / 5 mA = 860 Ω → choose 820 Ω.', 'Add a 1N4148/1N4007 flyback diode across the relay coil.'],
    answer: '**820 Ω** base resistor (≈ 5.2 mA), plus a flyback diode. The BJT saturates with margin even if β is lower than typical.',
  },
  demo: { tool: 'ohms-law', intro: 'Use the calculator to check the base resistor and the power in the transistor\'s on-resistance (P = I² × R).' },
  mistakes: [['Choosing a MOSFET by V_GS(th) alone', 'Check R_DS(on) at your real gate voltage; a "2 V threshold" part may barely conduct at 3.3 V.'], ['No base resistor on a BJT', 'Without it the base-emitter junction draws excessive current from the pin.'], ['Separate grounds for MCU and load', 'The gate/base voltage is relative to the source/emitter — join the grounds.']],
  check: ['comp-4', 'tr-a', 'tr-b'],
  challenge: { prompt: 'Build an LED (or small fan) switched by a transistor from your Uno, then explain why the MCU pin must not drive the load directly. Upload the schematic to your notes.' },
  summary: ['BJT: base current controls collector current; overdrive for saturation.', 'MOSFET: gate voltage controls the channel; pick logic-level parts and check R_DS(on).', 'Always: gate/base resistor, pull-down, flyback diode, common ground.'],
  cards: [['BJT base resistor', 'R_B = (V_pin − 0.7) / I_B, with I_B ≈ 5 × I_C/β', 'formula'], ['MOSFET conduction loss', 'P = I² × R_DS(on) at your gate voltage', 'formula']],
});

export const pullups = L({
  id: 'pullups', title: 'Pull-up and pull-down resistors', topic: 'pullups', minutes: 12,
  objectives: ['Explain floating inputs and how pull resistors fix them', 'Choose pull-up values by current and speed', 'Account for parallel pull-ups on shared buses'],
  why: `Random readings from a button, a sensor that "sometimes" responds, an I2C bus that fails only on long wires — all can be pull-resistor problems. They look like software bugs until you measure them.`,
  visual: { diagram: 'pullup-button', caption: 'With the pull-up, the pin reads HIGH until the button connects it to ground.' },
  theory: `An input pin has extremely high impedance, so unconnected it **floats** — nearby signals and your hand can flip it.

- **Pull-up:** resistor from the pin to VCC → default HIGH. Button to GND reads LOW when pressed (active-low).
- **Pull-down:** resistor to GND → default LOW. Button to VCC reads HIGH when pressed.

#### Choosing a value

| Value | Effect |
|---|---|
| Lower (1–4.7 kΩ) | Stronger, faster edges, more current when pulled low |
| Higher (10–100 kΩ) | Less current, weaker against noise, slower edges |

Current when the button is pressed: \`I = V / R\` (10 kΩ at 5 V → 0.5 mA).

#### Internal pull-ups

Most MCUs have them (≈ 20–50 kΩ on the Uno): \`pinMode(pin, INPUT_PULLUP)\`. Fine for buttons; often too weak for fast or long I2C lines.

#### I2C

SDA and SCL are open-drain and **require** pull-ups (4.7 kΩ at 100 kHz is common). Every breakout board may add its own — parallel resistors lower the total.`,
  worked: {
    problem: 'Your robot\'s I2C bus has three breakout boards, each with 10 kΩ pull-ups, at 3.3 V. Is the bus OK?',
    steps: ['Parallel: 10 kΩ / 3 ≈ 3.3 kΩ effective pull-up.', 'Sink current when a device pulls low: 3.3 V / 3.3 kΩ = 1 mA — far below the 3 mA I2C limit.', '3.3 kΩ is a typical value for 100–400 kHz on short wires.'],
    answer: 'Yes — **≈ 3.3 kΩ** total and 1 mA sink current is fine. With ten boards (1 kΩ, 3.3 mA) you would exceed the standard-mode limit and should remove some pull-ups.',
  },
  demo: { tool: 'voltage-divider', intro: 'A pull-up and the input leakage form a divider. Set R1 to 10 kΩ and a 1 MΩ "load" to see how the pin stays close to VCC.' },
  mistakes: [['Leaving an unused input floating', 'Enable the internal pull-up or tie it to a defined level.'], ['Using INPUT_PULLUP but expecting HIGH when pressed', 'With a pull-up and button to ground, pressed = LOW.'], ['Adding pull-ups without checking the boards', 'Measure or read each breakout\'s schematic first.']],
  check: ['pu-2', 'pu-3', 'pu-b'],
  challenge: { prompt: 'Build the debounced press counter lab and compare readings with and without INPUT_PULLUP.', exerciseId: 'lab-uno-debounce' },
  summary: ['Floating inputs read random values.', 'Pull-up → default HIGH; pull-down → default LOW.', 'Parallel pull-ups on a bus combine into a smaller resistance.'],
  cards: [['Pull-up + button to GND', 'Released = HIGH, pressed = LOW (active-low)', 'concept']],
});

export const regulators = L({
  id: 'regulators', title: 'Voltage regulators and power supplies', topic: 'regulators', minutes: 16,
  objectives: ['Compare linear, buck and boost regulators', 'Calculate linear-regulator heat and switching-converter currents', 'Build a power budget and estimate battery runtime'],
  why: `Weak power causes resets, noisy readings and dead batteries — the most common reasons a robot "works on the bench but not on the floor". Your capstone robot runs a 2S lithium pack through a buck converter; choosing and checking it is your job.`,
  visual: { md: '| Type | How | Efficiency | Best for | Watch out |\n|---|---|---|---|---|\n| Linear (LDO) | Burns the difference as heat | ≈ V_out/V_in | Low current, low noise | Heat: (V_in − V_out) × I |\n| Buck | Switches + inductor, steps down | 85–95 % | Battery → 5 V / 3.3 V | Switching noise, layout |\n| Boost | Switches + inductor, steps up | 80–90 % | 1 cell → 5 V | Draws more input current |', caption: 'Choosing a regulator: heat versus noise versus efficiency.' },
  theory: `#### Linear regulators

Output current ≈ input current; the voltage difference becomes heat:

\`\`\`
P_heat = (V_in − V_out) × I
\`\`\`

8 V → 5 V at 200 mA wastes 0.6 W — the regulator gets hot. An **LDO** works with a small difference (dropout ~0.2–0.5 V).

#### Switching converters

Power in ≈ power out / efficiency:

\`\`\`
I_in = (V_out × I_out) / (η × V_in)
\`\`\`

A buck can draw *less* input current than it delivers.

#### Power budget and runtime

List each part's typical and peak current at its voltage. Then:

\`\`\`
Runtime (h) ≈ capacity (mAh) / average current (mA)
\`\`\`

Plan for less: converter losses, battery ageing and a safe low-voltage cutoff all reduce it. Check the converter can supply **peak** current (motors starting) without the voltage dipping.`,
  worked: {
    problem: 'The robot draws 5 V at an average of 0.8 A from a 7.4 V, 2500 mAh pack through a 90 %-efficient buck. Estimate runtime.',
    steps: ['P_out = 5 × 0.8 = 4 W; P_in = 4 / 0.9 ≈ 4.44 W.', 'Battery current = 4.44 W / 7.4 V ≈ 0.60 A = 600 mA.', 'Runtime ≈ 2500 / 600 ≈ 4.2 h in theory.', 'Using 80 % of capacity to stay above the safe cutoff: ≈ 3.3 h.'],
    answer: 'About **3–4 hours**. Measure the real average current with a meter or USB power monitor to replace estimates with data.',
  },
  demo: { tool: 'power', intro: 'Switch to "Linear reg." and compare the heat for 8 V → 5 V at 100 mA and at 500 mA.' },
  mistakes: [['Using a linear regulator for a large voltage drop at high current', 'Use a buck converter; calculate P_heat first.'], ['Sizing the converter for average current only', 'Check the peak current when motors start, plus margin.'], ['Measuring battery capacity as "nameplate"', 'Plan with 70–80 % usable capacity and verify with a runtime test.']],
  check: ['reg-1', 'ohm-7', 'rg-a'],
  challenge: { prompt: 'Fill in the robot power budget (ESP32, two motors, sensors) with datasheet values and estimate runtime for your chosen battery. Record it in the capstone workspace (milestone 3).' },
  summary: ['Linear: simple and quiet, wastes (V_in − V_out) × I.', 'Buck/boost: efficient, noisier; I_in = P_out / (η V_in).', 'Runtime ≈ capacity / average current — then plan for less.'],
  cards: [['Linear regulator heat', 'P = (V_in − V_out) × I', 'formula'], ['Battery runtime', 't ≈ capacity (mAh) / average current (mA)', 'formula']],
});

export const circuitDiagrams = L({
  id: 'circuit-diagrams', title: 'Reading circuit diagrams', topic: 'schematics', minutes: 12,
  objectives: ['Recognise common schematic symbols and reference designators', 'Use net labels and power symbols correctly', 'Translate a schematic to a breadboard connection by connection'],
  why: `Every module you buy — sensor breakout, motor driver, dev board — is documented with a schematic. Reading one lets you find pull-ups, voltage levels and protection parts without guessing.`,
  visual: { diagram: 'led-circuit', caption: 'A schematic shows connections, not physical layout: source, resistor and LED in one loop.' },
  theory: `#### Reference designators

| Prefix | Part |
|---|---|
| R, C, L | Resistor, capacitor, inductor |
| D, Q | Diode, transistor |
| U | Integrated circuit |
| J, P | Connector |
| SW, Y | Switch, crystal |

#### Connections

- A **dot** where lines cross means connected; no dot means they just cross.
- **Net labels** with the same name (e.g. SDA) are connected even with no line drawn.
- **Power symbols** (VCC, 3V3, 5V, VIN) and **GND** connect every point with the same name.

#### From diagram to breadboard

Don't copy the drawing's shape. Build one connection (net) at a time and tick it off on a printed copy. A breadboard's five-hole rows are connected; the long rails along the side carry power and ground.`,
  worked: {
    problem: 'A BME280 breakout schematic shows R1 and R2 (10 kΩ) from SDA and SCL to a net labelled VDD, and U2 (a regulator) feeding VDD from VIN. What does this tell you?',
    steps: ['R1/R2 are I2C pull-ups — the board already has them.', 'U2 means the board accepts a higher VIN and makes its own VDD; check its maximum input.', 'Because the pull-ups go to VDD, the I2C high level is VDD (often 3.3 V) — safe for the ESP32.'],
    answer: 'The board has its own **10 kΩ pull-ups** and a **regulator**; its I2C lines idle at VDD. Don\'t add more pull-ups unless the bus needs them.',
  },
  tryIt: 'Take any module you own (e.g. a sensor breakout) and find its schematic online. Identify: power input and regulator (if any), pull-ups, decoupling capacitors, and each pin\'s function. Write them in a table in your notes.',
  mistakes: [['Assuming crossing lines are connected', 'Look for the junction dot.'], ['Missing a net label connection', 'Search the whole sheet for every label of the same name.'], ['Copying the drawing\'s layout onto the breadboard', 'Wire net by net and tick each one off.']],
  check: ['sch-1', 'sch-2', 'sc-a'],
  challenge: { prompt: 'Redraw your LED circuit as a schematic from memory, with designators (R1, D1) and a GND symbol, and compare it with the lesson diagram.' },
  summary: ['Designators: R, C, L, D, Q, U, J.', 'Same net label = connected; dot = junction.', 'Wire net by net, not by shape.'],
  cards: [['Designator U', 'Integrated circuit', 'vocab'], ['Same net label on two wires', 'They are electrically connected', 'concept']],
});

export const schematicInterpretation = L({
  id: 'schematic-interpretation', title: 'Schematic interpretation', topic: 'schematics', minutes: 14,
  objectives: ['Apply a five-step method to any schematic', 'Predict key node voltages before measuring', 'Run a pre-power checklist on a breadboard build'],
  why: `Interpreting a schematic means predicting how the circuit behaves. Those predictions become your measurement plan — and your fastest route to the fault when something doesn't work.`,
  visual: { flow: ['Find power rails and ground', 'Find the main chip', 'Follow each signal', 'Check support parts', 'Predict key voltages, then measure'], caption: 'Five steps for reading any schematic.' },
  theory: `#### 1. Power and ground
Find every supply rail and its source. Note voltage levels — a 5 V sensor output into a 3.3 V ESP32 is a problem you can spot here.

#### 2. The main chip
Identify the microcontroller, sensor or driver and open its datasheet pinout.

#### 3. Signals
Trace each input to its output: button → pull-up → GPIO; GPIO → gate resistor → MOSFET → motor.

#### 4. Support parts
- Pull-ups/pull-downs (default states)
- Decoupling capacitors (one per power pin)
- Protection (diodes, fuses, TVS)
- Level shifters

#### 5. Predict, then measure
Write the expected voltage at each key node: supply, regulator output, idle bus lines, gate when ON/OFF.

#### Before applying power

- Supply not shorted to ground (continuity check)
- Polarised parts the right way
- Common ground between all modules
- Each module on its correct voltage`,
  worked: {
    problem: 'A MOSFET motor circuit: GPIO → 220 Ω → gate, 100 kΩ gate to GND, motor from 6 V to drain, diode across motor, source to GND. List your predictions.',
    steps: ['GPIO LOW or floating: gate ≈ 0 V (pull-down), motor off, drain ≈ 6 V.', 'GPIO HIGH (3.3 V): gate ≈ 3.3 V, MOSFET on, drain ≈ I × R_DS(on) (tens of mV).', 'Diode cathode at +6 V: reverse-biased in normal operation, conducts only on switch-off spikes.'],
    answer: 'OFF: gate **0 V**, drain **6 V**. ON: gate **3.3 V**, drain **near 0 V**. Any other reading points to the fault (e.g. drain at 6 V while ON → MOSFET not fully on or open motor).',
  },
  tryIt: 'Pick the MOSFET motor switch diagram (Phase 1 lesson "Transistors and MOSFETs") and write a predicted-voltage table for ON and OFF before building it. After building, add a "measured" column.',
  mistakes: [['Measuring without a prediction', 'Write expected values first — otherwise you can\'t tell good from bad.'], ['Skipping the pre-power checklist', 'A 30-second continuity check prevents burnt parts.'], ['Overlooking voltage-level mismatches', 'Mark every net with its voltage during step 1.']],
  check: ['sc-b', 'gnd-1', 'mm-3'],
  challenge: { prompt: 'Trace the MOSFET motor switch from Chapter 7 of the syllabus and explain each part\'s purpose in your notes.' },
  summary: ['Power → chip → signals → support parts → predictions.', 'Predictions become your measurement plan.', 'Always run the pre-power checklist.'],
  cards: [['Five-step schematic method', 'Power/ground → main chip → signals → support parts → predict & measure', 'concept']],
});

export const multimeter = L({
  id: 'multimeter', title: 'Basic multimeter usage', topic: 'multimeter', minutes: 14,
  objectives: ['Measure voltage, current, resistance and continuity safely', 'Choose the right connection and range for each measurement', 'Turn readings into component values and fault diagnoses'],
  why: `Don't guess at a hardware problem when you can measure it. The multimeter is the first tool you reach for: supply voltage, broken wires, shorts and wrong resistor values are all found in seconds.`,
  visual: { md: '| Measure | Dial | Lead socket | Connect | Circuit |\n|---|---|---|---|---|\n| Voltage | V⎓ | VΩ + COM | **Across** the part / node to GND | Powered |\n| Current | A or mA | **A/mA** + COM | **In series** (break the path) | Powered |\n| Resistance | Ω | VΩ + COM | Across the part | **Unpowered** |\n| Continuity / diode | ⟟ / beep | VΩ + COM | Across | **Unpowered** |', caption: 'How to connect the meter for each measurement.' },
  theory: `#### Habits that prevent mistakes

1. **Predict the reading first.**
2. Check the **ground** connection first — black probe on GND.
3. Change **one thing at a time**.
4. Move the red lead back to VΩ after current measurements.

#### Current measurement

The meter in current mode is nearly a short circuit. Connected *across* a supply it blows the fuse (or worse). Break the circuit and put the meter **in series**. Alternative: measure the voltage across a known resistor and use I = V / R.

#### Resistance in-circuit

Other parts in parallel distort the reading. Lift one leg or compare with the expected parallel combination.

#### Reading the display

- "OL" = over-range or open circuit.
- A negative voltage means the probes are reversed.
- Auto-ranging meters show the unit prefix (mV, kΩ) — read it carefully.

**Safety:** these labs use only low voltage. Never probe mains wiring.`,
  worked: {
    problem: 'The meter in series reads 23.0 mA in a 5 V LED circuit; the LED drops 2.0 V. You expected 9 mA with a 330 Ω resistor. What happened?',
    steps: ['Actual resistance = (5 − 2) / 0.023 ≈ 130 Ω.', '130 Ω is far below 330 Ω — likely a wrong part (brown-orange-brown = 130 Ω instead of orange-orange-brown).', 'Verify: measure the resistor alone, unpowered.'],
    answer: 'The resistor is about **130 Ω**, not 330 Ω — a colour-code mix-up. 23 mA is above a typical LED rating, so replace it.',
  },
  demo: { tool: 'resistor-color', intro: 'Compare orange-orange-brown (330 Ω) with brown-orange-brown (130 Ω) — an easy mix-up under poor light.' },
  mistakes: [['Measuring current with the meter across a supply', 'Always in series, lead in the A/mA socket.'], ['Measuring resistance with power on', 'Power off; discharge large capacitors first.'], ['Forgetting to move the lead back from the A socket', 'Make it a habit after every current measurement.']],
  check: ['mm-1', 'mm-b', 'mm-c'],
  challenge: { prompt: 'Interpret two meter readings to find a resistor\'s true value in the lab.', exerciseId: 'lab-multimeter-reading' },
  summary: ['Voltage across, current in series, resistance and continuity unpowered.', 'Predict, check ground, change one thing at a time.', 'Readings + Ohm\'s law reveal wrong parts and broken paths.'],
  cards: [['Meter connection for current', 'In series, lead in the A/mA socket', 'concept'], ['"OL" on the display', 'Over-range or open circuit', 'concept']],
});
