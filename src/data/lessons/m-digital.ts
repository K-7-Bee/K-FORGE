import type { Question } from '../types';
import { L, mc, num, out, sc, tf } from './helpers';

export const digitalLessonQuestions: Question[] = [
  num('cv-a', 'hex', 2, 'What is the 8-bit two\'s complement value of `0xFE` interpreted as `int8_t`?', -2, undefined, 'Invert 1111 1110 → 0000 0001, add 1 → 0000 0010 = 2, so the value is −2.', 0),
  out('cv-b', 'hex', 2, 'Write −1 as an 8-bit two\'s complement hex value.', 'int8_t x = -1;  // stored as 0x??', ['0xFF', '0xff', 'FF', 'ff'], '−1 is all ones: 1111 1111 = 0xFF.'),
  sc('lg-a', 'logic-gates', 1, 'Which gate outputs 1 when its inputs are **different**?', ['AND', 'OR', 'XOR', 'NAND'], 2, 'XOR (exclusive OR) is 1 for 01 and 10, 0 for 00 and 11.'),
  num('tt-a', 'boolean', 1, 'How many rows does a truth table with 4 inputs have?', 16, undefined, '2⁴ = 16 rows, listed in binary counting order.', 0),
  sc('tt-b', 'boolean', 2, 'A truth table for Y has 1s only in rows A=1,B=0 and A=1,B=1. What is the simplest expression?', ['Y = B', 'Y = A', 'Y = A·B', 'Y = A + B'], 1, 'Y is 1 whenever A = 1, regardless of B: Y = A·¬B + A·B = A(¬B + B) = A.'),
  sc('ba-a', 'boolean', 2, 'Simplify `A + A·B`.', ['A·B', 'A', 'B', 'A + B'], 1, 'Absorption: A + A·B = A(1 + B) = A.'),
  out('ba-b', 'boolean', 2, 'In C, De Morgan lets you rewrite `!(ready && enabled)`. Give the equivalent using `||`.', 'if (!(ready && enabled)) { ... }', ['!ready || !enabled', '(!ready) || (!enabled)', '!ready||!enabled'], 'De Morgan: ¬(A·B) = ¬A + ¬B → `!ready || !enabled`.'),
  sc('cb-a', 'logic-gates', 2, 'A half adder adds two bits A and B. Which gates produce the sum and the carry?', ['Sum = AND, carry = OR', 'Sum = XOR, carry = AND', 'Sum = OR, carry = XOR', 'Sum = NAND, carry = NOR'], 1, '1 + 1 = 10₂: sum bit 0 (XOR), carry 1 (AND).'),
  num('cb-b', 'logic-gates', 2, 'How many select lines does an 8-to-1 multiplexer need?', 3, undefined, '2³ = 8 inputs, so 3 select lines.', 0),
  tf('sq-a', 'sequential', 1, 'A counter is an example of sequential logic.', true, 'A counter must remember its current count between clock edges — it has state.'),
  sc('ff-a', 'sequential', 2, 'A 74HC595 shift register drives 8 LEDs. What is the main advantage?', ['It removes the need for resistors', 'It controls 8 outputs from about 3 MCU pins by shifting bits in serially', 'It doubles the LED brightness', 'It replaces the microcontroller'], 1, 'Data, clock and latch pins shift 8 bits in, then latch them to the outputs — saving GPIO pins.'),
  num('ff-b', 'sequential', 1, 'An 8-bit register is built from how many D flip-flops?', 8, undefined, 'One flip-flop stores one bit.', 0),
  mc('ds-a', 'logic-gates', 2, 'A 5 V sensor output connects to an ESP32 (3.3 V logic). Which solutions are acceptable? (select all)', ['A resistor divider for slow signals', 'A level-shifter module', 'Direct connection — it works fine', 'A 3.3 V-powered version of the sensor'], [0, 1, 3], '5 V exceeds the ESP32 input rating. Divide, level-shift, or run the sensor at 3.3 V.'),
  num('ck-a', 'sequential', 1, 'A PWM signal has a period of 2 ms. What is its frequency?', 500, 'Hz', 'f = 1/T = 1 / 0.002 s = 500 Hz.', 0),
  num('ck-b', 'sequential', 2, 'A clock is HIGH for 3 µs of each 12 µs period. What is the duty cycle?', 25, '%', 'Duty = 3 / 12 = 25 %.', 0),
];

