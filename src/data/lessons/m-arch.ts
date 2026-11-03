import type { Question } from '../types';
import { L, mc, num, sc, tf } from './helpers';

export const archLessonQuestions: Question[] = [
  sc('hc-a', 'mcu-arch', 1, 'In the fetch–decode–execute cycle, where does the CPU fetch the next instruction from?', ['The stack', 'The address in the program counter (PC)', 'The ADC', 'The UART'], 1, 'The PC holds the address of the next instruction; it advances after each fetch or jumps on branches.'),
  num('hc-b', 'mcu-arch', 2, 'A 16 MHz AVR executes most instructions in one clock cycle. Roughly how many such instructions per second?', 16, 'million', 'One instruction per cycle at 16 MHz ≈ 16 million instructions per second (16 MIPS).', 0),
  sc('ca-a', 'mcu-arch', 2, 'Why is floating-point maths much faster on the STM32F446 than on the Arduino Uno?', ['It has more flash', 'Its Cortex-M4F core has a hardware FPU', 'It runs Python', 'It uses 3.3 V'], 1, 'The "F" in Cortex-M4F means a single-precision floating-point unit. The AVR emulates floats in software.'),
  sc('rg-b', 'mcu-arch', 1, 'What is a peripheral register?', ['A CPU cache line', 'A memory-mapped address whose bits control or report hardware', 'A type of EEPROM', 'A stack frame'], 1, 'Writing a register bit can enable a clock, set a pin or start a conversion.'),
  mc('mt-a', 'mcu-arch', 2, 'Which memories keep their contents without power? (select all)', ['Flash', 'SRAM', 'EEPROM', 'CPU registers'], [0, 2], 'Flash and EEPROM are non-volatile; SRAM and registers lose their contents at power-off.'),
  sc('ma-a', 'mcu-arch', 1, 'What distinguishes a microcontroller from a desktop CPU?', ['It cannot run C', 'CPU, memory and peripherals are integrated on one chip for control tasks', 'It has no clock', 'It always runs Linux'], 1, 'An MCU integrates flash, RAM and peripherals such as timers, ADC and UART.'),
  sc('gr-a', 'mcu-arch', 2, 'On the STM32, which register lets you set or reset individual output pins atomically (no read-modify-write)?', ['IDR', 'MODER', 'BSRR', 'PUPDR'], 2, 'Writing 1 to BSRR bit n sets pin n; writing 1 to bit n+16 resets it — atomically.'),
  sc('ck-c', 'timers', 2, 'On an STM32, you configure a timer but it never counts. What is the most likely cause?', ['The ADC is off', 'The timer\'s peripheral clock is not enabled in RCC', 'The UART baud rate', 'The flash is full'], 1, 'Peripherals are clock-gated to save power; enable them (e.g. RCC->APB1ENR |= RCC_APB1ENR_TIM2EN) first.'),
  sc('it-a', 'interrupts', 2, 'What happens when an interrupt fires?', ['The CPU reboots', 'The CPU saves context, runs the ISR, then resumes where it was', 'The main loop is cancelled', 'Interrupts are queued until the loop ends'], 1, 'Hardware saves registers, jumps to the vector, runs the ISR, restores context and continues.'),
  num('tm-a', 'timers', 2, 'A 16 MHz timer with a prescaler of 8 counts to 20 000 before resetting. What is the period?', 10, 'ms', '16 MHz / 8 = 2 MHz → 0.5 µs per count. 20 000 × 0.5 µs = 10 ms.', 0),
  sc('dsx-a', 'datasheets', 2, 'A sensor\'s absolute maximum supply is 4.0 V and recommended range 1.7–3.6 V. What should you use?', ['4.0 V — it is allowed', '3.3 V — inside the recommended range', '5 V with a resistor', 'Any voltage up to 4.0 V indefinitely'], 1, 'Absolute maximum ratings are damage limits, not operating points. Design to the recommended conditions.'),
  tf('dsx-b', 'datasheets', 1, 'Errata documents list known silicon bugs and workarounds for a chip revision.', true, 'Always check the errata for your MCU — some peripherals have documented quirks.'),
];

