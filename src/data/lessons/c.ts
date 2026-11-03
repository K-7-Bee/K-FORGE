import type { Lesson } from '../types';

export const cTypes: Lesson = {
  id: 'c-types',
  title: 'C variables and data types',
  minutes: 18,
  status: 'full',
  topic: 'c-types',
  objectives: [
    'Declare and initialise variables with appropriate types',
    'Use exact-width types from <stdint.h> and explain why',
    'Predict integer division, overflow and conversion results',
    'Choose a type from a value\'s range and units',
  ],
  why: `On a laptop you rarely think about how big an \`int\` is. In firmware it decides whether code works. A plain \`int\` is **16 bits on the Uno** but **32 bits on the ESP32** — the same timing code can overflow on one board and work on another.

Every sensor reading, register value and timestamp in the air-quality robot has a type chosen from its range: \`uint16_t\` for CO₂ ppm, \`int16_t\` for temperature in tenths of a degree, \`uint32_t\` for milliseconds.`,
  visual: { diagram: 'c-types', caption: 'Exact-width integer types and their sizes in memory. A uint8_t occupies one byte; a uint32_t occupies four.' },
  theory: `A **variable** is a named piece of memory with a **type**, which fixes its size and how its bits are interpreted.

\`\`\`c
#include <stdint.h>

uint16_t co2_ppm = 650;        // 0 … 65 535
int16_t  temp_tenths_c = 235;  // 23.5 °C stored as an integer
uint32_t uptime_ms = 0;        // ~49.7 days before wrap-around
float    voltage = 3.3f;       // approximate decimals
\`\`\`

| Type | Bits | Range | Typical use |
|---|---|---|---|
| uint8_t | 8 | 0 … 255 | Register values, raw bytes |
| int16_t | 16 | −32 768 … 32 767 | Signed sensor readings |
| uint16_t | 16 | 0 … 65 535 | ADC and CO₂ readings |
| uint32_t | 32 | 0 … 4 294 967 295 | Time in milliseconds |
| float | 32 | ~7 significant digits | Calculations where rounding is acceptable |

#### Four traps to remember

| Code | Result | Why |
|---|---|---|
| \`int x = 7 / 2;\` | 3 | Integer division drops the fraction |
| \`uint8_t x = 255; x = x + 1;\` | 0 | Unsigned values wrap around |
| \`if (n = 0)\` | false, n becomes 0 | \`=\` assigns, \`==\` compares |
| \`readings[3]\` on a 3-item array | undefined behaviour | Valid indexes are 0, 1, 2 |

#### Fixed-point instead of float

Storing 23.5 °C as \`int16_t 235\` (tenths) keeps arithmetic exact and fast — important on the Uno, which has no floating-point hardware.

Compile with warnings on: \`gcc -std=c11 -Wall -Wextra main.c -o main\`. The compiler catches many of these traps for you.`,
  worked: {
    problem: 'Compute the average of {230, 235, 240} (temperature in tenths of °C) and print it with one decimal.',
    steps: [
      '**Accumulate in a wider type:** the sum (705) fits in int16_t here, but for long arrays it could overflow — use `int32_t sum`.',
      '**Avoid integer division:** `sum / count` would give 235. Cast first: `(float)sum / count` = 235.0.',
      '**Convert units for display:** 235.0 tenths = 23.5 °C → `printf("%.1f", avg / 10.0f)`.',
    ],
    answer: '```c\nint32_t sum = 0;\nfor (size_t i = 0; i < count; i++) sum += readings[i];\nfloat avg_c = ((float)sum / count) / 10.0f;   // 23.5\n```',
  },
  demo: {
    tool: 'memory-layout',
    intro: 'See where variables of different types and storage classes live in memory, and how many bytes each one takes.',
  },
  mistakes: [
    { mistake: 'Using int for a millisecond timestamp on the Uno', fix: 'int is 16 bits there and overflows after 32.7 s. Use uint32_t.' },
    { mistake: 'Expecting 7 / 2 to be 3.5', fix: 'At least one operand must be floating point: 7.0f / 2.' },
    { mistake: 'Storing a value larger than the type\'s range', fix: 'Choose the type from the value\'s full range, including worst cases.' },
    { mistake: 'Comparing floats with ==', fix: 'Compare with a tolerance: fabsf(a - b) < 0.001f.' },
  ],
  check: ['ct-1', 'ct-2', 'ct-3'],
  challenge: {
    prompt: 'Write min_value, max_value and average functions for an array of int16_t readings, and print them for given input.',
    exerciseId: 'lab-c-stats',
  },
  summary: [
    'A type fixes size and interpretation; use <stdint.h> exact-width types in firmware.',
    'Integer division truncates; unsigned overflow wraps.',
    'Store fractional sensor values as scaled integers when you can.',
    'Compile with -Wall -Wextra and read every warning.',
  ],
  flashcards: [
    { id: 'fc-int-size', front: 'Size of plain int on the Uno vs ESP32', back: '16 bits on the Uno, 32 bits on the ESP32 — use int16_t/int32_t.', kind: 'concept', topic: 'c-types' },
    { id: 'fc-intdiv', front: 'int x = 7 / 2;  → x = ?', back: '3 (integer division truncates).', kind: 'code', topic: 'c-types' },
    { id: 'fc-wrap', front: 'uint8_t x = 255; x++;  → x = ?', back: '0 (unsigned wrap-around).', kind: 'code', topic: 'c-types' },
  ],
};