export const conversions = L({
  id: 'conversions', title: 'Number conversions in practice', topic: 'hex', minutes: 14,
  objectives: ['Convert hex ↔ binary instantly by nibbles', 'Represent negative numbers with two\'s complement', 'Read signed sensor values from raw bytes'],
  why: `Accelerometers, temperature sensors and encoders report **signed** values as raw bytes. If you read 0xFFF6 as 65 526 instead of −10, your robot thinks it is accelerating wildly. Number conversion is a daily firmware skill, not a classroom exercise.`,
  visual: { diagram: 'binary-byte', caption: 'Each nibble (4 bits) maps to one hex digit — the fastest way to convert by eye.' },
  theory: `#### Fast conversions

- **Hex → binary:** replace each digit with 4 bits (0xC8 → 1100 1000).
- **Binary → hex:** group from the right in 4s.
- **Decimal ↔ hex:** go via binary, or divide by 16 repeatedly.

#### Two's complement (signed integers)

The MSB has a **negative** weight: for 8 bits it is −128. So \`1111 1110\` = −128 + 64 + 32 + 16 + 8 + 4 + 2 = −2.

To negate a number: **invert every bit and add 1.**

| Type | Range |
|---|---|
| int8_t | −128 … 127 |
| int16_t | −32 768 … 32 767 |
| int32_t | −2 147 483 648 … 2 147 483 647 |

#### Reading signed sensor data

\`\`\`c
uint8_t hi = 0xFF, lo = 0xF6;
int16_t raw = (int16_t)((hi << 8) | lo);   // −10
\`\`\`

Cast to the **signed** type of the right width; the bit pattern is the same, only the interpretation changes.`,
  worked: {
    problem: 'An MPU6050 returns accel X bytes 0xFC, 0x18. With a scale of 16 384 LSB/g, what acceleration is that?',
    steps: ['Combine: 0xFC18.', 'As int16_t: 0xFC18 = 64 536 − 65 536 = −1000.', 'Convert: −1000 / 16 384 ≈ −0.061 g.'],
    answer: '**−1000 LSB ≈ −0.061 g**. Reading it as unsigned (64 536) would give an impossible ≈ 3.9 g.',
  },
  demo: { tool: 'base-converter', intro: 'Enable "Show signed" and toggle the top bit: watch the signed value jump from +127 to −128.' },
  mistakes: [['Storing signed sensor data in an unsigned type', 'Use int16_t (or cast) for signed registers.'], ['Combining bytes without casting first', 'Cast to a 16-bit type before shifting.'], ['Forgetting that 0x80 as int8_t is −128', 'The MSB carries negative weight in two\'s complement.']],
  check: ['bin-7', 'cv-a', 'cv-b'],
  challenge: { prompt: 'Print a byte in binary in C — a core skill for checking register values.', exerciseId: 'lab-binary-print' },
  summary: ['Hex ↔ binary by nibbles.', 'Two\'s complement: invert and add 1; MSB weight is negative.', 'Cast raw bytes to the correct signed width.'],
  cards: [['Negate in two\'s complement', 'Invert all bits, then add 1', 'concept'], ['int16_t range', '−32 768 … 32 767', 'concept']],
});