export const howComputersWork = L({
  id: 'how-computers-work', title: 'How computers work', topic: 'mcu-arch', minutes: 12,
  objectives: ['Describe the fetch–decode–execute cycle', 'Explain the roles of the program counter, registers and buses', 'Relate clock speed to instructions per second'],
  why: `Understanding what the CPU actually does turns mysterious behaviour — an ISR that "takes too long", a loop that is slower than expected — into something you can reason about and measure.`,
  visual: { flow: ['Fetch instruction at PC', 'Decode opcode', 'Execute (ALU, memory, I/O)', 'Write back result', 'PC → next instruction'], caption: 'The fetch–decode–execute cycle repeats millions of times per second.' },
  theory: `A CPU repeatedly:
1. **Fetches** the instruction at the address in the **program counter (PC)**.
2. **Decodes** it (which operation, which registers).
3. **Executes** it in the ALU or by reading/writing memory and peripherals.
4. **Writes back** results and moves the PC on (or jumps on a branch/call).

#### Building blocks
- **Registers:** a few very fast storage slots inside the CPU (general purpose, PC, stack pointer, status flags).
- **ALU:** arithmetic and logic.
- **Buses:** address, data and control lines connecting CPU, memory and peripherals.
- **Clock:** paces each step; more MHz = more instructions per second (if the CPU can keep up).

#### Harvard vs von Neumann
The AVR (Uno) has separate program and data memories (**Harvard**) — that is why constant strings need \`PROGMEM\` to stay in flash. ARM Cortex-M has a unified address space with separate buses.`,
  worked: {
    problem: 'A loop on the Uno runs 1000 iterations of ~40 instructions. Estimate its time.',
    steps: ['Total ≈ 40 000 instructions.', 'At ~1 instruction per cycle and 16 MHz: 40 000 / 16 000 000 s.', '= 2.5 ms (more if instructions take multiple cycles).'],
    answer: 'About **2.5 ms** — measure it with micros() before and after to check the estimate.',
  },
  tryIt: 'On your Uno, time a loop of 10 000 additions with `micros()` before and after. Then use `float` instead of `int` and compare — the difference shows the cost of software floating point.',
  mistakes: [['Assuming every instruction takes one cycle', 'Multiplication, division and memory access can take several.'], ['Ignoring that float is emulated on the AVR', 'Expect it to be many times slower than int.'], ['Thinking more MHz always means proportionally faster code', 'Memory wait states and peripherals also limit speed.']],
  check: ['hc-a', 'hc-b', 'arch-1'],
  challenge: { prompt: 'Measure the int vs float loop timing described above and record both numbers and the ratio in your notes.' },
  summary: ['Fetch → decode → execute → write back, paced by the clock.', 'PC, registers, ALU, buses.', 'Harvard (AVR) separates program and data memory.'],
  cards: [['Program counter', 'Register holding the address of the next instruction', 'vocab']],
});

export const cpuArchitecture = L({
  id: 'cpu-architecture', title: 'CPU architecture', topic: 'mcu-arch', minutes: 13,
  objectives: ['Compare 8-bit AVR, Xtensa and Cortex-M cores', 'Explain word size and its effect on code', 'Know what an FPU changes'],
  why: `You will move code between the Uno, ESP32 and STM32. Word size, FPU support and clock speed explain why the same C code behaves and performs differently on each.`,
  visual: { md: '| | Arduino Uno | ESP32 | NUCLEO-F446RE |\n|---|---|---|---|\n| Core | 8-bit AVR | 32-bit dual-core Xtensa LX6 | 32-bit ARM Cortex-M4F |\n| Clock | 16 MHz | up to 240 MHz | up to 180 MHz |\n| Flash / RAM | 32 KB / 2 KB | ~4 MB (module) / ~520 KB | 512 KB / 128 KB |\n| FPU | no | single precision | single precision |\n| `int` size | 16 bits | 32 bits | 32 bits |', caption: 'Your three boards compared.' },
  theory: `#### Word size
An 8-bit CPU processes 8 bits per instruction; a 32-bit add on the AVR needs several instructions. That is why 32-bit maths and 16-bit reads are not atomic there.

#### Pipelines and cycles
Cortex-M cores pipeline instructions (fetch the next while executing the current), so most run in one cycle. Branches can stall the pipeline.

#### FPU
With a hardware FPU, \`float\` add/multiply take a few cycles. Without one, the compiler calls software routines that take tens to hundreds of cycles. **double** is still emulated on single-precision FPUs — use \`float\` and the \`f\` suffix (\`3.3f\`).

#### Interrupt controllers
Cortex-M has the **NVIC** with programmable priorities and nesting; the AVR has fixed priorities.`,
  worked: {
    problem: 'A PID loop uses `double` maths on the STM32F446 and runs slower than expected. Why, and how do you fix it?',
    steps: ['The M4F FPU is single precision only.', 'double operations fall back to software emulation.', 'Use float variables and float literals (0.01f), and enable the FPU in the build (CubeIDE does by default).'],
    answer: 'Switch to **float** and float literals — the FPU then handles the maths in hardware.',
  },
  tryIt: 'Compile the same small function with `float` and with `double` for an ARM target (or read the generated assembly in Compiler Explorer) and compare the instructions used.',
  mistakes: [['Using double on single-precision FPUs', 'Use float and f-suffixed literals.'], ['Assuming int is 32 bits everywhere', 'Use stdint.h types.'], ['Assuming multi-byte reads are atomic on 8-bit CPUs', 'Protect shared multi-byte data.']],
  check: ['ca-a', 'arch-2', 'esp-4'],
  challenge: { prompt: 'Write a one-page comparison of your three boards (Uno, ESP32, Nucleo) for a portfolio README: which job each is best for and why.' },
  summary: ['8-bit vs 32-bit changes atomicity and speed.', 'FPU: float fast, double often still emulated.', 'Cortex-M NVIC gives programmable interrupt priorities.'],
  cards: [['M4F FPU precision', 'Single precision — use float, not double', 'concept']],
});

