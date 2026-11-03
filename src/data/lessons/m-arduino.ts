import type { Question } from '../types';
import { L, mc, num, out, sc, tf } from './helpers';

export const arduinoLessonQuestions: Question[] = [
  sc('ui-a', 'arduino-gpio', 1, 'How often does the Arduino `loop()` function run?', ['Once', 'Every second', 'Repeatedly, as fast as possible, forever', 'Only when an interrupt fires'], 2, 'The hidden main() calls setup() once, then loop() in an endless loop.'),
  tf('ui-b', 'arduino-gpio', 1, 'The Arduino Uno\'s ATmega328P runs at 16 MHz with 32 KB flash and 2 KB RAM.', true, 'Those limits shape every design choice on the Uno — especially the 2 KB of RAM.'),
  sc('id-a', 'arduino-gpio', 1, 'Upload fails with "port not found". What should you check first?', ['The sketch logic', 'The selected board and serial port (and the USB cable/driver)', 'The I2C pull-ups', 'The analog reference'], 1, 'Wrong port/board selection or a charge-only USB cable is the usual cause.'),
  mc('id-b', 'arduino-gpio', 2, 'What does PlatformIO add compared with the Arduino IDE? (select all)', ['Project-based configuration (platformio.ini)', 'Built-in unit testing support', 'Library version pinning', 'It cannot compile Arduino code'], [0, 1, 2], 'PlatformIO compiles Arduino-framework code too, with better project structure, testing and dependency management.'),
  num('lb-a', 'arduino-gpio', 1, 'A 5 V Uno pin drives a red LED (1.9 V) at 10 mA. What series resistance is needed?', 310, 'Ω', '(5 − 1.9) / 0.010 = 310 Ω → use 330 Ω (≈ 9.4 mA).'),
  num('ai-a', 'adc', 1, 'A Uno ADC (5 V reference) reads 205. What voltage is that?', 1.002, 'V', '205 / 1023 × 5 ≈ 1.00 V.', 0.01),
  sc('ai-b', 'adc', 2, 'A potentiometer is wired 5 V – wiper – GND. Turning it changes the reading from 0 to 1023. What circuit is it?', ['A current source', 'A variable voltage divider', 'A pull-up', 'A low-pass filter'], 1, 'The wiper splits the track into R1 and R2: V_wiper = 5 V × R2/(R1+R2).'),
  num('pw-a', 'pwm', 1, 'What duty cycle does `analogWrite(9, 64)` produce on a Uno?', 25.1, '%', '64 / 255 ≈ 25 %.', 0.02),
  sc('pw-b', 'pwm', 2, 'Why does an LED driven by PWM at 490 Hz look steady, while at 20 Hz it flickers?', ['PWM changes the LED colour', 'The eye averages fast switching; below ~50–100 Hz individual flashes are visible', '20 Hz exceeds the LED rating', 'analogWrite only works at 490 Hz'], 1, 'Persistence of vision averages fast pulses; slow pulses are seen as flicker.'),
  mc('se-a', 'arduino-gpio', 2, 'Which steps belong in the six-step sensor bring-up? (select all)', ['Check voltage, logic level and address', 'Read one raw value', 'Compare with a reference', 'Write the full application first'], [0, 1, 2], 'Bring up step by step: verify power and address, raw value, units, reference, then characterise noise and drift.'),
  sc('dm-a', 'pwm', 2, 'Why does a DC motor draw much more current when stalled than when spinning freely?', ['Stalled motors heat the battery', 'There is no back-EMF opposing the supply, so only the winding resistance limits current', 'PWM stops when stalled', 'The encoder shorts the supply'], 1, 'A spinning motor generates back-EMF; stalled, I = V / R_winding — often several times the running current.'),
  sc('md-b', 'pwm', 1, 'On the TB6612, IN1 = HIGH, IN2 = HIGH with PWM on gives…', ['Forward', 'Reverse', 'Coast', 'Short brake'], 3, 'Both inputs HIGH shorts the motor terminals through the low-side switches: short brake.'),
  sc('md-c', 'pwm', 2, 'The TB6612 motor won\'t run although PWM and IN pins are correct. Which pin should you check?', ['VREF', 'STBY must be HIGH', 'AREF', 'RESET'], 1, 'STBY LOW puts the driver in standby. Measure it.'),
  out('ut-a', 'interrupts', 2, 'Which interrupt mode counts both edges of a square wave? Answer with the Arduino constant.', 'attachInterrupt(digitalPinToInterrupt(2), isr, ???);', ['CHANGE'], 'CHANGE fires on rising and falling edges (RISING/FALLING fire on one edge only).'),
];