export const logicGates = L({
  id: 'logic-gates', title: 'Logic gates', topic: 'logic-gates', minutes: 13,
  objectives: ['Recognise the seven basic gates and their truth tables', 'Explain why NAND and NOR are universal', 'Map gates to C operators'],
  why: `Gates are the hardware behind every bit operation your firmware performs. Motor-enable logic, interlocks and the C operators \`&\`, \`|\`, \`^\` and \`~\` are all gates.`,
  visual: { diagram: 'gate-symbols', caption: 'The basic gate symbols and their Boolean expressions.' },
  theory: `| A | B | AND | OR | XOR | NAND | NOR |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| 0 | 1 | 0 | 1 | 1 | 1 | 0 |
| 1 | 0 | 0 | 1 | 1 | 1 | 0 |
| 1 | 1 | 1 | 1 | 0 | 0 | 0 |

NOT has one input and inverts it. XNOR is the inverse of XOR (1 when inputs are equal).

#### Universal gates

NAND alone can build every function: NOT A = A NAND A; AND = NOT(NAND); OR = (NOT A) NAND (NOT B). The same is true for NOR. Chips are often built mostly from NANDs.

#### In C

| Gate | Bitwise | Logical |
|---|---|---|
| AND | \`a & b\` | \`a && b\` |
| OR | \`a \\| b\` | \`a \\|\\| b\` |
| XOR | \`a ^ b\` | — |
| NOT | \`~a\` | \`!a\` |

Bitwise operators work on every bit; logical operators treat the whole value as true/false.`,
  worked: {
    problem: 'Build NOT, AND and OR from NAND gates only.',
    steps: ['NOT A = A NAND A (both inputs tied together).', 'A AND B = NOT(A NAND B) = (A NAND B) NAND (A NAND B).', 'A OR B = (NOT A) NAND (NOT B) = (A NAND A) NAND (B NAND B).'],
    answer: 'NOT: **1 NAND**, AND: **2 NANDs**, OR: **3 NANDs** — proof that NAND is universal.',
  },
  demo: { tool: 'logic-gates', intro: 'Toggle A and B for each gate, then use the two-gate circuit to build OR from NANDs.' },
  mistakes: [['Confusing & with && in C', '& is bitwise (every bit); && is logical (true/false) and short-circuits.'], ['Mixing up XOR and OR for input 1,1', 'OR gives 1; XOR gives 0.'], ['Forgetting the bubble means inversion', 'A bubble on an output turns AND into NAND, OR into NOR.']],
  check: ['gate-1', 'gate-5', 'lg-a'],
  challenge: { prompt: 'Design the motor-enable logic in the lab and verify it in the truth table generator.', exerciseId: 'lab-gate-design' },
  summary: ['AND, OR, XOR, NOT, NAND, NOR, XNOR.', 'NAND and NOR are universal.', 'C: & | ^ ~ are bitwise gates; && || ! are logical.'],
  cards: [['XOR truth', '1 when inputs differ', 'concept'], ['Universal gates', 'NAND and NOR', 'concept']],
});