export const registers = L({
  id: 'registers', title: 'Registers', topic: 'mcu-arch', minutes: 12,
  objectives: ['Explain memory-mapped peripheral registers', 'Read a register description table', 'Access registers safely from C'],
  why: `Every Arduino or HAL function ends in a register write. Reading and writing registers yourself lets you debug drivers, use features libraries don't expose, and understand what your code really does.`,
  visual: { diagram: 'mcu-block', caption: 'Peripherals sit on the bus; their registers are addresses the CPU reads and writes.' },
  theory: `Peripheral registers live at fixed addresses in the memory map. A datasheet table describes each bit:

| Bits | Name | Access | Meaning |
|---|---|---|---|
| 7 | EN | R/W | 1 = peripheral enabled |
| 6:5 | RATE[1:0] | R/W | sample rate select |
| 0 | DRDY | R | 1 = new data ready |

#### Access in C
\`\`\`c
#define SENSOR_CTRL (*(volatile uint8_t *)0x40001000u)
SENSOR_CTRL |= (1u << 7);          // enable
while (!(SENSOR_STATUS & 1u)) {}   // wait for DRDY (add a timeout!)
\`\`\`
Vendor headers do this for you: \`GPIOA->ODR\`, \`DDRB\`, \`TIM2->CR1\`.

#### Access types
- **R/W** normal; **R** read-only; **W1C** "write 1 to clear" (common for flags); **RC** cleared by reading.
- Reserved bits: keep them unchanged (read-modify-write).`,
  worked: {
    problem: 'A status register\'s DRDY flag is "W1C". You clear it with `STATUS &= ~DRDY;` but it never clears. Why?',
    steps: ['W1C means writing **1** clears the bit; writing 0 has no effect.', '`&= ~DRDY` writes 0 to DRDY (and might clear other W1C flags by writing back their 1s!).', 'Correct: `STATUS = DRDY;` — write 1 only to the bit you want to clear.'],
    answer: 'Write **1** to a W1C bit: `STATUS = DRDY;`. Always read the access type in the register table.',
  },
  tryIt: 'In the ATmega328P datasheet, find the DDRB, PORTB and PINB register descriptions. Note each register\'s address and what writing 1 to PINB does (it toggles the output).',
  mistakes: [['Missing volatile on register pointers', 'Vendor headers include it; your own macros must too.'], ['Clearing W1C flags with &=', 'Write 1 to the flag bit.'], ['Overwriting reserved bits', 'Read-modify-write; keep reserved bits as read.']],
  check: ['rg-b', 'arch-3', 'bit-3'],
  challenge: { prompt: 'Blink the Uno LED using DDRB and PORTB directly in the lab.', exerciseId: 'lab-register-blink' },
  summary: ['Registers are memory-mapped and volatile.', 'Read the bit table: name, access type, meaning.', 'W1C flags: write 1 to clear.'],
  cards: [['W1C', 'Write 1 to clear a flag bit', 'vocab']],
});

