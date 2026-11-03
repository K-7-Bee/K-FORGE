import type { Question } from '../types';
import { L, mc, num, out, sc, tf } from './helpers';

export const stm32LessonQuestions: Question[] = [
  sc('sa-a', 'stm32', 1, 'What is the CPU core of the STM32F446RE?', ['8-bit AVR', 'ARM Cortex-M4F', 'Xtensa LX6', 'RISC-V'], 1, 'A 32-bit Cortex-M4 with a single-precision FPU, up to 180 MHz.'),
  sc('sa-b', 'stm32', 2, 'Why must you enable a peripheral\'s clock in RCC before configuring it?', ['To reset the chip', 'Peripherals are clock-gated off by default; register writes to an unclocked peripheral are ignored', 'To set the baud rate', 'It enables interrupts'], 1, 'Clock gating saves power, so every peripheral starts with its clock disabled.'),
  mc('nu-a', 'stm32', 1, 'What does the NUCLEO-F446RE board include? (select all)', ['An ST-LINK programmer/debugger', 'A virtual COM port over USB', 'A user LED on PA5 and a user button', 'Built-in Wi-Fi'], [0, 1, 2], 'Nucleo boards have an on-board ST-LINK with a virtual COM port; the F446 has no radio.'),
  sc('ci-a', 'stm32', 1, 'Which CubeIDE feature replaces most "print debugging"?', ['The serial plotter', 'Breakpoints with live variable and register views', 'The linker script', 'The clock tree'], 1, 'Pause the CPU exactly where you want and inspect variables, memory and peripheral registers.'),
  sc('cm-a', 'stm32', 2, 'You regenerate code in CubeMX and lose your changes. Why?', ['CubeMX deletes all files', 'Your code was outside the USER CODE BEGIN/END markers', 'The project was not saved', 'HAL was updated'], 1, 'Only code between USER CODE BEGIN and END markers survives regeneration.'),
  sc('ha-a', 'stm32', 2, 'What does a HAL function such as HAL_I2C_Master_Transmit return?', ['void', 'A HAL_StatusTypeDef: HAL_OK, HAL_ERROR, HAL_BUSY or HAL_TIMEOUT', 'The number of bytes', 'A pointer'], 1, 'Always check the status — HAL_TIMEOUT often means a missing device or pull-ups.'),
  out('ha-b', 'stm32', 1, 'Which HAL call toggles the Nucleo user LED (PA5)? Complete the call.', 'HAL_GPIO_TogglePin(GPIOA, ???);', ['GPIO_PIN_5'], 'Port GPIOA, pin GPIO_PIN_5.'),
  num('sg-a', 'stm32', 2, 'In MODER, each pin uses 2 bits. At what bit position do PA7\'s mode bits start?', 14, undefined, 'Pin n uses bits 2n+1:2n → PA7 uses bits 15:14.', 0),
  sc('stt-a', 'timers', 2, 'In HAL, which callback runs when a timer started with HAL_TIM_Base_Start_IT overflows?', ['HAL_TIM_PWM_PulseFinishedCallback', 'HAL_TIM_PeriodElapsedCallback', 'HAL_GPIO_EXTI_Callback', 'SysTick_Handler'], 1, 'Override HAL_TIM_PeriodElapsedCallback and check htim->Instance to see which timer fired.'),
  num('sap-a', 'pwm', 2, 'A PWM timer has ARR = 999. What CCR value gives 30 % duty?', 300, undefined, 'Duty = CCR / (ARR + 1) → CCR = 0.30 × 1000 = 300.', 0),
  sc('dm-b1', 'dma', 2, 'What do the DMA "half-transfer" and "transfer-complete" callbacks enable?', ['Faster CPU clock', 'Double buffering: process one half of the buffer while DMA fills the other', 'Error correction', 'Lower power'], 1, 'Circular DMA plus half/full callbacks lets you process data continuously without gaps.'),
  sc('sc-c', 'uart', 2, 'Which HAL UART variant returns immediately and lets the CPU do other work while bytes are sent?', ['HAL_UART_Transmit', 'HAL_UART_Transmit_IT or HAL_UART_Transmit_DMA', 'printf', 'HAL_Delay'], 1, 'Blocking variants wait; _IT and _DMA variants complete in the background and call a callback.'),
  sc('hd-b', 'debugging-tools', 2, 'Your STM32 enters HardFault_Handler. What is a good first step?', ['Reflash the bootloader', 'Inspect the stacked PC/LR and fault status registers (CFSR) in the debugger to find the faulting instruction', 'Increase the clock speed', 'Disable all interrupts forever'], 1, 'The fault registers and stacked PC usually point straight at the bad memory access or stack overflow.'),
  tf('sj-a', 'stm32', 2, 'Keeping hardware access in thin driver files and logic in pure functions makes STM32 code unit-testable on a laptop.', true, 'The same design principle as on the Uno and ESP32.'),
];

