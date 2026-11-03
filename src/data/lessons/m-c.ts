import type { Question } from '../types';
import { L, mc, num, out, sc, tf } from './helpers';

export const cLessonQuestions: Question[] = [
  sc('cf-a', 'c-types', 1, 'Where does every C program begin executing?', ['At the first line of the file', 'In the function main', 'In the first #include', 'In setup()'], 1, 'Execution starts at main. (On Arduino, a hidden main calls setup() once and loop() forever.)'),
  sc('cf-b', 'c-debugging', 1, 'The compiler reports 14 errors. Which should you fix first?', ['The last one', 'The first one', 'The longest one', 'Any — they are independent'], 1, 'Later errors are often consequences of the first (e.g. a missing semicolon). Fix the first, recompile.'),
  out('fn-a', 'c-control', 1, 'What does this print?', 'int square(int x) { return x * x; }\n\nint main(void) {\n    int a = 3;\n    printf("%d %d", square(a + 1), a);\n}', ['16 3'], 'square receives 4 and returns 16; a is unchanged (passed by value).'),
  tf('fn-b', 'c-control', 2, 'A C function declared `int f(void);` can be called before its definition appears, as long as the prototype is visible.', true, 'The prototype tells the compiler the signature; the definition can come later or in another file.'),
  out('as-a', 'c-pointers', 1, 'How many bytes does this array use? (answer with a number)', 'char msg[] = "CO2";', ['4'], '"CO2" is 3 characters plus the terminating \'\\0\' = 4 bytes.'),
  sc('as-b', 'c-pointers', 2, 'Why use `snprintf(buf, sizeof(buf), ...)` instead of `sprintf(buf, ...)`?', ['It is faster', 'It never writes past the end of buf, truncating if needed', 'It supports floats', 'It allocates memory'], 1, 'snprintf respects the buffer size — preventing buffer overflows.'),
  num('st-a', 'c-structs', 2, 'On a 32-bit MCU, `struct { uint8_t a; uint32_t b; }` usually has what sizeof? (bytes)', 8, undefined, 'The compiler adds 3 padding bytes after a so b is 4-byte aligned: 1 + 3 + 4 = 8.', 0),
  out('st-b', 'c-structs', 1, 'What does this print?', 'typedef enum { LINK_DOWN, LINK_CONNECTING, LINK_UP } LinkState;\nprintf("%d", LINK_UP);', ['2'], 'Enumerators count from 0 by default: DOWN = 0, CONNECTING = 1, UP = 2.'),
  sc('mm-a1', 'c-pointers', 2, 'Why do small-MCU projects prefer fixed-size buffers over repeated malloc/free?', ['malloc is not available in C', 'Heap fragmentation can make allocation fail unpredictably after hours of running', 'Fixed buffers are always smaller', 'free() is too slow'], 1, 'With 2 KB RAM, fragmentation can leave no contiguous block even when total free memory looks sufficient.'),
  tf('mm-a2', 'c-pointers', 1, 'You must check the pointer returned by malloc against NULL before using it.', true, 'malloc returns NULL when it cannot allocate.'),
  sc('sh-a', 'c-pointers', 2, 'A function declares `uint8_t buf[1500];` as a local on an Arduino Uno. What is the main risk?', ['Nothing — locals are free', 'Stack overflow: the 1.5 KB frame eats most of the 2 KB RAM', 'It goes into flash', 'The array is zero-initialised slowly'], 1, 'Locals live on the stack; a large local array can collide with globals and the heap.'),
  sc('sh-b', 'c-pointers', 1, 'Which variable is stored on the stack?', ['A global int', 'A static local', 'A non-static local inside a function', 'A string literal'], 2, 'Ordinary locals are in the function\'s stack frame; globals and statics live in .data/.bss.'),
  out('bw-a', 'c-bitwise', 2, 'What does this print?', 'uint8_t reg = 0x5A;\nreg &= ~(1u << 1);\nreg |= (1u << 7);\nprintf("0x%02X", reg);', ['0xD8'], '0x5A = 0101 1010. Clear bit 1 → 0101 1000 (0x58). Set bit 7 → 1101 1000 = 0xD8.'),
  sc('hd-a', 'c-modules', 2, 'Where should the definition `int g_count = 0;` go if two .c files need it?', ['In the header file', 'In one .c file, with `extern int g_count;` in the header', 'In both .c files', 'In main only, with no declaration'], 1, 'Define once in a .c file; declare it extern in the header. Defining in a header creates duplicate definitions.'),
  sc('md-a', 'c-modules', 2, 'In `filter.c`, why is the buffer declared `static uint16_t buffer[4];` at file scope?', ['To make it constant', 'So only filter.c can access it — callers must use filter_add()', 'To put it on the stack', 'To make it volatile'], 1, 'File-scope static gives internal linkage: the module\'s state is private.'),
  out('kw-a1', 'c-keywords', 2, 'What does this print after calling counter() three times?', 'int counter(void) {\n    static int calls = 0;\n    return ++calls;\n}\n// counter(); counter(); printf("%d", counter());', ['3'], 'A static local keeps its value between calls: 1, 2, 3.'),
  sc('kw-a2', 'c-keywords', 2, 'Which declaration describes a hardware status register that may change on its own and must not be written by the code?', ['const uint32_t *reg', 'volatile const uint32_t *reg', 'static uint32_t *reg', 'uint32_t reg'], 1, 'volatile: always re-read; const: the code may not write through this pointer.'),
  sc('smx-a', 'state-machines', 2, 'Why should the robot\'s state machine avoid long delay() calls inside states?', ['delay() uses too much flash', 'The machine cannot react to events such as an obstacle while blocked', 'delay() resets the state', 'States must be under 1 ms'], 1, 'A blocking delay freezes event handling. Use elapsed-time checks instead.'),
  out('smx-b', 'state-machines', 2, 'Using the robot state machine, which state follows: IDLE → start → point → stop?', 'IDLE --start--> ? --point--> ? --stop--> ?', ['IDLE'], 'start → DRIVING, point → SAMPLING, stop (from any state) → IDLE.'),
  mc('db-a', 'c-debugging', 2, 'Which are good debugging habits? (select all)', ['Reproduce the problem with exact steps', 'Change several things at once to save time', 'Test one hypothesis at a time', 'Add a test for the bug after fixing it'], [0, 2, 3], 'Changing several things at once hides which change mattered.'),
];