export const memoryTypes = L({
  id: 'memory-types', title: 'Memory types', topic: 'mcu-arch', minutes: 12,
  objectives: ['Distinguish flash, SRAM and EEPROM', 'Place data deliberately (const, PROGMEM, globals)', 'Read a build\'s memory usage report'],
  why: `"Sketch uses 28 000 bytes (86 %) of program storage; global variables use 1 800 bytes (87 %) of dynamic memory" — on the Uno that warning means trouble. Knowing where data lives keeps your robot from crashing.`,
  visual: { md: '| Memory | Volatile? | Speed | Write endurance | Holds |\n|---|---|---|---|---|\n| Flash | no | fast read | ~10 k erase cycles | code, const data |\n| SRAM | yes | fastest | unlimited | variables, stack, heap |\n| EEPROM | no | slow write | ~100 k cycles | calibration, settings |\n| Registers | yes | instant | unlimited | CPU and peripheral state |', caption: 'Microcontroller memory types.' },
  theory: `#### Flash
Program code and constants. Writing requires erasing whole pages and wears the cells — not for frequently changing data.

#### SRAM
All variables, the stack and the heap. Lost at power-off. Usually the scarcest resource (2 KB on the Uno).

#### EEPROM
Small, byte-writable, non-volatile — ideal for calibration values (gyro bias, motor dead-band). ESP32 and STM32 emulate it in flash (Preferences / NVS on ESP32).

#### Saving RAM on AVR
\`\`\`cpp
Serial.println(F("Calibration complete"));          // string stays in flash
const uint8_t table[] PROGMEM = { /* … */ };        // read with pgm_read_byte()
\`\`\`
Without \`F()\` the string is copied into RAM at start-up.

#### Reading the build report
Program storage = flash used; dynamic memory = .data + .bss (static RAM). Leave room for the stack.`,
  worked: {
    problem: 'Store the gyro bias so the robot doesn\'t need recalibrating after every reset (Uno and ESP32).',
    steps: ['Uno: EEPROM.put(0, bias) after calibrating; EEPROM.get(0, bias) in setup().', 'ESP32: Preferences: prefs.putFloat("gyro_bias", bias) / getFloat.', 'Write only when the value changes, to respect write endurance.'],
    answer: '**EEPROM (Uno) / Preferences-NVS (ESP32)** — non-volatile, and written rarely.',
  },
  tryIt: 'Compile a sketch with 10 long Serial.println strings, note the "dynamic memory" figure, then wrap them in F() and compile again. Record the RAM saved.',
  mistakes: [['Writing EEPROM/flash in a fast loop', 'Write only on change; endurance is limited.'], ['Long string literals in RAM on the Uno', 'Use F() or PROGMEM.'], ['Ignoring the build memory report', 'Keep static RAM well below 100 % to leave stack space.']],
  check: ['mt-a', 'arch-2', 'arch-5'],
  challenge: { prompt: 'Save and reload a calibration value across resets on your board, and prove it by printing the value after a power cycle.' },
  summary: ['Flash: code/const. SRAM: variables. EEPROM: settings.', 'Use F()/PROGMEM to keep strings out of AVR RAM.', 'Write non-volatile memory rarely.'],
  cards: [['Keep a string in flash on AVR', 'Serial.println(F("text"));', 'code']],
});