export const stm32Arch = L({
  id: 'stm32-arch', title: 'STM32 architecture', topic: 'stm32', minutes: 13,
  objectives: ['Describe the STM32F446\'s core, memory and buses', 'Explain clock gating via RCC', 'Navigate the datasheet vs the reference manual'],
  why: `STM32 parts dominate industrial and automotive embedded jobs in Germany. Understanding their structure — buses, clocks, peripherals — is what separates "I used Arduino" from "I can work on professional firmware".`,
  visual: { flow: ['Cortex-M4F core + NVIC', 'AHB bus: GPIO, DMA, RCC', 'APB2 (≤ 90 MHz): ADC, USART1, TIM1/8', 'APB1 (≤ 45 MHz): I2C, USART2, TIM2–5'], caption: 'STM32F446 bus structure (simplified).' },
  theory: `| Feature | STM32F446RE |
|---|---|
| Core | Cortex-M4F, up to 180 MHz, single-precision FPU, DSP instructions |
| Memory | 512 KB flash, 128 KB SRAM |
| Peripherals | many timers, 3 ADCs, USART/UART, I2C, SPI, CAN, USB, DMA |
| Logic | 3.3 V (many pins 5 V-tolerant as inputs — check the datasheet "FT" marking) |

#### Documents
- **Datasheet:** pinout, electrical characteristics, alternate functions table.
- **Reference manual (RM0390):** every peripheral and register in detail.
- **Errata:** known silicon issues.
- **Nucleo user manual:** board connections (LED, button, ST-LINK).

#### RCC and clock gating
Every peripheral sits on a bus (AHB1, APB1, APB2) and needs its clock enabled in RCC before use. HAL/CubeMX generates \`__HAL_RCC_GPIOA_CLK_ENABLE()\` for you; in register code you set the bits yourself.`,
  worked: {
    problem: 'You want USART2 at 115 200 baud and TIM3 PWM. Which buses do they use, and what clocks do you need?',
    steps: ['USART2 and TIM3 are on APB1 (≤ 45 MHz on the F446).', 'Enable RCC APB1 clocks for USART2 and TIM3 (plus GPIO port clocks for their pins).', 'TIM3 runs at 2 × APB1 = 90 MHz when the APB1 prescaler is not 1 — use that for PSC/ARR maths.'],
    answer: 'Both on **APB1**: enable their clocks and the GPIO ports; calculate the timer from **90 MHz**.',
  },
  tryIt: 'Download the STM32F446RE datasheet and reference manual from ST. In the datasheet, find the alternate-function table entry for PA2 and PA3; in the reference manual, find the RCC_APB1ENR register.',
  mistakes: [['Reading the datasheet for register details', 'Registers are in the reference manual.'], ['Forgetting peripheral clocks', 'Enable them in RCC first.'], ['Assuming every pin is 5 V tolerant', 'Check the FT marking per pin.']],
  check: ['sa-a', 'sa-b', 'ca-a'],
  challenge: { prompt: 'Write a one-page STM32F446 cheat sheet: buses, maximum bus clocks, the peripherals you will use for the robot and their bus.' },
  summary: ['Cortex-M4F @ 180 MHz, 512 KB / 128 KB.', 'Datasheet for pins, reference manual for registers.', 'RCC clock gating before every peripheral.'],
  cards: [['Where are STM32 register details?', 'The reference manual (RM), not the datasheet', 'concept']],
});

export const nucleo = L({
  id: 'nucleo', title: 'STM32 Nucleo boards', topic: 'stm32', minutes: 11,
  objectives: ['Identify the Nucleo\'s on-board debugger, LED and button', 'Use the ST-LINK virtual COM port', 'Connect shields and external hardware safely'],
  why: `The NUCLEO-F446RE gives you a professional debugger from day one — something Arduino boards lack. Knowing what is on the board saves hours of wiring and searching.`,
  visual: { md: '| Item | Connection |\n|---|---|\n| ST-LINK/V2-1 | USB: flashing, debugging (SWD), virtual COM port |\n| User LED LD2 | PA5 |\n| User button B1 | PC13 (active LOW) |\n| Virtual COM port | USART2: PA2 (TX), PA3 (RX) |\n| Headers | Arduino Uno R3 compatible + ST morpho (all pins) |', caption: 'NUCLEO-F446RE essentials (from the board user manual).' },
  theory: `#### On-board ST-LINK
The upper part of the board is a debugger: it flashes the target over **SWD**, supports breakpoints, and exposes a **virtual COM port** connected to USART2 — so \`printf\` over USART2 appears on your PC without extra hardware.

#### Power
Powered from USB by default (with a current limit). For motors and big loads, use an external supply and connect grounds — never draw motor current through the board's 3.3 V regulator.

#### Headers
- Arduino-compatible headers accept many shields (check voltage: STM32 is 3.3 V).
- Morpho headers expose every MCU pin.

#### First test
Blink LD2 (PA5) and print over the virtual COM port at 115 200 baud.`,
  worked: {
    problem: 'printf output does not appear on the PC terminal although the code runs. What do you check?',
    steps: ['printf must be redirected to USART2 (implement __io_putchar or _write to call HAL_UART_Transmit).', 'Open the ST-LINK virtual COM port (not another COM port) at the configured baud.', 'Ensure USART2 is enabled in CubeMX on PA2/PA3.'],
    answer: 'Redirect **printf → USART2**, open the **ST-LINK VCP**, match the baud.',
  },
  tryIt: 'Read the button on PC13 and toggle the LED on PA5 on each press (it is active LOW). Print "pressed" over the virtual COM port.',
  mistakes: [['Powering motors from the Nucleo 3.3 V pin', 'Use a separate supply; share ground.'], ['Plugging 5 V shields into 3.3 V-only pins', 'Check levels and FT pins.'], ['Opening the wrong COM port', 'Use the STLink Virtual COM Port.']],
  check: ['stm-1', 'nu-a', 'proto-5'],
  challenge: { prompt: 'Run the Nucleo blink lab: HAL first, then registers, then the debugger.', exerciseId: 'lab-stm32-blink' },
  summary: ['ST-LINK: flash, debug, virtual COM (USART2).', 'LED PA5, button PC13 (active LOW).', 'External supply for loads; common ground.'],
  cards: [['Nucleo virtual COM port', 'USART2 on PA2/PA3 via the ST-LINK', 'concept']],
});