export const truthTables = L({
  id: 'truth-tables', title: 'Truth tables', topic: 'boolean', minutes: 12,
  objectives: ['Build a truth table for any expression', 'Read an expression from a truth table (sum of products)', 'Use truth tables to check that two expressions are equivalent'],
  why: `A truth table is the complete specification of a logic function — and the clearest way to test safety logic such as "the motor may only run if enabled, no obstacle and no e-stop". If two designs give the same table, they are interchangeable.`,
  visual: { md: '| E | O | S | M = E·¬O·¬S |\n|---|---|---|---|\n| 0 | x | x | 0 |\n| 1 | 0 | 0 | **1** |\n| 1 | 0 | 1 | 0 |\n| 1 | 1 | 0 | 0 |\n| 1 | 1 | 1 | 0 |', caption: 'Motor-enable truth table (x = either value): only one row allows the motor to run.' },
  theory: `#### Building one

1. List the inputs; an n-input function has **2ⁿ rows**.
2. Write the rows in binary counting order (000, 001, 010 …).
3. Evaluate the output for each row — break complex expressions into intermediate columns.

#### From table to expression: sum of products

For every row where the output is 1, write an AND term of the inputs (complemented when 0), then OR the terms:

\`\`\`
rows A=1,B=0 and A=1,B=1  →  Y = A·¬B + A·B  =  A
\`\`\`

The canonical form is often simplifiable with Boolean algebra (next lesson).

#### Equivalence testing

Two expressions are equivalent if and only if their tables match in **every** row. This is how you verify a simplification or a refactored \`if\` condition.`,
  worked: {
    problem: 'Build the truth table for Y = A ⊕ B and write its sum of products.',
    steps: ['2 inputs → 4 rows: 00, 01, 10, 11.', 'XOR outputs: 0, 1, 1, 0.', 'Rows with 1: A=0,B=1 → ¬A·B; A=1,B=0 → A·¬B.', 'Y = ¬A·B + A·¬B.'],
    answer: '**Y = ¬A·B + A·¬B** — the standard definition of XOR in AND/OR/NOT form.',
  },
  demo: { tool: 'truth-table', intro: 'Type an expression and compare it with a simplified version — the tool says whether they are equivalent for every input.' },
  mistakes: [['Missing rows', 'Count them: 2ⁿ rows for n inputs.'], ['Rows out of order', 'Use binary counting order so nothing is skipped.'], ['Writing product terms for 0 rows', 'Sum of products uses only the rows where the output is 1.']],
  check: ['gate-3', 'tt-a', 'tt-b'],
  challenge: { prompt: 'Use the truth table generator to prove De Morgan\'s laws: compare `!(A & B)` with `!A | !B`, and `!(A | B)` with `!A & !B`.' },
  summary: ['2ⁿ rows in binary order.', 'Sum of products: OR the AND-terms of the 1-rows.', 'Equal tables = equivalent logic.'],
  cards: [['Rows for n inputs', '2ⁿ', 'formula']],
});

export const booleanAlgebra = L({
  id: 'boolean-algebra', title: 'Boolean algebra', topic: 'boolean', minutes: 14,
  objectives: ['Apply the main Boolean identities', 'Use De Morgan\'s laws', 'Simplify logic and C conditions'],
  why: `Simpler logic means fewer gates on a PCB and clearer, less buggy \`if\` statements in firmware. De Morgan's laws in particular turn confusing negated conditions into readable ones.`,
  visual: { md: '| Law | AND form | OR form |\n|---|---|---|\n| Identity | A·1 = A | A + 0 = A |\n| Null | A·0 = 0 | A + 1 = 1 |\n| Idempotent | A·A = A | A + A = A |\n| Complement | A·¬A = 0 | A + ¬A = 1 |\n| Absorption | A·(A + B) = A | A + A·B = A |\n| De Morgan | ¬(A·B) = ¬A + ¬B | ¬(A + B) = ¬A·¬B |', caption: 'The identities you will use most.' },
  theory: `Boolean algebra follows familiar rules — commutative, associative, distributive — plus a few of its own (table above).

#### De Morgan's laws

"Break the bar, change the sign":

\`\`\`
¬(A · B) = ¬A + ¬B
¬(A + B) = ¬A · ¬B
\`\`\`

#### In code

\`\`\`c
// before
if (!(sensor_ok && link_up)) enter_safe_mode();
// after De Morgan — reads as two separate failure reasons
if (!sensor_ok || !link_up) enter_safe_mode();
\`\`\`

#### Simplification strategy

1. Expand or factor to expose common terms.
2. Apply absorption and complement laws.
3. Check the result with a truth table.`,
  worked: {
    problem: 'Simplify Y = A·B + A·¬B + ¬A·B.',
    steps: ['A·B + A·¬B = A·(B + ¬B) = A.', 'So Y = A + ¬A·B.', 'A + ¬A·B = (A + ¬A)·(A + B) = A + B (distributive law over +).'],
    answer: '**Y = A + B** — three terms reduced to a single OR gate. Verify in the truth table tool.',
  },
  demo: { tool: 'truth-table', intro: 'Enter `A&B | A&!B | !A&B` and compare with `A | B`.' },
  mistakes: [['Applying De Morgan without flipping the operator', '¬(A·B) is ¬A **+** ¬B, not ¬A·¬B.'], ['Over-simplifying without checking', 'Always confirm with a truth table.'], ['Mixing bitwise and logical NOT in C', '`!x` gives 0 or 1; `~x` flips every bit.']],
  check: ['gate-4', 'ba-a', 'ba-b'],
  challenge: { prompt: 'Find a negated condition in your own code (or the robot state machine) and rewrite it with De Morgan. Record before/after in your notes.' },
  summary: ['Identities: identity, null, idempotent, complement, absorption.', 'De Morgan: break the bar, change the sign.', 'Simplify, then verify with a truth table.'],
  cards: [['De Morgan', '¬(A·B) = ¬A + ¬B and ¬(A+B) = ¬A·¬B', 'formula'], ['Absorption', 'A + A·B = A', 'formula']],
});