export const mcuArchitecture = L({
  id: 'mcu-architecture', title: 'Microcontroller architecture', topic: 'mcu-arch', minutes: 13,
  objectives: ['Identify the blocks inside a microcontroller', 'Explain how peripherals work alongside the CPU', 'Choose peripherals for a task from a block diagram'],
  why: `Peripherals do work *in parallel* with your code: a timer generates PWM, the ADC converts, DMA moves data, UART shifts bytes. Good firmware lets hardware do the work instead of burning CPU time.`,
  visual: { diagram: 'mcu-block', caption: 'CPU, memories and peripherals connected by on-chip buses.' },
  theory: `#### Typical blocks
- **CPU core** + interrupt controller
- **Flash, SRAM**, sometimes EEPROM
- **Clock system:** oscillators, PLL, prescalers
- **GPIO** ports
- **Timers:** counting, PWM, input capture, encoder mode
- **ADC / DAC**
- **Communication:** UART, I2C, SPI, CAN, USB
- **DMA:** moves data between peripherals and memory
- **Watchdog:** resets the chip if firmware hangs

#### Hardware vs software
| Task | Software (CPU) | Hardware peripheral |
|---|---|---|
| PWM | toggle a pin in a loop | timer PWM channel |
| Count encoder edges | interrupt per edge | timer encoder mode |
| Stream ADC samples | read in a loop | ADC + DMA |

#### Pin multiplexing
Each pin can serve several functions (GPIO, UART TX, PWM channel…). Pin maps and CubeMX show which peripheral can use which pin.`,
  worked: {
    problem: 'Pick peripherals for: two motor PWMs, two quadrature encoders, an I2C sensor bus and a debug console on an STM32.',
    steps: ['Motor PWM: two channels of one timer (e.g. TIM3 CH1/CH2) so they share a frequency.', 'Encoders: two timers in encoder mode (e.g. TIM2, TIM4) — hardware counting.', 'Sensors: I2C1; console: USART2 (connected to the Nucleo\'s ST-LINK virtual COM port).'],
    answer: '**TIM3 (PWM), TIM2 + TIM4 (encoder mode), I2C1, USART2** — almost no CPU time spent on counting or waveform generation.',
  },
  tryIt: 'Open the block diagram in your MCU\'s datasheet (ATmega328P or ESP32 or STM32F446). List every timer and communication peripheral and one pin each can use.',
  mistakes: [['Doing in software what a peripheral can do', 'Check the peripheral list first.'], ['Pin conflicts between peripherals', 'Plan the pin map before wiring.'], ['Forgetting the watchdog', 'Enable it in products so a hang triggers a reset.']],
  check: ['ma-a', 'arch-1', 'stm-4'],
  challenge: { prompt: 'Create a peripheral and pin plan for the robot on the ESP32 in the lab.', exerciseId: 'lab-esp32-pinmap' },
  summary: ['MCU = CPU + memories + peripherals + clocks.', 'Let peripherals work in parallel with the CPU.', 'Pins are multiplexed — plan the map.'],
  cards: [['Watchdog timer', 'Resets the MCU if firmware stops refreshing it', 'vocab']],
});

export const gpioRegisters = L({
  id: 'gpio-registers', title: 'GPIO registers', topic: 'mcu-arch', minutes: 13,
  objectives: ['Configure pins via AVR and STM32 GPIO registers', 'Read inputs and write outputs at register level', 'Use atomic set/reset registers'],
  why: `digitalWrite takes several microseconds on the Uno; a register write takes one cycle. More importantly, knowing the registers lets you debug "the pin doesn't change" in seconds with a debugger.`,
  visual: { md: '| Function | AVR (Uno) | STM32 |\n|---|---|---|\n| Direction / mode | DDRx | MODER (2 bits per pin) |\n| Output level | PORTx | ODR (or BSRR for atomic set/reset) |\n| Read input | PINx | IDR |\n| Pull-up | PORTx bit with DDR = 0 | PUPDR |\n| Output type / speed | — | OTYPER / OSPEEDR |', caption: 'The same GPIO ideas, different register names.' },
  theory: `#### AVR
\`\`\`c
DDRB  |=  (1 << DDB5);        // PB5 (pin 13) output
PORTB |=  (1 << PORTB5);      // HIGH
PORTB &= ~(1 << PORTB5);      // LOW
PINB   =  (1 << PINB5);       // writing 1 to PINx toggles the output
bool pressed = !(PIND & (1 << PIND2));   // input, active-low
\`\`\`

#### STM32
\`\`\`c
RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;            // 1. enable the port clock
GPIOA->MODER &= ~(3u << (5 * 2));               // 2. clear mode bits for PA5
GPIOA->MODER |=  (1u << (5 * 2));               //    01 = output
GPIOA->BSRR   =  (1u << 5);                     // set PA5 (atomic)
GPIOA->BSRR   =  (1u << (5 + 16));              // reset PA5 (atomic)
\`\`\`

BSRR avoids read-modify-write races when an ISR also changes the port.`,
  worked: {
    problem: 'On the Nucleo, PA5 is configured but the LED never lights. The register view shows MODER bits for PA5 = 00. What is wrong?',
    steps: ['00 = input mode, so ODR changes have no effect on the pin.', 'Either the MODER write was missing, or it happened before the GPIOA clock was enabled (writes to an unclocked peripheral are ignored).', 'Enable RCC->AHB1ENR GPIOAEN first, then set MODER to 01.'],
    answer: 'Enable the **port clock** first, then set **MODER = 01** for PA5.',
  },
  tryIt: 'On the Uno, toggle pin 13 as fast as possible with digitalWrite and then with PINB, measuring the frequency with a logic analyzer or counting toggles in one second.',
  mistakes: [['Configuring GPIO before enabling its clock (STM32)', 'Enable RCC first.'], ['Using ODR read-modify-write while an ISR changes the port', 'Use BSRR.'], ['Forgetting MODER uses 2 bits per pin', 'Shift by pin × 2 and clear both bits.']],
  check: ['gr-a', 'arch-3', 'stm-6'],
  challenge: { prompt: 'Blink the Nucleo LED with HAL, then with registers, and inspect ODR in the debugger.', exerciseId: 'lab-stm32-blink' },
  summary: ['AVR: DDR/PORT/PIN. STM32: MODER/ODR/IDR/BSRR.', 'Enable the clock first on STM32.', 'BSRR gives atomic set/reset.'],
  cards: [['STM32 atomic pin set/reset', 'GPIOx->BSRR: bit n sets, bit n+16 resets', 'code']],
});