export const cubeide = L({
  id: 'cubeide', title: 'STM32CubeIDE', topic: 'stm32', minutes: 12,
  objectives: ['Create, build and flash a project', 'Run a debug session with breakpoints and watches', 'Inspect peripheral registers (SFRs) live'],
  why: `A debugger replaces guesswork: stop the robot's control loop at the exact moment speed goes wrong and inspect every variable and register. Employers expect you to use one.`,
  visual: { flow: ['New STM32 project (board selector)', 'Configure in .ioc (CubeMX)', 'Generate code', 'Build (Ctrl+B)', 'Debug: breakpoints, watches, SFRs'], caption: 'The CubeIDE workflow.' },
  theory: `#### Debug essentials
- **Breakpoint:** click the margin; execution stops there.
- **Step over / into / return** (F6 / F5 / F7).
- **Expressions/Live Expressions:** watch variables update while running.
- **SFRs view:** peripheral registers decoded bit by bit (e.g. GPIOA → ODR).
- **Memory view:** raw RAM and buffers.

#### Build settings
- Optimisation \`-O0\`/\`-Og\` for debugging (variables stay visible); \`-O2\`/\`-Os\` for release.
- Warnings: enable \`-Wall -Wextra\`.

#### Tips
- Conditional breakpoints (stop when \`speed > 300\`).
- A breakpoint in a control loop stops the motors abruptly — lift the wheels.
- Watch the build console's memory report (flash/RAM usage).`,
  worked: {
    problem: 'A variable shows "<optimized out>" in the debugger. Why, and what do you do?',
    steps: ['With -O2, the compiler keeps the value in a register or removes it.', 'Switch the Debug configuration to -Og (or -O0) and rebuild.', 'If you must debug optimised code, declare the variable volatile temporarily.'],
    answer: 'Use the **Debug build (-Og/-O0)** for stepping; optimised builds remove or move variables.',
  },
  tryIt: 'Set a breakpoint inside your blink loop, step over the toggle line and watch GPIOA → ODR bit 5 change in the SFRs view.',
  mistakes: [['Debugging an optimised build', 'Use -Og/-O0 when stepping.'], ['Breakpoints in motor loops with wheels on the floor', 'Lift the wheels or disable motors first.'], ['Ignoring the memory usage report', 'Check flash and RAM after each build.']],
  check: ['ci-a', 'stm-2', 'tool-1'],
  challenge: { prompt: 'Use a breakpoint and the register view to explain why a pin is not changing (try it by commenting out the GPIO clock enable).' },
  summary: ['Build, flash and debug in one tool.', 'Breakpoints, live expressions, SFR view.', 'Debug builds for stepping; release builds for size/speed.'],
  cards: [['"optimized out" in debugger', 'Rebuild with -Og/-O0 for debugging', 'concept']],
});

export const cubemx = L({
  id: 'cubemx', title: 'STM32CubeMX', topic: 'stm32', minutes: 12,
  objectives: ['Configure pins, clocks and peripherals graphically', 'Generate code and extend it safely', 'Resolve pin conflicts'],
  why: `CubeMX turns hours of register reading into minutes of configuration — and shows pin conflicts before you solder. Understanding what it generates keeps you in control.`,
  visual: { flow: ['Pinout: assign functions', 'Clock tree: set frequencies', 'Peripherals: parameters, DMA, NVIC', 'Generate code', 'Write code in USER CODE blocks'], caption: 'CubeMX configuration steps.' },
  theory: `#### Tabs
- **Pinout & Configuration:** click a pin to choose its function; peripherals list their modes and parameters; enable DMA streams and NVIC interrupts here.
- **Clock Configuration:** visual clock tree, warns about out-of-range values.
- **Project Manager:** toolchain, code generation options (e.g. separate .c/.h per peripheral).

#### Generated code
\`main.c\` calls \`HAL_Init()\`, \`SystemClock_Config()\`, then \`MX_GPIO_Init()\`, \`MX_USART2_UART_Init()\`… Handles like \`huart2\` and \`htim3\` are globals you pass to HAL functions.

#### USER CODE blocks
\`\`\`c
/* USER CODE BEGIN 2 */
HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);
/* USER CODE END 2 */
\`\`\`
Anything outside these markers is overwritten on regeneration. Put larger code in your own files (\`motor.c\`) and call it from USER CODE blocks.`,
  worked: {
    problem: 'You assign TIM3_CH1 to PA6 for PWM, but CubeMX shows PA6 already used by SPI1_MISO. What are your options?',
    steps: ['Check the alternate-function table: TIM3_CH1 is also available on PB4 and PC6.', 'Move PWM to PB4 or PC6, or move SPI1 to its alternate pins.', 'Re-check the Nucleo headers to make sure the chosen pin is accessible and free.'],
    answer: 'Use an **alternate pin** for TIM3_CH1 (e.g. PC6) — CubeMX shows the options and flags conflicts.',
  },
  tryIt: 'In CubeMX, configure TIM3 CH1 as PWM at 20 kHz, USART2 asynchronous at 115 200, and I2C1 standard mode. Generate code and find where each handle is initialised.',
  mistakes: [['Writing code outside USER CODE blocks', 'Keep edits inside the markers or in your own files.'], ['Ignoring clock-tree warnings', 'Resolve red fields before generating.'], ['Forgetting to start a peripheral after init', 'MX_..._Init configures; HAL_TIM_PWM_Start etc. starts it.']],
  check: ['cm-a', 'stm-2', 'ck-c'],
  challenge: { prompt: 'Configure and generate a project with PWM, UART and I2C as above, commit it to Git, then regenerate after a change and confirm your USER CODE survived.' },
  summary: ['Pinout, clocks, peripherals, DMA and NVIC in one place.', 'Generated init + handles; start peripherals yourself.', 'USER CODE blocks survive regeneration.'],
  cards: [['CubeMX safe edit zone', 'Between /* USER CODE BEGIN */ and /* USER CODE END */', 'concept']],
});