export const unoIntro = L({
  id: 'uno-intro', title: 'Arduino Uno introduction', topic: 'arduino-gpio', minutes: 12,
  objectives: ['Describe the Uno\'s MCU, memory and I/O', 'Explain how setup() and loop() run', 'Know the board\'s electrical limits'],
  why: `You already own an Uno. It is the simplest place to learn every core peripheral — GPIO, ADC, PWM, timers, interrupts, UART, I2C, SPI — before moving the same ideas to the ESP32 and STM32.`,
  visual: { md: '| Item | Arduino Uno R3 |\n|---|---|\n| MCU | ATmega328P, 8-bit AVR @ 16 MHz |\n| Flash / SRAM / EEPROM | 32 KB (0.5 KB bootloader) / 2 KB / 1 KB |\n| Digital I/O | 14 pins (6 PWM: 3, 5, 6, 9, 10, 11) |\n| Analog inputs | 6 (A0–A5), 10-bit ADC |\n| External interrupts | pins 2 and 3 |\n| UART / I2C / SPI | pins 0–1 / A4–A5 / 10–13 |\n| Logic level | 5 V; ~20 mA per pin recommended |', caption: 'Arduino Uno at a glance.' },
  theory: `#### Program structure
\`\`\`cpp
void setup() {          // runs once after reset
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
}
void loop() {           // runs forever
  digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  delay(500);
}
\`\`\`
Behind the scenes: \`main()\` → \`init()\` (timers, ADC) → \`setup()\` → \`for(;;) loop();\`.

#### Limits to remember
- 2 KB SRAM: big arrays and long strings run out fast.
- ~20 mA per pin, ~200 mA total for all pins: drive loads through transistors.
- 5 V logic: level-shift for 3.3 V devices.
- Pins 0 and 1 are the USB serial — avoid them for other uses while debugging.`,
  worked: {
    problem: 'You want to read a button, blink a status LED, and log readings to the PC. Which pins?',
    steps: ['Button: pin 2 (supports interrupts later) with INPUT_PULLUP.', 'LED: pin 13 (LED_BUILTIN) — already on the board.', 'Logging: USB serial on pins 0/1 via Serial — leave them free.'],
    answer: 'Button on **2**, LED on **13**, Serial over USB. Keep 0/1 unused.',
  },
  tryIt: 'Upload Blink, then change it to blink twice quickly and pause, using `millis()` instead of `delay()`. Print the time of each blink over Serial.',
  mistakes: [['Using pins 0/1 while using Serial', 'They are the USB UART; pick other pins.'], ['Driving loads directly from pins', 'Respect ~20 mA per pin; use a transistor.'], ['Ignoring RAM usage', 'Watch the "dynamic memory" figure after compiling.']],
  check: ['ui-a', 'ui-b', 'arch-2'],
  challenge: { prompt: 'Complete the starter missions: blink the LED, create a GitHub repository for your learning projects, and commit your first sketch with a README.' },
  summary: ['ATmega328P: 16 MHz, 32 KB flash, 2 KB RAM, 5 V.', 'setup() once, loop() forever.', 'Respect pin current and keep 0/1 for Serial.'],
  cards: [['Uno PWM pins', '3, 5, 6, 9, 10, 11', 'concept'], ['Uno external interrupt pins', '2 and 3', 'concept']],
});