export const cFundamentals = L({
  id: 'c-fundamentals', title: 'Programming fundamentals', topic: 'c-types', minutes: 13,
  objectives: ['Write, compile and run a C program from a blank file', 'Read compiler errors and warnings efficiently', 'Explain how Arduino setup()/loop() relates to main()'],
  why: `Firmware engineers spend their day in a compile-run-fix loop. Being fast and calm with compiler messages — and compiling with warnings on — prevents whole classes of bugs before the code ever reaches the board.`,
  visual: { flow: ['Write main.c', 'gcc -std=c11 -Wall -Wextra', 'Read first error / warning', 'Fix and recompile', 'Run and compare with prediction'], caption: 'The compile–run–fix loop.' },
  theory: `\`\`\`c
#include <stdio.h>

int main(void) {
    printf("Hello, K-FORGE\\n");
    return 0;          // 0 = success
}
\`\`\`

\`\`\`
gcc -std=c11 -Wall -Wextra main.c -o main
./main
\`\`\`

#### Anatomy
- \`#include\` pulls in declarations (stdio.h gives printf).
- \`main\` is the entry point; its return value is the exit status.
- Statements end with \`;\`; blocks use \`{ }\`.

#### Errors vs warnings
- **Errors** stop compilation (syntax, unknown names).
- **Warnings** compile but flag likely bugs (\`if (n = 0)\`, unused variables, sign comparison). Treat them as errors: \`-Werror\`.
- Read the **first** message first — later ones often cascade from it.

#### Arduino
Arduino hides \`main\`: the core calls \`init()\`, your \`setup()\` once, then \`loop()\` forever. It is still C/C++.`,
  worked: {
    problem: 'This fails to compile with several errors. Fix it:\n\n```c\n#include <stdio.h>\nint main(void) {\n    int total = 5\n    printf("%d\\n", total);\n    return 0;\n}\n```',
    steps: ['The first error points at the printf line: "expected \';\' before printf".', 'The real problem is the line above: `int total = 5` is missing its semicolon.', 'Add the semicolon; the other errors disappear too.'],
    answer: '`int total = 5;` — one missing semicolon caused every error. The compiler reports where it *noticed* the problem, often one line late.',
  },
  tryIt: 'Install a C compiler (gcc via MSYS2/MinGW on Windows, or use WSL), compile the hello program with `-Wall -Wextra`, then introduce three deliberate bugs (missing semicolon, undeclared variable, `if (x = 0)`) and read each message.',
  mistakes: [['Ignoring warnings because the code compiled', 'Warnings mark likely bugs — fix them or use -Werror.'], ['Fixing the last error first', 'Start with the first message and recompile.'], ['Forgetting \\n in printf', 'Output may stay buffered and appear late or not at all.']],
  check: ['cf-a', 'cf-b', 'cl-8'],
  challenge: { prompt: 'Write the min/max/average program from a blank file (no copying) and pass its tests.', exerciseId: 'lab-c-stats' },
  summary: ['main is the entry point; compile with -Wall -Wextra.', 'Fix the first error first.', 'Arduino setup()/loop() is called from a hidden main.'],
  cards: [['Compile with warnings', 'gcc -std=c11 -Wall -Wextra main.c -o main', 'code']],
});