export const hal = L({
  id: 'hal', title: 'HAL libraries', topic: 'stm32', minutes: 13,
  objectives: ['Use HAL handles, functions and callbacks', 'Check HAL status codes', 'Know when to drop to LL or registers'],
  why: `The HAL is portable across STM32 families and is what most companies use. Reading it — and knowing its costs — lets you write correct firmware quickly and optimise where it matters.`,
  visual: { md: '| Layer | Example | Trade-off |\n|---|---|---|\n| HAL | `HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_SET)` | Portable, readable, more overhead |\n| LL (low-layer) | `LL_GPIO_SetOutputPin(GPIOA, LL_GPIO_PIN_5)` | Thin inline wrappers |\n| Registers | `GPIOA->BSRR = GPIO_PIN_5` | Fastest, least portable |', caption: 'Three ways to do the same thing.' },
  theory: `#### Patterns
- **Handles:** \`UART_HandleTypeDef huart2\` holds configuration and state.
- **Blocking:** \`HAL_UART_Transmit(&huart2, buf, len, 100)\` — waits up to 100 ms.
- **Interrupt / DMA:** \`HAL_UART_Transmit_IT(...)\`, \`..._DMA(...)\` return immediately; completion arrives in a callback.
- **Callbacks** are weak functions you override:
\`\`\`c
void HAL_UART_TxCpltCallback(UART_HandleTypeDef *huart) {
  if (huart->Instance == USART2) tx_done = 1;
}
\`\`\`

#### Status codes
\`HAL_OK\`, \`HAL_ERROR\`, \`HAL_BUSY\`, \`HAL_TIMEOUT\` — check them, log failures.

#### HAL_Delay and SysTick
\`HAL_Delay\` blocks using the 1 ms SysTick; \`HAL_GetTick()\` gives milliseconds for non-blocking timing (like millis()).`,
  worked: {
    problem: 'An I2C read returns HAL_TIMEOUT intermittently. What do you check?',
    steps: ['Pull-ups and wiring (scope or logic analyzer).', 'Device address: HAL expects the 7-bit address shifted left by 1 (0x76 << 1).', 'Bus contention from another task/ISR using the same handle — HAL_BUSY/HAL_TIMEOUT can result.'],
    answer: 'Check **pull-ups, the shifted address (HAL wants addr7 << 1), and concurrent access**.',
  },
  tryIt: 'Send "hello" over USART2 three ways: blocking, _IT with a TX-complete callback, and _DMA. Toggle a pin while each transfer runs to see which ones let the CPU continue.',
  mistakes: [['Ignoring HAL return values', 'Check and log every status.'], ['Passing the 7-bit I2C address to HAL', 'HAL uses addr << 1.'], ['HAL_Delay in control loops', 'Use HAL_GetTick() for non-blocking timing.']],
  check: ['ha-a', 'ha-b', 'stm-2'],
  challenge: { prompt: 'Write a small wrapper `bool sensor_read_reg(uint8_t reg, uint8_t *val)` over HAL I2C that returns false on any non-HAL_OK status, and test it with your sensor.' },
  summary: ['Handles + functions + weak callbacks.', 'Blocking, IT and DMA variants.', 'Always check HAL status; HAL I2C wants addr << 1.'],
  cards: [['HAL I2C address', 'Pass the 7-bit address shifted left: addr7 << 1', 'concept']],
});

