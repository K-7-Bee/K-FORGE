import type { CodeExercise } from './types';

/**
 * Auto-graded coding exercises, grouped by module. Code is written with the `src` tag so it reads
 * exactly as the learner sees it (backslashes are kept literally). Every reference solution passes
 * its tests and every starter fails at least one; `tests/lab-solutions.test.ts` checks both with a
 * real compiler whenever gcc / g++ / Python are installed.
 */
function src(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw({ raw: strings.raw }, ...values).replace(/^\n/, '');
}

export const CODE_EXERCISES: CodeExercise[] = [
  // ======================= Phase 1 — Electronics =======================
  {
    id: 'lab-led-e12', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-electronics', tags: ['ohms-law', 'e-series'], language: 'c',
    title: 'LED resistor with a real part number',
    objective: 'Turn an Ohm\'s-law result into a resistor you can actually buy.',
    description: 'Read the supply voltage, the LED forward voltage and the target current in **mA**. Compute the exact resistance, then choose the **smallest E12 value that is not below it**, so the current never exceeds the target. E12 values are 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82 in every decade from 10 Ω to 8.2 MΩ. Print `R=<exact, 1 decimal> E12=<value>`. If the supply is not above the forward voltage, print `ERROR`.',
    io: '**Input:** `5 2.0 20`\n\n**Output:** `R=150.0 E12=150`',
    starter: src`
#include <stdio.h>

static const int E12[] = {10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82};

int main(void) {
    double vs, vf, ma;
    if (scanf("%lf %lf %lf", &vs, &vf, &ma) != 3) return 1;

    /* TODO: compute R = (vs - vf) / I, then find the first E12 value >= R */

    return 0;
}
`,
    tests: [
      { label: 'Exact match', stdin: '5 2.0 20', expected: 'R=150.0 E12=150' },
      { label: '3.3 V red LED', stdin: '3.3 2.0 10', expected: 'R=130.0 E12=150' },
      { label: '12 V supply', stdin: '12 2.1 15', expected: 'R=660.0 E12=680' },
      { label: 'Blue LED at 5 V', stdin: '5 3.2 5', expected: 'R=360.0 E12=390', hidden: true },
      { label: 'Low current', stdin: '9 2 1', expected: 'R=7000.0 E12=8200', hidden: true },
      { label: 'Supply too low', stdin: '3.3 3.4 10', expected: 'ERROR', hidden: true },
    ],
    hints: [
      'Work in volts and milliamps: R = (Vs − Vf) × 1000 / I_mA gives ohms.',
      'Loop over decades (multiplier 1, 10, 100 …) and inside that over the 12 base values; stop at the first value ≥ R.',
      'Floating-point results such as 129.99999 are normal. Compare with a small tolerance: if (E12[i] * mult >= r - 1e-6) …',
    ],
    solution: src`
#include <stdio.h>

static const int E12[] = {10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82};

int main(void) {
    double vs, vf, ma;
    if (scanf("%lf %lf %lf", &vs, &vf, &ma) != 3) return 1;
    if (vs <= vf || ma <= 0) {
        puts("ERROR");
        return 0;
    }
    double r = (vs - vf) * 1000.0 / ma;
    for (long mult = 1; mult <= 100000; mult *= 10) {
        for (int i = 0; i < 12; i++) {
            long value = E12[i] * mult;
            if (value >= r - 1e-6) {
                printf("R=%.1f E12=%ld\n", r, value);
                return 0;
            }
        }
    }
    puts("ERROR");
    return 0;
}
`,
    explanation: 'Rounding **up** to the next standard value keeps the current at or below the target. The tolerance matters: (3.3 − 2.0) is 1.2999999… in binary floating point, and a strict comparison can skip the right part.',
  },
  {
    id: 'lab-equivalent-r', kind: 'code', level: 'implement', difficulty: 1, moduleId: 'm-electronics', tags: ['series-parallel'], language: 'c',
    title: 'Equivalent resistance calculator',
    objective: 'Apply the series and parallel formulas in code.',
    description: 'Input: the word `series` or `parallel`, a count **n**, then **n** resistances in ohms. Print `R=<equivalent>` with two decimals.',
    io: '**Input:** `parallel 2 1000 1000`\n\n**Output:** `R=500.00`',
    starter: src`
#include <stdio.h>
#include <string.h>

int main(void) {
    char mode[16];
    int n;
    double r[32];
    if (scanf("%15s %d", mode, &n) != 2 || n < 1 || n > 32) return 1;
    for (int i = 0; i < n; i++) scanf("%lf", &r[i]);

    /* TODO: series adds resistances; parallel adds conductances (1/R) */

    return 0;
}
`,
    tests: [
      { label: 'Series', stdin: 'series 3 100 220 330', expected: 'R=650.00' },
      { label: 'Two equal in parallel', stdin: 'parallel 2 1000 1000', expected: 'R=500.00' },
      { label: 'Three in parallel', stdin: 'parallel 3 100 220 330', expected: 'R=56.90' },
      { label: 'Single resistor', stdin: 'series 1 47', expected: 'R=47.00', hidden: true },
      { label: 'Four equal in parallel', stdin: 'parallel 4 100 100 100 100', expected: 'R=25.00', hidden: true },
    ],
    hints: [
      'Parallel resistances combine through their reciprocals.',
      'Series: sum of R. Parallel: 1 / (sum of 1/R). Compare the mode with strcmp.',
      'double g = 0; for (…) g += 1.0 / r[i]; printf("R=%.2f\\n", 1.0 / g);',
    ],
    solution: src`
#include <stdio.h>
#include <string.h>

int main(void) {
    char mode[16];
    int n;
    double r[32];
    if (scanf("%15s %d", mode, &n) != 2 || n < 1 || n > 32) return 1;
    for (int i = 0; i < n; i++) scanf("%lf", &r[i]);
    double total = 0.0;
    if (strcmp(mode, "series") == 0) {
        for (int i = 0; i < n; i++) total += r[i];
    } else {
        double g = 0.0;
        for (int i = 0; i < n; i++) g += 1.0 / r[i];
        total = 1.0 / g;
    }
    printf("R=%.2f\n", total);
    return 0;
}
`,
    explanation: 'A parallel combination is always smaller than its smallest resistor — a quick sanity check for any result.',
  },
  {
    id: 'lab-py-divider-design', kind: 'code', level: 'create', difficulty: 3, moduleId: 'm-electronics', tags: ['voltage-divider', 'e-series', 'python'], language: 'python',
    title: 'Design a divider from standard parts',
    objective: 'Search standard values to meet a voltage target.',
    description: 'Input: `Vin Vtarget R2`. Choose **R1** from the E12 series (10 Ω … 8.2 MΩ) so that Vout = Vin × R2 / (R1 + R2) is **as close as possible** to the target. On a tie, keep the smaller R1. Print `R1=<ohms> Vout=<volts, 3 decimals>`.',
    io: '**Input:** `5 3.3 10000`\n\n**Output:** `R1=5600 Vout=3.205`',
    starter: src`
import sys

E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82]
vin, target, r2 = (float(x) for x in sys.stdin.read().split())

# TODO: try every E12 value for R1 and keep the one with the smallest error
`,
    tests: [
      { label: '5 V → 3.3 V', stdin: '5 3.3 10000', expected: 'R1=5600 Vout=3.205' },
      { label: '12 V → 5 V', stdin: '12 5 10000', expected: 'R1=15000 Vout=4.800' },
      { label: 'Exact half', stdin: '3.3 1.65 4700', expected: 'R1=4700 Vout=1.650', hidden: true },
    ],
    hints: [
      'There are only 72 candidates, so you can simply try them all.',
      'Build the list with a nested comprehension over multipliers 1, 10, … 100000, then compute the error |Vout − target| for each.',
      'Iterate in ascending order and replace the best only when the new error is strictly smaller — that keeps the smaller R1 on ties.',
    ],
    solution: src`
import sys

E12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82]
vin, target, r2 = (float(x) for x in sys.stdin.read().split())

best_r1 = None
best_err = None
for mult in (1, 10, 100, 1000, 10000, 100000):
    for base in E12:
        r1 = base * mult
        vout = vin * r2 / (r1 + r2)
        err = abs(vout - target)
        if best_err is None or err < best_err:
            best_r1, best_err = r1, err

vout = vin * r2 / (best_r1 + r2)
print("R1={} Vout={:.3f}".format(best_r1, vout))
`,
    explanation: 'Real designs are constrained to standard parts. Brute-force search over a small catalogue is exact, quick and easy to verify — and the same idea scales to choosing E24 or E96 pairs.',
  },

  // ======================= Phase 2 — Digital =======================
  {
    id: 'lab-popcount', kind: 'code', level: 'implement', difficulty: 1, moduleId: 'm-digital', tags: ['bitwise', 'binary'], language: 'c',
    title: 'Count bits and parity',
    objective: 'Inspect every bit of a 16-bit word.',
    description: 'Read hexadecimal 16-bit values until the end of input. For each, print `bits=<number of 1 bits> parity=<even|odd>` on its own line.',
    io: '**Input:** `0xF00F`\n\n**Output:** `bits=8 parity=even`',
    starter: src`
#include <stdio.h>

int main(void) {
    unsigned int v;
    while (scanf("%x", &v) == 1) {
        /* TODO: count the 1 bits of the low 16 bits of v */
    }
    return 0;
}
`,
    tests: [
      { label: '0xF00F', stdin: '0xF00F', expected: 'bits=8 parity=even' },
      { label: 'Single bit', stdin: '0x0001', expected: 'bits=1 parity=odd' },
      { label: 'Several values', stdin: '0xFFFF 0x8000', expected: 'bits=16 parity=even\nbits=1 parity=odd' },
      { label: 'Zero', stdin: '0x0000', expected: 'bits=0 parity=even', hidden: true },
    ],
    hints: [
      'Test one bit at a time, 16 times.',
      'for (int i = 0; i < 16; i++) count += (v >> i) & 1u;',
      'Parity is even when count % 2 == 0.',
    ],
    solution: src`
#include <stdio.h>

int main(void) {
    unsigned int v;
    while (scanf("%x", &v) == 1) {
        int count = 0;
        for (int i = 0; i < 16; i++) count += (v >> i) & 1u;
        printf("bits=%d parity=%s\n", count, count % 2 == 0 ? "even" : "odd");
    }
    return 0;
}
`,
    explanation: 'Parity bits in UART frames and many sensor protocols are exactly this calculation. Some CPUs do it in one instruction (`__builtin_popcount` in GCC).',
  },
  {
    id: 'lab-gray-code', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-digital', tags: ['binary', 'encoders'], language: 'c',
    title: 'Gray code encoder and decoder',
    objective: 'Convert between binary and Gray code with XOR.',
    description: 'Input is a list of commands: `enc <n>` converts binary **n** (0–255) to Gray code; `dec <g>` converts Gray code **g** back to binary. Print each result in decimal on its own line. Absolute encoders use Gray code because only one bit changes between neighbouring positions.',
    io: '**Input:** `enc 5 dec 7`\n\n**Output:**\n```\n7\n5\n```',
    starter: src`
#include <stdio.h>
#include <string.h>

unsigned to_gray(unsigned n) {
    /* TODO */
    return n;
}

unsigned from_gray(unsigned g) {
    /* TODO */
    return g;
}

int main(void) {
    char cmd[4];
    unsigned v;
    while (scanf("%3s %u", cmd, &v) == 2) {
        printf("%u\n", strcmp(cmd, "enc") == 0 ? to_gray(v) : from_gray(v));
    }
    return 0;
}
`,
    tests: [
      { label: 'Encode 5', stdin: 'enc 5', expected: '7' },
      { label: 'Decode 7', stdin: 'dec 7', expected: '5' },
      { label: 'Round trip at the top', stdin: 'enc 255 dec 128', expected: '128\n255' },
      { label: 'Zero', stdin: 'enc 0', expected: '0', hidden: true },
      { label: 'Decode 13', stdin: 'dec 13', expected: '9', hidden: true },
    ],
    hints: [
      'Encoding needs one shift and one XOR.',
      'gray = n ^ (n >> 1). Decoding XORs together every right-shift of g.',
      'unsigned b = 0; for (; g; g >>= 1) b ^= g; return b;',
    ],
    solution: src`
#include <stdio.h>
#include <string.h>

unsigned to_gray(unsigned n) {
    return n ^ (n >> 1);
}

unsigned from_gray(unsigned g) {
    unsigned b = 0;
    for (; g; g >>= 1) b ^= g;
    return b;
}

int main(void) {
    char cmd[4];
    unsigned v;
    while (scanf("%3s %u", cmd, &v) == 2) {
        printf("%u\n", strcmp(cmd, "enc") == 0 ? to_gray(v) : from_gray(v));
    }
    return 0;
}
`,
    explanation: 'Each binary bit is the XOR of all Gray bits above and including it, which is what the decoding loop accumulates.',
  },
  {
    id: 'lab-7seg', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-digital', tags: ['logic-gates', 'displays'], language: 'c',
    title: '7-segment decoder',
    objective: 'Derive segment patterns and handle active-low outputs.',
    description: 'Segments are named **a** (top), **b** (top right), **c** (bottom right), **d** (bottom), **e** (bottom left), **f** (top left) and **g** (middle). The byte layout is `0 g f e d c b a` (bit 0 = a). Input: `cc` (common cathode, segment on = 1) or `ca` (common anode, all 8 bits inverted), then a string of digits. Print one `0x%02X` byte per digit, separated by spaces.',
    io: '**Input:** `cc 2026`\n\n**Output:** `0x5B 0x3F 0x5B 0x7D`',
    starter: src`
#include <stdio.h>
#include <string.h>

/* TODO: fill in the segment pattern for each digit 0-9 (bit 0 = a ... bit 6 = g) */
static const unsigned char SEG[10] = {0};

int main(void) {
    char mode[3], digits[32];
    if (scanf("%2s %31s", mode, digits) != 2) return 1;
    for (int i = 0; digits[i]; i++) {
        unsigned char code = SEG[digits[i] - '0'];
        /* TODO: invert for common anode */
        printf(i ? " 0x%02X" : "0x%02X", code);
    }
    printf("\n");
    return 0;
}
`,
    tests: [
      { label: 'Common cathode', stdin: 'cc 2026', expected: '0x5B 0x3F 0x5B 0x7D' },
      { label: 'Other digits', stdin: 'cc 0189', expected: '0x3F 0x06 0x7F 0x6F' },
      { label: 'Common anode', stdin: 'ca 2026', expected: '0xA4 0xC0 0xA4 0x82' },
      { label: 'Remaining digits', stdin: 'cc 3457', expected: '0x4F 0x66 0x6D 0x07', hidden: true },
    ],
    hints: [
      'Sketch each digit and list which segments are lit. "1" uses only b and c.',
      '0 lights a–f (0x3F), 8 lights everything (0x7F). Common anode is active-low: code ^ 0xFF.',
      'static const unsigned char SEG[10] = {0x3F, 0x06, 0x5B, 0x4F, 0x66, …};',
    ],
    solution: src`
#include <stdio.h>
#include <string.h>

static const unsigned char SEG[10] = {0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F};

int main(void) {
    char mode[3], digits[32];
    if (scanf("%2s %31s", mode, digits) != 2) return 1;
    for (int i = 0; digits[i]; i++) {
        unsigned char code = SEG[digits[i] - '0'];
        if (strcmp(mode, "ca") == 0) code ^= 0xFF;
        printf(i ? " 0x%02X" : "0x%02X", code);
    }
    printf("\n");
    return 0;
}
`,
    explanation: 'A lookup table is the standard way to drive a display: one byte per symbol, written straight to a port or shift register. Active-low hardware needs only an inversion.',
  },

  // ======================= Phase 3 — C =======================
  {
    id: 'lab-ring-buffer', kind: 'code', level: 'implement', difficulty: 3, moduleId: 'm-c', tags: ['c-arrays', 'buffers'], language: 'c',
    title: 'Ring buffer for UART bytes',
    objective: 'Implement the FIFO used by almost every serial driver.',
    description: 'Complete `rb_push` and `rb_pop` for a ring buffer of **4** slots. `push x` prints `OK` or `FULL`; `pop` prints the oldest value or `EMPTY`; `size` prints the count. The head and tail indices must wrap around.',
    io: '**Input:** `push 1 push 2 pop pop pop`\n\n**Output:**\n```\nOK\nOK\n1\n2\nEMPTY\n```',
    starter: src`
#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <string.h>

#define RB_SIZE 4

typedef struct {
    int16_t data[RB_SIZE];
    uint8_t head;   /* next write position */
    uint8_t tail;   /* next read position */
    uint8_t count;
} RingBuffer;

bool rb_push(RingBuffer *rb, int16_t value) {
    /* TODO: refuse when full; otherwise store at head and advance head with wrap-around */
    (void)rb;
    (void)value;
    return false;
}

bool rb_pop(RingBuffer *rb, int16_t *out) {
    /* TODO: refuse when empty; otherwise read at tail and advance tail with wrap-around */
    (void)rb;
    (void)out;
    return false;
}

int main(void) {
    RingBuffer rb = {0};
    char cmd[8];
    while (scanf("%7s", cmd) == 1) {
        if (strcmp(cmd, "push") == 0) {
            int v;
            if (scanf("%d", &v) != 1) return 1;
            puts(rb_push(&rb, (int16_t)v) ? "OK" : "FULL");
        } else if (strcmp(cmd, "pop") == 0) {
            int16_t v;
            if (rb_pop(&rb, &v)) printf("%d\n", v);
            else puts("EMPTY");
        } else if (strcmp(cmd, "size") == 0) {
            printf("%u\n", (unsigned)rb.count);
        }
    }
    return 0;
}
`,
    tests: [
      { label: 'Push and pop', stdin: 'push 1 push 2 pop pop pop', expected: 'OK\nOK\n1\n2\nEMPTY' },
      { label: 'Full buffer', stdin: 'push 1 push 2 push 3 push 4 push 5 size', expected: 'OK\nOK\nOK\nOK\nFULL\n4' },
      { label: 'Wrap-around', stdin: 'push 1 push 2 push 3 pop pop push 4 push 5 push 6 pop pop pop pop', expected: 'OK\nOK\nOK\n1\n2\nOK\nOK\nOK\n3\n4\n5\n6' },
      { label: 'Fill, drain, refill', stdin: 'push 7 push 8 push 9 push 10 pop push 11 pop pop pop pop pop', expected: 'OK\nOK\nOK\nOK\n7\nOK\n8\n9\n10\n11\nEMPTY', hidden: true },
    ],
    hints: [
      'The count tells you full (== RB_SIZE) and empty (== 0) without comparing head and tail.',
      'Push: data[head] = value; head = (head + 1) % RB_SIZE; count++. Pop mirrors it with tail.',
      'if (rb->count == RB_SIZE) return false; rb->data[rb->head] = value; …',
    ],
    solution: src`
#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <string.h>

#define RB_SIZE 4

typedef struct {
    int16_t data[RB_SIZE];
    uint8_t head;   /* next write position */
    uint8_t tail;   /* next read position */
    uint8_t count;
} RingBuffer;

bool rb_push(RingBuffer *rb, int16_t value) {
    if (rb->count == RB_SIZE) return false;
    rb->data[rb->head] = value;
    rb->head = (uint8_t)((rb->head + 1) % RB_SIZE);
    rb->count++;
    return true;
}

bool rb_pop(RingBuffer *rb, int16_t *out) {
    if (rb->count == 0) return false;
    *out = rb->data[rb->tail];
    rb->tail = (uint8_t)((rb->tail + 1) % RB_SIZE);
    rb->count--;
    return true;
}

int main(void) {
    RingBuffer rb = {0};
    char cmd[8];
    while (scanf("%7s", cmd) == 1) {
        if (strcmp(cmd, "push") == 0) {
            int v;
            if (scanf("%d", &v) != 1) return 1;
            puts(rb_push(&rb, (int16_t)v) ? "OK" : "FULL");
        } else if (strcmp(cmd, "pop") == 0) {
            int16_t v;
            if (rb_pop(&rb, &v)) printf("%d\n", v);
            else puts("EMPTY");
        } else if (strcmp(cmd, "size") == 0) {
            printf("%u\n", (unsigned)rb.count);
        }
    }
    return 0;
}
`,
    explanation: 'A UART receive interrupt pushes bytes and the main loop pops them. With one producer and one consumer, this structure lets both run without losing data — as long as you check FULL rather than overwrite.',
  },
  {
    id: 'lab-nmea-checksum', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-c', tags: ['c-strings', 'protocol'], language: 'c',
    title: 'NMEA-style checksum',
    objective: 'Walk a string with pointers and XOR its bytes.',
    description: 'Each input line is a sentence such as `$KFRG,650,235*`. The checksum is the **XOR of every character between `$` and `*`** (both excluded). Print the sentence followed by the checksum as two uppercase hex digits. If the line has no `$` or no `*`, print `INVALID`.',
    io: '**Input:** `$KFRG,650,235*`\n\n**Output:** `$KFRG,650,235*1F`',
    starter: src`
#include <stdio.h>
#include <string.h>

int main(void) {
    char line[128];
    while (fgets(line, sizeof line, stdin)) {
        line[strcspn(line, "\r\n")] = '\0';
        if (line[0] == '\0') continue;

        /* TODO: XOR the characters between '$' and '*', then print line + checksum */
    }
    return 0;
}
`,
    tests: [
      { label: 'One sentence', stdin: '$KFRG,650,235*', expected: '$KFRG,650,235*1F' },
      { label: 'Two sentences', stdin: '$GPGLL,4916.45,N,12311.12,W*\n$KFRG,1,2*', expected: '$GPGLL,4916.45,N,12311.12,W*71\n$KFRG,1,2*1B' },
      { label: 'Missing star', stdin: '$KFRG,1,2', expected: 'INVALID' },
      { label: 'Empty body', stdin: '$*', expected: '$*00', hidden: true },
    ],
    hints: [
      'Find the start with strchr(line, \'$\') and the end with strchr(line, \'*\').',
      'Start a uint8_t at 0 and XOR each character from just after $ up to just before *.',
      'for (const char *p = start + 1; p < star; p++) cs ^= (unsigned char)*p; printf("%s%02X\\n", line, cs);',
    ],
    solution: src`
#include <stdio.h>
#include <string.h>

int main(void) {
    char line[128];
    while (fgets(line, sizeof line, stdin)) {
        line[strcspn(line, "\r\n")] = '\0';
        if (line[0] == '\0') continue;
        const char *start = strchr(line, '$');
        const char *star = strchr(line, '*');
        if (!start || !star || star < start) {
            puts("INVALID");
            continue;
        }
        unsigned char cs = 0;
        for (const char *p = start + 1; p < star; p++) cs ^= (unsigned char)*p;
        printf("%s%02X\n", line, cs);
    }
    return 0;
}
`,
    explanation: 'GPS receivers and many robot telemetry formats protect each line this way. XOR checksums are cheap enough to verify inside a UART interrupt, though a CRC catches more error patterns.',
  },

  // ======================= Phase 4 — C++ =======================
  {
    id: 'lab-cpp-pass-by-ref', kind: 'code', level: 'debug', difficulty: 1, moduleId: 'm-cpp', tags: ['cpp', 'debugging'], language: 'cpp',
    title: 'The calibration that does nothing',
    objective: 'Find value-vs-reference bugs.',
    description: '`calibrate` should scale every reading by a percentage, but the program prints the readings unchanged. There are **two** places where a copy is modified instead of the original. Fix them without changing `main`.',
    io: '**Input:**\n```\n3 110\n100 200 300\n```\n**Output:** `110 220 330`',
    starter: src`
#include <iostream>
#include <vector>

// Scales every reading by a calibration factor given in percent.
void calibrate(std::vector<int> readings, int percent) {
    for (int r : readings) {
        r = r * percent / 100;
    }
}

int main() {
    int n, percent;
    std::cin >> n >> percent;
    std::vector<int> readings(n);
    for (int &r : readings) std::cin >> r;
    calibrate(readings, percent);
    for (std::size_t i = 0; i < readings.size(); ++i) std::cout << (i ? " " : "") << readings[i];
    std::cout << "\n";
}
`,
    tests: [
      { label: 'Gain above 100 %', stdin: '3 110\n100 200 300', expected: '110 220 330' },
      { label: 'Half', stdin: '2 50\n7 9', expected: '3 4' },
      { label: 'Unity gain', stdin: '1 100\n42', expected: '42', hidden: true },
    ],
    hints: [
      'Ask of every variable that is modified: is it the caller\'s object or a copy?',
      'The parameter copies the whole vector, and the range-for copies each element.',
      'void calibrate(std::vector<int> &readings, int percent) { for (int &r : readings) … }',
    ],
    solution: src`
#include <iostream>
#include <vector>

// Scales every reading by a calibration factor given in percent.
void calibrate(std::vector<int> &readings, int percent) {
    for (int &r : readings) {
        r = r * percent / 100;
    }
}

int main() {
    int n, percent;
    std::cin >> n >> percent;
    std::vector<int> readings(n);
    for (int &r : readings) std::cin >> r;
    calibrate(readings, percent);
    for (std::size_t i = 0; i < readings.size(); ++i) std::cout << (i ? " " : "") << readings[i];
    std::cout << "\n";
}
`,
    explanation: 'Passing a container by value silently copies it — a correctness bug here, and a RAM and time cost on a microcontroller. Use `T&` to modify and `const T&` to read.',
  },
  {
    id: 'lab-cpp-sensor-interface', kind: 'code', level: 'create', difficulty: 2, moduleId: 'm-cpp', tags: ['cpp', 'oop'], language: 'cpp',
    title: 'Sensor interface with polymorphism',
    objective: 'Design an abstract interface with two implementations and a factory.',
    description: 'Implement `TemperatureSensor` (raw value = tenths of °C, prints `Temperature: 23.5 C`) and `Co2Sensor` (raw value = ppm, prints `CO2: 650 ppm`), both derived from `Sensor`. `make_sensor` returns the right object for `temp` or `co2`, or `nullptr` otherwise. Negative temperatures must keep their sign (−5 → `-0.5`).',
    io: '**Input:** `temp 235 co2 650`\n\n**Output:**\n```\nTemperature: 23.5 C\nCO2: 650 ppm\n```',
    starter: src`
#include <iostream>
#include <memory>
#include <string>

class Sensor {
public:
    virtual ~Sensor() = default;
    virtual std::string describe(int raw) const = 0;
};

// TODO: class TemperatureSensor : public Sensor { ... };
// TODO: class Co2Sensor : public Sensor { ... };

std::unique_ptr<Sensor> make_sensor(const std::string &kind) {
    (void)kind;
    return nullptr;
}

int main() {
    std::string kind;
    int raw;
    while (std::cin >> kind >> raw) {
        auto sensor = make_sensor(kind);
        if (!sensor) {
            std::cout << "Unknown sensor: " << kind << "\n";
            continue;
        }
        std::cout << sensor->describe(raw) << "\n";
    }
}
`,
    tests: [
      { label: 'Both sensors', stdin: 'temp 235 co2 650', expected: 'Temperature: 23.5 C\nCO2: 650 ppm' },
      { label: 'Below zero', stdin: 'temp -5', expected: 'Temperature: -0.5 C' },
      { label: 'Unknown kind', stdin: 'humidity 40', expected: 'Unknown sensor: humidity' },
      { label: 'Mixed', stdin: 'temp 0 co2 400 temp -123', expected: 'Temperature: 0.0 C\nCO2: 400 ppm\nTemperature: -12.3 C', hidden: true },
    ],
    hints: [
      'Each derived class overrides describe(); main only ever sees a Sensor.',
      'Format tenths without floats: a sign, then abs(raw) / 10, a dot, and abs(raw) % 10. Return objects with std::make_unique<…>().',
      'std::string s = raw < 0 ? "-" : ""; int a = raw < 0 ? -raw : raw; s += std::to_string(a / 10) + "." + std::to_string(a % 10);',
    ],
    solution: src`
#include <iostream>
#include <memory>
#include <string>

class Sensor {
public:
    virtual ~Sensor() = default;
    virtual std::string describe(int raw) const = 0;
};

class TemperatureSensor : public Sensor {
public:
    std::string describe(int raw) const override {
        int a = raw < 0 ? -raw : raw;
        std::string s = raw < 0 ? "-" : "";
        s += std::to_string(a / 10) + "." + std::to_string(a % 10);
        return "Temperature: " + s + " C";
    }
};

class Co2Sensor : public Sensor {
public:
    std::string describe(int raw) const override {
        return "CO2: " + std::to_string(raw) + " ppm";
    }
};

std::unique_ptr<Sensor> make_sensor(const std::string &kind) {
    if (kind == "temp") return std::make_unique<TemperatureSensor>();
    if (kind == "co2") return std::make_unique<Co2Sensor>();
    return nullptr;
}

int main() {
    std::string kind;
    int raw;
    while (std::cin >> kind >> raw) {
        auto sensor = make_sensor(kind);
        if (!sensor) {
            std::cout << "Unknown sensor: " << kind << "\n";
            continue;
        }
        std::cout << sensor->describe(raw) << "\n";
    }
}
`,
    explanation: 'The rest of the firmware depends only on `Sensor`, so adding a humidity sensor means one new class and one line in the factory. Fixed-point formatting avoids pulling `printf("%f")` into a small build.',
  },
  {
    id: 'lab-cpp-irq-guard', kind: 'code', level: 'debug', difficulty: 2, moduleId: 'm-cpp', tags: ['cpp', 'raii', 'interrupts'], language: 'cpp',
    title: 'Interrupts left disabled: fix it with RAII',
    objective: 'Use a constructor/destructor pair so cleanup can never be skipped.',
    description: '`update_counter` disables interrupts while it touches shared data, but the early `return` on the reject path leaves them **off**. Write an `IrqGuard` class whose constructor calls `disable_irq()` and whose destructor calls `enable_irq()`, and use it so every path restores interrupts.',
    io: '**Input:** `50 60`\n\n**Output:**\n```\nirq off\nirq on\ncounter=50 irq=1\nirq off\nrejected\nirq on\ncounter=50 irq=1\n```',
    starter: src`
#include <iostream>

int interrupts_enabled = 1;
void disable_irq() { interrupts_enabled = 0; std::cout << "irq off\n"; }
void enable_irq() { interrupts_enabled = 1; std::cout << "irq on\n"; }

// TODO: class IrqGuard { ... };

int counter = 0;

// Adds delta to the shared counter, rejecting changes that would exceed 100.
bool update_counter(int delta) {
    disable_irq();
    if (counter + delta > 100) {
        std::cout << "rejected\n";
        return false;
    }
    counter += delta;
    enable_irq();
    return true;
}

int main() {
    int delta;
    while (std::cin >> delta) {
        update_counter(delta);
        std::cout << "counter=" << counter << " irq=" << interrupts_enabled << "\n";
    }
}
`,
    tests: [
      { label: 'Accepted then rejected', stdin: '50 60', expected: 'irq off\nirq on\ncounter=50 irq=1\nirq off\nrejected\nirq on\ncounter=50 irq=1' },
      { label: 'Recovers after a reject', stdin: '90 20 10', expected: 'irq off\nirq on\ncounter=90 irq=1\nirq off\nrejected\nirq on\ncounter=90 irq=1\nirq off\nirq on\ncounter=100 irq=1' },
      { label: 'Only accepted', stdin: '1 2', expected: 'irq off\nirq on\ncounter=1 irq=1\nirq off\nirq on\ncounter=3 irq=1', hidden: true },
    ],
    hints: [
      'A local object\'s destructor runs on every way out of its scope — including early returns.',
      'Constructor: disable_irq(). Destructor: enable_irq(). Then replace the manual calls with one IrqGuard local at the top of the function.',
      'class IrqGuard { public: IrqGuard() { disable_irq(); } ~IrqGuard() { enable_irq(); } IrqGuard(const IrqGuard&) = delete; IrqGuard& operator=(const IrqGuard&) = delete; };',
    ],
    solution: src`
#include <iostream>

int interrupts_enabled = 1;
void disable_irq() { interrupts_enabled = 0; std::cout << "irq off\n"; }
void enable_irq() { interrupts_enabled = 1; std::cout << "irq on\n"; }

class IrqGuard {
public:
    IrqGuard() { disable_irq(); }
    ~IrqGuard() { enable_irq(); }
    IrqGuard(const IrqGuard &) = delete;
    IrqGuard &operator=(const IrqGuard &) = delete;
};

int counter = 0;

// Adds delta to the shared counter, rejecting changes that would exceed 100.
bool update_counter(int delta) {
    IrqGuard guard;
    if (counter + delta > 100) {
        std::cout << "rejected\n";
        return false;
    }
    counter += delta;
    return true;
}

int main() {
    int delta;
    while (std::cin >> delta) {
        update_counter(delta);
        std::cout << "counter=" << counter << " irq=" << interrupts_enabled << "\n";
    }
}
`,
    explanation: 'RAII ties a resource (here, "interrupts are off") to an object\'s lifetime. The same pattern guards mutexes (`std::lock_guard`), chip-select lines and DMA buffers. Deleting the copy operations stops the guard from being duplicated by accident.',
  },

  // ======================= Phase 5 — Architecture =======================
  {
    id: 'lab-reg-field', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-arch', tags: ['registers', 'bitwise'], language: 'c',
    title: 'Write a register bit-field',
    objective: 'Change a multi-bit field without disturbing its neighbours.',
    description: 'Input: a 32-bit register value (hex), the field\'s lowest bit **pos**, its **width** (1–16) and the new field value (hex). Print the updated register as `0x%08X`. If the value does not fit in the field, print `OVERFLOW`. Example: setting pin 5 of an STM32 `GPIOx_MODER` to output (`01`) writes a 2-bit field at bit 10.',
    io: '**Input:** `0xA8000000 10 2 0x1`\n\n**Output:** `0xA8000400`',
    starter: src`
#include <stdio.h>
#include <stdint.h>

int main(void) {
    unsigned int reg_in, value_in;
    int pos, width;
    if (scanf("%x %d %d %x", &reg_in, &pos, &width, &value_in) != 4) return 1;
    uint32_t reg = reg_in, value = value_in;

    /* TODO: build a mask for the field, clear it, then OR in the shifted value */

    printf("0x%08X\n", (unsigned)reg);
    return 0;
}
`,
    tests: [
      { label: 'MODER pin 5 output', stdin: '0xA8000000 10 2 0x1', expected: '0xA8000400' },
      { label: 'Clear a nibble', stdin: '0xFFFFFFFF 4 4 0x0', expected: '0xFFFFFF0F' },
      { label: 'Top nibble', stdin: '0x00000000 28 4 0xF', expected: '0xF0000000' },
      { label: 'Overwrite old bits', stdin: '0xA8000C00 10 2 0x1', expected: '0xA8000400', hidden: true },
      { label: 'Byte field', stdin: '0x12345678 8 8 0xAB', expected: '0x1234AB78', hidden: true },
      { label: 'Too wide', stdin: '0x0 0 2 0x5', expected: 'OVERFLOW', hidden: true },
    ],
    hints: [
      'A field of width w has the value range 0 … 2^w − 1.',
      'mask = ((1u << width) − 1) << pos. Clear with reg & ~mask, then OR in value << pos.',
      'uint32_t field = (1u << width) - 1u; if (value > field) { puts("OVERFLOW"); return 0; } reg = (reg & ~(field << pos)) | (value << pos);',
    ],
    solution: src`
#include <stdio.h>
#include <stdint.h>

int main(void) {
    unsigned int reg_in, value_in;
    int pos, width;
    if (scanf("%x %d %d %x", &reg_in, &pos, &width, &value_in) != 4) return 1;
    uint32_t reg = reg_in, value = value_in;
    uint32_t field = (1u << width) - 1u;
    if (value > field) {
        puts("OVERFLOW");
        return 0;
    }
    reg = (reg & ~(field << pos)) | (value << pos);
    printf("0x%08X\n", (unsigned)reg);
    return 0;
}
`,
    explanation: 'This read-modify-write is what every `MODIFY_REG` macro in STM32 and ESP-IDF headers does. Forgetting to clear first is the classic bug: OR-ing 01 into an old 11 leaves 11.',
  },
  {
    id: 'lab-imu-bytes', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-arch', tags: ['endianness', 'datasheets', 'i2c'], language: 'c',
    title: 'Assemble signed IMU readings',
    objective: 'Combine big-endian bytes into signed 16-bit values.',
    description: 'An MPU-6050 sends each axis as two bytes, **high byte first**, in two\'s complement. Input: **n**, then **n** pairs of hex bytes. Print the signed values separated by spaces.',
    io: '**Input:**\n```\n2\n0xFF 0x38 0x40 0x00\n```\n**Output:** `-200 16384`',
    starter: src`
#include <stdio.h>
#include <stdint.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    for (int i = 0; i < n; i++) {
        unsigned int hi, lo;
        if (scanf("%x %x", &hi, &lo) != 2) return 1;

        int value = 0; /* TODO: combine hi and lo into a signed 16-bit value */

        printf(i ? " %d" : "%d", value);
    }
    printf("\n");
    return 0;
}
`,
    tests: [
      { label: 'Example', stdin: '2\n0xFF 0x38 0x40 0x00', expected: '-200 16384' },
      { label: 'Extremes', stdin: '2\n0x80 0x00 0x7F 0xFF', expected: '-32768 32767' },
      { label: 'Zero', stdin: '1\n0x00 0x00', expected: '0' },
      { label: 'Minus one', stdin: '1\n0xFF 0xFF', expected: '-1', hidden: true },
    ],
    hints: [
      'Shift the high byte up by 8 and OR in the low byte — then interpret the 16 bits as signed.',
      'Without the cast to int16_t, 0xFF38 is just 65336.',
      'int16_t value = (int16_t)((hi << 8) | lo);',
    ],
    solution: src`
#include <stdio.h>
#include <stdint.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    for (int i = 0; i < n; i++) {
        unsigned int hi, lo;
        if (scanf("%x %x", &hi, &lo) != 2) return 1;
        int16_t value = (int16_t)(((hi & 0xFFu) << 8) | (lo & 0xFFu));
        printf(i ? " %d" : "%d", value);
    }
    printf("\n");
    return 0;
}
`,
    explanation: 'At ±2 g full scale, 16384 counts = 1 g. Forgetting the signed cast makes every negative acceleration look like a huge positive one — a bug that is easy to miss when the robot sits level.',
  },

  // ======================= Phase 6 — Arduino =======================
  {
    id: 'lab-arduino-map', kind: 'code', level: 'implement', difficulty: 1, moduleId: 'm-arduino', tags: ['adc', 'integer-math'], language: 'c',
    title: 'Re-implement map()',
    objective: 'Scale ranges with integer arithmetic exactly as Arduino does.',
    description: 'Implement `map_range(x, in_min, in_max, out_min, out_max)` with the same integer formula as Arduino\'s `map()`: results truncate toward zero and reversed output ranges work. Each input line has five integers; print one result per line.',
    io: '**Input:** `512 0 1023 0 255`\n\n**Output:** `127`',
    starter: src`
#include <stdio.h>

long map_range(long x, long in_min, long in_max, long out_min, long out_max) {
    /* TODO */
    (void)x; (void)in_min; (void)in_max; (void)out_min; (void)out_max;
    return 0;
}

int main(void) {
    long x, a, b, c, d;
    while (scanf("%ld %ld %ld %ld %ld", &x, &a, &b, &c, &d) == 5) {
        printf("%ld\n", map_range(x, a, b, c, d));
    }
    return 0;
}
`,
    tests: [
      { label: 'ADC to PWM', stdin: '512 0 1023 0 255', expected: '127' },
      { label: 'Range ends', stdin: '0 0 1023 0 255\n1023 0 1023 0 255', expected: '0\n255' },
      { label: 'Reversed output', stdin: '300 0 1023 255 0', expected: '181' },
      { label: 'Negative output range', stdin: '50 0 100 -100 100', expected: '0', hidden: true },
      { label: 'Offset output', stdin: '700 0 1023 1000 2000', expected: '1684', hidden: true },
    ],
    hints: [
      'Shift x to start at 0, scale by the ratio of the two spans, then shift to the output start.',
      'Multiply before dividing, or integer division throws the result away.',
      'return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;',
    ],
    solution: src`
#include <stdio.h>

long map_range(long x, long in_min, long in_max, long out_min, long out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

int main(void) {
    long x, a, b, c, d;
    while (scanf("%ld %ld %ld %ld %ld", &x, &a, &b, &c, &d) == 5) {
        printf("%ld\n", map_range(x, a, b, c, d));
    }
    return 0;
}
`,
    explanation: 'On the 8-bit Uno an `int` is 16 bits, so 512 × 255 would overflow — that is why `map()` uses `long`. It truncates, so 1023 → 255 works but intermediate values round down.',
  },
  {
    id: 'lab-debounce-sim', kind: 'code', level: 'create', difficulty: 3, moduleId: 'm-arduino', tags: ['arduino-gpio', 'debouncing'], language: 'c',
    title: 'Debounce a noisy button in software',
    objective: 'Turn a bouncing input into clean presses with a counter.',
    description: 'The input is a string of raw samples (`0`/`1`) taken every 5 ms. The stable state starts at `0`. The stable state changes only after **4 consecutive samples** that differ from it; any sample equal to the stable state resets the counter. Print the stable state after each sample as one string, then `presses=<number of 0→1 changes>`.',
    io: '**Input:** `00110111110000`\n\n**Output:**\n```\n00000000111110\npresses=1\n```',
    starter: src`
#include <stdio.h>

int main(void) {
    char raw[257];
    if (scanf("%256s", raw) != 1) return 1;
    int stable = 0, counter = 0, presses = 0;

    for (int i = 0; raw[i]; i++) {
        int sample = raw[i] - '0';
        /* TODO: update counter, stable and presses */
        (void)sample;
        putchar('0' + stable);
    }
    printf("\npresses=%d\n", presses);
    (void)counter;
    return 0;
}
`,
    tests: [
      { label: 'Bouncy press and release', stdin: '00110111110000', expected: '00000000111110\npresses=1' },
      { label: 'Short glitch ignored', stdin: '0001110000', expected: '0000000000\npresses=0' },
      { label: 'Two presses', stdin: '111100001111', expected: '000111100001\npresses=2' },
      { label: 'Held with a dropout', stdin: '1111101111100000', expected: '0001111111111100\npresses=1', hidden: true },
    ],
    hints: [
      'Only samples that disagree with the stable state count towards a change.',
      'if (sample != stable) { if (++counter >= 4) { stable = sample; counter = 0; if (stable) presses++; } } else counter = 0;',
      'The change is accepted on the 4th differing sample, so that sample already prints the new state.',
    ],
    solution: src`
#include <stdio.h>

int main(void) {
    char raw[257];
    if (scanf("%256s", raw) != 1) return 1;
    int stable = 0, counter = 0, presses = 0;

    for (int i = 0; raw[i]; i++) {
        int sample = raw[i] - '0';
        if (sample != stable) {
            if (++counter >= 4) {
                stable = sample;
                counter = 0;
                if (stable) presses++;
            }
        } else {
            counter = 0;
        }
        putchar('0' + stable);
    }
    printf("\npresses=%d\n", presses);
    return 0;
}
`,
    explanation: 'Four samples at 5 ms means a change must persist for 20 ms — longer than typical contact bounce, short enough to feel instant. This counter version needs no `delay()`, so the loop stays responsive.',
  },
  {
    id: 'lab-moving-average', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-arduino', tags: ['adc', 'filtering', 'buffers'], language: 'c',
    title: 'Moving-average filter for ADC readings',
    objective: 'Smooth samples with a fixed window and a running sum.',
    description: 'Read **n**, then **n** ADC readings. After each reading, print the integer average (truncated) of the **last 4** readings — or of all readings so far while fewer than 4 have arrived. Separate outputs with spaces.',
    io: '**Input:**\n```\n6\n100 200 300 400 500 600\n```\n**Output:** `100 150 200 250 350 450`',
    starter: src`
#include <stdio.h>
#include <stdint.h>

#define WINDOW 4

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    uint16_t window[WINDOW] = {0};
    uint32_t sum = 0;
    int index = 0, filled = 0;

    for (int i = 0; i < n; i++) {
        int raw;
        if (scanf("%d", &raw) != 1) return 1;

        /* TODO: replace the oldest sample, keep sum up to date, print sum / filled */

    }
    printf("\n");
    (void)window; (void)sum; (void)index; (void)filled;
    return 0;
}
`,
    tests: [
      { label: 'Ramp', stdin: '6\n100 200 300 400 500 600', expected: '100 150 200 250 350 450' },
      { label: 'Truncation', stdin: '3\n5 6 6', expected: '5 5 5' },
      { label: 'Alternating extremes', stdin: '5\n1023 0 1023 0 1023', expected: '1023 511 682 511 511', hidden: true },
    ],
    hints: [
      'Keep the last 4 samples in a circular array and a running sum, so each update costs O(1).',
      'sum -= window[index]; window[index] = raw; sum += raw; index = (index + 1) % WINDOW; if (filled < WINDOW) filled++;',
      'printf(i ? " %u" : "%u", (unsigned)(sum / filled));',
    ],
    solution: src`
#include <stdio.h>
#include <stdint.h>

#define WINDOW 4

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    uint16_t window[WINDOW] = {0};
    uint32_t sum = 0;
    int index = 0, filled = 0;

    for (int i = 0; i < n; i++) {
        int raw;
        if (scanf("%d", &raw) != 1) return 1;
        sum -= window[index];
        window[index] = (uint16_t)raw;
        sum += (uint32_t)raw;
        index = (index + 1) % WINDOW;
        if (filled < WINDOW) filled++;
        printf(i ? " %u" : "%u", (unsigned)(sum / filled));
    }
    printf("\n");
    return 0;
}
`,
    explanation: 'Subtracting the outgoing sample keeps the cost constant however large the window. Because the slots start at zero, removing an "empty" slot subtracts nothing, so the warm-up needs no special case.',
  },

  // ======================= Phase 7 — ESP32 =======================
  {
    id: 'lab-mqtt-topic', kind: 'code', level: 'create', difficulty: 3, moduleId: 'm-esp32', tags: ['wifi-mqtt', 'c-strings'], language: 'c',
    title: 'MQTT topic matching',
    objective: 'Implement the + and # wildcard rules.',
    description: 'Each line holds a subscription **filter** and a **topic**. Levels are separated by `/`. `+` matches exactly one level; `#` (always last) matches any number of remaining levels, including none, so `a/#` also matches `a`. Print `MATCH` or `NO` for each line.',
    io: '**Input:** `kforge/+/co2 kforge/robot1/co2`\n\n**Output:** `MATCH`',
    starter: src`
#include <stdio.h>
#include <string.h>

/* Splits s in place on '/'. Returns the number of levels. */
static int split(char *s, char *levels[], int max) {
    int n = 0;
    for (char *p = strtok(s, "/"); p && n < max; p = strtok(NULL, "/")) levels[n++] = p;
    return n;
}

int matches(char *filter, char *topic) {
    char *f[16], *t[16];
    int nf = split(filter, f, 16);
    int nt = split(topic, t, 16);

    /* TODO: compare level by level */
    (void)f; (void)t; (void)nf; (void)nt;
    return 0;
}

int main(void) {
    char filter[128], topic[128];
    while (scanf("%127s %127s", filter, topic) == 2) {
        puts(matches(filter, topic) ? "MATCH" : "NO");
    }
    return 0;
}
`,
    tests: [
      { label: 'Exact and +', stdin: 'kforge/robot1/co2 kforge/robot1/co2\nkforge/+/co2 kforge/robot1/co2\nkforge/+/co2 kforge/robot1/temp', expected: 'MATCH\nMATCH\nNO' },
      { label: '# wildcard', stdin: 'kforge/# kforge/robot1/co2\nkforge/# kforge', expected: 'MATCH\nMATCH' },
      { label: 'Level counts', stdin: 'kforge/+ kforge/robot1/co2\nkforge/robot1 kforge/robot1/co2\n+/+/co2 kforge/robot1/co2', expected: 'NO\nNO\nMATCH' },
      { label: 'Edge cases', stdin: '# anything/at/all\nkforge/+/+ kforge/robot1', expected: 'MATCH\nNO', hidden: true },
    ],
    hints: [
      'Walk the filter levels. # ends the comparison with a match; otherwise each filter level needs a topic level.',
      'A level matches when it is "+" or equal to the topic level. After the loop, both must have run out together.',
      'for (int i = 0; i < nf; i++) { if (!strcmp(f[i], "#")) return 1; if (i >= nt) return 0; if (strcmp(f[i], "+") && strcmp(f[i], t[i])) return 0; } return nf == nt;',
    ],
    solution: src`
#include <stdio.h>
#include <string.h>

/* Splits s in place on '/'. Returns the number of levels. */
static int split(char *s, char *levels[], int max) {
    int n = 0;
    for (char *p = strtok(s, "/"); p && n < max; p = strtok(NULL, "/")) levels[n++] = p;
    return n;
}

int matches(char *filter, char *topic) {
    char *f[16], *t[16];
    int nf = split(filter, f, 16);
    int nt = split(topic, t, 16);
    for (int i = 0; i < nf; i++) {
        if (strcmp(f[i], "#") == 0) return 1;
        if (i >= nt) return 0;
        if (strcmp(f[i], "+") != 0 && strcmp(f[i], t[i]) != 0) return 0;
    }
    return nf == nt;
}

int main(void) {
    char filter[128], topic[128];
    while (scanf("%127s %127s", filter, topic) == 2) {
        puts(matches(filter, topic) ? "MATCH" : "NO");
    }
    return 0;
}
`,
    explanation: 'This is how a broker decides who receives a message. Designing topics as `project/device/measurement` lets a dashboard subscribe to `kforge/+/co2` and see every robot at once.',
  },
  {
    id: 'lab-json-payload', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-esp32', tags: ['wifi-mqtt', 'fixed-point'], language: 'c',
    title: 'Build a JSON telemetry payload',
    objective: 'Format fixed-point values safely with snprintf.',
    description: 'Each line holds `co2_ppm temp_tenths humidity`. Build `{"co2":650,"temp":23.5,"hum":41}` with `snprintf` into a 64-byte buffer and print it. Use **integer arithmetic** for the temperature (many embedded `printf` builds omit `%f`), and keep the sign of values between −1 and 0 °C.',
    io: '**Input:** `650 235 41`\n\n**Output:** `{"co2":650,"temp":23.5,"hum":41}`',
    starter: src`
#include <stdio.h>

int main(void) {
    int co2, temp, hum;
    char buf[64];
    while (scanf("%d %d %d", &co2, &temp, &hum) == 3) {
        /* TODO: snprintf the JSON into buf */
        buf[0] = '\0';
        puts(buf);
    }
    return 0;
}
`,
    tests: [
      { label: 'Typical', stdin: '650 235 41', expected: '{"co2":650,"temp":23.5,"hum":41}' },
      { label: 'Just below zero', stdin: '420 -5 80', expected: '{"co2":420,"temp":-0.5,"hum":80}' },
      { label: 'Cold', stdin: '1500 -123 0', expected: '{"co2":1500,"temp":-12.3,"hum":0}', hidden: true },
      { label: 'Exactly zero', stdin: '400 0 50', expected: '{"co2":400,"temp":0.0,"hum":50}', hidden: true },
    ],
    hints: [
      'Print the sign yourself, then the whole and fractional parts of the absolute value.',
      'temp / 10 is 0 for −5, so "%d.%d" loses the minus sign. Use abs and a "-" prefix.',
      'int a = temp < 0 ? -temp : temp; snprintf(buf, sizeof buf, "{\\"co2\\":%d,\\"temp\\":%s%d.%d,\\"hum\\":%d}", co2, temp < 0 ? "-" : "", a / 10, a % 10, hum);',
    ],
    solution: src`
#include <stdio.h>

int main(void) {
    int co2, temp, hum;
    char buf[64];
    while (scanf("%d %d %d", &co2, &temp, &hum) == 3) {
        int a = temp < 0 ? -temp : temp;
        snprintf(buf, sizeof buf, "{\"co2\":%d,\"temp\":%s%d.%d,\"hum\":%d}",
                 co2, temp < 0 ? "-" : "", a / 10, a % 10, hum);
        puts(buf);
    }
    return 0;
}
`,
    explanation: '`snprintf` never writes past the buffer, unlike `sprintf`. The −0.5 case is the bug that slips through summer testing and appears in the first winter field test.',
  },
  {
    id: 'lab-crc8-sht', kind: 'code', level: 'implement', difficulty: 3, moduleId: 'm-esp32', tags: ['i2c', 'crc', 'datasheets'], language: 'c',
    title: 'Sensirion CRC-8',
    objective: 'Implement a bitwise CRC from a datasheet specification.',
    description: 'Sensirion sensors (SHT3x, SCD4x) protect every 2-byte word with CRC-8: polynomial **0x31** (x⁸ + x⁵ + x⁴ + 1), initial value **0xFF**, no reflection, no final XOR. The datasheet test vector is `0xBE 0xEF` → `0x92`. Input: **n**, then **n** hex bytes. Print the CRC as `0x%02X`.',
    io: '**Input:**\n```\n2\n0xBE 0xEF\n```\n**Output:** `0x92`',
    starter: src`
#include <stdio.h>
#include <stdint.h>

uint8_t crc8(const uint8_t *data, int len) {
    uint8_t crc = 0xFF;
    /* TODO: for each byte, XOR it in, then process 8 bits */
    (void)data;
    (void)len;
    return crc;
}

int main(void) {
    int n;
    uint8_t buf[64];
    if (scanf("%d", &n) != 1 || n < 0 || n > 64) return 1;
    for (int i = 0; i < n; i++) {
        unsigned int b;
        if (scanf("%x", &b) != 1) return 1;
        buf[i] = (uint8_t)b;
    }
    printf("0x%02X\n", crc8(buf, n));
    return 0;
}
`,
    tests: [
      { label: 'Datasheet vector', stdin: '2\n0xBE 0xEF', expected: '0x92' },
      { label: 'Zero word', stdin: '2\n0x00 0x00', expected: '0x81' },
      { label: 'No data', stdin: '0', expected: '0xFF' },
      { label: 'Second word', stdin: '2\n0x66 0x66', expected: '0x93', hidden: true },
    ],
    hints: [
      'Shift left one bit at a time; when the bit falling off the top was 1, XOR in the polynomial.',
      'crc ^= byte; then 8 times: crc = (crc & 0x80) ? (crc << 1) ^ 0x31 : crc << 1;',
      'Keep crc as uint8_t (or mask with 0xFF) so the shifted-out bit disappears.',
    ],
    solution: src`
#include <stdio.h>
#include <stdint.h>

uint8_t crc8(const uint8_t *data, int len) {
    uint8_t crc = 0xFF;
    for (int i = 0; i < len; i++) {
        crc ^= data[i];
        for (int bit = 0; bit < 8; bit++) {
            crc = (crc & 0x80) ? (uint8_t)((crc << 1) ^ 0x31) : (uint8_t)(crc << 1);
        }
    }
    return crc;
}

int main(void) {
    int n;
    uint8_t buf[64];
    if (scanf("%d", &n) != 1 || n < 0 || n > 64) return 1;
    for (int i = 0; i < n; i++) {
        unsigned int b;
        if (scanf("%x", &b) != 1) return 1;
        buf[i] = (uint8_t)b;
    }
    printf("0x%02X\n", crc8(buf, n));
    return 0;
}
`,
    explanation: 'Always test a CRC against the datasheet vector first. Rejecting readings with a bad CRC turns a loose I2C wire from "strange numbers on the dashboard" into a clear, countable error.',
  },

  // ======================= Phase 8 — STM32 =======================
  {
    id: 'lab-timer-psc-arr', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-stm32', tags: ['timers'], language: 'c',
    title: 'Find PSC and ARR for any frequency',
    objective: 'Search 16-bit prescaler and auto-reload values for an exact timer frequency.',
    description: 'A timer\'s update frequency is f = clk / ((PSC + 1)(ARR + 1)), with PSC and ARR both 16-bit (0–65535). Each line holds `clk_hz f_hz`. Print the **smallest PSC** that gives the frequency **exactly** with 1 ≤ ARR ≤ 65535, as `PSC=<psc> ARR=<arr>`, or `NONE` if no exact pair exists.',
    io: '**Input:** `72000000 1000`\n\n**Output:** `PSC=1 ARR=35999`',
    starter: src`
#include <stdio.h>

int main(void) {
    unsigned long clk, f;
    while (scanf("%lu %lu", &clk, &f) == 2) {
        /* TODO: total = clk / f must be exact; then try PSC = 0, 1, 2 ... */
    }
    return 0;
}
`,
    tests: [
      { label: '1 kHz from 72 MHz', stdin: '72000000 1000', expected: 'PSC=1 ARR=35999' },
      { label: '50 Hz servo from 16 MHz', stdin: '16000000 50', expected: 'PSC=4 ARR=63999' },
      { label: 'Not exact', stdin: '72000000 7', expected: 'NONE' },
      { label: '1 Hz from 84 MHz', stdin: '84000000 1', expected: 'PSC=1343 ARR=62499', hidden: true },
      { label: 'Fast timer', stdin: '8000000 1000000', expected: 'PSC=0 ARR=7', hidden: true },
      { label: 'ARR would be 0', stdin: '1000 1000', expected: 'NONE', hidden: true },
    ],
    hints: [
      'total = clk / f is the number of input clocks per period. You need (PSC + 1) to divide it exactly.',
      'For d = PSC + 1 from 1 to 65536: if total % d == 0 and total / d − 1 is between 1 and 65535, you have the answer.',
      'Check clk % f == 0 first, otherwise no pair can be exact.',
    ],
    solution: src`
#include <stdio.h>

int main(void) {
    unsigned long clk, f;
    while (scanf("%lu %lu", &clk, &f) == 2) {
        int found = 0;
        if (f > 0 && clk % f == 0) {
            unsigned long total = clk / f;
            for (unsigned long d = 1; d <= 65536UL; d++) {
                if (total % d != 0) continue;
                unsigned long arr = total / d - 1;
                if (arr >= 1 && arr <= 65535UL) {
                    printf("PSC=%lu ARR=%lu\n", d - 1, arr);
                    found = 1;
                    break;
                }
            }
        }
        if (!found) puts("NONE");
    }
    return 0;
}
`,
    explanation: 'The smallest prescaler gives the largest ARR, which means the finest PWM duty-cycle resolution. CubeMX does this search for you; now you know what it is doing.',
  },
  {
    id: 'lab-usart-brr', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-stm32', tags: ['uart', 'registers'], language: 'c',
    title: 'USART baud-rate register and error',
    objective: 'Compute BRR and decide if the baud error is acceptable.',
    description: 'With 16× oversampling, BRR = round(f_clk / baud). Each line holds `fclk baud`. Print `BRR=0x%04X baud=<actual, 0 decimals> err=<percent, 2 decimals>%` followed by ` OK` if |error| ≤ 2 % or ` TOO HIGH` otherwise. The actual baud is f_clk / BRR.',
    io: '**Input:** `16000000 115200`\n\n**Output:** `BRR=0x008B baud=115108 err=-0.08% OK`',
    starter: src`
#include <stdio.h>

int main(void) {
    unsigned long fclk, baud;
    while (scanf("%lu %lu", &fclk, &baud) == 2) {
        /* TODO: round to the nearest BRR, then compute the actual baud and the error */
    }
    return 0;
}
`,
    tests: [
      { label: '115200 at 16 MHz', stdin: '16000000 115200', expected: 'BRR=0x008B baud=115108 err=-0.08% OK' },
      { label: '9600 at 16 MHz', stdin: '16000000 9600', expected: 'BRR=0x0683 baud=9598 err=-0.02% OK' },
      { label: 'Too fast for the clock', stdin: '8000000 921600', expected: 'BRR=0x0009 baud=888889 err=-3.55% TOO HIGH' },
      { label: 'Exact divisor', stdin: '72000000 115200', expected: 'BRR=0x0271 baud=115200 err=0.00% OK', hidden: true },
    ],
    hints: [
      'Round an integer division by adding half the divisor first.',
      'brr = (fclk + baud / 2) / baud; actual = (double)fclk / brr; err = (actual − baud) / baud × 100.',
      'printf("BRR=0x%04lX baud=%.0f err=%.2f%% %s\\n", brr, actual, err, (err > 2 || err < -2) ? "TOO HIGH" : "OK");',
    ],
    solution: src`
#include <stdio.h>

int main(void) {
    unsigned long fclk, baud;
    while (scanf("%lu %lu", &fclk, &baud) == 2) {
        unsigned long brr = (fclk + baud / 2) / baud;
        double actual = (double)fclk / (double)brr;
        double err = (actual - (double)baud) / (double)baud * 100.0;
        printf("BRR=0x%04lX baud=%.0f err=%.2f%% %s\n", brr, actual, err,
               (err > 2.0 || err < -2.0) ? "TOO HIGH" : "OK");
    }
    return 0;
}
`,
    explanation: 'Both ends of a UART link may each be a few percent off, so keep your own error well under 2 %. When the error is too high, change the clock or the baud rate — not the cable.',
  },
  {
    id: 'lab-adc-millivolts', kind: 'code', level: 'implement', difficulty: 1, moduleId: 'm-stm32', tags: ['adc', 'fixed-point'], language: 'c',
    title: 'ADC counts to millivolts without floats',
    objective: 'Scale with rounded integer arithmetic and reject impossible values.',
    description: 'A 12-bit ADC with a 3300 mV reference returns 0–4095. Read **n**, then **n** raw values. Print each in millivolts, **rounded to the nearest mV**, separated by spaces. A value above 4095 is a fault: print `ERR` for it.',
    io: '**Input:**\n```\n4\n0 4095 2048 1241\n```\n**Output:** `0 3300 1650 1000`',
    starter: src`
#include <stdio.h>
#include <stdint.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    for (int i = 0; i < n; i++) {
        unsigned long raw;
        if (scanf("%lu", &raw) != 1) return 1;
        if (i) putchar(' ');

        /* TODO: print ERR or the rounded millivolts */

    }
    printf("\n");
    return 0;
}
`,
    tests: [
      { label: 'Example', stdin: '4\n0 4095 2048 1241', expected: '0 3300 1650 1000' },
      { label: 'Fault value', stdin: '2\n4096 100', expected: 'ERR 81' },
      { label: 'Just below full scale', stdin: '1\n4094', expected: '3299', hidden: true },
    ],
    hints: [
      'mV = raw × 3300 / 4095. Multiply first, in a 32-bit type.',
      'To round instead of truncate, add half the divisor before dividing: (raw × 3300 + 2047) / 4095.',
      'uint32_t mv = ((uint32_t)raw * 3300u + 2047u) / 4095u; printf("%lu", (unsigned long)mv);',
    ],
    solution: src`
#include <stdio.h>
#include <stdint.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    for (int i = 0; i < n; i++) {
        unsigned long raw;
        if (scanf("%lu", &raw) != 1) return 1;
        if (i) putchar(' ');
        if (raw > 4095) {
            printf("ERR");
            continue;
        }
        uint32_t mv = ((uint32_t)raw * 3300u + 2047u) / 4095u;
        printf("%lu", (unsigned long)mv);
    }
    printf("\n");
    return 0;
}
`,
    explanation: 'On an MCU without an FPU, this integer version is many times faster than floating point. 4095 × 3300 fits easily in 32 bits but would overflow a 16-bit `int`.',
  },

  // ======================= Phase 9 — RTOS =======================
  {
    id: 'lab-rm-schedulability', kind: 'code', level: 'create', difficulty: 3, moduleId: 'm-rtos', tags: ['rtos', 'scheduling'], language: 'c',
    title: 'Rate-monotonic schedulability check',
    objective: 'Compute CPU utilisation and apply the Liu & Layland bound.',
    description: 'Read **n** (1–8) periodic tasks, each as `C T` (worst-case execution time and period, in ms). Utilisation U = Σ C/T. Print `U=<3 decimals> bound=<3 decimals> <verdict>`, where the verdict is `schedulable` if U ≤ bound, `overloaded` if U > 1, and `inconclusive` otherwise (it needs response-time analysis). The bound table n(2^(1/n) − 1) is provided.',
    io: '**Input:**\n```\n3\n1 4\n1 5\n2 10\n```\n**Output:** `U=0.650 bound=0.780 schedulable`',
    starter: src`
#include <stdio.h>

/* Liu & Layland bound n(2^(1/n) - 1) for n = 1 ... 8 */
static const double BOUND[9] = {0, 1.0, 0.8284, 0.7798, 0.7568, 0.7435, 0.7348, 0.7286, 0.7241};

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 1 || n > 8) return 1;
    double u = 0.0;
    for (int i = 0; i < n; i++) {
        double c, t;
        if (scanf("%lf %lf", &c, &t) != 2) return 1;
        /* TODO: add this task's utilisation */
        (void)c; (void)t;
    }

    /* TODO: print U, the bound and the verdict */
    (void)u;
    return 0;
}
`,
    tests: [
      { label: 'Under the bound', stdin: '3\n1 4\n1 5\n2 10', expected: 'U=0.650 bound=0.780 schedulable' },
      { label: 'Between bound and 1', stdin: '2\n2 4\n3 6', expected: 'U=1.000 bound=0.828 inconclusive' },
      { label: 'Over 100 %', stdin: '2\n3 4\n2 5', expected: 'U=1.150 bound=0.828 overloaded' },
      { label: 'Single task', stdin: '1\n5 10', expected: 'U=0.500 bound=1.000 schedulable', hidden: true },
    ],
    hints: [
      'Each task uses C/T of the CPU. Add them up.',
      'Check U > 1 first (overloaded), then U <= BOUND[n] (schedulable), otherwise inconclusive.',
      'printf("U=%.3f bound=%.3f %s\\n", u, BOUND[n], verdict);',
    ],
    solution: src`
#include <stdio.h>

/* Liu & Layland bound n(2^(1/n) - 1) for n = 1 ... 8 */
static const double BOUND[9] = {0, 1.0, 0.8284, 0.7798, 0.7568, 0.7435, 0.7348, 0.7286, 0.7241};

int main(void) {
    int n;
    if (scanf("%d", &n) != 1 || n < 1 || n > 8) return 1;
    double u = 0.0;
    for (int i = 0; i < n; i++) {
        double c, t;
        if (scanf("%lf %lf", &c, &t) != 2) return 1;
        u += c / t;
    }
    const char *verdict = u > 1.0 + 1e-9 ? "overloaded" : (u <= BOUND[n] ? "schedulable" : "inconclusive");
    printf("U=%.3f bound=%.3f %s\n", u, BOUND[n], verdict);
    return 0;
}
`,
    explanation: 'The bound is sufficient, not necessary: a task set between the bound and 100 % may still meet every deadline, which response-time analysis can prove. Above 100 % nothing can save it.',
  },
  {
    id: 'lab-backoff', kind: 'code', level: 'implement', difficulty: 1, moduleId: 'm-rtos', tags: ['wifi-mqtt', 'robustness'], language: 'c',
    title: 'Exponential reconnect back-off',
    objective: 'Double a delay up to a cap without integer overflow.',
    description: 'A reconnect task waits `base`, then 2×, 4× … that, never more than `cap`. Input: `base cap attempts`. Print the delay before each attempt, separated by spaces. Attempts can be large, so the calculation must not overflow.',
    io: '**Input:** `500 30000 8`\n\n**Output:** `500 1000 2000 4000 8000 16000 30000 30000`',
    starter: src`
#include <stdio.h>
#include <stdint.h>

int main(void) {
    uint32_t base, cap;
    int attempts;
    if (scanf("%u %u %d", &base, &cap, &attempts) != 3) return 1;

    /* TODO: print each delay */

    printf("\n");
    return 0;
}
`,
    tests: [
      { label: 'MQTT defaults', stdin: '500 30000 8', expected: '500 1000 2000 4000 8000 16000 30000 30000' },
      { label: 'Low cap', stdin: '1000 5000 4', expected: '1000 2000 4000 5000' },
      { label: 'Many attempts', stdin: '500 30000 40', expected: [500, 1000, 2000, 4000, 8000, 16000, ...Array<number>(34).fill(30000)].join(' '), hidden: true },
    ],
    hints: [
      'Keep the current delay in a variable and double it after each attempt.',
      'Stop doubling once the delay reaches the cap — otherwise 500 × 2⁴⁰ wraps around to a small number.',
      'uint32_t d = base; for (…) { print min(d, cap); if (d < cap) d = (d > cap / 2) ? cap : d * 2; }',
    ],
    solution: src`
#include <stdio.h>
#include <stdint.h>

int main(void) {
    uint32_t base, cap;
    int attempts;
    if (scanf("%u %u %d", &base, &cap, &attempts) != 3) return 1;
    uint32_t delay = base;
    for (int i = 0; i < attempts; i++) {
        uint32_t shown = delay < cap ? delay : cap;
        printf(i ? " %u" : "%u", (unsigned)shown);
        if (delay < cap) delay = (delay > cap / 2) ? cap : delay * 2;
    }
    printf("\n");
    return 0;
}
`,
    explanation: 'Back-off stops a fleet of robots from hammering a broker that just restarted. Real firmware also adds random jitter so devices do not all retry at the same instant.',
  },

  // ======================= Phase 10 — Control =======================
  {
    id: 'lab-pid-step', kind: 'code', level: 'implement', difficulty: 3, moduleId: 'm-control', tags: ['pid'], language: 'c',
    title: 'PID update with anti-windup',
    objective: 'Implement a discrete PID step exactly to a specification.',
    description: 'Input: `kp ki kd dt imax`, then the setpoint, then **n** and **n** measurements. For each measurement:\n\n1. e = setpoint − measurement\n2. integral += e·dt, then clamp to [−imax, imax]\n3. derivative = (e − previous e) / dt, but **0 on the first step**\n4. u = kp·e + ki·integral + kd·derivative, clamped to [−255, 255]\n\nPrint u with two decimals, one per line.',
    io: '**Input:**\n```\n2 0 0 0.1 100\n100\n3\n0 50 100\n```\n**Output:**\n```\n200.00\n100.00\n0.00\n```',
    starter: src`
#include <stdio.h>

typedef struct {
    double kp, ki, kd, dt, imax;
    double integral, prev_error;
    int first;
} Pid;

double pid_step(Pid *p, double setpoint, double measurement) {
    /* TODO */
    (void)p; (void)setpoint; (void)measurement;
    return 0.0;
}

int main(void) {
    Pid p = {0};
    double sp;
    int n;
    if (scanf("%lf %lf %lf %lf %lf %lf %d", &p.kp, &p.ki, &p.kd, &p.dt, &p.imax, &sp, &n) != 7) return 1;
    p.first = 1;
    for (int i = 0; i < n; i++) {
        double y;
        if (scanf("%lf", &y) != 1) return 1;
        printf("%.2f\n", pid_step(&p, sp, y));
    }
    return 0;
}
`,
    tests: [
      { label: 'P only', stdin: '2 0 0 0.1 100\n100\n3\n0 50 100', expected: '200.00\n100.00\n0.00' },
      { label: 'Integral clamp', stdin: '1 10 0 0.1 2.5\n10\n4\n0 0 0 0', expected: '20.00\n30.00\n35.00\n35.00' },
      { label: 'Output clamp and derivative', stdin: '5 0 1 0.1 100\n100\n3\n0 20 60', expected: '255.00\n200.00\n-200.00' },
      { label: 'All terms', stdin: '1 1 0.5 0.5 10\n50\n3\n40 45 55', expected: '15.00\n7.50\n-10.00', hidden: true },
    ],
    hints: [
      'Follow the four steps in order and keep integral and prev_error in the struct between calls.',
      'Clamp the integral before using it; clamp u last. Set first = 0 and prev_error = e at the end of each step.',
      'double d = p->first ? 0.0 : (e - p->prev_error) / p->dt;',
    ],
    solution: src`
#include <stdio.h>

typedef struct {
    double kp, ki, kd, dt, imax;
    double integral, prev_error;
    int first;
} Pid;

static double clamp(double v, double lo, double hi) {
    return v < lo ? lo : (v > hi ? hi : v);
}

double pid_step(Pid *p, double setpoint, double measurement) {
    double e = setpoint - measurement;
    p->integral = clamp(p->integral + e * p->dt, -p->imax, p->imax);
    double d = p->first ? 0.0 : (e - p->prev_error) / p->dt;
    double u = p->kp * e + p->ki * p->integral + p->kd * d;
    p->prev_error = e;
    p->first = 0;
    return clamp(u, -255.0, 255.0);
}

int main(void) {
    Pid p = {0};
    double sp;
    int n;
    if (scanf("%lf %lf %lf %lf %lf %lf %d", &p.kp, &p.ki, &p.kd, &p.dt, &p.imax, &sp, &n) != 7) return 1;
    p.first = 1;
    for (int i = 0; i < n; i++) {
        double y;
        if (scanf("%lf", &y) != 1) return 1;
        printf("%.2f\n", pid_step(&p, sp, y));
    }
    return 0;
}
`,
    explanation: 'Clamping the integral (anti-windup) stops it growing while the motor is saturated, which would otherwise cause a large overshoot afterwards. Zeroing the first derivative avoids a "kick" when the controller starts.',
  },
  {
    id: 'lab-lowpass', kind: 'code', level: 'implement', difficulty: 1, moduleId: 'm-control', tags: ['filtering'], language: 'c',
    title: 'First-order low-pass filter',
    objective: 'Implement an exponential moving average.',
    description: 'Input: **alpha** (0–1), **n**, then **n** samples. The output starts at the first sample, then y = y + alpha·(x − y). Print every output with two decimals, separated by spaces.',
    io: '**Input:**\n```\n0.5\n4\n0 100 100 100\n```\n**Output:** `0.00 50.00 75.00 87.50`',
    starter: src`
#include <stdio.h>

int main(void) {
    double alpha;
    int n;
    if (scanf("%lf %d", &alpha, &n) != 2) return 1;
    double y = 0.0;
    for (int i = 0; i < n; i++) {
        double x;
        if (scanf("%lf", &x) != 1) return 1;

        /* TODO: initialise y with the first sample, filter the rest */
        (void)x;

        printf(i ? " %.2f" : "%.2f", y);
    }
    printf("\n");
    return 0;
}
`,
    tests: [
      { label: 'Step response', stdin: '0.5\n4\n0 100 100 100', expected: '0.00 50.00 75.00 87.50' },
      { label: 'alpha = 1 passes through', stdin: '1\n3\n5 9 2', expected: '5.00 9.00 2.00' },
      { label: 'Heavy smoothing', stdin: '0.2\n5\n10 10 20 20 20', expected: '10.00 10.00 12.00 13.60 14.88', hidden: true },
    ],
    hints: [
      'Starting at the first sample avoids a slow ramp up from zero.',
      'if (i == 0) y = x; else y += alpha * (x - y);',
      'A smaller alpha smooths more but responds more slowly.',
    ],
    solution: src`
#include <stdio.h>

int main(void) {
    double alpha;
    int n;
    if (scanf("%lf %d", &alpha, &n) != 2) return 1;
    double y = 0.0;
    for (int i = 0; i < n; i++) {
        double x;
        if (scanf("%lf", &x) != 1) return 1;
        if (i == 0) y = x;
        else y += alpha * (x - y);
        printf(i ? " %.2f" : "%.2f", y);
    }
    printf("\n");
    return 0;
}
`,
    explanation: 'One multiply and one add per sample, with a single stored value — the cheapest useful filter for noisy CO₂ or encoder-speed readings. The trade-off is lag: check it on a step input like the first test.',
  },
  {
    id: 'lab-py-odometry', kind: 'code', level: 'create', difficulty: 3, moduleId: 'm-control', tags: ['kinematics', 'python'], language: 'python',
    title: 'Dead-reckoning odometry',
    objective: 'Integrate wheel speeds into a robot pose.',
    description: 'The first value is the wheel spacing **L** (m). Then come triples `vl vr dt` (m/s, m/s, s). Start at x = y = θ = 0 and, for each triple, use the midpoint heading:\n\n- v = (vl + vr) / 2, ω = (vr − vl) / L\n- x += v·cos(θ + ω·dt/2)·dt, y += v·sin(θ + ω·dt/2)·dt\n- θ += ω·dt\n\nPrint `x=<3 decimals> y=<3 decimals> theta=<1 decimal> deg`, with θ normalised to [−180, 180).',
    io: '**Input:**\n```\n0.1\n0.1 0.1 2\n-0.1 0.1 0.785398\n0.1 0.1 3\n```\n**Output:** `x=0.200 y=0.300 theta=90.0 deg`',
    starter: src`
import math
import sys

values = [float(t) for t in sys.stdin.read().split()]
L = values[0]
x = y = theta = 0.0

# TODO: process each (vl, vr, dt) triple from values[1:]

`,
    tests: [
      { label: 'Straight line', stdin: '0.12\n0.2 0.2 1\n0.2 0.2 1', expected: 'x=0.400 y=0.000 theta=0.0 deg' },
      { label: 'Turn in place', stdin: '0.1\n-0.1 0.1 0.785398', expected: 'x=0.000 y=0.000 theta=90.0 deg' },
      { label: 'Drive, turn, drive', stdin: '0.1\n0.1 0.1 2\n-0.1 0.1 0.785398\n0.1 0.1 3', expected: 'x=0.200 y=0.300 theta=90.0 deg' },
      { label: 'Wrap past 180°', stdin: '0.1\n-0.1 0.1 2.3561945', expected: 'x=0.000 y=0.000 theta=-90.0 deg', hidden: true },
    ],
    hints: [
      'Loop over values[1:] three at a time: for i in range(1, len(values), 3).',
      'Compute v and ω, update x and y with the midpoint heading, then update θ.',
      'deg = (math.degrees(theta) + 180) % 360 - 180; print("x={:.3f} y={:.3f} theta={:.1f} deg".format(x, y, deg))',
    ],
    solution: src`
import math
import sys

values = [float(t) for t in sys.stdin.read().split()]
L = values[0]
x = y = theta = 0.0

for i in range(1, len(values) - 2, 3):
    vl, vr, dt = values[i], values[i + 1], values[i + 2]
    v = (vl + vr) / 2
    w = (vr - vl) / L
    mid = theta + w * dt / 2
    x += v * math.cos(mid) * dt
    y += v * math.sin(mid) * dt
    theta += w * dt

deg = (math.degrees(theta) + 180) % 360 - 180
print("x={:.3f} y={:.3f} theta={:.1f} deg".format(x, y, deg))
`,
    explanation: 'Odometry drifts because every small error in L, wheel diameter or slip is integrated forever. Driving a known square and measuring the end error is the standard way to calibrate it.',
  },

  // ======================= Phase 11 — Python =======================
  {
    id: 'lab-py-outliers', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-python', tags: ['python', 'statistics'], language: 'python',
    title: 'Flag sensor spikes with z-scores',
    objective: 'Detect outliers and summarise the clean data.',
    description: 'The first value is the z-score threshold **k**, the rest are readings. Using the mean and **population** standard deviation of all readings, flag every reading with |x − mean| > k·std. Print `outliers=<comma-separated indices, or none>` and `clean_mean=<mean of the rest, 1 decimal>`. If the standard deviation is 0, nothing is an outlier.',
    io: '**Input:**\n```\n2\n10 11 10 12 11 50 10 11\n```\n**Output:**\n```\noutliers=5\nclean_mean=10.7\n```',
    starter: src`
import sys

tokens = sys.stdin.read().split()
k = float(tokens[0])
readings = [float(t) for t in tokens[1:]]

# TODO
`,
    tests: [
      { label: 'One spike', stdin: '2\n10 11 10 12 11 50 10 11', expected: 'outliers=5\nclean_mean=10.7' },
      { label: 'Constant signal', stdin: '2\n5 5 5 5', expected: 'outliers=none\nclean_mean=5.0' },
      { label: 'Two spikes', stdin: '1.5\n1 2 3 4 100 -100', expected: 'outliers=4,5\nclean_mean=2.5', hidden: true },
    ],
    hints: [
      'Compute the mean, then std = sqrt(mean of squared deviations).',
      'Collect the indices with enumerate; the clean list is every reading whose index is not flagged.',
      'print("outliers=" + (",".join(str(i) for i in idx) if idx else "none"))',
    ],
    solution: src`
import math
import sys

tokens = sys.stdin.read().split()
k = float(tokens[0])
readings = [float(t) for t in tokens[1:]]

n = len(readings)
mean = sum(readings) / n
std = math.sqrt(sum((x - mean) ** 2 for x in readings) / n)
idx = [i for i, x in enumerate(readings) if std > 0 and abs(x - mean) > k * std]
clean = [x for i, x in enumerate(readings) if i not in idx]

print("outliers=" + (",".join(str(i) for i in idx) if idx else "none"))
print("clean_mean={:.1f}".format(sum(clean) / len(clean)))
`,
    explanation: 'One spike inflates the standard deviation it is measured against, which is why a single huge outlier can hide others. For heavily contaminated data, median-based methods are more robust.',
  },
  {
    id: 'lab-py-log-summary', kind: 'code', level: 'implement', difficulty: 2, moduleId: 'm-python', tags: ['python', 'parsing'], language: 'python',
    title: 'Summarise a serial log',
    objective: 'Parse structured log lines and ignore malformed ones.',
    description: 'Each valid line looks like `[<ms>] <LEVEL> <message>` with LEVEL one of `INFO`, `WARN`, `ERROR`. Ignore every other line. Print three lines: `INFO=<n> WARN=<n> ERROR=<n>`, `first_error=<ms> <message>` (or `first_error=none`), and `duration_ms=<last valid timestamp − first valid timestamp>` (0 if there are no valid lines).',
    io: '**Input:**\n```\n[1000] INFO boot ok\n[1500] WARN co2 high 1650\n[2100] ERROR sensor timeout\ngarbage line\n[2600] INFO retry ok\n```\n**Output:**\n```\nINFO=2 WARN=1 ERROR=1\nfirst_error=2100 sensor timeout\nduration_ms=1600\n```',
    starter: src`
import re
import sys

LINE = re.compile(r"^\[(\d+)\] (INFO|WARN|ERROR) (.*)$")

for line in sys.stdin.read().splitlines():
    pass  # TODO
`,
    tests: [
      { label: 'Example', stdin: '[1000] INFO boot ok\n[1500] WARN co2 high 1650\n[2100] ERROR sensor timeout\ngarbage line\n[2600] INFO retry ok', expected: 'INFO=2 WARN=1 ERROR=1\nfirst_error=2100 sensor timeout\nduration_ms=1600' },
      { label: 'No errors', stdin: '[0] INFO a\n[10] INFO b', expected: 'INFO=2 WARN=0 ERROR=0\nfirst_error=none\nduration_ms=10' },
      { label: 'Malformed lines', stdin: '[5] DEBUG x\n[7] ERROR disk full\n[x] ERROR bad ts\n[20] ERROR again', expected: 'INFO=0 WARN=0 ERROR=2\nfirst_error=7 disk full\nduration_ms=13', hidden: true },
    ],
    hints: [
      'LINE.match(line) returns None for malformed lines — skip those.',
      'Keep a dict of counts, the first error seen, and the first and last timestamps.',
      'm = LINE.match(line); ms, level, msg = int(m.group(1)), m.group(2), m.group(3)',
    ],
    solution: src`
import re
import sys

LINE = re.compile(r"^\[(\d+)\] (INFO|WARN|ERROR) (.*)$")

counts = {"INFO": 0, "WARN": 0, "ERROR": 0}
first_error = None
first_ms = last_ms = None
for line in sys.stdin.read().splitlines():
    m = LINE.match(line)
    if not m:
        continue
    ms, level, msg = int(m.group(1)), m.group(2), m.group(3)
    counts[level] += 1
    if level == "ERROR" and first_error is None:
        first_error = "{} {}".format(ms, msg)
    if first_ms is None:
        first_ms = ms
    last_ms = ms

print("INFO={} WARN={} ERROR={}".format(counts["INFO"], counts["WARN"], counts["ERROR"]))
print("first_error=" + (first_error if first_error else "none"))
print("duration_ms={}".format(last_ms - first_ms if first_ms is not None else 0))
`,
    explanation: 'A strict regular expression is a cheap validator: corrupted serial lines are skipped instead of crashing the analysis. The first error is usually the root cause; later ones are often consequences.',
  },

  // ======================= Phase 12 — Capstone =======================
  {
    id: 'lab-co2-alarm', kind: 'code', level: 'create', difficulty: 2, moduleId: 'm-capstone', tags: ['state-machines', 'air-quality'], language: 'c',
    title: 'CO₂ bands and an alarm with hysteresis',
    objective: 'Classify readings and stop an alarm from chattering.',
    description: 'Read **n**, then **n** CO₂ readings (ppm). Bands: `GOOD` < 800, `MODERATE` < 1000, `POOR` < 1500, otherwise `BAD`. The alarm switches **on** at ≥ 1000 ppm and only switches **off** again below 800 ppm. For each reading print `<ppm> <band> alarm=<0|1>`.',
    io: '**Input:**\n```\n3\n950 1000 900\n```\n**Output:**\n```\n950 MODERATE alarm=0\n1000 POOR alarm=1\n900 MODERATE alarm=1\n```',
    starter: src`
#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    int alarm = 0;
    for (int i = 0; i < n; i++) {
        int ppm;
        if (scanf("%d", &ppm) != 1) return 1;

        const char *band = "GOOD"; /* TODO: choose the band and update the alarm */

        printf("%d %s alarm=%d\n", ppm, band, alarm);
    }
    return 0;
}
`,
    tests: [
      { label: 'Full cycle', stdin: '6\n600 950 1000 900 790 1600', expected: '600 GOOD alarm=0\n950 MODERATE alarm=0\n1000 POOR alarm=1\n900 MODERATE alarm=1\n790 GOOD alarm=0\n1600 BAD alarm=1' },
      { label: 'Thresholds', stdin: '3\n999 799 1000', expected: '999 MODERATE alarm=0\n799 GOOD alarm=0\n1000 POOR alarm=1' },
      { label: 'Falling edge', stdin: '4\n1500 1499 800 799', expected: '1500 BAD alarm=1\n1499 POOR alarm=1\n800 MODERATE alarm=1\n799 GOOD alarm=0', hidden: true },
    ],
    hints: [
      'The band depends only on the current reading; the alarm also depends on its previous state.',
      'if (ppm >= 1000) alarm = 1; else if (ppm < 800) alarm = 0; — between the two it keeps its value.',
      'Check bands from the lowest threshold upwards: if (ppm < 800) band = "GOOD"; else if (ppm < 1000) …',
    ],
    solution: src`
#include <stdio.h>

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 1;
    int alarm = 0;
    for (int i = 0; i < n; i++) {
        int ppm;
        if (scanf("%d", &ppm) != 1) return 1;
        const char *band = ppm < 800 ? "GOOD" : ppm < 1000 ? "MODERATE" : ppm < 1500 ? "POOR" : "BAD";
        if (ppm >= 1000) alarm = 1;
        else if (ppm < 800) alarm = 0;
        printf("%d %s alarm=%d\n", ppm, band, alarm);
    }
    return 0;
}
`,
    explanation: 'Without hysteresis, a reading hovering around 1000 ppm would switch the buzzer on and off every sample. The 200 ppm gap is a design decision worth justifying in your capstone report.',
  },
];