export const cFunctions = L({
  id: 'c-functions', title: 'Functions', topic: 'c-control', minutes: 14,
  objectives: ['Declare, define and call functions with prototypes', 'Explain pass-by-value', 'Design small functions that return status codes'],
  why: `Readable firmware is a set of small functions with clear names: \`read_temperature\`, \`clamp_speed\`, \`publish_sample\`. Small functions are also testable on a laptop — the basis of unit testing.`,
  visual: { flow: ['Prototype in .h', 'Call with arguments (copied)', 'Function body runs', 'Return value to caller'], caption: 'A function call: arguments are copied in, a value comes back.' },
  theory: `\`\`\`c
// prototype (usually in a header)
int16_t clamp_speed(int16_t speed);

// definition
int16_t clamp_speed(int16_t speed) {
    if (speed > 255)  return 255;
    if (speed < -255) return -255;
    return speed;
}
\`\`\`

#### Pass by value
Arguments are **copied**. Changing a parameter inside the function does not change the caller's variable — to do that, pass a pointer (next lessons).

#### Return status, write results through pointers

\`\`\`c
typedef enum { SENSOR_OK, SENSOR_TIMEOUT, SENSOR_BAD_CRC } SensorStatus;
SensorStatus read_co2(uint16_t *out_ppm);
\`\`\`

#### Design rules
- One job per function; describe it in one sentence.
- Name it with a verb: \`read_\`, \`set_\`, \`is_\`.
- Keep hardware access separate from calculations, so calculations can be tested.
- \`void\` in the parameter list means "no parameters" in C.`,
  worked: {
    problem: 'Refactor this loop body into a testable function:\n\n```c\nint mv = raw * 5000 / 1023;\nif (mv > 3300) mv = 3300;\n```',
    steps: ['Name the job: convert a raw ADC reading to millivolts, clamped to the sensor\'s range.', 'Pure input → output, no hardware: `uint16_t adc_to_mv(uint16_t raw)`.', 'Use a 32-bit intermediate so raw * 5000 cannot overflow a 16-bit int on the Uno.'],
    answer: '```c\nuint16_t adc_to_mv(uint16_t raw) {\n    uint32_t mv = (uint32_t)raw * 5000u / 1023u;\n    return mv > 3300u ? 3300u : (uint16_t)mv;\n}\n```\nNow it can be unit-tested with raw = 0, 512, 1023.',
  },
  tryIt: 'Write `adc_to_mv` and test it with three asserts on your laptop. Then remove the `(uint32_t)` cast and compile for a 16-bit int (or reason it through): what does 1023 × 5000 overflow to?',
  mistakes: [['Expecting a function to change its argument', 'Arguments are copies — return a value or pass a pointer.'], ['Huge functions that do everything', 'Split by job; each should fit on one screen.'], ['Missing prototype → implicit declaration warning', 'Declare functions before use (header or top of file).']],
  check: ['fn-a', 'fn-b', 'ptr-2'],
  challenge: { prompt: 'Implement clamp_speed so it passes boundary tests.', exerciseId: 'lab-unit-test' },
  summary: ['Prototypes declare, definitions implement.', 'C passes arguments by value.', 'Small, named, pure functions are testable.'],
  cards: [['Pass by value', 'Function parameters are copies of the arguments', 'concept']],
});

export const cArraysStrings = L({
  id: 'c-arrays-strings', title: 'Arrays and strings', topic: 'c-pointers', minutes: 15,
  objectives: ['Index arrays safely and pass them with their length', 'Explain the null terminator in C strings', 'Format strings safely with snprintf'],
  why: `Sample buffers, UART messages and MQTT payloads are arrays and strings. Buffer overflows — writing past the end — are among the most common and dangerous embedded bugs.`,
  visual: { md: '| index | 0 | 1 | 2 | 3 |\n|---|---|---|---|---|\n| `char msg[] = "CO2"` | \'C\' | \'O\' | \'2\' | **\'\\0\'** |', caption: 'A C string is a char array ending in the null terminator — "CO2" occupies 4 bytes.' },
  theory: `#### Arrays
\`\`\`c
int16_t readings[10];          // indexes 0 … 9
size_t n = sizeof(readings) / sizeof(readings[0]);   // 10 — only where the array is declared
\`\`\`
Passed to a function, an array becomes a pointer, so **pass the length too**:
\`\`\`c
int16_t max_of(const int16_t *v, size_t n);
\`\`\`

#### Strings
A string is a \`char\` array ending in \`'\\0'\`. Library functions find the end by searching for it — a missing terminator makes them run off into memory.

| Unsafe | Safer |
|---|---|
| \`strcpy(dst, src)\` | \`snprintf(dst, sizeof dst, "%s", src)\` |
| \`sprintf(buf, …)\` | \`snprintf(buf, sizeof buf, …)\` |
| \`gets()\` | \`fgets(buf, sizeof buf, stdin)\` |

\`\`\`c
char msg[32];
snprintf(msg, sizeof msg, "{\\"co2\\":%u}", co2_ppm);
\`\`\``,
  worked: {
    problem: 'Build an MQTT payload `{"seq":17,"co2":650}` in a 24-byte buffer and detect truncation.',
    steps: ['`int n = snprintf(buf, sizeof buf, "{\\"seq\\":%u,\\"co2\\":%u}", seq, co2);`', 'snprintf returns the length it *wanted* to write (20 here).', 'If n >= sizeof buf, the output was truncated — report an error instead of sending a broken message.'],
    answer: '20 characters + \'\\0\' fit in 24 bytes. Always compare snprintf\'s return value with the buffer size.',
  },
  tryIt: 'Write a function that copies at most n−1 characters into a buffer and always terminates it. Test it with a string longer than the buffer and print the result.',
  mistakes: [['Forgetting space for \\0', 'A 3-character string needs 4 bytes.'], ['Using sizeof on an array parameter', 'Inside the function it is a pointer — pass the length.'], ['strcpy into a small buffer', 'Use snprintf with sizeof.']],
  check: ['ct-5', 'as-a', 'as-b'],
  challenge: { prompt: 'Fix the buffer-filling function that writes past its array.', exerciseId: 'lab-c-pointer-debug' },
  summary: ['Indexes run 0 … n−1; pass the length.', 'Strings end in \\0.', 'Use snprintf and check its return value.'],
  cards: [['Bytes for "CO2"', '4 (3 chars + \\0)', 'concept'], ['Safe string formatting', 'snprintf(buf, sizeof buf, fmt, …)', 'code']],
});

