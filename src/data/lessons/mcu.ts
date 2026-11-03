import type { Lesson } from '../types';

export const arduinoGpio: Lesson = {
  id: 'arduino-gpio',
  title: 'Arduino GPIO: outputs, inputs & pull-ups',
  minutes: 19,
  status: 'full',
  topic: 'arduino-gpio',
  objectives: [
    'Configure pins as outputs and inputs with pinMode()',
    'Read a button reliably using INPUT_PULLUP',
    'Explain what digitalWrite() does at register level',
    'Debounce a button and blink without delay()',
  ],
  why: `GPIO (General-Purpose Input/Output) is the first peripheral on every microcontroller and the one you will use most: LEDs, buttons, motor driver direction pins, the TB6612's STBY pin, chip-select lines, and status indicators on the air-quality robot.

The concepts here — direction registers, pull-ups, active-low logic and debouncing — transfer directly to the ESP32 and STM32, just with different register names.`,
  visual: { diagram: 'gpio-pin', caption: 'Pin 13 drives an LED through a resistor (output). Pin 2 reads a button to GND with the internal pull-up enabled (input, active-low).' },
  theory: `#### Configure, then use

\`\`\`cpp
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);     // pin 13
  pinMode(2, INPUT_PULLUP);         // button to GND
}

void loop() {
  bool pressed = (digitalRead(2) == LOW);   // active-low
  digitalWrite(LED_BUILTIN, pressed ? HIGH : LOW);
}
\`\`\`

#### What happens underneath

Arduino functions are shortcuts that change register bits. On the Uno's ATmega328P, pin 13 is **PB5**:

\`\`\`c
DDRB  |= (1 << DDB5);    // data direction: PB5 = output
PORTB |= (1 << PORTB5);  // output register: PB5 = HIGH
\`\`\`

For an input, writing 1 to PORTx enables the internal pull-up, and the pin's state is read from PINx.

#### Pull-ups and active-low buttons

An unconnected input **floats** and reads random values. With \`INPUT_PULLUP\`, an internal ~20–50 kΩ resistor holds the pin HIGH; pressing the button connects it to GND → LOW.

#### Limits

| Parameter | Uno (ATmega328P) |
|---|---|
| Logic level | 5 V |
| Recommended pin current | ~20 mA (40 mA absolute maximum) |
| External interrupts | pins 2 and 3 |

Never drive a motor, relay coil or long LED strip directly from a pin — use a transistor or driver.

#### Bounce

Mechanical contacts bounce for a few milliseconds, producing several edges per press. Ignore changes for ~20–50 ms after the last edge:

\`\`\`cpp
if (reading != last_reading) last_change_ms = millis();
if (millis() - last_change_ms > 30 && reading != stable_state) {
  stable_state = reading;
  if (stable_state == LOW) presses++;
}
last_reading = reading;
\`\`\``,
  worked: {
    problem: 'Toggle an LED each time a button is pressed (not while it is held), without delay().',
    steps: [
      '**Detect an edge, not a level:** remember the previous stable state; act only on a HIGH → LOW change.',
      '**Debounce:** accept a new state only after it has been steady for 30 ms.',
      '**Toggle:** on each accepted press, `led_on = !led_on; digitalWrite(13, led_on);`',
      '**Non-blocking:** all timing uses millis(), so the loop never stalls.',
    ],
    answer: 'One debounced press → one toggle. Holding the button does nothing extra; quick bounces are ignored.',
  },
  demo: {
    tool: 'pwm',
    intro: 'GPIO pins can also switch fast enough to dim an LED. Change the duty cycle to see the average voltage — the basis of analogWrite().',
  },
  mistakes: [
    { mistake: 'Forgetting pinMode() — the pin stays an input', fix: 'Configure every pin in setup().' },
    { mistake: 'Button wired to 5 V with no pull-down — random readings', fix: 'Use INPUT_PULLUP and wire the button to GND (active-low).' },
    { mistake: 'Treating pressed as HIGH with INPUT_PULLUP', fix: 'Pressed reads LOW. Name it: bool pressed = digitalRead(pin) == LOW;' },
    { mistake: 'Counting several presses per push', fix: 'Debounce in software (20–50 ms) or add an RC filter.' },
  ],
  check: ['gpio-1', 'gpio-2', 'gpio-6'],
  challenge: {
    prompt: 'On your Uno, build the debounced toggle and count presses on the serial monitor. Upload your code and a short video or photo as evidence.',
    exerciseId: 'lab-uno-debounce',
  },
  summary: [
    'pinMode → digitalWrite / digitalRead; Arduino functions set register bits underneath.',
    'INPUT_PULLUP + button to GND = active-low, no external resistor needed.',
    'Respect pin current limits; drive loads through transistors or drivers.',
    'Debounce buttons and use millis() instead of delay().',
  ],
  flashcards: [
    { id: 'fc-input-pullup', front: 'INPUT_PULLUP button reads ___ when pressed', back: 'LOW (active-low).', kind: 'concept', topic: 'arduino-gpio' },
    { id: 'fc-ddrb', front: 'What do DDRB and PORTB control on the Uno?', back: 'DDRB: pin direction. PORTB: output level (or pull-up for inputs).', kind: 'concept', topic: 'arduino-gpio' },
    { id: 'fc-adc-uno', front: 'Uno ADC reading → voltage', back: 'V = reading / 1023 × 5 V', kind: 'formula', topic: 'adc' },
  ],
};

