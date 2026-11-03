import type { Lesson } from '../types';

export const binaryNumbers: Lesson = {
  id: 'binary-numbers',
  title: 'Binary, hexadecimal & number conversions',
  minutes: 17,
  status: 'full',
  topic: 'binary',
  objectives: [
    'Read and write binary numbers using bit weights',
    'Convert between binary, decimal and hexadecimal',
    'Explain why registers are written in hex',
    'Combine two bytes into a 16-bit sensor value',
  ],
  why: `A microcontroller stores and controls almost everything as **bits**. Register datasheets are written in hex (\`0x3C\`), sensors send raw bytes (\`0x12, 0x34\`), and logic analyzers decode traffic in hex. You cannot configure a timer, read an I2C sensor, or debug a protocol without fluent number conversion.

When the BME280 returns two bytes for a temperature reading, you combine them with shifts — and you need to know instantly that \`0x1234\` is 4660.`,
  visual: { diagram: 'binary-byte', caption: 'One byte: eight bits with weights 128 … 1. Each group of four bits (a nibble) maps to one hexadecimal digit.' },
  theory: `#### Bit weights

Each bit position has a weight that is a power of two. Bit 0 (rightmost, the LSB) is worth 1; bit 7 (the MSB of a byte) is worth 128.

| Bit | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|---|---|---|---|---|---|---|---|---|
| Weight | 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |

**Binary → decimal:** add the weights of the 1-bits. \`0010 1101\` = 32 + 8 + 4 + 1 = 45.

**Decimal → binary:** subtract the largest weight that fits, write 1, continue. 45 − 32 = 13 → 13 − 8 = 5 → 5 − 4 = 1 → 1 − 1 = 0 → \`0010 1101\`.

#### Hexadecimal

Hex is base 16, using 0–9 and A–F (A = 10 … F = 15). **One hex digit is exactly four bits**, so conversion is just grouping:

| Decimal | Binary | Hex |
|---|---|---|
| 0 | 0000 | 0x0 |
| 5 | 0101 | 0x5 |
| 10 | 1010 | 0xA |
| 15 | 1111 | 0xF |
| 255 | 1111 1111 | 0xFF |

\`1010 1100\` → \`1010\` = A, \`1100\` = C → **0xAC**.

#### Ranges

An n-bit unsigned number holds 0 to 2ⁿ − 1: 8 bits → 255, 10 bits (Uno ADC) → 1023, 12 bits (ESP32 ADC) → 4095, 16 bits → 65 535.

#### Combining bytes

\`\`\`c
uint8_t high = 0x12, low = 0x34;
uint16_t value = ((uint16_t)high << 8) | low;   // 0x1234 = 4660
\`\`\`

Check the datasheet for which byte arrives first (byte order).`,
  worked: {
    problem: 'Convert 0x3C to binary and decimal, then convert decimal 200 to hex.',
    steps: [
      '**0x3C → binary:** 3 = 0011, C = 1100 → 0011 1100.',
      '**→ decimal:** 32 + 16 + 8 + 4 = 60. (Check: 3 × 16 + 12 = 60 ✓)',
      '**200 → binary:** 200 − 128 = 72 → 72 − 64 = 8 → 8 − 8 = 0 → bits 7, 6, 3 set → 1100 1000.',
      '**→ hex:** 1100 = C, 1000 = 8 → 0xC8.',
    ],
    answer: '0x3C = **0011 1100 = 60**; 200 = **0xC8**.',
  },
  demo: {
    tool: 'base-converter',
    intro: 'Type in any base and click individual bits to toggle them. Watch how one nibble changes exactly one hex digit.',
  },
  mistakes: [
    { mistake: 'Reading bits from the wrong end', fix: 'Bit 0 is the rightmost (least significant) bit.' },
    { mistake: 'Forgetting that hex letters are values: 0xA ≠ 0x10', fix: 'A = 10, F = 15, 0x10 = 16.' },
    { mistake: 'Assuming an 8-bit value can hold 256', fix: 'The range is 0–255; 255 + 1 wraps to 0.' },
    { mistake: 'Combining bytes without casting: high << 8 on an 8-bit type', fix: 'Cast to uint16_t before shifting, as in the example.' },
  ],
  check: ['bin-1', 'bin-3', 'bin-4'],
  challenge: {
    prompt: 'Decode a sensor register dump: convert three hex bytes to binary and identify which flag bits are set.',
    exerciseId: 'lab-register-decode',
  },
  summary: [
    'Bit weights are powers of two; bit 0 is the LSB.',
    'One hex digit = four bits; group binary in nibbles to convert.',
    'n bits hold 0 … 2ⁿ − 1.',
    'Combine bytes with (high << 8) | low after casting to a wider type.',
  ],
  flashcards: [
    { id: 'fc-nibble', front: 'How many bits in one hex digit?', back: 'Four (a nibble).', kind: 'concept', topic: 'hex' },
    { id: 'fc-range', front: 'Range of an n-bit unsigned number', back: '0 … 2ⁿ − 1 (8-bit: 255, 10-bit: 1023, 12-bit: 4095)', kind: 'formula', topic: 'binary' },
    { id: 'fc-0x3f', front: '0x3F in binary and decimal', back: '0011 1111 = 63', kind: 'concept', topic: 'hex' },
  ],
};