export const cStructs = L({
  id: 'c-structs', title: 'Structures and enums', topic: 'c-structs', minutes: 14,
  objectives: ['Group related data in structs and name choices with enums', 'Explain padding and why raw structs are not a wire format', 'Use typedef for readable types'],
  why: `A robot sample has a timestamp, position and three sensor values; a link has states DOWN/CONNECTING/UP. Structs and enums make that data self-describing — and padding knowledge prevents corrupted messages between devices.`,
  visual: { md: '| Offset | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |\n|---|---|---|---|---|---|---|---|---|\n| `struct { uint8_t a; uint32_t b; }` | a | pad | pad | pad | b | b | b | b |', caption: 'The compiler pads a struct so each member is aligned — sizeof is 8, not 5.' },
  theory: `\`\`\`c
typedef struct {
    uint32_t time_ms;
    int16_t  x_cm, y_cm;
    uint16_t co2_ppm;
    int16_t  temp_tenths_c;
} AirSample;

typedef enum { LINK_DOWN, LINK_CONNECTING, LINK_UP } LinkState;

AirSample s = { .time_ms = 1200, .co2_ppm = 650 };   // designated initialisers
s.temp_tenths_c = 235;
AirSample *p = &s;
p->co2_ppm = 660;                                      // -> through a pointer
\`\`\`

#### Padding and alignment
CPUs read aligned data faster (some fault on misaligned access), so compilers insert padding. Order members from largest to smallest to reduce it. **Never send a raw struct** to another device — size, padding and byte order can differ. Serialise field by field (or as JSON/CSV).

#### Enums
Give names to related constants; the compiler can warn when a \`switch\` misses one (\`-Wswitch\`).`,
  worked: {
    problem: 'Send an AirSample over UART to a Python script without depending on struct layout.',
    steps: ['Choose a format: little-endian fields in a fixed order, or text.', 'Text is easiest to debug: `snprintf(line, sizeof line, "%lu,%d,%d,%u,%d\\n", …)`.', 'Python splits on commas — no padding or endianness issues.'],
    answer: 'Serialise explicitly (CSV or a defined byte layout). The C struct is an in-memory convenience, not a protocol.',
  },
  tryIt: 'Print `sizeof` for `struct { uint8_t a; uint32_t b; uint8_t c; }` and for the same members ordered b, a, c. Explain the difference.',
  mistakes: [['Assuming sizeof(struct) = sum of members', 'Padding adds bytes — measure with sizeof.'], ['Sending a raw struct between devices', 'Define an explicit byte or text format.'], ['Magic numbers for states', 'Use an enum so states have names and switch warnings work.']],
  check: ['kw-3', 'st-a', 'st-b'],
  challenge: { prompt: 'Build the robot state machine using an enum for states and events.', exerciseId: 'lab-state-machine' },
  summary: ['struct groups data; enum names choices; typedef names types.', 'Padding aligns members — sizeof tells the truth.', 'Serialise explicitly for communication.'],
  cards: [['Access a struct field through a pointer', 'p->field (same as (*p).field)', 'code']],
});

export const cMemory = L({
  id: 'c-memory', title: 'Memory management', topic: 'c-pointers', minutes: 14,
  objectives: ['Use malloc/free correctly when needed', 'Explain fragmentation and why small MCUs avoid the heap', 'Design with fixed-size and ring buffers'],
  why: `A robot that crashes after three hours of driving is often a memory problem. Knowing when not to allocate dynamically is a hallmark of embedded engineering.`,
  visual: { diagram: 'memory-layout', caption: 'Static data, heap and stack share RAM — on a 2 KB Uno they can collide.' },
  theory: `#### Dynamic allocation
\`\`\`c
uint16_t *buf = malloc(n * sizeof *buf);
if (buf == NULL) { /* handle failure */ }
/* … use buf … */
free(buf);
buf = NULL;            // avoid a dangling pointer
\`\`\`
Every \`malloc\` needs exactly one \`free\`. Missing frees leak; double frees corrupt the heap.

#### Fragmentation
Allocating and freeing blocks of different sizes leaves gaps. Eventually a request fails even though the total free memory looks sufficient — typically hours into a run.

#### Embedded patterns
- **Static allocation:** fixed-size arrays sized at compile time, visible at the top of the file.
- **Allocate once at start-up**, never free.
- **Ring buffers** for streams (UART bytes, sensor samples): fixed array + head/tail indexes.
- **Memory pools** of equal-size blocks (FreeRTOS offers these).

\`\`\`c
#define BUF_LEN 16
static uint16_t ring[BUF_LEN];
static uint8_t head = 0;
void push(uint16_t v) { ring[head] = v; head = (head + 1) % BUF_LEN; }
\`\`\``,
  worked: {
    problem: 'The robot must buffer up to 50 readings (AirSample, 12 bytes each) while Wi-Fi is down. Heap or static?',
    steps: ['Size is bounded and known: 50 × 12 = 600 bytes.', 'On an ESP32 (≈ 520 KB RAM) that is small; static allocation is simple and cannot fail at runtime.', 'Use a ring buffer: when full, overwrite the oldest (and count dropped samples).'],
    answer: '**Static ring buffer** `static AirSample pending[50];` — predictable, no fragmentation, and the drop counter documents data loss honestly.',
  },
  demo: { tool: 'memory-layout', intro: 'Increase heap usage and call depth on the 2 KB Uno until the stack and heap collide.' },
  mistakes: [['Not checking malloc for NULL', 'Always check, and handle the failure.'], ['Using memory after free', 'Set the pointer to NULL after freeing.'], ['malloc/free in a loop on a small MCU', 'Allocate once or use static buffers.']],
  check: ['ptr-6', 'mm-a1', 'mm-a2'],
  challenge: { prompt: 'Implement a 16-element ring buffer with push, pop and count functions, and test wrap-around with 20 pushes on your laptop.' },
  summary: ['Every malloc has one free; check for NULL.', 'Fragmentation causes late failures.', 'Prefer static buffers, ring buffers and pools.'],
  cards: [['Why avoid malloc on small MCUs?', 'Heap fragmentation can make allocation fail hours into a run', 'concept']],
});