export const esp32Intro: Lesson = {
  id: 'esp32-intro',
  title: 'ESP32 introduction: architecture & pin rules',
  minutes: 18,
  status: 'full',
  topic: 'esp32',
  objectives: [
    'Compare the ESP32 with the Uno and explain when to use each',
    'Apply the four GPIO rules from Espressif\'s documentation',
    'Handle 3.3 V logic levels safely',
    'Describe how the ESP32 publishes data over Wi-Fi with MQTT',
  ],
  why: `The ESP32 becomes the **main controller of the air-quality robot** because it adds a fast 32-bit dual-core CPU, much more memory, and built-in Wi-Fi and Bluetooth for streaming sensor data. It is also one of the most common chips in IoT freelancing work.

But it brings rules the Uno never taught you: 3.3 V logic, input-only pins, strapping pins that affect boot, and an ADC that conflicts with Wi-Fi. Ignoring them causes the most common ESP32 bring-up failures.`,
  visual: { diagram: 'esp32-block', caption: 'ESP32 block diagram: two Xtensa cores, RAM, external flash, Wi-Fi/Bluetooth radio, and peripherals (GPIO, ADC, LEDC PWM, UART, I2C, SPI).' },
  theory: `#### Uno vs ESP32

| Topic | Arduino Uno | ESP32 DevKit |
|---|---|---|
| CPU | 8-bit AVR, 16 MHz | 32-bit dual-core, up to 240 MHz |
| RAM | 2 KB | ~520 KB |
| Flash | 32 KB | usually 4 MB (on the module) |
| Logic level | 5 V | **3.3 V** |
| ADC | 10-bit (0–1023) | usually 12-bit (0–4095), less accurate near its limits |
| PWM | analogWrite | LEDC peripheral |
| Plain int | 16 bits | 32 bits |
| Wireless | — | Wi-Fi + Bluetooth |

#### Four GPIO rules (original ESP32, from Espressif's GPIO guide)

1. **GPIO 34–39 are input-only** and have no internal pull-up or pull-down.
2. **GPIO 6–11** are usually connected to the module's flash — leave them alone.
3. **GPIO 0, 2, 5, 12 and 15 are strapping pins** that affect start-up — use with care.
4. **ADC2 pins can't be used while Wi-Fi is on** — use ADC1 pins for analog sensors.

#### 3.3 V logic

Never connect a 5 V output directly to an ESP32 input. Check each module's output level; use a level shifter or a divider (e.g. 1 kΩ / 2 kΩ → 3.33 V) for slow signals.

#### FreeRTOS underneath

ESP32 Arduino code already runs on FreeRTOS: \`setup()\` and \`loop()\` run inside a task. You can create your own tasks later (Phase 9).

#### Sending data: MQTT in one paragraph

The robot connects to Wi-Fi and to a **broker** (e.g. Mosquitto on your laptop), **publishes** JSON to a **topic** such as \`robot/air\`, and your dashboard **subscribes** to it:

\`\`\`json
{"time_ms": 120000, "x_cm": 150, "y_cm": 80, "co2_ppm": 650, "rh_pct": 48.5}
\`\`\`

Design for failure: motor control must never wait for the network, readings are buffered until they can be sent, and Wi-Fi credentials live in an ignored file — never in Git.`,
  worked: {
    problem: 'You need to read a potentiometer, an analog gas sensor and a push-button on an ESP32 that also uses Wi-Fi. Choose pins.',
    steps: [
      '**Analog inputs with Wi-Fi on:** must be ADC1 → e.g. GPIO 34 and GPIO 35 (ADC1, input-only — fine for analog).',
      '**Button:** needs a pull-up. GPIO 34–39 have none, so choose a normal GPIO such as 27 with `INPUT_PULLUP`.',
      '**Avoid:** GPIO 6–11 (flash), and strapping pins 0, 2, 5, 12, 15 for the button.',
      '**Levels:** confirm the gas sensor\'s output never exceeds 3.3 V; if it outputs up to 5 V, add a divider.',
    ],
    answer: 'Pot → **GPIO 34**, gas sensor → **GPIO 35** (both ADC1), button → **GPIO 27** with INPUT_PULLUP.',
  },
  demo: {
    tool: 'adc',
    intro: 'Compare a 10-bit Uno ADC with a 12-bit ESP32 ADC at different reference voltages. Notice the change in resolution (volts per step).',
  },
  mistakes: [
    { mistake: 'Connecting a 5 V sensor output straight to an ESP32 pin', fix: 'Use a level shifter or divider; check the datasheet\'s output level.' },
    { mistake: 'Reading an ADC2 pin with Wi-Fi on and getting errors', fix: 'Move analog sensors to ADC1 pins (GPIO 32–39).' },
    { mistake: 'Board won\'t boot after wiring a button to GPIO 12 or 0', fix: 'Strapping pins affect boot mode — choose another pin.' },
    { mistake: 'Expecting an internal pull-up on GPIO 34–39', fix: 'They have none. Add an external resistor or use another pin.' },
  ],
  check: ['esp-1', 'esp-2', 'mqtt-1'],
  challenge: {
    prompt: 'Plan the ESP32 pin map for the robot (motor driver, encoders, I2C bus, distance sensor) respecting every rule, then justify each choice.',
    exerciseId: 'lab-esp32-pinmap',
  },
  summary: [
    'ESP32: 32-bit, dual-core, 3.3 V, Wi-Fi + Bluetooth — the robot\'s main controller.',
    'Input-only 34–39, flash 6–11, strapping 0/2/5/12/15, ADC1 only with Wi-Fi.',
    'Never feed 5 V into an ESP32 input.',
    'MQTT: publish to a topic on a broker; buffer data and never block motor control on the network.',
  ],
  flashcards: [
    { id: 'fc-esp-adc2', front: 'Which ESP32 ADC works while Wi-Fi is on?', back: 'ADC1 (GPIO 32–39). ADC2 is used by Wi-Fi.', kind: 'concept', topic: 'esp32' },
    { id: 'fc-esp-input', front: 'ESP32 input-only GPIOs', back: 'GPIO 34–39, no internal pull-ups.', kind: 'concept', topic: 'esp32' },
    { id: 'fc-mqtt', front: 'MQTT roles', back: 'Publisher → topic on broker → subscribers.', kind: 'concept', topic: 'wifi-mqtt' },
  ],
};