export const unoIde = L({
  id: 'uno-ide', title: 'Development environment', topic: 'arduino-gpio', minutes: 11,
  objectives: ['Set up the Arduino IDE and upload a sketch', 'Use the serial monitor and plotter', 'Know when to move to PlatformIO'],
  why: `A smooth tool chain keeps you focused on engineering. PlatformIO later gives you proper project structure, library pinning and unit tests — the workflow professional teams expect.`,
  visual: { flow: ['Write sketch', 'Select board + port', 'Verify (compile)', 'Upload', 'Serial monitor / plotter'], caption: 'The Arduino IDE workflow.' },
  theory: `#### Arduino IDE
1. Install the IDE; select **Tools → Board → Arduino Uno** and the correct **Port**.
2. **Verify** compiles; **Upload** compiles and flashes via the bootloader.
3. **Serial Monitor** shows \`Serial.print\` output — match the baud rate.
4. **Serial Plotter** graphs comma-separated numbers per line — great for sensor noise.

Enable *File → Preferences → Compiler warnings: All*.

#### PlatformIO (VS Code)
\`\`\`ini
; platformio.ini
[env:uno]
platform = atmelavr
board = uno
framework = arduino
lib_deps = adafruit/Adafruit BME280 Library@^2.2.4
monitor_speed = 115200
\`\`\`
Benefits: \`src/\` + \`include/\` + \`lib/\` structure, pinned library versions, \`pio test\` for unit tests, multiple boards in one project.

#### Version control
Commit sketches to Git from day one; ignore build folders (\`.pio/\`).`,
  worked: {
    problem: 'The serial monitor shows random symbols. The sketch calls Serial.begin(115200). Fix it.',
    steps: ['Check the monitor\'s baud selector — it is set to 9600.', 'Set it to 115200 to match the sketch.', 'If still wrong, check that nothing else uses pins 0/1.'],
    answer: 'Match the monitor to **115200 baud**.',
  },
  tryIt: 'Print three values per line separated by commas (e.g. raw ADC, filtered value, threshold) and open the Serial Plotter. Then create the same project in PlatformIO and build it.',
  mistakes: [['Wrong board or port selected', 'Re-select after plugging into a different USB port.'], ['Baud mismatch', 'Same value in Serial.begin and the monitor.'], ['Unpinned library versions', 'Pin versions in platformio.ini for reproducible builds.']],
  check: ['id-a', 'id-b', 'proto-5'],
  challenge: { prompt: 'Fix the garbled serial output scenario in the lab.', exerciseId: 'lab-uart-garbled' },
  summary: ['Board + port, verify, upload, monitor.', 'Turn compiler warnings on.', 'PlatformIO: structure, pinned libraries, tests.'],
  cards: [['Serial Plotter input format', 'Comma-separated numbers, one sample per line', 'concept']],
});

export const ledsButtons = L({
  id: 'leds-buttons', title: 'LEDs and buttons', topic: 'arduino-gpio', minutes: 13,
  objectives: ['Size LED resistors and wire active-high/active-low LEDs', 'Read buttons with pull-ups and debounce them', 'Detect edges (press events) rather than levels'],
  why: `LEDs and buttons are the simplest output and input — and they already contain the key ideas of embedded I/O: current limits, pull-ups, bounce, edge detection and non-blocking code.`,
  visual: { diagram: 'gpio-pin', caption: 'An LED on an output pin and a button on an input with the internal pull-up.' },
  theory: `#### LEDs
\`\`\`
R = (V_pin − V_LED) / I_LED
\`\`\`
5 V, red (1.9 V), 10 mA → 310 Ω → 330 Ω. Wired pin → resistor → LED → GND, HIGH turns it on (**active-high**). Wired VCC → resistor → LED → pin, LOW turns it on (**active-low**).

#### Buttons
\`pinMode(2, INPUT_PULLUP)\` and a button to GND: pressed reads LOW.

#### Bounce
Contacts chatter for 1–20 ms. Accept a change only after it has been stable for ~30 ms.

#### Edges, not levels
\`\`\`cpp
static bool last = HIGH;
bool now = digitalRead(2);
if (last == HIGH && now == LOW) on_press();   // falling edge = press
last = now;
\`\`\`
Combine with debouncing so one press = one event.`,
  worked: {
    problem: 'Count presses on pin 2 reliably and toggle an LED on each press, without delay().',
    steps: ['Read the pin each loop; if it differs from the last raw reading, restart a 30 ms timer.', 'When the reading has been stable for 30 ms and differs from the debounced state, update the state.', 'On a debounced HIGH → LOW transition, increment the count and toggle the LED.'],
    answer: 'Debounce (30 ms stability) + edge detection = exactly **one event per press**, while loop() keeps running.',
  },
  demo: { tool: 'circuit-builder', intro: 'Try LED colours and resistor values; watch the current and the warning when an LED is overdriven.' },
  mistakes: [['No series resistor on an LED', 'Always limit current with a resistor.'], ['Acting on the level, not the edge', 'Detect HIGH → LOW transitions for press events.'], ['Debouncing with delay()', 'Use millis() so the loop stays responsive.']],
  check: ['gpio-2', 'gpio-6', 'lb-a'],
  challenge: { prompt: 'Build the debounced press counter and compare counts with and without debouncing.', exerciseId: 'lab-uno-debounce' },
  summary: ['R = (V_pin − V_LED)/I.', 'INPUT_PULLUP + button to GND = active-low.', 'Debounce + edge detection = one event per press.'],
  cards: [['Press detection', 'Act on the debounced HIGH → LOW edge, not the LOW level', 'concept']],
});