export const cStackHeap = L({
  id: 'c-stack-heap', title: 'Stack and heap', topic: 'c-pointers', minutes: 13,
  objectives: ['Place variables in .text, .data, .bss, heap or stack', 'Explain stack frames and stack overflow', 'Estimate stack use and check it on an RTOS'],
  why: `Stack overflows crash firmware in confusing ways — corrupted variables, random resets. On FreeRTOS each task has its own small stack, so sizing it is part of your job.`,
  visual: { diagram: 'memory-layout', caption: 'Memory sections: code and constants in flash; globals, heap and stack in RAM.' },
  theory: `| Declaration | Lives in |
|---|---|
| Code, \`const\` tables | .text / .rodata (flash) |
| \`int g = 5;\` (global) | .data (RAM, initial value copied from flash) |
| \`int g;\` / \`static int s;\` | .bss (RAM, zeroed at start-up) |
| \`malloc(...)\` | heap |
| Local variables, return addresses | stack |

#### Stack frames
Each function call pushes a frame (locals, saved registers, return address); returning pops it. Deep recursion or large local arrays grow the stack until it hits other data — a **stack overflow**.

#### Measuring
- Compiler: \`-fstack-usage\` reports per-function frame sizes.
- FreeRTOS: \`uxTaskGetStackHighWaterMark(NULL)\` returns the minimum free stack seen.
- Bare metal: fill the stack with a pattern at start-up and check how much was overwritten.`,
  worked: {
    problem: 'A FreeRTOS task has a 2048-byte stack. It calls a function with a 512-byte local buffer from a function with a 256-byte frame. The high-water mark reports 180 bytes free. Is that safe?',
    steps: ['180 bytes of headroom in the worst case observed so far.', 'Interrupts and untested code paths may need more.', 'A common rule: keep at least 20–25 % headroom (≈ 400–500 bytes here).'],
    answer: '**Not comfortable.** Increase the stack (e.g. 3072 bytes) or move the 512-byte buffer to static storage.',
  },
  demo: { tool: 'memory-layout', intro: 'Select each declaration to see its section, then grow the call depth to watch the stack expand.' },
  mistakes: [['Large arrays as locals on small MCUs', 'Make them static or global, sized deliberately.'], ['Unbounded recursion', 'Use loops or bound the depth.'], ['Never measuring stack usage', 'Check high-water marks in every RTOS task.']],
  check: ['arch-5', 'sh-a', 'sh-b'],
  challenge: { prompt: 'Print the address of a global, a static local, a local and a malloc block on your laptop. Sort them and explain which section each is in.' },
  summary: ['Flash: code/const. RAM: .data, .bss, heap, stack.', 'Stack frames grow with call depth and local size.', 'Measure stack use; keep headroom.'],
  cards: [['.bss', 'Zero-initialised globals and statics (RAM)', 'vocab'], ['FreeRTOS stack check', 'uxTaskGetStackHighWaterMark(NULL)', 'code']],
});

export const cBitwise = L({
  id: 'c-bitwise', title: 'Bitwise operations', topic: 'c-bitwise', minutes: 15,
  objectives: ['Set, clear, toggle and read bits with masks', 'Extract and insert multi-bit fields', 'Combine sensor bytes with shifts'],
  why: `Configuring a timer, enabling a peripheral clock or reading a sensor status flag are all bit manipulation. You will write \`reg |= (1u << n)\` thousands of times.`,
  visual: { md: '| Goal | Code |\n|---|---|\n| Set bit n | `v \\|= (1u << n);` |\n| Clear bit n | `v &= ~(1u << n);` |\n| Toggle bit n | `v ^= (1u << n);` |\n| Read bit n | `(v >> n) & 1u` |\n| Read field (3 bits at 4) | `(v >> 4) & 0x07u` |\n| Write field | `v = (v & ~(0x07u << 4)) \\| ((f & 0x07u) << 4);` |', caption: 'The six bit-manipulation idioms of every driver.' },
  theory: `#### Masks
A mask has 1s where you want to act. \`1u << n\` makes a single-bit mask. Use **unsigned** literals (\`1u\`) — shifting a 1 into the sign bit of a signed int is undefined behaviour.

#### Fields
Registers pack several settings into one word. To write a field without disturbing others: **clear it, then OR in the new value** (read-modify-write).

\`\`\`c
#define MODE_POS   4u
#define MODE_MASK  (0x3u << MODE_POS)
reg = (reg & ~MODE_MASK) | ((mode << MODE_POS) & MODE_MASK);
\`\`\`

#### Combining bytes
\`\`\`c
uint16_t value = ((uint16_t)hi << 8) | lo;
\`\`\`

#### Atomicity
Read-modify-write on a register shared with an interrupt can lose updates. STM32 offers BSRR (set/reset registers) that change bits atomically.`,
  worked: {
    problem: 'A sensor CONFIG register is 0x5A. Set the 2-bit RATE field (bits 6–5) to 0b10 without changing other bits.',
    steps: ['Mask for bits 6–5: 0x3 << 5 = 0x60.', 'Clear the field: 0x5A & ~0x60 = 0101 1010 & 1001 1111 = 0001 1010 (0x1A).', 'Insert 0b10 << 5 = 0x40: 0x1A | 0x40 = 0x5A.'],
    answer: 'The result is **0x5A** — the field was already 0b10. Always read-modify-write so other bits stay untouched.',
  },
  demo: { tool: 'bitwise', intro: 'Use the quick masks to set, clear and flip bit 3, then try your own field masks.' },
  mistakes: [['reg = (1 << n) instead of |=', 'Plain assignment wipes every other bit.'], ['Signed shifts like 1 << 31', 'Use 1u (or 1UL) to stay unsigned and defined.'], ['Writing a field without clearing it first', 'Clear with & ~mask, then OR in the value.']],
  check: ['bit-3', 'bit-5', 'bw-a'],
  challenge: { prompt: 'Implement set/clear/toggle/read on a register value in the lab.', exerciseId: 'lab-bitmask' },
  summary: ['|= set, &= ~ clear, ^= toggle, >> & read.', 'Fields: clear then insert.', 'Use unsigned literals.'],
  cards: [['Clear bit n', 'v &= ~(1u << n);', 'code'], ['Read a 3-bit field at bit 4', '(v >> 4) & 0x07u', 'code']],
});