export const combinational = L({
  id: 'combinational', title: 'Combinational logic', topic: 'logic-gates', minutes: 13,
  objectives: ['Define combinational logic', 'Build a half adder and describe a full adder', 'Explain multiplexers and decoders'],
  why: `Address decoders select chips, multiplexers share pins and ADC channels, adders do arithmetic inside the CPU. Recognising these blocks in datasheets ("8-channel analog mux") tells you how the hardware works.`,
  visual: { md: '| A | B | Sum (XOR) | Carry (AND) |\n|---|---|---|---|\n| 0 | 0 | 0 | 0 |\n| 0 | 1 | 1 | 0 |\n| 1 | 0 | 1 | 0 |\n| 1 | 1 | 0 | 1 |', caption: 'Half adder: 1 + 1 = binary 10, so sum 0 and carry 1.' },
  theory: `**Combinational** circuits have no memory: outputs depend only on the current inputs.

#### Adders
- **Half adder:** Sum = A ⊕ B, Carry = A · B.
- **Full adder:** adds A, B and a carry-in; chained, full adders add multi-bit numbers (a ripple-carry adder).

#### Multiplexer (mux)
Selects one of 2ⁿ inputs using n select lines. Microcontrollers use an analog mux in front of a single ADC to provide many analog channels.

#### Decoder
Turns an n-bit code into one of 2ⁿ active outputs — e.g. selecting one memory chip or one digit of a display.

#### Encoder / priority encoder
The reverse: reports which input is active (the highest priority one if several).`,
  worked: {
    problem: 'An ESP32 has one ADC with 8 channels. Explain how a single converter reads 8 pins.',
    steps: ['An analog multiplexer sits in front of the ADC.', 'Firmware sets 3 select bits (2³ = 8) to choose the channel.', 'After switching, allow settling time, then convert.'],
    answer: 'A **mux** routes one pin at a time to the ADC. That is why channel switching needs a short settling time and why readings are sequential, not simultaneous.',
  },
  demo: { tool: 'logic-gates', intro: 'Use the two-gate circuit with XOR and AND to see the half adder\'s sum and carry.' },
  mistakes: [['Thinking a mux makes channels simultaneous', 'It switches between them; readings happen one at a time.'], ['Confusing a decoder with an encoder', 'Decoder: code → one active line. Encoder: active line → code.'], ['Ignoring settling time after switching', 'Allow the input to settle before converting.']],
  check: ['cb-a', 'cb-b', 'seq-1'],
  challenge: { prompt: 'On paper, design a 2-bit adder from two full adders (or one half + one full adder) and list its truth table for 01 + 11.' },
  summary: ['Combinational = no memory.', 'Half adder: XOR sum, AND carry.', 'Mux selects, decoder activates one line.'],
  cards: [['Half adder', 'Sum = A ⊕ B, Carry = A·B', 'formula']],
});