export const clockSystems = L({
  id: 'clock-systems', title: 'Clock systems', topic: 'timers', minutes: 12,
  objectives: ['Trace the clock tree from oscillator to peripherals', 'Explain PLLs, prescalers and clock gating', 'Diagnose clock-related peripheral failures'],
  why: `Wrong clock settings give wrong baud rates, wrong PWM frequencies and dead peripherals. "My UART prints garbage" or "the timer never counts" is often a clock problem.`,
  visual: { flow: ['Oscillator (HSI / HSE crystal)', 'PLL multiplies', 'System clock (e.g. 180 MHz)', 'AHB / APB prescalers', 'Peripheral clocks (gated)'], caption: 'A clock tree: source → PLL → system clock → bus prescalers → peripherals.' },
  theory: `#### Sources
- **Internal RC (HSI):** no external parts, ±1–2 % accuracy.
- **External crystal (HSE):** ±20–50 ppm — needed for USB and accurate UART at high baud.

#### PLL
Multiplies a reference up to the system clock (e.g. 8 MHz → 180 MHz on the F446).

#### Bus prescalers
Peripherals sit on buses with their own maximum speeds: on the F446, APB1 ≤ 45 MHz, APB2 ≤ 90 MHz. **Timers on a prescaled APB get ×2** — so APB1 timers run at 90 MHz when APB1 is 45 MHz.

#### Clock gating
Each peripheral's clock is **off by default** to save power. Enable it in RCC (STM32) or via the PRR register (AVR power reduction) before use.

#### Tools
CubeMX's clock configuration tab shows the whole tree and flags invalid settings.`,
  worked: {
    problem: 'UART at 115 200 baud prints garbage after you changed the PLL settings by hand. What do you check?',
    steps: ['The baud-rate divider is computed from the APB clock frequency.', 'If the HAL/your code still assumes the old frequency, the actual baud is wrong.', 'Regenerate with CubeMX (or update SystemCoreClock and re-init the UART), then verify with a logic analyzer.'],
    answer: 'The **peripheral clock frequency changed** but the baud divider did not. Recompute it — and measure the actual bit time.',
  },
  tryIt: 'Open a CubeMX project for the F446 and set the system clock to 180 MHz. Note the resulting APB1, APB2 and APB1-timer frequencies.',
  mistakes: [['Using a peripheral without enabling its clock', 'Enable it in RCC first.'], ['Forgetting the timer ×2 rule on prescaled APBs', 'Check the timer clock in the clock tree.'], ['Relying on HSI for high-baud UART or USB', 'Use a crystal (HSE).']],
  check: ['ck-c', 'seq-3', 'stm-5'],
  challenge: { prompt: 'Document your board\'s clock tree (source, PLL, system, buses, timer clocks) in your notes with the actual frequencies.' },
  summary: ['Source → PLL → system clock → prescalers → peripherals.', 'Peripheral clocks are gated off by default.', 'Timers on prescaled APBs run at ×2.'],
  cards: [['STM32 timer clock rule', 'If the APB prescaler ≠ 1, timer clock = 2 × APB clock', 'concept']],
});