export const cHeaders = L({
  id: 'c-headers', title: 'Header files', topic: 'c-modules', minutes: 12,
  objectives: ['Separate declarations (.h) from definitions (.c)', 'Write include guards', 'Use extern correctly for shared variables'],
  why: `Every library you use — Arduino, HAL, FreeRTOS — is a set of headers. Writing clean headers is how your robot code grows from one file into maintainable modules.`,
  visual: { flow: ['motor.h: declarations', 'motor.c: definitions + private state', 'main.c: #include "motor.h"', 'Linker joins the object files'], caption: 'A module: the header is the contract, the .c file the implementation.' },
  theory: `\`\`\`c
// motor.h
#ifndef MOTOR_H
#define MOTOR_H
#include <stdint.h>

void    motor_init(void);
void    motor_set_speed(int16_t speed);   // −255 … 255
int16_t motor_get_speed(void);
extern  volatile uint32_t motor_fault_count;   // declared here …
#endif
\`\`\`
\`\`\`c
// motor.c
#include "motor.h"
volatile uint32_t motor_fault_count = 0;       // … defined once here
static int16_t current_speed = 0;              // private
\`\`\`

#### Rules
- Headers contain **declarations**: prototypes, types, macros, \`extern\` variables.
- Exactly one .c file contains each **definition**.
- Include guards (or \`#pragma once\`) prevent double inclusion.
- A header should include what it needs (\`stdint.h\` here) so it compiles on its own.
- \`#include <x.h>\` for system/library headers, \`"x.h"\` for your own.`,
  worked: {
    problem: 'The linker reports "multiple definition of `g_speed`". `int g_speed = 0;` is in config.h, included by main.c and motor.c. Fix it.',
    steps: ['Each .c that includes config.h gets its own definition → two definitions.', 'Change the header to a declaration: `extern int g_speed;`.', 'Put the single definition `int g_speed = 0;` in one .c file (e.g. config.c).'],
    answer: 'Declare in the header (**extern**), define once in a .c file. Better still, hide it behind getter/setter functions.',
  },
  tryIt: 'Create stats.h / stats.c with `min_value`, `max_value` and `average`, include stats.h from main.c, and compile both: `gcc -Wall main.c stats.c -o app`. Then define a variable in the header to reproduce the linker error.',
  mistakes: [['Defining variables in headers', 'Use extern in the header, define in one .c file.'], ['Missing include guard', 'Add #ifndef/#define/#endif.'], ['Headers that depend on include order', 'Each header includes what it uses.']],
  check: ['kw-4', 'hd-a', 'kw-2'],
  challenge: { prompt: 'Split your Chapter 11 statistics code into stats.h and stats.c and commit it to GitHub with a README.' },
  summary: ['.h declares, .c defines.', 'Include guards prevent double inclusion.', 'extern in header, one definition in a .c file.'],
  cards: [['Shared global across files', 'extern declaration in .h, single definition in one .c', 'concept']],
});

export const cModular = L({
  id: 'c-modular', title: 'Modular programming', topic: 'c-modules', minutes: 13,
  objectives: ['Design modules with one clear job and a small API', 'Hide state with file-scope static', 'Separate hardware drivers from logic for testability'],
  why: `The air-quality robot has motor, encoder, IMU, sensor, comms and navigation code. Clean module boundaries let you test logic on a laptop, swap the Uno for an ESP32, and find bugs quickly.`,
  visual: { flow: ['App: state machine', 'Services: navigation, logging', 'Drivers: motor, BME280, SCD40', 'Hardware: GPIO, I2C, timers'], caption: 'Layered firmware: each layer only calls the layer below.' },
  theory: `#### One module, one job
- \`motor.c\` — signed speed → PWM and direction pins.
- \`encoder.c\` — ticks → speed.
- \`filter.c\` — moving average.
- \`comms.c\` — MQTT publishing and buffering.

#### Small public API, private state
\`\`\`c
// filter.c
#define WINDOW 4
static uint16_t buffer[WINDOW];
static uint8_t  next;
static uint32_t sum;

uint16_t filter_add(uint16_t sample) {
    sum -= buffer[next];
    buffer[next] = sample;
    sum += sample;
    next = (next + 1) % WINDOW;
    return (uint16_t)(sum / WINDOW);
}
\`\`\`

#### Hardware boundary
Keep register and library calls in thin **drivers**. Logic modules (filters, state machines, PID) take numbers and return numbers — so they compile and run in unit tests on a laptop.`,
  worked: {
    problem: 'Trace filter_add with an all-zero buffer for samples 400, 400, 400, 400. What does it return each time, and what does that reveal?',
    steps: ['Call 1: sum = 400 → returns 100.', 'Call 2: sum = 800 → 200; call 3: 1200 → 300.', 'Call 4: sum = 1600 → 400 — the true value.'],
    answer: 'Returns **100, 200, 300, 400**: the first outputs are too low because the buffer starts at zero. Pre-fill it with the first sample if that matters.',
  },
  tryIt: 'Draw a module map for your robot firmware: one box per module, arrows for calls. Mark which modules touch hardware and which are pure logic.',
  mistakes: [['Global variables shared across modules', 'Hide state with static and expose functions.'], ['Logic mixed with register access', 'Thin drivers; testable logic.'], ['Modules with vague jobs ("utils.c")', 'Name modules after their single responsibility.']],
  check: ['md-a', 'kw-2', 'test-1'],
  challenge: { prompt: 'Write unit tests for clamp_speed — a pure logic function that never touches hardware.', exerciseId: 'lab-unit-test' },
  summary: ['One job per module; small public API.', 'File-scope static hides state.', 'Thin drivers below, testable logic above.'],
  cards: [['Why separate drivers from logic?', 'Logic can be unit-tested on a laptop without hardware', 'concept']],
});