export const sequential = L({
  id: 'sequential', title: 'Sequential logic', topic: 'sequential', minutes: 12,
  objectives: ['Distinguish sequential from combinational logic', 'Explain the role of the clock', 'Recognise counters and state machines as sequential systems'],
  why: `Anything that remembers — a counter, a register, the robot's current state — is sequential. Timers in your microcontroller are sequential counters; your firmware state machine is the software version of the same idea.`,
  visual: { diagram: 'state-machine', caption: 'A state machine: the next state depends on the current state and the input — memory plus logic.' },
  theory: `**Sequential** logic = combinational logic + **memory**. The output depends on the current inputs *and* the stored state.

#### Synchronous design
State updates only on a **clock edge**. Between edges, the logic settles; at the edge, flip-flops capture the new state. This makes timing predictable.

#### Common sequential blocks

| Block | Behaviour |
|---|---|
| Register | Stores n bits |
| Counter | Adds 1 each clock — the core of every timer |
| Shift register | Moves bits one position per clock |
| State machine | Current state + input → next state |

#### Hardware ↔ firmware

A microcontroller **timer** is a hardware counter clocked by a prescaled system clock. Your \`next_state()\` function is a software state machine evaluated each loop instead of each clock edge.`,
  worked: {
    problem: 'A 16-bit timer counts at 1 MHz and resets at 50 000. How often does it overflow?',
    steps: ['Counts per overflow: 50 000.', 'Time = 50 000 / 1 000 000 Hz = 0.05 s.', 'Frequency = 1 / 0.05 = 20 Hz.'],
    answer: 'Every **50 ms (20 Hz)** — a handy rate for a speed-control loop.',
  },
  demo: { tool: 'interrupts', intro: 'A timer interrupt is a sequential counter raising an event at a fixed period. Compare polling with an interrupt.' },
  mistakes: [['Assuming outputs change the instant inputs change', 'Synchronous outputs update at the clock edge.'], ['Forgetting the counter\'s maximum value', 'An n-bit counter wraps after 2ⁿ − 1.'], ['Treating a state machine as combinational', 'It needs stored state — a variable that persists between calls.']],
  check: ['seq-1', 'sq-a', 'sm-1'],
  challenge: { prompt: 'Implement the robot state machine in C in the lab.', exerciseId: 'lab-state-machine' },
  summary: ['Sequential = logic + memory.', 'Synchronous circuits update on clock edges.', 'Timers are counters; firmware state machines are the software version.'],
  cards: [['Sequential vs combinational', 'Sequential has memory (state); combinational depends only on current inputs', 'concept']],
});

export const flipFlops = L({
  id: 'flip-flops', title: 'Flip-flops and registers', topic: 'sequential', minutes: 13,
  objectives: ['Describe D flip-flop behaviour on a clock edge', 'Explain how registers and shift registers are built', 'Use a 74HC595 to expand outputs'],
  why: `Every peripheral register you write to (\`GPIOA->ODR\`, \`DDRB\`) is a row of flip-flops. Shift registers are also a cheap, practical way to drive many LEDs from a few pins.`,
  visual: { diagram: 'clock-wave', caption: 'A D flip-flop samples D at each rising edge (▲) and holds Q until the next one.' },
  theory: `#### D flip-flop

On the active (usually rising) clock edge, **Q takes the value of D** and holds it until the next edge. Changes on D between edges are ignored.

Timing requirements: D must be stable for a **setup time** before and a **hold time** after the edge.

#### Registers
n flip-flops sharing a clock store an n-bit word. An 8-bit MCU register is 8 flip-flops; writing \`PORTB = 0x20\` loads all 8 at once.

#### Shift registers (74HC595)

| Pin | Role |
|---|---|
| SER (data) | Next bit |
| SRCLK (shift clock) | Shift one position per rising edge |
| RCLK (latch) | Copy the 8 shifted bits to the outputs |

\`\`\`c
digitalWrite(LATCH, LOW);
shiftOut(DATA, CLOCK, MSBFIRST, pattern);
digitalWrite(LATCH, HIGH);   // outputs update together
\`\`\`

Daisy-chain several 595s for 16, 24 … outputs from the same three pins.`,
  worked: {
    problem: 'You want LEDs 7, 5 and 0 on a 74HC595 (bit 7 = first shifted with MSBFIRST). What byte do you shift?',
    steps: ['Set bits 7, 5, 0: 1010 0001.', 'In hex: 0xA1.', 'shiftOut(…, MSBFIRST, 0xA1) then pulse the latch.'],
    answer: 'Shift **0xA1** — then latch, so all eight outputs change at the same moment.',
  },
  demo: { tool: 'bitwise', intro: 'Use OR masks to build the byte 0xA1 bit by bit.' },
  mistakes: [['Forgetting to latch the 595', 'Outputs only update on the RCLK rising edge.'], ['Changing D right at the clock edge', 'Respect setup and hold times — in firmware, set data before toggling the clock.'], ['Wrong bit order', 'Match MSBFIRST/LSBFIRST to how your LEDs are wired.']],
  check: ['seq-2', 'ff-a', 'ff-b'],
  challenge: { prompt: 'If you have a 74HC595, drive 8 LEDs from 3 Uno pins and show a running-light pattern without delay(). Otherwise, write the code and simulate the byte sequence on paper.' },
  summary: ['D flip-flop: Q ← D on the clock edge, then holds.', 'Registers are rows of flip-flops.', '74HC595: shift in serially, latch to outputs.'],
  cards: [['D flip-flop', 'Copies D to Q on the active clock edge and holds it', 'concept']],
});