export const cControl: Lesson = {
  id: 'c-control',
  title: 'C conditions and loops',
  minutes: 18,
  status: 'full',
  topic: 'c-control',
  objectives: [
    'Write if / else if / else chains and switch statements correctly',
    'Choose between for, while and do-while loops',
    'Use break and continue deliberately',
    'Replace blocking delays with elapsed-time checks',
  ],
  why: `Control flow is how firmware decides: *is the obstacle closer than 20 cm? has 5 seconds passed since the last CO₂ sample? which state is the robot in?* Loops process arrays of readings, retry I2C transactions, and form the main \`loop()\` that runs forever.

Two bugs in this area — \`=\` instead of \`==\`, and a missing \`break\` in a \`switch\` — have caused real product failures. Learning to spot them is a core debugging skill.`,
  visual: { diagram: 'loop-flow', caption: 'A for loop: initialise once, test the condition before each pass, run the body, then update. When the condition is false, execution continues after the loop.' },
  theory: `#### Conditions

\`\`\`c
if (distance_cm < 10) {
    stop_motors();
} else if (distance_cm < 30) {
    slow_down();
} else {
    drive();
}
\`\`\`

In C, **0 is false and any non-zero value is true**. Comparison operators: \`== != < > <= >=\`. Logical: \`&& || !\` (they short-circuit: in \`p != NULL && *p > 0\`, \`*p\` is only evaluated when p is valid).

#### switch

\`\`\`c
switch (state) {
    case STATE_IDLE:    handle_idle();    break;
    case STATE_DRIVING: handle_driving(); break;
    default:            handle_error();   break;
}
\`\`\`

Without \`break\`, execution **falls through** to the next case.

#### Loops

| Loop | Use when | Example |
|---|---|---|
| for | You know the count | Process 10 readings |
| while | Repeat while a condition holds | Wait for data (with a timeout!) |
| do-while | Body must run at least once | Read until a valid frame |

\`break\` leaves the loop; \`continue\` skips to the next iteration.

#### Timing without delay()

\`delay()\` stops the program. Use elapsed time instead, so the loop can keep reacting:

\`\`\`c
uint32_t now = millis();
if (now - last_sample_ms >= SAMPLE_MS) {
    last_sample_ms = now;
    take_sample();
}
\`\`\`

The unsigned subtraction keeps working when \`millis()\` wraps after ~49 days.`,
  worked: {
    problem: 'Print min, max and average every 10 readings without using delay().',
    steps: [
      '**State:** keep `count`, `sum`, `min`, `max` as static or global variables.',
      '**Each reading:** update sum, compare with min and max, increment count.',
      '**Every 10th reading:** `if (count == 10)` print the results and reset the state.',
      '**Pacing:** take one reading when `now - last_ms >= 100`, so 10 readings take one second and the loop never blocks.',
    ],
    answer: '```c\nif (now - last_ms >= 100) {\n    last_ms = now;\n    int16_t r = read_sensor();\n    sum += r; if (r < mn) mn = r; if (r > mx) mx = r;\n    if (++count == 10) { report(mn, mx, sum / 10); reset(); }\n}\n```',
  },
  demo: {
    tool: 'interrupts',
    intro: 'This timeline shows a main loop running while events arrive. Compare a blocking delay with the elapsed-time pattern to see why events can be missed.',
  },
  mistakes: [
    { mistake: 'if (n = 0) instead of if (n == 0)', fix: 'Enable -Wall; some engineers write constants first: if (0 == n).' },
    { mistake: 'Off-by-one: for (i = 0; i <= N; i++) over an N-element array', fix: 'Use i < N. Valid indexes are 0 … N−1.' },
    { mistake: 'Forgetting break in switch', fix: 'End every case with break, or comment an intentional fall-through.' },
    { mistake: 'while (!sensor_ready()); with no timeout', fix: 'Add a timeout so a missing sensor cannot hang the firmware forever.' },
  ],
  check: ['cl-1', 'cl-2', 'cl-4'],
  challenge: {
    prompt: 'Classify a list of distance readings into STOP / SLOW / GO using conditions and a loop.',
    exerciseId: 'lab-c-classify',
  },
  summary: [
    '0 is false; non-zero is true. && and || short-circuit.',
    'switch needs break, or execution falls through.',
    'for when you know the count; while for conditions — always with a timeout.',
    'Prefer elapsed-time checks over delay() so firmware stays responsive.',
  ],
  flashcards: [
    { id: 'fc-fallthrough', front: 'What happens if a switch case has no break?', back: 'Execution falls through into the next case.', kind: 'code', topic: 'c-control' },
    { id: 'fc-millis', front: 'Non-blocking timing pattern', back: 'if (now - last >= PERIOD) { last = now; … }', kind: 'code', topic: 'c-control' },
  ],
};