export const cKeywords = L({
  id: 'c-keywords', title: 'const, volatile and static', topic: 'c-keywords', minutes: 15,
  objectives: ['Use const for read-only data and APIs', 'Use volatile for hardware and ISR-shared variables', 'Use static for internal linkage and persistent locals'],
  why: `"What does volatile do?" is the most common embedded interview question. Getting it wrong produces bugs that only appear with optimisation enabled — the worst kind.`,
  visual: { md: '| Keyword | On a variable means | Typical use |\n|---|---|---|\n| `const` | Code must not modify it | Lookup tables in flash, read-only parameters |\n| `volatile` | Value may change outside normal flow — always re-read | Hardware registers, ISR-shared flags |\n| `static` (file scope) | Private to this .c file | Module state |\n| `static` (in function) | Keeps value between calls | Counters, first-call init |', caption: 'Three keywords, three different jobs.' },
  theory: `#### const
\`\`\`c
static const uint16_t SINE_TABLE[64] = { /* … */ };   // can stay in flash
float average(const int16_t *v, size_t n);             // promises not to modify v
\`\`\`

#### volatile
The optimiser may keep a variable in a register if it sees no code changing it. If an ISR or hardware changes it, the main loop may never see the update.
\`\`\`c
static volatile bool data_ready = false;
void ISR(void) { data_ready = true; }
while (!data_ready) { }   // without volatile this can loop forever
\`\`\`
volatile does **not** make access atomic — multi-byte values still need critical sections.

#### static
- File scope: internal linkage (private to the file).
- Function scope: storage persists across calls; initialised once.

#### Combined
\`volatile const uint32_t *status\` — a hardware register you only read, which changes on its own.`,
  worked: {
    problem: 'An encoder ISR increments `uint16_t ticks`. The loop prints `ticks` but it sometimes shows huge jumps on an Uno. What two fixes are needed?',
    steps: ['Declare `volatile uint16_t ticks` so the loop re-reads it.', 'On an 8-bit AVR, reading 16 bits takes two instructions — an ISR between them tears the value.', 'Copy with interrupts disabled: `noInterrupts(); uint16_t t = ticks; interrupts();`'],
    answer: '**volatile** (fresh reads) **plus** a critical section for the copy (atomic read).',
  },
  tryIt: 'Compile a loop like `while (!flag) {}` with `-O2` and look at the assembly (`gcc -O2 -S`), with and without `volatile`. Find the load instruction that disappears without it.',
  mistakes: [['Thinking volatile makes access atomic', 'Use critical sections or atomic types for multi-byte shared data.'], ['Missing const on read-only pointer parameters', 'Add const — it documents intent and catches bugs.'], ['Using static locals in code called from several tasks', 'They are shared state — protect or avoid them.']],
  check: ['kw-1', 'kw-a1', 'kw-a2'],
  challenge: { prompt: 'Diagnose the ISR counter bug in the lab.', exerciseId: 'lab-isr-race' },
  summary: ['const: read-only. volatile: always re-read. static: private or persistent.', 'volatile ≠ atomic.', 'volatile const for read-only hardware registers.'],
  cards: [['volatile', 'Tells the compiler the value can change outside normal flow; re-read every access', 'concept'], ['static local', 'Keeps its value between calls; initialised once', 'concept']],
});