export const stm32Gpio = L({
  id: 'stm32-gpio', title: 'GPIO configuration', topic: 'stm32', minutes: 12,
  objectives: ['Configure GPIO mode, type, speed and pulls', 'Use alternate functions for peripherals', 'Write GPIO code with HAL and registers'],
  why: `Every STM32 peripheral signal goes through GPIO configuration. A pin in the wrong mode or alternate function is the most common reason a peripheral "does nothing".`,
  visual: { md: '| Register | Bits per pin | Options |\n|---|---|---|\n| MODER | 2 | 00 input, 01 output, 10 alternate function, 11 analog |\n| OTYPER | 1 | 0 push-pull, 1 open-drain |\n| OSPEEDR | 2 | low … very high (edge speed) |\n| PUPDR | 2 | none, pull-up, pull-down |\n| AFR[0/1] | 4 | AF0–AF15 selection |\n| IDR / ODR / BSRR | 1 | read / write / atomic set-reset |', caption: 'STM32 GPIO registers.' },
  theory: `#### HAL
\`\`\`c
__HAL_RCC_GPIOA_CLK_ENABLE();
GPIO_InitTypeDef g = {0};
g.Pin = GPIO_PIN_5; g.Mode = GPIO_MODE_OUTPUT_PP; g.Pull = GPIO_NOPULL; g.Speed = GPIO_SPEED_FREQ_LOW;
HAL_GPIO_Init(GPIOA, &g);
\`\`\`

#### Registers (PA5 output)
\`\`\`c
RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
GPIOA->MODER = (GPIOA->MODER & ~(3u << 10)) | (1u << 10);
GPIOA->ODR ^= (1u << 5);
\`\`\`

#### Alternate functions
Peripheral pins (UART TX, I2C SDA, timer channels) use **MODER = 10** plus the right **AF number** from the datasheet table (e.g. USART2 on PA2/PA3 is AF7). I2C pins are **open-drain**.

#### Speed
Higher OSPEEDR gives faster edges but more EMI — use low speed for LEDs, higher for SPI clocks.`,
  worked: {
    problem: 'Configure PB8/PB9 for I2C1 using registers (concept level).',
    steps: ['Enable GPIOB clock.', 'MODER for pins 8 and 9 = 10 (alternate function).', 'OTYPER bits 8 and 9 = 1 (open-drain); PUPDR = pull-up only if no external pull-ups.', 'AFR[1] fields for pins 8 and 9 = AF4 (I2C1).'],
    answer: '**AF mode, open-drain, AF4** on PB8/PB9 (check the datasheet table) — then configure I2C1 itself.',
  },
  tryIt: 'Configure PC13 (user button) as input with no pull (the board has one) and PA5 as output using registers only; mirror the button onto the LED.',
  mistakes: [['MODER left as input for a peripheral pin', 'Set alternate-function mode and the AF number.'], ['Push-pull I2C pins', 'I2C requires open-drain.'], ['Very-high speed everywhere', 'Use the lowest speed that meets timing.']],
  check: ['gr-a', 'sg-a', 'stm-6'],
  challenge: { prompt: 'Blink PA5 using registers only (no HAL GPIO calls) and verify ODR in the debugger.', exerciseId: 'lab-stm32-blink' },
  summary: ['MODER, OTYPER, OSPEEDR, PUPDR, AFR.', 'Alternate functions need MODER = 10 + AF number.', 'I2C pins open-drain.'],
  cards: [['STM32 MODER values', '00 in · 01 out · 10 AF · 11 analog', 'concept']],
});

export const stm32Timers = L({
  id: 'stm32-timers', title: 'Timers and interrupts', topic: 'timers', minutes: 14,
  objectives: ['Configure a periodic timer interrupt with HAL', 'Set NVIC priorities', 'Run a fixed-rate control loop from a timer'],
  why: `A PID speed loop must run at a constant rate — jitter makes the derivative term noisy and the integral wrong. Timer interrupts give you a precise heartbeat.`,
  visual: { diagram: 'clock-wave', caption: 'A timer overflow every period becomes the heartbeat of the control loop.' },
  theory: `#### Periodic interrupt (HAL)
\`\`\`c
// CubeMX: TIM6 PSC = 8399, ARR = 199 → 50 Hz at 84 MHz; NVIC TIM6 enabled
HAL_TIM_Base_Start_IT(&htim6);

volatile uint8_t control_tick = 0;
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim) {
  if (htim->Instance == TIM6) control_tick = 1;
}
// main loop:
if (control_tick) { control_tick = 0; control_step(); }
\`\`\`

#### NVIC priorities
Lower number = higher priority on Cortex-M. Give the encoder/timer interrupts higher priority than UART logging. With FreeRTOS, ISRs that call FreeRTOS APIs must use priorities numerically ≥ \`configMAX_SYSCALL_INTERRUPT_PRIORITY\`.

#### EXTI
External pin interrupts: \`HAL_GPIO_EXTI_Callback(uint16_t pin)\` — debounce buttons in software.

#### Doing work in the ISR?
Short calculations can be fine at 50 Hz, but logging and I2C transactions belong in the main loop or a task.`,
  worked: {
    problem: 'Your control step takes 3 ms and runs at 500 Hz from a timer callback. Logging over UART in the same callback makes the robot unstable. Why?',
    steps: ['Period at 500 Hz = 2 ms; the step alone takes 3 ms → overruns every period.', 'Blocking UART adds even more, so interrupts pile up and timing jitters.', 'Reduce the rate (e.g. 100 Hz), set a flag in the callback, do the step and logging outside.'],
    answer: 'The **step is longer than the period**. Lower the rate and move work out of the ISR.',
  },
  tryIt: 'Toggle a pin at the start and end of your control step and measure its duration and period with a logic analyzer — confirm the duty is well below 100 %.',
  mistakes: [['Control work longer than the timer period', 'Measure execution time; adjust the rate.'], ['Wrong priority order', 'Lower NVIC number = higher priority.'], ['Not checking htim->Instance in shared callbacks', 'Several timers share the same callback.']],
  check: ['stt-a', 'stm-5', 'arch-6'],
  challenge: { prompt: 'Run a 50 Hz timer heartbeat that toggles the LED and increments a counter printed once per second from the main loop.' },
  summary: ['HAL_TIM_Base_Start_IT + PeriodElapsedCallback.', 'Lower NVIC number = higher priority.', 'Measure step time; keep ISRs short.'],
  cards: [['Cortex-M priority numbers', 'Lower number = higher priority', 'concept']],
});