export const analogInputs = L({
  id: 'analog-inputs', title: 'Analog inputs', topic: 'adc', minutes: 13,
  objectives: ['Convert raw ADC readings to volts and physical units', 'Explain resolution and reference voltage', 'Reduce noise with averaging'],
  why: `Potentiometers, light sensors, thermistors, battery-voltage monitoring and many gas sensors are analog. The robot also needs to know its battery voltage before it stops working.`,
  visual: { diagram: 'voltage-divider', caption: 'Many analog sensors are voltage dividers: one resistance changes with the measured quantity.' },
  theory: `\`analogRead(A0)\` returns **0–1023** on the Uno (10-bit) with a 5 V reference:

\`\`\`
V = reading / 1023 × V_ref        resolution = 5 V / 1023 ≈ 4.9 mV
\`\`\`

#### Reference voltage
The default reference is the 5 V supply — if USB gives 4.8 V, every reading shifts. \`analogReference(INTERNAL)\` uses a 1.1 V internal reference: more stable and finer resolution for small signals.

#### Measuring battery voltage
A 2S pack reaches 8.4 V, above the ADC range. Use a divider: 10 kΩ / 4.7 kΩ maps 8.4 V to ≈ 2.69 V. Then \`V_bat = V_adc × (R1 + R2) / R2\`.

#### Noise
Average several samples or use a moving average; keep analog wires away from motor wiring; add 100 nF at the ADC pin for slowly changing signals.

#### Sampling
Each Uno conversion takes ≈ 100 µs (about 10 000 samples/s max).`,
  worked: {
    problem: 'A 10 kΩ / 4.7 kΩ divider feeds the battery voltage to A1 (5 V reference). The reading is 560. What is the battery voltage?',
    steps: ['V_adc = 560 / 1023 × 5 ≈ 2.737 V.', 'Divider ratio = (10 + 4.7) / 4.7 ≈ 3.128.', 'V_bat = 2.737 × 3.128 ≈ 8.56 V… check: that exceeds a full 2S pack (8.4 V).', 'So either the reference is below 5 V, or the resistors are off-tolerance — calibrate against a meter.'],
    answer: '**≈ 8.6 V computed — impossible for a 2S pack**, which reveals a reference or tolerance error. Calibrate: measure the real battery voltage and correct the scale factor.',
  },
  demo: { tool: 'adc', intro: 'Compare 10-bit and 12-bit resolution and see the quantisation error at different input voltages.' },
  mistakes: [['Feeding more than V_ref into an analog pin', 'Use a divider; check the worst case.'], ['Trusting the 5 V reference blindly', 'Measure it or use the internal reference and calibrate.'], ['Plotting raw counts without units', 'Convert to volts and physical units.']],
  check: ['gpio-3', 'ai-a', 'ai-b'],
  challenge: { prompt: 'Convert a potentiometer reading to volts in the lab, then on hardware control an LED\'s brightness with the pot.', exerciseId: 'lab-adc-pot' },
  summary: ['V = reading/1023 × V_ref on the Uno.', 'Dividers bring larger voltages into range.', 'Average, filter and calibrate.'],
  cards: [['Uno ADC resolution', '≈ 4.9 mV per step (5 V / 1023)', 'concept']],
});