export const cStateMachines = L({
  id: 'c-state-machines', title: 'State machines', topic: 'state-machines', minutes: 15,
  objectives: ['Model behaviour as states, events and transitions', 'Implement a testable next_state() function', 'Combine state machines with non-blocking timing'],
  why: `The robot drives, samples, avoids obstacles and idles. A state machine makes this behaviour explicit, predictable and testable — instead of a tangle of flags and delays.`,
  visual: { diagram: 'state-machine', caption: 'The robot\'s four states and the events that move between them.' },
  theory: `#### Ingredients
- **States:** IDLE, DRIVING, SAMPLING, AVOIDING.
- **Events:** START, STOP, AT_POINT, SAMPLE_DONE, OBSTACLE, PATH_CLEAR.
- **Transitions:** (state, event) → next state.
- **Actions:** what to do on entry, during, or on exit.

#### Pure transition function
\`\`\`c
RobotState next_state(RobotState s, RobotEvent e) {
    if (e == EVENT_STOP) return STATE_IDLE;
    switch (s) {
        case STATE_IDLE:     return e == EVENT_START ? STATE_DRIVING : s;
        case STATE_DRIVING:  if (e == EVENT_AT_POINT) return STATE_SAMPLING;
                             if (e == EVENT_OBSTACLE) return STATE_AVOIDING;
                             return s;
        case STATE_SAMPLING: return e == EVENT_SAMPLE_DONE ? STATE_DRIVING : s;
        case STATE_AVOIDING: return e == EVENT_PATH_CLEAR ? STATE_DRIVING : s;
    }
    return s;
}
\`\`\`
Every arrow in the diagram becomes one unit test.

#### The loop
\`\`\`c
RobotEvent e = poll_events();           // sensors, timers, commands
RobotState n = next_state(state, e);
if (n != state) { on_exit(state); on_entry(n); state = n; }
run_state(state);                       // non-blocking work for this state
\`\`\``,
  worked: {
    problem: 'Add a LOW_BATTERY event that sends the robot to a new RETURNING state from DRIVING or SAMPLING, and to IDLE when it arrives home.',
    steps: ['Add STATE_RETURNING and EVENT_LOW_BATTERY, EVENT_HOME to the enums.', 'In DRIVING and SAMPLING: if (e == EVENT_LOW_BATTERY) return STATE_RETURNING;', 'In RETURNING: return e == EVENT_HOME ? STATE_IDLE : s; — and still allow OBSTACLE → AVOIDING if needed.', 'Add tests for each new arrow.'],
    answer: 'Two new enum values, three new transitions, three new tests. The rest of the machine is untouched — that is the benefit of the pattern.',
  },
  demo: { tool: 'interrupts', intro: 'A state machine must keep polling events. See how a blocking delay misses short events that a non-blocking loop catches.' },
  mistakes: [['Long delays inside states', 'Use elapsed-time checks so events are still polled.'], ['Transitions scattered across the code', 'Keep them in one next_state() function.'], ['No default handling of unexpected events', 'Return the current state for events that do not apply.']],
  check: ['sm-1', 'smx-a', 'smx-b'],
  challenge: { prompt: 'Implement and test next_state for the robot in the lab.', exerciseId: 'lab-state-machine' },
  summary: ['States, events, transitions, actions.', 'One pure next_state() function — easy to test.', 'Non-blocking loop: poll, transition, run state.'],
  cards: [['State machine test strategy', 'One unit test per arrow (state, event → next state)', 'concept']],
});

export const cDebugging = L({
  id: 'c-debugging', title: 'Debugging and code organisation', topic: 'c-debugging', minutes: 14,
  objectives: ['Apply a six-step debugging method', 'Choose between prints, asserts, debugger and instruments', 'Organise code so bugs are easier to find'],
  why: `Debugging is a core job skill — interviewers ask you to describe a bug you found and how you proved the cause. A method beats guessing, every time.`,
  visual: { flow: ['Reproduce', 'Describe expected vs actual', 'One hypothesis', 'Test only that', 'Fix and retest', 'Record and add a test'], caption: 'The six-step debugging method.' },
  theory: `#### Tools

| Tool | Best for |
|---|---|
| Compiler warnings (\`-Wall -Wextra\`) | Mistakes before running |
| \`printf\` / Serial prints | Values and program flow |
| \`assert()\` | Catching impossible states early |
| Debugger (gdb, ST-LINK) | Pausing, stepping, inspecting memory |
| Multimeter / logic analyzer | Power and signal problems |

#### Good prints
Print **values with labels and units**, and the path taken: \`printf("speed=%d mm/s state=%d\\n", v, s);\`. Remove or guard them (\`#ifdef DEBUG\`) when done — prints change timing.

#### Organisation that helps
- Small functions with one job.
- Pure logic separated from hardware → reproducible on a laptop.
- Consistent naming with units: \`dist_cm\`, \`time_ms\`.
- Version control: \`git diff\` and \`git bisect\` find when a bug appeared.`,
  worked: {
    problem: 'The robot sometimes turns left when commanded straight. Apply the method.',
    steps: ['Reproduce: happens on the carpet, not on tiles; more at low speed.', 'Expected: equal wheel speeds; actual: left wheel ≈ 15 % slower at PWM 60.', 'Hypothesis: the left motor needs a higher starting PWM (dead-band).', 'Test only that: log PWM vs speed for each wheel with the robot lifted.', 'Fix: closed-loop speed control (PID) per wheel; retest on carpet.', 'Record the cause in your log; add a test of the dead-band compensation.'],
    answer: 'A measured, single-variable investigation found a **motor dead-band mismatch** — fixed by closed-loop control rather than by guessing PWM offsets.',
  },
  tryIt: 'Take a working program, ask a friend (or flip a coin per line) to insert one bug, then find it using only the six steps. Time yourself and write a short debug report.',
  mistakes: [['Changing several things at once', 'One hypothesis, one change, one test.'], ['Prints without labels or units', 'Label every printed value.'], ['Not recording the lesson', 'Write the cause and fix in your log; add a regression test.']],
  check: ['dbg-1', 'db-a', 'cf-b'],
  challenge: { prompt: 'Find and fix the two pointer bugs in the lab using the six-step method; note your hypothesis for each.', exerciseId: 'lab-c-pointer-debug' },
  summary: ['Reproduce → describe → hypothesise → test → fix → record.', 'Pick the tool that matches the symptom.', 'Small pure functions make bugs reproducible.'],
  cards: [['Six-step debugging', 'Reproduce, describe, hypothesise, test one thing, fix & retest, record', 'concept']],
});