export const cPointers: Lesson = {
  id: 'c-pointers',
  title: 'C pointers',
  minutes: 20,
  status: 'full',
  topic: 'c-pointers',
  objectives: [
    'Explain what a pointer stores and draw the memory diagram',
    'Use & and * correctly',
    'Pass pointers so a function can modify the caller\'s variables',
    'Recognise NULL, dangling and out-of-bounds pointer bugs',
  ],
  why: `Most hard C bugs involve memory — so this is the lesson to learn slowly. Pointers are everywhere in embedded code: drivers return a status and write the reading through a pointer, DMA is configured with buffer addresses, and hardware registers are accessed through pointers to fixed addresses (\`GPIOA->ODR\`).

Interviewers for embedded roles ask about pointers more than almost any other C topic.`,
  visual: { diagram: 'pointer-memory', caption: 'q holds the value 5 at address 0x2000. p holds the address 0x2000, so *p reads or writes q.' },
  theory: `A **pointer** is a variable that holds an **address**.

\`\`\`c
int q = 5;
int *p = &q;   // & = "address of":  p now holds q's address
*p = 6;        // * = "the thing at": writes 6 into q
\`\`\`

#### Why pointers matter: pass by reference

C passes **copies** of arguments into functions:

\`\`\`c
void add_one(int x)      { x = x + 1; }    // changes only the copy
void add_one_ptr(int *x) { *x = *x + 1; }  // changes the original
\`\`\`

\`add_one(q)\` leaves q at 5; \`add_one_ptr(&q)\` makes it 6.

#### Return a status and a value

\`\`\`c
typedef enum { SENSOR_OK, SENSOR_ERROR } SensorStatus;

SensorStatus read_temperature(int16_t *out_tenths_c) {
    if (out_tenths_c == NULL) return SENSOR_ERROR;
    *out_tenths_c = 235;          // 23.5 °C
    return SENSOR_OK;
}
\`\`\`

#### Pointers and arrays

An array passed to a function becomes a pointer to its first element, so always pass the length too. \`p + 2\` points two **elements** further (not two bytes): \`*(p + 2)\` is the same as \`p[2]\`.

#### Mistakes to avoid

| Mistake | What can happen | Safer habit |
|---|---|---|
| Uninitialised pointer | Writes to a random address | Initialise to a valid address or NULL |
| Dereferencing NULL | Crash / hard fault | Check before use |
| Returning address of a local | Memory no longer valid | Caller provides the buffer |
| Writing past an array end | Corrupts nearby data | Pass and check the length |`,
  worked: {
    problem: 'Write swap(), which exchanges two integers in the caller.',
    steps: [
      '**Signature:** the function must modify the caller\'s variables, so it takes their addresses: `void swap(int *a, int *b)`.',
      '**Body:** save one value through its pointer, then copy across: `int tmp = *a; *a = *b; *b = tmp;`',
      '**Call site:** pass addresses: `swap(&x, &y);`',
      '**Defensive version:** `if (a == NULL || b == NULL) return;` before dereferencing.',
    ],
    answer: '```c\nvoid swap(int *a, int *b) {\n    if (a == NULL || b == NULL) return;\n    int tmp = *a;\n    *a = *b;\n    *b = tmp;\n}\n```',
  },
  demo: {
    tool: 'memory-layout',
    intro: 'Explore where locals, globals and heap allocations live. Notice that a local\'s address belongs to a stack frame that disappears when the function returns.',
  },
  mistakes: [
    { mistake: 'int *p; *p = 5; — uninitialised pointer', fix: 'Point it at real storage first: int x; int *p = &x;' },
    { mistake: 'Confusing p (the address) with *p (the value)', fix: 'Say it aloud: "p is where; *p is what\'s there".' },
    { mistake: 'Returning &local_variable', fix: 'Have the caller pass a buffer pointer and length.' },
    { mistake: 'sizeof(array) inside a function to get its length', fix: 'Inside the function it is a pointer: sizeof gives the pointer size. Pass the length.' },
  ],
  check: ['ptr-1', 'ptr-2', 'ptr-4'],
  challenge: {
    prompt: 'Find and fix a pointer bug in a function that should fill a caller-provided buffer with readings.',
    exerciseId: 'lab-c-pointer-debug',
  },
  summary: [
    'A pointer holds an address; & takes an address; * dereferences.',
    'Pass pointers when a function must modify the caller\'s data.',
    'Arrays decay to pointers — always pass the length.',
    'Check for NULL, never return addresses of locals, never write past the end.',
  ],
  flashcards: [
    { id: 'fc-amp-star', front: '& and * in C', back: '&x = address of x;  *p = value at the address in p.', kind: 'code', topic: 'c-pointers' },
    { id: 'fc-decay', front: 'What does a function receive when you pass an array?', back: 'A pointer to its first element (so pass the length too).', kind: 'concept', topic: 'c-pointers' },
    { id: 'fc-dangling', front: 'Why never return the address of a local variable?', back: 'Its stack frame ends at return; the pointer dangles.', kind: 'concept', topic: 'c-pointers' },
  ],
};