export const digitalSignals = L({
  id: 'digital-signals', title: 'Digital signals and logic levels', topic: 'logic-gates', minutes: 12,
  objectives: ['Read V_IL, V_IH, V_OL and V_OH from a datasheet', 'Explain why 5 V and 3.3 V logic need level shifting', 'Choose a level-shifting method'],
  why: `Connecting a 5 V sensor directly to an ESP32 can damage the pin or give random readings. Checking logic levels before wiring is one of the cheapest habits in embedded work.`,
  visual: { md: '| Family | Supply | V_OH (min) | V_IH (min) | V_IL (max) | V_OL (max) |\n|---|---|---|---|---|---|\n| 5 V CMOS (Uno) | 5 V | ≈ 4.2 V | ≈ 3.0 V | ≈ 1.5 V | ≈ 0.7 V |\n| 3.3 V (ESP32) | 3.3 V | ≈ 2.6 V | ≈ 2.5 V | ≈ 0.8 V | ≈ 0.4 V |', caption: 'Typical thresholds — always confirm in the datasheet\'s electrical characteristics.' },
  theory: `A digital input reads LOW below **V_IL(max)** and HIGH above **V_IH(min)**. Between them is undefined: the pin may read either value or oscillate.

An output guarantees at least **V_OH(min)** when HIGH and at most **V_OL(max)** when LOW.

**Compatibility rule:** driver V_OH ≥ receiver V_IH, driver V_OL ≤ receiver V_IL, and the driver's HIGH must not exceed the receiver's absolute maximum input.

#### 3.3 V → 5 V
3.3 V HIGH often meets a 5 V CMOS input's V_IH (≈ 3.0 V) only marginally — check the datasheet.

#### 5 V → 3.3 V (the dangerous direction)

| Method | Good for |
|---|---|
| Resistor divider (1 k / 2 k) | Slow one-way signals (ECHO, UART RX) |
| MOSFET level shifter (BSS138) | I2C and bidirectional lines |
| Logic buffer (74LVC245, TXS0108) | Fast or many lines |
| Run the sensor at 3.3 V | When the sensor supports it |`,
  worked: {
    problem: 'An HC-SR04 ECHO pin outputs 5 V. Design a divider for an ESP32 input.',
    steps: ['Target ≤ 3.3 V: V_out = 5 × R2 / (R1 + R2).', 'R1 = 1 kΩ, R2 = 2 kΩ → 3.33 V.', 'Check the ESP32 V_IH (≈ 2.5 V): 3.33 V is a clear HIGH; 0 V is LOW.'],
    answer: '**1 kΩ (top) / 2 kΩ (bottom)** gives ≈ 3.3 V — safe and correctly read. Fine for ECHO, too slow for fast SPI.',
  },
  demo: { tool: 'voltage-divider', intro: 'Set 5 V input, 1 kΩ and 2 kΩ, then add the ESP32 input as a very large load (e.g. 1 MΩ).' },
  mistakes: [['Assuming any HIGH is compatible', 'Compare V_OH with V_IH and the absolute maximum.'], ['Using a divider on a bidirectional bus', 'Use a MOSFET level shifter for I2C.'], ['Feeding a mid-range voltage to a digital input', 'Undefined region: unreliable readings.']],
  check: ['lvl-1', 'esp-1', 'ds-a'],
  challenge: { prompt: 'Diagnose the erratic distance sensor on the ESP32 in the lab.', exerciseId: 'lab-level-debug' },
  summary: ['Inputs: V_IL / V_IH; outputs: V_OL / V_OH.', '5 V → 3.3 V needs a divider, shifter or buffer.', 'Check levels before wiring any new module.'],
  cards: [['V_IH', 'Minimum input voltage guaranteed to read HIGH', 'vocab'], ['Level shift for I2C', 'MOSFET (BSS138) bidirectional shifter', 'concept']],
});