export const pwmLesson = L({
  id: 'pwm', title: 'PWM', topic: 'pwm', minutes: 13,
  objectives: ['Relate duty cycle to average voltage', 'Use analogWrite and know its pins and frequencies', 'Choose a PWM frequency for LEDs and motors'],
  why: `PWM dims LEDs, sets motor speed through the TB6612, drives servos and even makes sound. It is how a digital pin controls analog power.`,
  visual: { md: '| Duty | `analogWrite` value | Average (5 V) |\n|---|---|---|\n| 0 % | 0 | 0 V |\n| 25 % | 64 | 1.25 V |\n| 50 % | 128 | 2.5 V |\n| 100 % | 255 | 5 V |', caption: 'Duty cycle and average voltage.' },
  theory: `\`\`\`
V_avg = duty × V_high        duty = value / 255   (Uno analogWrite)
\`\`\`

The pin still switches fully on and off — the **load** (motor inertia, the eye) responds to the average.

#### Uno specifics
- PWM pins: 3, 5, 6, 9, 10, 11.
- Frequencies: ≈ 490 Hz on most, ≈ 980 Hz on pins 5 and 6 (Timer0).
- Using Timer1 or Timer2 for other purposes affects the PWM on their pins.

#### Choosing a frequency
| Load | Typical PWM frequency |
|---|---|
| LED | > 200 Hz (no flicker) |
| Small DC motor | 1–20 kHz (above 20 kHz is inaudible) |
| Hobby servo | 50 Hz with 1–2 ms pulses (position, not power) |

The ESP32 uses the **LEDC** peripheral with configurable frequency and resolution; the STM32 uses timer channels.`,
  worked: {
    problem: 'A motor driver runs from 7.4 V. What analogWrite value gives about 5 V average to the motor?',
    steps: ['Duty = 5 / 7.4 ≈ 0.676.', 'Value = 0.676 × 255 ≈ 172.', 'Note: battery voltage drops as it discharges, so the same value gives less speed later — closed-loop control fixes that.'],
    answer: '**≈ 172** — and this open-loop setting drifts as the battery discharges.',
  },
  demo: { tool: 'pwm', intro: 'Change the duty cycle and frequency; watch the average voltage and LED brightness.' },
  mistakes: [['Using analogWrite on a non-PWM pin', 'Use pins 3, 5, 6, 9, 10, 11 on the Uno.'], ['Expecting a true analog voltage', 'PWM is switching; add an RC filter if you need DC.'], ['Audible motor whine', 'Raise the PWM frequency above ~20 kHz where the driver allows.']],
  check: ['gpio-7', 'pw-a', 'pw-b'],
  challenge: { prompt: 'Measure your Uno\'s PWM frequency and duty cycle with a logic analyzer (or a multimeter\'s duty/frequency mode) at values 64, 128 and 192, and compare with the calculation.' },
  summary: ['V_avg = duty × V_high.', 'Uno: 6 PWM pins, ~490/980 Hz.', 'Match frequency to the load.'],
  cards: [['analogWrite duty', 'value / 255', 'formula']],
});