export const interrupts = L({
  id: 'interrupts', title: 'Interrupts', topic: 'interrupts', minutes: 15,
  objectives: ['Explain the interrupt sequence and vector table', 'Write short, safe ISRs', 'Share data between ISRs and the main loop correctly'],
  why: `Encoder pulses, UART bytes, timer ticks and button presses arrive whenever they want. Interrupts let you respond in microseconds without polling — but careless ISRs cause the hardest bugs in embedded work.`,
  visual: { flow: ['Event (edge, byte, overflow)', 'CPU saves context', 'Jump via vector table', 'ISR: read, set flag, clear source', 'Restore context, resume'], caption: 'What happens when an interrupt fires.' },
  theory: `#### Sequence
1. A peripheral raises an interrupt request.
2. If enabled and higher priority than the current code, the CPU finishes the current instruction, **saves context**, and jumps to the handler in the **vector table**.
3. The ISR runs, then context is restored and execution resumes.

#### ISR rules
- **Short:** read the hardware, store data, set a flag, clear the interrupt source — then return.
- No \`delay()\`, \`printf\`/\`Serial.print\`, blocking waits or heavy maths.
- Shared variables are \`volatile\`; multi-byte reads in the main loop are done in a **critical section**.
- Clear the interrupt flag, or it fires again immediately.

\`\`\`c
volatile uint16_t ticks;
void encoder_isr(void) { ticks++; }

uint16_t read_ticks(void) {
    noInterrupts();   // or __disable_irq()
    uint16_t t = ticks;
    interrupts();
    return t;
}
\`\`\`

#### Priorities
On Cortex-M the NVIC lets a higher-priority interrupt preempt a lower one. Give time-critical events (encoders) higher priority than slow ones.`,
  worked: {
    problem: 'An ISR calls Serial.println on each encoder edge. At high speed the robot freezes. Why?',
    steps: ['Serial output at 115 200 baud takes ~87 µs per character; println of a number takes ~0.5 ms or more.', 'Edges arrive every ~100 µs at speed → the ISR never finishes before the next one.', 'Interrupts pile up; the main loop starves; Serial may even deadlock waiting for its own interrupt.'],
    answer: 'Never print in an ISR. Count in the ISR; print the count from the main loop.',
  },
  demo: { tool: 'interrupts', intro: 'Compare polling with delay(), non-blocking polling and interrupts, and see how ISR duration affects CPU load.' },
  mistakes: [['Long or blocking ISRs', 'Defer work to the main loop or a task.'], ['Missing volatile on shared variables', 'Mark ISR-shared data volatile.'], ['Not clearing the interrupt flag', 'Clear the source, or the ISR re-enters forever.']],
  check: ['arch-6', 'it-a', 'gpio-8'],
  challenge: { prompt: 'Diagnose the ISR counter that "never changes" in the lab.', exerciseId: 'lab-isr-race' },
  summary: ['Interrupt: save context → ISR → restore.', 'ISRs: short, no blocking, clear the flag.', 'volatile + critical sections for shared data.'],
  cards: [['ISR golden rule', 'Read hardware, set a flag, return — do the work elsewhere', 'concept']],
});

export const timers = L({
  id: 'timers', title: 'Timers', topic: 'timers', minutes: 14,
  objectives: ['Calculate timer periods from prescaler and reload values', 'Use timers for periodic interrupts, PWM and input capture', 'Avoid off-by-one errors in reload values'],
  why: `Timers generate your motor PWM, run your 20 ms control loop, count encoder pulses and measure echo times from the ultrasonic sensor — all without CPU effort.`,
  visual: { md: '| Mode | Use on the robot |\n|---|---|\n| Periodic interrupt | 50 Hz PID control loop |\n| PWM output | Motor speed (TB6612 PWMA/PWMB) |\n| Input capture | Ultrasonic echo pulse width |\n| Encoder mode | Wheel position and speed |\n| One-pulse | 10 µs ultrasonic trigger |', caption: 'Timer modes and where you will use them.' },
  theory: `A timer is a counter clocked by a prescaled clock:

\`\`\`
f_tick     = f_clk / (PSC + 1)
f_overflow = f_tick / (ARR + 1)
\`\`\`

#### Periodic interrupt
Set PSC and ARR for the period, enable the update interrupt, and in the ISR set a flag that the main loop (or a task) uses to run the control step.

#### PWM
The counter compares against CCR: output HIGH while CNT < CCR. Duty = CCR / (ARR + 1). Frequency is set by PSC and ARR.

#### Input capture
On an edge, the hardware copies CNT into a capture register — precise pulse timing (echo width → distance).

#### Arduino
\`millis()\` and \`micros()\` use Timer0; \`analogWrite\` uses Timers 0–2 — reconfiguring them breaks those functions.`,
  worked: {
    problem: 'Configure an 84 MHz STM32 timer for a 50 Hz control-loop interrupt.',
    steps: ['Choose PSC = 8399 → 84 MHz / 8400 = 10 kHz tick (0.1 ms).', '50 Hz → 20 ms → 200 ticks.', 'ARR = 200 − 1 = 199.'],
    answer: '**PSC = 8399, ARR = 199** → 10 kHz / 200 = 50 Hz. Many combinations work; pick one that gives the resolution you need.',
  },
  demo: { tool: 'pwm', intro: 'Set the frequency and duty cycle; relate them to ARR (period) and CCR (compare) values.' },
  mistakes: [['Off-by-one in ARR/PSC', 'The hardware divides by (value + 1).'], ['Reconfiguring Arduino Timer0', 'It breaks millis(), micros() and delay().'], ['Heavy work in the timer ISR', 'Set a flag; run the control step in the loop or a task.']],
  check: ['stm-5', 'tm-a', 'ck-a'],
  challenge: { prompt: 'Calculate PSC and ARR for a 1 kHz PWM in the lab.', exerciseId: 'lab-timer-calc' },
  summary: ['f = f_clk / ((PSC+1)(ARR+1)).', 'Periodic IRQ, PWM, capture, encoder mode.', 'Arduino Timer0 belongs to millis().'],
  cards: [['PWM duty from registers', 'Duty = CCR / (ARR + 1)', 'formula']],
});