export const stm32AdcPwm = L({
  id: 'stm32-adc-pwm', title: 'ADC and PWM', topic: 'pwm', minutes: 14,
  objectives: ['Generate motor PWM from a timer channel', 'Use encoder mode to count wheel ticks in hardware', 'Read the 12-bit ADC'],
  why: `On the STM32, timer hardware generates PWM and counts encoder pulses with no CPU load — ideal for a robot that also runs sensors, comms and navigation.`,
  visual: { diagram: 'quadrature', caption: 'In encoder mode, the timer counts A/B edges and direction in hardware.' },
  theory: `#### PWM
\`\`\`c
// CubeMX: TIM3 CH1 PWM, PSC = 0, ARR = 4499 → 90 MHz / 4500 = 20 kHz
HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_1);
__HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_1, 2250);   // 50 % duty
\`\`\`
Duty = CCR / (ARR + 1).

#### Encoder mode
\`\`\`c
HAL_TIM_Encoder_Start(&htim2, TIM_CHANNEL_ALL);
int32_t ticks = (int32_t)__HAL_TIM_GET_COUNTER(&htim2);   // TIM2 is 32-bit
\`\`\`
Encoder mode TI12 counts both edges of both channels (x4). Use a 32-bit timer (TIM2/TIM5) or handle 16-bit wrap-around.

#### ADC
\`\`\`c
HAL_ADC_Start(&hadc1);
HAL_ADC_PollForConversion(&hadc1, 10);
uint16_t raw = HAL_ADC_GetValue(&hadc1);            // 0–4095
float v = raw * 3.3f / 4095.0f;
\`\`\`
Set the sampling time long enough for high-impedance sources.`,
  worked: {
    problem: 'A 16-bit encoder timer reads 65 530 at one sample and 20 at the next 20 ms later (forward). How many ticks occurred?',
    steps: ['The counter wrapped from 65 535 to 0.', 'Ticks = (20 − 65 530) mod 65 536 = 26.', 'In C: `int16_t delta = (int16_t)(now - prev);` handles wrap-around for counts below 32 768 per sample.'],
    answer: '**26 ticks** — compute deltas with a signed cast of the unsigned difference.',
  },
  demo: { tool: 'encoder', intro: 'See how x4 decoding and the measurement window affect speed resolution.' },
  mistakes: [['Forgetting to start PWM after init', 'Call HAL_TIM_PWM_Start.'], ['Ignoring 16-bit counter wrap-around', 'Use 32-bit timers or signed deltas.'], ['ADC sampling time too short', 'Increase it for high-impedance sources.']],
  check: ['stm-4', 'sap-a', 'stm-3'],
  challenge: { prompt: 'Configure one timer for 20 kHz PWM and another in encoder mode; print wheel speed every 50 ms using wrap-safe deltas.' },
  summary: ['PWM: timer channel, duty = CCR/(ARR+1).', 'Encoder mode counts in hardware; handle wrap-around.', 'ADC: 12-bit, choose sampling time.'],
  cards: [['Wrap-safe encoder delta (16-bit)', 'int16_t delta = (int16_t)(now - prev);', 'code']],
});

export const dma = L({
  id: 'dma', title: 'DMA', topic: 'dma', minutes: 14,
  objectives: ['Explain what DMA does and when to use it', 'Stream ADC or UART data with circular DMA', 'Use half/full callbacks for double buffering'],
  why: `Sampling a sensor at 10 kHz with interrupts would bury the CPU. DMA moves the data into memory in the background, leaving the CPU free for control and communication.`,
  visual: { flow: ['Peripheral (ADC/UART) has data', 'DMA copies to buffer[i]', 'Half-transfer callback: process first half', 'Transfer-complete callback: process second half', 'Circular: repeat'], caption: 'Circular DMA with double buffering.' },
  theory: `**DMA (direct memory access)** transfers data between peripherals and memory without the CPU copying each item.

#### Configuration
- Direction: peripheral → memory (ADC, UART RX) or memory → peripheral (UART TX, DAC).
- Data width (byte, half-word, word) and address increment.
- **Normal** (stop after N items) or **circular** (wrap around forever).

#### Double buffering
\`\`\`c
uint16_t adc_buf[256];
HAL_ADC_Start_DMA(&hadc1, (uint32_t *)adc_buf, 256);      // circular in CubeMX

void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *h) { process(&adc_buf[0], 128); }
void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *h)     { process(&adc_buf[128], 128); }
\`\`\`
While you process one half, DMA fills the other — continuous data without gaps.

#### Caveats
- Buffers must stay valid (static/global, not a local that goes out of scope).
- On parts with data caches (e.g. Cortex-M7) you must manage cache coherency; the F446 (M4) has no data cache.`,
  worked: {
    problem: 'ADC + DMA samples at 10 kHz into a 256-element circular buffer. How long does processing each half have?',
    steps: ['Each half = 128 samples.', 'At 10 kHz, 128 samples take 12.8 ms.', 'Processing of one half must finish within 12.8 ms, before DMA wraps back into it.'],
    answer: '**12.8 ms per half** — measure your processing time to confirm it fits.',
  },
  tryIt: 'Configure ADC1 with circular DMA on the Nucleo, compute the average of each half in the callbacks, and print one average per second over UART.',
  mistakes: [['DMA into a local (stack) buffer', 'Use static or global buffers.'], ['Processing slower than the buffer fills', 'Measure; enlarge the buffer or simplify processing.'], ['Wrong data width (byte vs half-word)', 'Match the peripheral data size.']],
  check: ['stm-3', 'dm-b1', 'arch-1'],
  challenge: { prompt: 'Stream ADC readings over UART using DMA (the syllabus Create mission): DMA for the ADC and DMA for UART transmission.' },
  summary: ['DMA moves data without the CPU.', 'Circular + half/full callbacks = continuous streaming.', 'Static buffers; processing must keep up.'],
  cards: [['DMA double buffering', 'Process one half in the half-transfer callback, the other in transfer-complete', 'concept']],
});