export const sensors = L({
  id: 'sensors', title: 'Sensors', topic: 'arduino-gpio', minutes: 14,
  objectives: ['Apply a repeatable six-step bring-up to any sensor', 'Characterise noise, drift and warm-up', 'Read accuracy, range and update rate from datasheets'],
  why: `A sensor reading is only useful when you know its units, limits and errors. Your capstone report needs measured noise and settling time for the BME280 and SCD40 — not just "it works".`,
  visual: { flow: ['Check voltage, level, address', 'Scan / confirm signal', 'Read one raw value', 'Convert to real units', 'Compare with reference', 'Record noise, drift, warm-up'], caption: 'Bring up every sensor the same way.' },
  theory: `#### Sensor types on the robot
| Sensor | Gives | Interface | Watch out for |
|---|---|---|---|
| SCD40 | CO₂, T, RH | I2C | New reading only every 5 s (standard mode), warm-up |
| BME280 | T, RH, pressure | I2C/SPI | Self-heating, heat from nearby parts |
| MPU6050 | accel, gyro | I2C | Gyro bias and drift |
| HC-SR04 / ToF | distance | GPIO / I2C | Angle, soft surfaces, 5 V echo |

#### Datasheet numbers that matter
- **Range** and **resolution** (smallest step).
- **Accuracy** (closeness to truth) vs **precision/noise** (repeatability).
- **Update rate / response time** — sample faster than it updates and you just read the same value.

#### Characterise
- **Noise:** standard deviation over a still period.
- **Drift:** slope over an hour.
- **Warm-up/settling:** time to reach a stable value after power-on or a step change.`,
  worked: {
    problem: 'Over 10 minutes in a still room, a temperature sensor reads mean 23.42 °C with standard deviation 0.03 °C; a reference thermometer reads 22.9 °C. Interpret this.',
    steps: ['Noise (precision): 0.03 °C — very repeatable.', 'Offset (accuracy): +0.52 °C vs the reference.', 'A constant offset is often self-heating or heat from nearby parts; check placement before calibrating it out.'],
    answer: '**Precise but offset by ≈ +0.5 °C.** Investigate heat sources, then apply a calibration offset and record it.',
  },
  tryIt: 'Log one sensor (any you own) for 30 minutes as CSV. Compute mean, standard deviation and the drift between the first and last 5 minutes using the Python lessons or a spreadsheet.',
  mistakes: [['Confusing accuracy and precision', 'Noise (spread) and offset (bias) are different errors.'], ['Sampling faster than the update rate', 'Respect the sensor\'s data-ready timing.'], ['Placing sensors near regulators or motors', 'Heat and noise corrupt readings.']],
  check: ['se-a', 'mm-3', 'proto-3'],
  challenge: { prompt: 'Record one sensor for an hour and report its noise and drift — the "Create" mission from the syllabus — in your notes or capstone milestone 7.' },
  summary: ['Six-step bring-up for every sensor.', 'Range, resolution, accuracy, noise, update rate.', 'Measure noise, drift and warm-up yourself.'],
  cards: [['Accuracy vs precision', 'Accuracy: closeness to truth (offset). Precision: repeatability (noise).', 'concept']],
});