export const datasheets = L({
  id: 'datasheets', title: 'Reading datasheets', topic: 'datasheets', minutes: 15,
  objectives: ['Navigate a datasheet in the right order', 'Distinguish absolute maximum ratings from operating conditions', 'Extract addresses, timing and register maps'],
  why: `The datasheet is the primary source for your hardware. AI tools and tutorials make mistakes; the datasheet is what the chip actually does. Employers expect you to bring up a new sensor from its datasheet alone.`,
  visual: { flow: ['Features: right part?', 'Pinout', 'Absolute maximum ratings', 'Recommended operating conditions', 'Electrical characteristics', 'Application circuit', 'Interface & registers'], caption: 'Read a datasheet in this order — never front to back.' },
  theory: `| Section | What you get |
|---|---|
| Features / overview | Is this the right part? Ranges, accuracy, interfaces |
| Pinout | Pin functions, package |
| **Absolute maximum ratings** | Limits that cause damage — **not** design targets |
| **Recommended operating conditions** | Supply range, temperature — design here |
| Electrical characteristics | Currents, logic levels, timing, accuracy (min/typ/max) |
| Application circuit | Required external parts (decoupling, pull-ups) |
| Communication | Addresses, commands, data formats, timing diagrams |
| Register map | Every configuration bit |

#### Habits
- Use **min/max**, not typical, for worst-case design.
- Check units and conditions on every number (V_DD = 3.3 V? T = 25 °C?).
- Read the **errata** for your chip revision.
- Save the datasheet version with your project.`,
  worked: {
    problem: 'From a sensor datasheet: V_DD 1.71–3.6 V recommended, 4.25 V absolute max, I2C address 0x76 (SDO = GND) or 0x77 (SDO = V_DD). Your ESP32 board has two of these sensors. How do you wire them?',
    steps: ['Supply at 3.3 V — inside the recommended range (never near 4.25 V).', 'Two sensors need different addresses: tie one SDO to GND (0x76), the other to V_DD (0x77).', 'Confirm with an I2C scanner before writing driver code.'],
    answer: '**3.3 V supply, SDO low on one (0x76), high on the other (0x77)**, then scan.',
  },
  tryIt: 'Download the BME280 (or MPU6050) datasheet and fill in a one-page cheat sheet: supply range, interface and address, current consumption, measurement ranges, accuracy, and required external parts.',
  mistakes: [['Designing to absolute maximum ratings', 'Stay within recommended operating conditions.'], ['Using typical values for worst-case design', 'Use min/max.'], ['Ignoring test conditions next to a number', 'Check supply voltage and temperature conditions.']],
  check: ['arch-4', 'dsx-a', 'dsx-b'],
  challenge: { prompt: 'Find the MPU6050 I2C address from its datasheet rule in the lab.', exerciseId: 'lab-datasheet-mpu' },
  summary: ['Features → pinout → abs max → recommended → characteristics → application → registers.', 'Abs max = damage limit, not target.', 'Min/max for design; check conditions and errata.'],
  cards: [['Absolute maximum ratings', 'Damage limits — never design to them', 'concept']],
});