export const stm32Comms = L({
  id: 'stm32-comms', title: 'UART, SPI and I2C', topic: 'uart', minutes: 14,
  objectives: ['Use HAL UART, SPI and I2C in blocking, IT and DMA modes', 'Receive variable-length UART messages', 'Choose the right transfer mode'],
  why: `Real firmware talks to many devices at once. Choosing blocking, interrupt or DMA transfers correctly is what keeps the control loop on time while data flows.`,
  visual: { md: '| Mode | Call | CPU during transfer | Use when |\n|---|---|---|---|\n| Blocking | `HAL_UART_Transmit(&h, buf, n, timeout)` | waits | Start-up, short debug output |\n| Interrupt | `HAL_UART_Transmit_IT(&h, buf, n)` | free | Short messages |\n| DMA | `HAL_UART_Transmit_DMA(&h, buf, n)` | free | Long or frequent transfers |', caption: 'HAL transfer modes.' },
  theory: `#### UART receive of unknown length
\`HAL_UARTEx_ReceiveToIdle_DMA(&huart2, rx_buf, sizeof rx_buf)\` stops when the line goes idle and calls \`HAL_UARTEx_RxEventCallback(huart, size)\` with the number of bytes — ideal for commands and GPS sentences.

#### SPI
\`\`\`c
HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_RESET);
HAL_SPI_TransmitReceive(&hspi1, tx, rx, 2, 10);
HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_SET);
\`\`\`

#### I2C register access
\`\`\`c
uint8_t id;
HAL_I2C_Mem_Read(&hi2c1, 0x76 << 1, 0xD0, I2C_MEMADD_SIZE_8BIT, &id, 1, 50);   // BME280 ID = 0x60
\`\`\`

#### Rules
- A handle can only do one transfer at a time (HAL_BUSY otherwise) — protect it with a mutex under an RTOS.
- Keep buffers alive until the IT/DMA transfer completes.`,
  worked: {
    problem: 'You send telemetry with HAL_UART_Transmit_DMA from a local array; the PC sometimes receives garbage. Why?',
    steps: ['The function returns immediately while DMA is still reading the buffer.', 'The local array goes out of scope and its stack memory is reused.', 'Use a static/global buffer and do not modify it until TxCpltCallback fires.'],
    answer: 'The **buffer must outlive the DMA transfer** — use static storage and wait for the complete callback.',
  },
  tryIt: 'Implement a command parser on USART2 using ReceiveToIdle DMA: "led on", "led off", "speed 120". Echo each recognised command back.',
  mistakes: [['Local buffers for IT/DMA transfers', 'Use static buffers that live until completion.'], ['Two tasks using one handle at once', 'Protect it with a mutex.'], ['Forgetting the << 1 on I2C addresses', 'HAL expects the shifted address.']],
  check: ['sc-c', 'ha-a', 'proto-2'],
  challenge: { prompt: 'Read the BME280 chip ID with HAL_I2C_Mem_Read and print it; then capture the transaction with a logic analyzer and match each byte.' },
  summary: ['Blocking, IT, DMA — pick by length and frequency.', 'ReceiveToIdle for variable-length UART input.', 'One transfer per handle; buffers must outlive transfers.'],
  cards: [['Variable-length UART receive (HAL)', 'HAL_UARTEx_ReceiveToIdle_DMA + RxEventCallback', 'code']],
});