export const dcMotors = L({
  id: 'dc-motors', title: 'DC motors', topic: 'pwm', minutes: 13,
  objectives: ['Explain speed, torque, back-EMF and stall current', 'Size a driver and supply from motor specs', 'Protect electronics from motor noise and spikes'],
  why: `Motors are the most power-hungry, noisy parts of your robot. Undersized drivers overheat, supply dips reset the ESP32, and spikes kill transistors — unless you understand how motors behave electrically.`,
  visual: { diagram: 'mosfet-switch', caption: 'A motor is an inductive load: it needs a switch, a flyback path and a stiff supply.' },
  theory: `#### Electrical model
A DC motor is a winding resistance R in series with a back-EMF \`E = k × ω\` that grows with speed:

\`\`\`
I = (V − k·ω) / R
\`\`\`
- Spinning freely: large back-EMF, small current.
- **Stalled or starting:** ω = 0, so \`I_stall = V / R\` — often 5–10× the running current.

#### Speed and torque
Speed ≈ proportional to voltage (minus losses). Torque ≈ proportional to current. Load slows the motor and raises current.

#### Gear motors
The robot's motors have gearboxes: lower output speed, higher torque, and encoders often mounted on the motor shaft (before the gearbox).

#### Practical rules
- Driver continuous rating ≥ running current; peak rating ≥ stall current (or limit current).
- Motor voltage rating ≥ full battery voltage (8.4 V for 2S).
- Bulk capacitance (e.g. 100–470 µF) near the driver, short thick motor wires, separate from signal wiring.
- Start with the wheels lifted.`,
  worked: {
    problem: 'A gear motor\'s winding resistance measures 4 Ω. It runs from a 7.4 V pack through a TB6612 (1.2 A continuous, 3.2 A peak per channel). Is the driver OK at start-up?',
    steps: ['I_stall ≈ 7.4 / 4 ≈ 1.85 A (ignoring driver resistance).', 'Above the 1.2 A continuous rating but below the 3.2 A peak.', 'OK for brief starts; avoid sustained stalls (e.g. robot pushing a wall) — detect them via encoder speed and cut power.'],
    answer: '**Short starts are fine; sustained stalls are not.** Add stall detection in firmware.',
  },
  demo: { tool: 'motor-speed', intro: 'See how PWM, battery voltage and load change speed and current, including the dead-band at low duty.' },
  mistakes: [['Sizing the driver for running current only', 'Check stall current against the peak rating.'], ['Motor rated below the full battery voltage', '2S packs reach 8.4 V when full.'], ['Motor wires bundled with sensor wires', 'Route them apart; twist motor pairs.']],
  check: ['gpio-4', 'dm-a', 'ctl-2'],
  challenge: { prompt: 'Measure your motor\'s winding resistance with a meter, calculate its stall current at full battery voltage, and compare it with your driver\'s ratings.' },
  summary: ['I = (V − kω)/R; stall current = V/R.', 'Speed ∝ voltage, torque ∝ current.', 'Size drivers for stall, decouple supplies, route wires apart.'],
  cards: [['Stall current', 'I_stall ≈ V / R_winding (no back-EMF)', 'formula']],
});

export const motorDrivers = L({
  id: 'motor-drivers', title: 'Motor drivers', topic: 'pwm', minutes: 14,
  objectives: ['Explain how an H-bridge reverses a motor', 'Wire and control the TB6612FNG', 'Implement a signed-speed motor function'],
  why: `The TB6612 is your robot's motor driver. Knowing its truth table and pins — especially STBY — turns "the motor doesn't move" from a mystery into a two-minute measurement.`,
  visual: { diagram: 'h-bridge', caption: 'An H-bridge: closing diagonal switches drives current through the motor in either direction.' },
  theory: `#### H-bridge
Four switches around the motor. Q1 + Q4 → forward; Q2 + Q3 → reverse. Never close both switches on one side (shoot-through short circuit) — integrated drivers prevent this.

#### TB6612FNG (per channel)
| IN1 | IN2 | PWM | Result |
|---|---|---|---|
| H | L | PWM | Forward at duty |
| L | H | PWM | Reverse at duty |
| L | L | x | Coast (stop, free-wheel) |
| H | H | x | Short brake |

- **STBY** must be HIGH to run.
- **VM:** motor supply (up to 15 V); **VCC:** logic (2.7–5.5 V).
- 1.2 A average, 3.2 A peak per channel.

#### Signed speed function
\`\`\`cpp
void motor_set(int16_t s) {           // −255 … 255
  s = constrain(s, -255, 255);
  digitalWrite(AIN1, s > 0);
  digitalWrite(AIN2, s < 0);
  analogWrite(PWMA, abs(s));          // s == 0 → coast
}
\`\`\``,
  worked: {
    problem: 'Implement an emergency stop that halts both wheels as quickly as possible.',
    steps: ['Coast lets the robot roll; brake stops faster.', 'Set IN1 = IN2 = HIGH on both channels (short brake), PWM can stay HIGH.', 'Optionally drop STBY LOW afterwards to disable outputs.'],
    answer: '**Short brake (IN1 = IN2 = HIGH)** on both channels, then STBY LOW. Test with the wheels lifted first.',
  },
  demo: { tool: 'motor-speed', intro: 'Explore speed vs PWM; then think about which TB6612 inputs give each direction.' },
  mistakes: [['STBY left LOW or floating', 'Drive it HIGH in setup().'], ['Logic and motor grounds not joined', 'Connect all grounds together.'], ['Reversing direction at full speed', 'Ramp speed or brake briefly before reversing to limit current spikes.']],
  check: ['md-b', 'md-c', 'gpio-4'],
  challenge: { prompt: 'Run a motor forward, backward and at three speeds through the TB6612, and diagnose a deliberate STBY fault with your meter.', exerciseId: 'lab-motor-driver' },
  summary: ['H-bridge: diagonal switches set direction.', 'TB6612: IN1/IN2 direction, PWM speed, STBY HIGH.', 'Signed speed → direction pins + |duty|.'],
  cards: [['TB6612 short brake', 'IN1 = HIGH, IN2 = HIGH', 'concept'], ['TB6612 must-have', 'STBY HIGH to enable the outputs', 'concept']],
});