export const clockSignals = L({
  id: 'clock-signals', title: 'Clock signals', topic: 'sequential', minutes: 11,
  objectives: ['Relate frequency, period and duty cycle', 'Explain prescalers and derived clocks', 'Calculate timer periods from clock settings'],
  why: `The CPU, timers, PWM, UART baud rates and I2C all run from clocks. Getting a prescaler wrong makes your PWM inaudible or your UART garbled — and the fix starts with \`f = 1/T\`.`,
  visual: { diagram: 'clock-wave', caption: 'Period T, high time and rising edges of a clock.' },
  theory: `\`\`\`
f = 1 / T          duty = t_high / T
\`\`\`

| Clock | Period |
|---|---|
| 16 MHz (Uno) | 62.5 ns |
| 84 MHz (STM32 timer) | ≈ 11.9 ns |
| 240 MHz (ESP32 CPU) | ≈ 4.17 ns |

#### Prescalers
Peripherals divide the system clock: \`f_timer = f_clk / prescaler\`. A timer then counts to its reload value:

\`\`\`
f_overflow = f_clk / ((PSC + 1) × (ARR + 1))     (STM32 convention)
\`\`\`

#### Clock sources
Internal RC oscillators are convenient but drift (±1–2 %); crystals are accurate (±20–50 ppm) — important for UART at high baud and for USB.`,
  worked: {
    problem: 'An Uno Timer1 runs at 16 MHz with a prescaler of 64. What counter value gives a 10 ms period?',
    steps: ['Timer clock = 16 MHz / 64 = 250 kHz → 4 µs per count.', '10 ms / 4 µs = 2500 counts.', 'Compare-match value (CTC mode) = 2500 − 1 = 2499.'],
    answer: '**2499** (2500 counts of 4 µs). Fits easily in the 16-bit Timer1.',
  },
  demo: { tool: 'pwm', intro: 'Change the frequency and duty cycle and read the period and high time.' },
  mistakes: [['Off-by-one in timer reload values', 'Many timers count from 0, so use N − 1.'], ['Mixing ms and µs', 'Convert everything to seconds first.'], ['Relying on an internal RC oscillator for precise timing', 'Use a crystal when timing accuracy matters.']],
  check: ['seq-3', 'ck-a', 'ck-b'],
  challenge: { prompt: 'Calculate the STM32 PSC/ARR for a 1 kHz PWM in the lab.', exerciseId: 'lab-timer-calc' },
  summary: ['f = 1/T; duty = t_high/T.', 'Prescalers divide the clock; counters set the period.', 'Watch for N − 1 in reload values.'],
  cards: [['Timer overflow frequency (STM32)', 'f = f_clk / ((PSC+1)(ARR+1))', 'formula'], ['Period of 16 MHz', '62.5 ns', 'concept']],
});