export const hwDebugging = L({
  id: 'hw-debugging', title: 'Hardware debugging', topic: 'debugging-tools', minutes: 14,
  objectives: ['Use breakpoints, watchpoints and register views', 'Analyse a HardFault', 'Combine the debugger with a logic analyzer'],
  why: `When the robot freezes, you need to know where and why. The debugger and fault registers answer that in minutes — an essential professional skill.`,
  visual: { flow: ['Reproduce the fault', 'Halt in the debugger', 'Read PC, LR, call stack', 'Check fault status registers (CFSR, HFSR)', 'Inspect variables / memory', 'Fix and verify'], caption: 'Debugging a crash on Cortex-M.' },
  theory: `#### Debugger features
- **Breakpoints** (stop at a line), **conditional** breakpoints.
- **Watchpoints** (stop when a variable is written) — find who corrupts a value.
- **Call stack**, local variables, memory and SFR views.

#### HardFault analysis
On a fault the CPU stacks registers (R0–R3, R12, LR, **PC**, xPSR). In the debugger:
1. Look at the **stacked PC** → the faulting instruction.
2. Read **CFSR** (configurable fault status): bits tell you if it was a bus fault, usage fault (e.g. divide by zero, unaligned access) or memory management fault, and **BFAR/MMFAR** give the faulting address.
3. Common causes: NULL/dangling pointer, stack overflow, array overrun, calling a function through a bad pointer.

#### Combine tools
The logic analyzer shows *what the pins did*; the debugger shows *what the code thought*. Toggle a spare GPIO at key code points to correlate them in time.`,
  worked: {
    problem: 'HardFault after adding a 4 KB local array in a FreeRTOS task with a 2 KB stack. Explain.',
    steps: ['The local array exceeds the task stack → stack overflow into other memory.', 'Corrupted return addresses or data lead to a fault later.', 'Fix: move the array to static storage or increase the task stack; enable configCHECK_FOR_STACK_OVERFLOW.'],
    answer: '**Task stack overflow.** Measure stacks (high-water mark) and enable FreeRTOS overflow checking.',
  },
  tryIt: 'Deliberately dereference a NULL pointer on the Nucleo, let it HardFault, and find the faulting line from the stacked PC and CFSR in CubeIDE\'s Fault Analyzer.',
  mistakes: [['Rebooting instead of investigating faults', 'Halt and read the fault registers first.'], ['Only using prints', 'Watchpoints find memory corruption far faster.'], ['Not correlating pins and code', 'Toggle a debug GPIO and capture it alongside the bus.']],
  check: ['hd-b', 'tool-1', 'tool-3'],
  challenge: { prompt: 'Use a breakpoint and the register view to find why a pin is not changing (the syllabus Debug mission), and write a one-page debug report.' },
  summary: ['Breakpoints, watchpoints, call stack, SFRs.', 'HardFault: stacked PC + CFSR + fault address.', 'Correlate debugger and logic analyzer with a debug GPIO.'],
  cards: [['First step on a Cortex-M HardFault', 'Read the stacked PC and CFSR to find the faulting instruction and cause', 'concept']],
});

export const stm32Project = L({
  id: 'stm32-project', title: 'Embedded project development', topic: 'stm32', minutes: 14,
  objectives: ['Structure an STM32 project into drivers, services and application', 'Integrate generated code with your own modules', 'Use version control and testing in a CubeIDE project'],
  why: `Employers look for firmware that is organised, tested and documented — not one huge main.c. This lesson pulls the STM32 phase together into a professional project structure.`,
  visual: { flow: ['Core/: CubeMX generated init', 'Drivers/: motor.c, encoder.c, bme280.c', 'App/: control.c, state_machine.c', 'Tests/: host unit tests', 'docs/: README, diagrams, results'], caption: 'A maintainable STM32 project layout.' },
  theory: `#### Layout
- \`Core/\` — generated: \`main.c\`, peripheral init. Keep your edits to USER CODE blocks that call your modules.
- \`App/\` — application logic: state machine, PID, kinematics (pure C, testable).
- \`Drivers/\` or \`Bsp/\` — thin hardware wrappers over HAL.
- \`Tests/\` — unit tests compiled on your laptop (gcc + Unity).

#### main.c
\`\`\`c
/* USER CODE BEGIN 2 */
app_init();
/* USER CODE END 2 */
while (1) {
  /* USER CODE BEGIN 3 */
  app_step(HAL_GetTick());
  /* USER CODE END 3 */
}
\`\`\`

#### Workflow
- Git: commit the .ioc file and sources; ignore Debug/Release build folders.
- One feature per branch; describe tests in the PR.
- README: what it does, hardware, how to build and flash, measured results.`,
  worked: {
    problem: 'Where should the PID update function live, and how do you test it?',
    steps: ['PID is pure maths → App/pid.c with pid.h.', 'No HAL includes in pid.c.', 'Tests/test_pid.c builds pid.c with gcc on the laptop and checks the first output (Kp=2, Ki=1, e=20, dt=0.01 → 40.2).'],
    answer: '**App/pid.c**, tested on the laptop — the same code then runs on the STM32 unchanged.',
  },
  tryIt: 'Restructure your Nucleo project into Core/App/Drivers folders, add a Tests/ folder with one host-side unit test, and add a .gitignore for build outputs.',
  mistakes: [['All code in main.c', 'Split into modules by responsibility.'], ['HAL calls inside logic modules', 'Keep logic pure; drivers wrap HAL.'], ['Not committing the .ioc', 'It is the source of the generated configuration.']],
  check: ['sj-a', 'test-1', 'git-1'],
  challenge: { prompt: 'Publish your STM32 project on GitHub with the layout above, a README with build/flash steps, and at least one host unit test.' },
  summary: ['Generated Core, pure App logic, thin Drivers, host Tests.', 'Call your modules from USER CODE blocks.', 'Commit the .ioc; document and test.'],
  cards: [['Testable firmware rule', 'Pure logic without HAL includes, tested on the host', 'concept']],
});