export const unoTimersInterrupts = L({
  id: 'uno-timers-interrupts', title: 'Timers and interrupts', topic: 'interrupts', minutes: 15,
  objectives: ['Count encoder pulses with attachInterrupt safely', 'Measure speed at a fixed interval', 'Run periodic tasks without delay()'],
  why: `Wheel encoders produce hundreds of pulses per second. Missing pulses means wrong speed and wrong position. Interrupts plus careful data sharing make counting reliable.`,
  visual: { diagram: 'quadrature', caption: 'Encoder channels A and B: count edges in an ISR; the order of A and B gives direction.' },
  theory: `#### Counting with an interrupt
\`\`\`cpp
volatile long ticks = 0;
void on_a() { ticks += digitalRead(ENC_B) ? -1 : 1; }   // direction from B

void setup() {
  pinMode(ENC_A, INPUT_PULLUP);
  pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), on_a, RISING);
}
\`\`\`

#### Measuring speed periodically
\`\`\`cpp
const uint32_t PERIOD_MS = 50;
static uint32_t last_ms = 0; static long last_ticks = 0;
if (millis() - last_ms >= PERIOD_MS) {
  last_ms += PERIOD_MS;
  noInterrupts(); long t = ticks; interrupts();     // atomic copy (long = 4 bytes on AVR)
  long delta = t - last_ticks; last_ticks = t;
  float rps = delta / (float)COUNTS_PER_REV / (PERIOD_MS / 1000.0f);
}
\`\`\`

#### Modes
\`RISING\`, \`FALLING\`, \`CHANGE\` (both edges = 2× resolution), \`LOW\`. Only pins 2 and 3 on the Uno support attachInterrupt.`,
  worked: {
    problem: 'Your encoder gives 12 counts per motor revolution (on RISING of A) with a 30:1 gearbox. In 50 ms you count 90 ticks. What is the wheel speed in RPM?',
    steps: ['Counts per wheel revolution = 12 × 30 = 360.', 'Wheel revolutions in 50 ms = 90 / 360 = 0.25.', 'RPM = 0.25 / 0.05 s × 60 = 300 RPM.'],
    answer: '**300 RPM**. Remember the gear ratio — counts are usually on the motor shaft.',
  },
  demo: { tool: 'encoder', intro: 'Change PPR, gear ratio, decoding mode and window; watch the counts and the speed resolution.' },
  mistakes: [['Non-volatile tick counter', 'Declare it volatile.'], ['Reading a multi-byte counter without disabling interrupts', 'Copy it inside noInterrupts()/interrupts().'], ['Forgetting the gear ratio', 'Counts per wheel turn = PPR × gear ratio × decoding factor.']],
  check: ['gpio-9', 'gpio-8', 'ut-a'],
  challenge: { prompt: 'Compute wheel speed from encoder ticks in C in the lab.', exerciseId: 'lab-encoder-speed' },
  summary: ['ISR counts; loop copies atomically.', 'Measure speed at a fixed period.', 'Include gear ratio and decoding factor.'],
  cards: [['Encoder counts per wheel revolution', 'PPR × gear ratio × decoding factor (x1/x2/x4)', 'formula']],
});
