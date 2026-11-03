import type { Question } from '../types';
import { L, mc, num, sc, tf } from './helpers';

export const controlLessonQuestions: Question[] = [
  tf('oc-a', 'control', 1, 'A closed-loop controller needs a measurement of the output it controls.', true, 'Feedback = measure, compare with the target, correct.'),
  num('fb-a', 'control', 2, 'A proportional-only speed loop has Kp·K = 4 (controller × plant gain). For a setpoint of 100 RPM, what steady-state error remains?', 20, 'RPM', 'e_ss = SP / (1 + Kp·K) = 100 / 5 = 20 RPM. Integral action removes it.', 0.01),
  sc('fb-b', 'control', 2, 'Raising the proportional gain too far in a real motor loop usually causes…', ['Slower response', 'Oscillation or instability', 'Zero steady-state error', 'Lower current'], 1, 'High gain reacts strongly to every error; with delays and noise the system overshoots and oscillates.'),
  sc('dmc-a', 'control', 2, 'At the same PWM, a robot drives slower on carpet than on tiles. In control terms this is…', ['A sensor fault', 'A load disturbance', 'Integral windup', 'Quantisation'], 1, 'The extra friction is a disturbance; closed-loop control rejects it by increasing PWM.'),
  num('en-b', 'encoders', 2, 'A wheel encoder gives 1400 counts per wheel revolution. The wheel diameter is 65 mm. What distance does one count represent? (mm)', 0.1459, 'mm', 'Circumference = π × 65 ≈ 204.2 mm; 204.2 / 1400 ≈ 0.146 mm per count.', 0.02),
  sc('pid-a', 'pid', 2, 'With the wheels lifted, which gain should you tune first?', ['Ki', 'Kd', 'Kp, with Ki and Kd at zero', 'All three together'], 2, 'Start with P only, add a little I for steady error, then D only if needed.'),
  sc('pid-b', 'pid', 3, 'Why should the PID derivative usually be computed on the measurement rather than on the error?', ['It is faster', 'A setpoint step makes d(error)/dt spike ("derivative kick"); using −d(measurement)/dt avoids it', 'It removes steady-state error', 'It prevents windup'], 1, 'Derivative on measurement gives the same damping without the kick when the target changes.'),
  num('pmc-a', 'pwm', 2, 'A controller outputs −0.4 (range −1 … 1). With an 8-bit PWM (0–255) and direction pins, what PWM value and direction do you command?', 102, undefined, '|−0.4| × 255 = 102, direction = reverse.', 0.01),
  sc('cal-a', 'imu', 1, 'How do you estimate a gyroscope\'s bias?', ['Spin it fast and average', 'Keep it still and average many readings', 'Read the datasheet typical value', 'Use the accelerometer only'], 1, 'At rest the true rate is zero, so the average reading is the bias.'),
  num('imx-a', 'imu', 2, 'An uncorrected gyro bias of 0.5 °/s is integrated for 2 minutes. How much heading error accumulates?', 60, '°', '0.5 °/s × 120 s = 60° — why bias calibration matters.', 0),
  sc('imu-c', 'imu', 2, 'An MPU6050 answers on I2C but every data register reads 0. What is the most likely cause?', ['Wrong I2C address', 'The device is still in sleep mode — clear the sleep bit in PWR_MGMT_1 (0x6B)', 'Missing pull-ups', 'The accelerometer range is too high'], 1, 'The MPU6050 powers up asleep. Write 0x00 to PWR_MGMT_1 before reading data.'),
  sc('sf-a', 'imu', 2, 'In a complementary filter `angle = α(angle + gyro·dt) + (1 − α)·accel_angle` with α = 0.98, which sensor dominates short-term changes?', ['The accelerometer', 'The gyroscope', 'Both equally', 'Neither'], 1, 'The gyro path has weight 0.98 and responds instantly; the accelerometer slowly corrects drift.'),
  num('kn-a', 'kinematics', 2, 'A robot drives at v = 0.25 m/s with heading 0 rad for 4 s. How far does x increase (m)?', 1, 'm', 'Δx = v·cos(0)·t = 0.25 × 4 = 1.0 m.', 0.01),
  num('ob-a', 'control', 2, 'The robot drives at 0.3 m/s; the distance sensor updates every 60 ms and braking takes 0.1 m. What minimum stop distance (m) should you use, before adding margin?', 0.118, 'm', 'Distance travelled during one sensor period = 0.3 × 0.06 = 0.018 m; plus braking 0.1 m = 0.118 m. Add margin for sensor error.', 0.03),
  mc('nv-a', 'kinematics', 2, 'Which belong in an honest navigation evaluation? (select all)', ['Measure actual position with a tape measure at each target', 'Report average and spread of position error', 'Report only the best run', 'Note conditions (floor type, battery level)'], [0, 1, 3], 'Honest reporting includes spread and conditions, not just the best run.'),
];

export const openClosed = L({
  id: 'open-closed', title: 'Open-loop and closed-loop systems', topic: 'control', minutes: 12,
  objectives: ['Distinguish open-loop from closed-loop control', 'Explain why open-loop speed changes with battery and floor', 'Identify the sensor, controller and actuator in a loop'],
  why: `"Run both wheels at the same PWM" makes the robot curve. Understanding why — and how feedback fixes it — is the first step to making your robot move on purpose.`,
  visual: { diagram: 'open-closed', caption: 'Open loop sends a command and hopes; closed loop measures and corrects.' },
  theory: `| | Open loop | Closed loop |
|---|---|---|
| Robot example | Always 50 % PWM | Adjust PWM until measured speed = target |
| Needs a sensor | no | yes (encoder) |
| Handles battery sag, floor changes | no | yes |
| Complexity | low | tuning, stability |

#### Loop elements
- **Setpoint** (target speed)
- **Sensor** (encoder → measured speed)
- **Controller** (computes the correction, e.g. PID)
- **Actuator** (motor driver + motor)
- **Disturbances** (battery voltage, carpet, slopes)

#### When open loop is fine
Predictable loads, low accuracy needs, or as a **feed-forward** starting guess combined with feedback.`,
  worked: {
    problem: 'Both wheels get PWM 150, yet after 2 m the robot is 12 cm off to the left. Explain and propose a fix.',
    steps: ['Drifting left means the left wheel is slower.', 'Motors, gearboxes and friction differ, so equal PWM ≠ equal speed.', 'Fix: measure each wheel\'s speed with encoders and control each to the same target speed (closed loop).'],
    answer: '**Unequal motors.** Closed-loop speed control per wheel removes the mismatch.',
  },
  demo: { tool: 'motor-speed', intro: 'Change the battery voltage and load at a fixed PWM — the open-loop speed changes every time.' },
  mistakes: [['Tuning PWM offsets by hand to drive straight', 'They break when the battery or floor changes; use feedback.'], ['Calling a timer-based delay "closed loop"', 'Closed loop requires measuring the output.'], ['Ignoring disturbances in testing', 'Test on different floors and battery levels.']],
  check: ['ctl-1', 'ctl-2', 'oc-a'],
  challenge: { prompt: 'Run both wheels at the same PWM, measure the curve over 2 m on two floor types, and explain the result (the syllabus Understand mission).' },
  summary: ['Open loop: command only. Closed loop: measure and correct.', 'Setpoint, sensor, controller, actuator, disturbances.', 'Feedback handles battery and floor changes.'],
  cards: [['Closed-loop requirement', 'A measurement of the controlled output (feedback)', 'concept']],
});

export const feedback = L({
  id: 'feedback', title: 'Feedback mechanisms', topic: 'control', minutes: 13,
  objectives: ['Compute the error signal and the controller response', 'Explain steady-state error with proportional control', 'Recognise instability from too much gain'],
  why: `Feedback is powerful but not magic: too little gain leaves errors, too much gain oscillates. Knowing why lets you tune with intention instead of random slider moves.`,
  visual: { diagram: 'pid-loop', caption: 'Error = target − measured; the controller turns error into a correction.' },
  theory: `#### Negative feedback
\`\`\`
error = setpoint − measurement
output = f(error)
\`\`\`
If the speed is too low, error > 0, so output increases.

#### Proportional control and steady-state error
\`output = Kp × error\`. A motor needs some output to keep spinning, so some error must remain:

\`\`\`
e_ss = setpoint / (1 + Kp·K)     (K = plant gain, simple first-order model)
\`\`\`
Higher Kp → smaller error, but…

#### Stability
Real systems have delays (sensor update, filtering, motor inertia). With high gain, the correction arrives late and overshoots → oscillation. The art of control is enough gain for accuracy with enough margin for stability.

#### Disturbance rejection
Closed loop automatically pushes harder on carpet — the error grows, so does the output.`,
  worked: {
    problem: 'With Kp·K = 4 and a 100 RPM target, the motor settles at 80 RPM. What happens if you double Kp?',
    steps: ['Now Kp·K = 8 → e_ss = 100/9 ≈ 11 RPM; speed ≈ 89 RPM.', 'Error halves but never reaches zero with P alone.', 'Watch for overshoot/oscillation as gain rises; add integral action to remove the residual error.'],
    answer: 'Speed rises to **≈ 89 RPM** (error ≈ 11). P-only always leaves some error; integral fixes it.',
  },
  demo: { tool: 'feedback-loop', intro: 'Raise Kp and watch the error shrink but not vanish; add Ki and watch it go to zero; add a load disturbance.' },
  mistakes: [['Expecting P-only control to reach the target exactly', 'P-only leaves steady-state error.'], ['Increasing gain until it oscillates "a bit"', 'Back off to keep margin; noise and battery changes will push it over.'], ['Positive feedback by a sign error', 'If the output runs away, check the error sign and motor direction.']],
  check: ['fb-a', 'fb-b', 'ctl-4'],
  challenge: { prompt: 'In the feedback-loop tool, find the Kp that halves the steady-state error from Kp = 1, and explain the result with e_ss = SP/(1 + Kp·K).' },
  summary: ['Error drives the correction.', 'P-only: e_ss = SP/(1 + Kp·K).', 'Too much gain + delay = oscillation.'],
  cards: [['Steady-state error with P only', 'e_ss = SP / (1 + Kp·K)', 'formula']],
});

export const dcMotorControl = L({
  id: 'dc-motor-control', title: 'DC motor control', topic: 'control', minutes: 13,
  objectives: ['Characterise a motor\'s PWM–speed curve and dead-band', 'Explain how load and battery voltage affect speed', 'Combine feed-forward with feedback'],
  why: `Before you can control a motor well, you must know how it behaves: where it starts moving, how speed scales with PWM, and how much it slows under load. That data also tunes your controller faster.`,
  visual: { md: '| PWM | Left wheel (m/s) | Right wheel (m/s) |\n|---|---|---|\n| 40 | 0.00 | 0.00 |\n| 60 | 0.05 | 0.00 |\n| 100 | 0.16 | 0.13 |\n| 150 | 0.27 | 0.24 |\n| 200 | 0.37 | 0.34 |\n| 255 | 0.46 | 0.43 |', caption: 'Example PWM → speed table: the two motors differ, and both have a dead-band.' },
  theory: `#### Characterise first
Lift the wheels, step PWM from 0 to 255, record the steady speed at each step for each wheel. You will see:
- A **dead-band**: no motion below a starting PWM (static friction).
- A roughly linear region.
- Differences between motors.

#### Feed-forward
Use the measured curve to compute a starting PWM for a target speed — then feedback only corrects the remainder:
\`\`\`c
pwm = ff_pwm(target) + pid_update(&pid, target, measured, dt);
\`\`\`

#### Dead-band compensation
Add the starting PWM when the command is non-zero, so small commands actually move the wheel.

#### Battery
Speed at a given PWM falls as the battery discharges (7.4 → 6.6 V ≈ −11 %). Feedback handles it; you can also scale feed-forward by measured battery voltage.`,
  worked: {
    problem: 'Using the table, estimate the feed-forward PWM for 0.30 m/s on the left wheel.',
    steps: ['0.27 m/s at 150 and 0.37 m/s at 200 → slope = 0.10 / 50 = 0.002 m/s per PWM step.', '0.30 − 0.27 = 0.03 → 0.03 / 0.002 = 15 steps above 150.', 'Feed-forward PWM ≈ 165.'],
    answer: '**≈ 165** as the starting point; the PID then trims the remaining error.',
  },
  demo: { tool: 'motor-speed', intro: 'Find the dead-band and see how load and battery voltage shift the speed–PWM curve.' },
  mistakes: [['Skipping characterisation', 'Measure PWM vs speed for each wheel first.'], ['Ignoring the dead-band', 'Small commands never move the wheel without compensation.'], ['Testing only with a full battery', 'Repeat at a lower battery voltage.']],
  check: ['dmc-a', 'ctl-2', 'dm-a'],
  challenge: { prompt: 'Plot PWM vs speed for each of your wheels (the syllabus Create mission) and record each motor\'s starting PWM.' },
  summary: ['Measure PWM–speed curves and dead-bands.', 'Feed-forward + feedback.', 'Battery voltage and load shift the curve.'],
  cards: [['Feed-forward + feedback', 'PWM = model-based guess + PID correction', 'concept']],
});

export const encoders = L({
  id: 'encoders', title: 'Motor encoders', topic: 'encoders', minutes: 14,
  objectives: ['Convert encoder ticks to distance and speed', 'Explain quadrature decoding and direction', 'Choose a measurement window for speed'],
  why: `Without encoders you can only assume how fast the wheels turn. With them, the robot measures speed and distance — the foundation of PID control and odometry.`,
  visual: { diagram: 'quadrature', caption: 'Quadrature channels A and B: edge count gives distance, phase order gives direction.' },
  theory: `#### Conversions
\`\`\`
counts per wheel turn = PPR × gear ratio × decoding (x1/x2/x4)
distance per count    = π × D / counts_per_turn
speed                 = (Δticks / counts_per_turn) × π × D / Δt
\`\`\`
Example: 70 ticks in 0.1 s, 700 counts/turn, 65 mm wheel → 0.204 m/s.

#### Quadrature
Two channels 90° apart. Forward: A leads B; reverse: B leads A. x4 decoding counts every edge of both channels for the finest resolution.

#### Measurement window
- Short window (10 ms): fast response, coarse at low speed (few ticks).
- Long window (100 ms): smooth, but delayed.
- Typical: 20–50 ms, with light filtering.
At very low speeds, measuring the **time between edges** gives better resolution.

#### Safe counting
ISR or timer encoder mode; copy counters atomically; compute deltas with signed arithmetic to survive wrap-around.`,
  worked: {
    problem: 'Your encoder has 7 PPR on the motor shaft, a 50:1 gearbox and you use x4 decoding. How many counts per wheel turn, and what is the distance per count for a 65 mm wheel?',
    steps: ['Counts per turn = 7 × 50 × 4 = 1400.', 'Circumference = π × 65 mm ≈ 204.2 mm.', 'Distance per count ≈ 204.2 / 1400 ≈ 0.146 mm.'],
    answer: '**1400 counts per turn, ≈ 0.15 mm per count** — check your actual encoder specification.',
  },
  demo: { tool: 'encoder', intro: 'Adjust PPR, gear ratio, decoding and window; read the counts per turn and speed resolution.' },
  mistakes: [['Forgetting gear ratio or decoding factor', 'counts/turn = PPR × gear × decoding.'], ['Integer division in speed maths', 'Use floating point (or scaled integers) for speed.'], ['Very short windows at low speed', 'Lengthen the window or time the edges.']],
  check: ['ctl-3', 'en-b', 'ut-a'],
  challenge: { prompt: 'Compute wheel speed from ticks in C in the lab, then verify on hardware by timing a 1 m run.', exerciseId: 'lab-encoder-speed' },
  summary: ['counts/turn = PPR × gear × decoding.', 'speed = (ticks/counts) × πD / Δt.', 'Window length trades response for resolution.'],
  cards: [['Wheel speed from encoder', 'v = (Δticks / counts_per_turn) × π·D / Δt', 'formula']],
});

export const pid = L({
  id: 'pid', title: 'PID control', topic: 'pid', minutes: 18,
  objectives: ['Implement a discrete PID with output limits and anti-windup', 'Tune Kp, Ki and Kd systematically', 'Measure rise time, overshoot, settling time and steady-state error'],
  why: `PID control is how the robot holds wheel speed despite carpet and battery sag — and one of the most common topics in embedded and robotics interviews.`,
  visual: { diagram: 'pid-loop', caption: 'PID turns the speed error into a PWM command; the encoder closes the loop.' },
  theory: `| Term | Reacts to | Effect | Too high |
|---|---|---|---|
| P | present error | pushes toward target | oscillation |
| I | accumulated error | removes steady error | slow oscillation, overshoot |
| D | rate of change | damps, reduces overshoot | amplifies noise |

\`\`\`c
typedef struct { float kp, ki, kd, integral, prev_meas, out_min, out_max; } Pid;

float pid_update(Pid *p, float sp, float meas, float dt) {
  float err = sp - meas;
  float deriv = -(meas - p->prev_meas) / dt;          // derivative on measurement (no kick)
  p->prev_meas = meas;
  float cand = p->integral + err * dt;
  float out = p->kp * err + p->ki * cand + p->kd * deriv;
  if (out > p->out_max) out = p->out_max;
  else if (out < p->out_min) out = p->out_min;
  else p->integral = cand;                            // anti-windup: integrate only if not saturated
  return out;
}
\`\`\`

#### Tuning procedure (wheels lifted first)
1. Ki = Kd = 0; raise Kp until the response is quick without strong oscillation.
2. Add a small Ki to remove steady-state error; watch overshoot.
3. Add Kd only if overshoot remains — and watch noise.
4. Test on the floor, including with a low battery.

#### Metrics
Rise time (10–90 %), overshoot (%), settling time (±2 %), steady-state error (%). Record them for each gain set.`,
  worked: {
    problem: 'Compute the first output with Kp = 2, Ki = 1, Kd = 0, error = 20, dt = 0.01 s and an empty integral.',
    steps: ['P = 2 × 20 = 40.', 'Integral candidate = 0 + 20 × 0.01 = 0.2 → I = 1 × 0.2 = 0.2.', 'D = 0. Output = 40.2 (inside the limits, so the integral is kept).'],
    answer: '**40.2** — matching the syllabus example.',
  },
  demo: { tool: 'pid', intro: 'Try the P, PI and PID presets, then tune your own gains to meet the lab spec.' },
  mistakes: [['No anti-windup', 'Stop integrating when the output saturates.'], ['Derivative on error with setpoint steps', 'Use derivative on measurement.'], ['Constant dt with a jittery loop', 'Use the measured time step.']],
  check: ['ctl-5', 'pid-a', 'pid-b'],
  challenge: { prompt: 'Tune the PID simulator to the lab specification and compare P, PI and PID metrics.', exerciseId: 'lab-pid-tune' },
  summary: ['P present, I past, D future (rate).', 'Clamp output, anti-windup, derivative on measurement.', 'Tune P → I → D; measure the metrics.'],
  cards: [['Anti-windup', 'Stop integrating while the output is saturated', 'concept'], ['PID tuning order', 'Kp first, then a little Ki, then Kd only if needed', 'concept']],
});

export const pwmMotorControl = L({
  id: 'pwm-motor-control', title: 'PWM motor control', topic: 'pwm', minutes: 13,
  objectives: ['Map a signed controller output to direction and PWM', 'Apply dead-band compensation and slew limits', 'Implement a safe emergency stop'],
  why: `The PID produces a number; the motor driver needs direction pins and a duty cycle. This last step decides whether the robot drives smoothly, jerks, or browns out its own supply.`,
  visual: { diagram: 'h-bridge', caption: 'Sign of the command → direction pins; magnitude → PWM duty.' },
  theory: `\`\`\`c
void motor_command(float u) {                    // u in −1 … 1
  if (u > 1) u = 1; else if (u < -1) u = -1;
  int16_t pwm = (int16_t)(fabsf(u) * 255.0f);
  if (pwm > 0 && pwm < START_PWM) pwm = START_PWM;   // dead-band compensation
  if (u == 0) { coast(); return; }
  set_direction(u > 0);
  set_pwm(pwm);
}
\`\`\`

#### Slew-rate limiting
Limit how fast the command changes (e.g. max 0.05 per 20 ms step) to reduce current spikes, wheel slip and supply dips.

#### Direction changes
Ramp through zero (or brake briefly) instead of slamming from +100 % to −100 %.

#### Emergency stop
Independent of the controller: short brake both channels, then disable the driver (STBY LOW), and reset the PID integrators so the robot doesn't lurch when re-enabled.`,
  worked: {
    problem: 'The PID outputs −0.4 with START_PWM = 50. What do you send to the driver?',
    steps: ['Magnitude 0.4 × 255 = 102 > 50 → PWM 102.', 'Negative → reverse direction (IN1 LOW, IN2 HIGH).', 'Apply slew limiting relative to the previous command.'],
    answer: '**Reverse, PWM 102.**',
  },
  demo: { tool: 'motor-speed', intro: 'Watch the dead-band: commands below the starting duty produce no motion, which is why compensation is needed.' },
  mistakes: [['Abrupt direction reversals', 'Ramp or brake first.'], ['E-stop that leaves integrators charged', 'Reset the PID state on stop.'], ['No dead-band compensation', 'Small commands otherwise do nothing.']],
  check: ['pmc-a', 'md-b', 'gpio-7'],
  challenge: { prompt: 'Write a motor module that takes a signed speed, handles direction, limits output and slew, and has an emergency-stop command that works immediately (capstone milestone 4).' },
  summary: ['Sign → direction, magnitude → PWM.', 'Dead-band compensation and slew limits.', 'E-stop: brake, disable, reset controllers.'],
  cards: [['Slew-rate limiting', 'Limit the change of the motor command per control step', 'concept']],
});

export const calibration = L({
  id: 'calibration', title: 'Sensor calibration', topic: 'imu', minutes: 13,
  objectives: ['Remove offsets (bias) and scale errors', 'Perform one- and two-point calibrations', 'Store and apply calibration values'],
  why: `Every real sensor has offsets and scale errors. A gyro bias of 0.5 °/s becomes a 60° heading error after two minutes. Calibration turns cheap sensors into useful instruments.`,
  visual: { flow: ['Hold a known condition', 'Average many readings', 'Compute offset / scale', 'Store (EEPROM / NVS)', 'Apply to every reading', 'Verify against a reference'], caption: 'A calibration procedure.' },
  theory: `#### Error types
- **Offset (bias):** reading ≠ 0 when the true value is 0.
- **Scale (gain):** reading grows too fast or slow.
- **Non-linearity, temperature drift, noise.**

#### One-point (offset)
At a known condition (gyro at rest = 0 °/s), average N readings: \`bias = mean\`; then \`corrected = raw − bias\`.

#### Two-point (offset + scale)
Measure at two known references (e.g. 0 °C ice water and a reference thermometer at room temperature):
\`\`\`
scale  = (ref2 − ref1) / (raw2 − raw1)
offset = ref1 − scale × raw1
corrected = scale × raw + offset
\`\`\`

#### Practice
- Average enough samples (e.g. 500 gyro readings at rest).
- Let the sensor warm up first.
- Store values in non-volatile memory; re-check periodically.
- **Verify** after calibrating — report the residual error.`,
  worked: {
    problem: 'A temperature sensor reads 1.2 °C in ice water (true 0 °C) and 24.6 °C when a reference reads 23.0 °C. Find the calibration.',
    steps: ['scale = (23.0 − 0) / (24.6 − 1.2) = 23.0 / 23.4 ≈ 0.983.', 'offset = 0 − 0.983 × 1.2 ≈ −1.18 °C.', 'Check: 0.983 × 24.6 − 1.18 ≈ 23.0 ✓.'],
    answer: '**corrected = 0.983 × raw − 1.18 °C.**',
  },
  tryIt: 'Keep your IMU still at start-up, average 500 gyro readings for each axis, subtract the bias, and plot heading for 5 minutes with and without the correction.',
  mistakes: [['Calibrating before warm-up', 'Let the sensor stabilise first.'], ['Moving the sensor during bias estimation', 'Keep it perfectly still.'], ['Never verifying the calibration', 'Measure the residual error against a reference.']],
  check: ['cal-a', 'imu-1', 'imx-a'],
  challenge: { prompt: 'Calibrate your gyro bias and measure heading drift over 5 minutes before and after (the syllabus Debug mission). Record both values.' },
  summary: ['Offset, scale, non-linearity, drift.', 'One-point for bias; two-point for bias + scale.', 'Store, apply, verify.'],
  cards: [['Two-point calibration', 'scale = Δref/Δraw; offset = ref1 − scale·raw1', 'formula']],
});

export const imu = L({
  id: 'imu', title: 'IMU fundamentals', topic: 'imu', minutes: 14,
  objectives: ['Read MPU6050 accelerometer and gyroscope data', 'Convert raw values to physical units', 'Know each sensor\'s strengths and weaknesses'],
  why: `The IMU improves your robot's turns: encoders lie when wheels slip, but the gyro measures actual rotation. Used well, it makes 90° turns accurate.`,
  visual: { md: '| | Accelerometer | Gyroscope |\n|---|---|---|\n| Measures | acceleration incl. gravity (g) | angular rate (°/s) |\n| Gives you | tilt (pitch/roll) when still | rotation by integrating |\n| Strength | no drift for tilt | fast, smooth, unaffected by vibration-free motion |\n| Weakness | noisy, disturbed by motion, no heading on flat ground | bias → drift when integrated |', caption: 'Accelerometer versus gyroscope.' },
  theory: `#### MPU6050
- I2C address 0x68 (AD0 low) or 0x69 (AD0 high).
- Wake it up: write 0 to PWR_MGMT_1 (0x6B).
- Data registers start at 0x3B: accel X/Y/Z, temperature, gyro X/Y/Z — each a signed 16-bit big-endian value.

#### Scaling (default ranges)
| Range | Sensitivity |
|---|---|
| Accel ±2 g | 16 384 LSB/g |
| Gyro ±250 °/s | 131 LSB/(°/s) |

\`\`\`c
int16_t gz_raw = (int16_t)((buf[12] << 8) | buf[13]);
float gz_dps = (gz_raw - gz_bias) / 131.0f;
heading_deg += gz_dps * dt_s;
\`\`\`

#### Mounting
Mount firmly, away from motor vibration if possible, with known axis orientation. Sample at a fixed rate and record data.`,
  worked: {
    problem: 'The robot turns in place; gyro Z reads 6550 raw (bias already removed) on the ±250 °/s range. What is the turn rate, and how long does a 90° turn take at that rate?',
    steps: ['Rate = 6550 / 131 = 50 °/s.', 'Time for 90° = 90 / 50 = 1.8 s.', 'Integrate rate × dt during the turn and stop at 90° rather than relying on the time.'],
    answer: '**50 °/s; about 1.8 s** — stop on the integrated heading, not the clock.',
  },
  tryIt: 'Read raw accel and gyro at 100 Hz, convert to g and °/s, and print heading while turning the IMU by hand (the syllabus Implement mission).',
  mistakes: [['Reading data with the sensor still asleep', 'Clear the sleep bit in PWR_MGMT_1.'], ['Wrong byte order or unsigned types', 'Big-endian, signed int16_t.'], ['Using the accelerometer for heading on flat ground', 'Gravity gives no yaw information.']],
  check: ['imu-1', 'imu-c', 'cv-a'],
  challenge: { prompt: 'Write a one-page MPU6050 cheat sheet from its datasheet: address, wake-up, data registers, ranges and scale factors (the syllabus Create mission).' },
  summary: ['Accel: tilt; gyro: rotation rate.', 'MPU6050: wake, read signed big-endian values, scale.', 'Mount firmly; sample at a fixed rate.'],
  cards: [['MPU6050 gyro scale at ±250 °/s', '131 LSB per °/s', 'formula'], ['MPU6050 accel scale at ±2 g', '16 384 LSB per g', 'formula']],
});

export const sensorFusion = L({
  id: 'sensor-fusion', title: 'Sensor fusion', topic: 'imu', minutes: 14,
  objectives: ['Explain why fusing sensors beats any single sensor', 'Implement a complementary filter', 'Compare encoder, gyro and fused heading experimentally'],
  why: `The gyro drifts; the accelerometer is noisy; encoders slip. Fusion combines their strengths. It is a core idea in robotics and a strong topic for your capstone report.`,
  visual: { flow: ['Gyro: fast, drifts', 'Accel / encoders: slow, drift-free reference', 'Complementary filter: α·fast + (1−α)·slow', 'Stable, responsive estimate'], caption: 'A complementary filter trusts each sensor where it is good.' },
  theory: `#### Complementary filter (tilt)
\`\`\`c
float accel_angle = atan2f(ay, az) * 57.2958f;           // degrees
angle = 0.98f * (angle + gyro_dps * dt) + 0.02f * accel_angle;
\`\`\`
- High-pass the gyro (fast changes), low-pass the accelerometer (long-term truth).
- α near 1 → smoother, slower correction; the time constant ≈ dt·α/(1−α) (≈ 0.5 s at 100 Hz, α = 0.98).

#### Heading on the robot
The accelerometer can't give yaw on flat ground. Fuse **gyro yaw** with **encoder odometry heading** instead: trust the gyro during turns (wheels slip), let encoder heading correct slow gyro drift — or simply use gyro for turns and encoders for distance.

#### Beyond
Kalman filters weigh sensors by their measured noise; they are the next step, not a requirement for this project.

#### Evaluate
Do repeated 90° turns; compare encoder-only, gyro-only and fused heading against a protractor or floor markings.`,
  worked: {
    problem: 'At 100 Hz with α = 0.98, about how quickly does the complementary filter pull a drifted gyro angle back toward the accelerometer angle?',
    steps: ['Each step keeps 98 % of the old estimate and adds 2 % of the accelerometer angle.', 'Time constant τ ≈ dt·α/(1 − α) = 0.01 × 0.98 / 0.02 ≈ 0.49 s.', 'So errors decay by ~63 % in about half a second.'],
    answer: '**≈ 0.5 s time constant** — tune α to trade smoothness for correction speed.',
  },
  tryIt: 'Log gyro-only and complementary-filter tilt while tilting the IMU by hand, then leave it still for 5 minutes. Plot both: the gyro-only angle drifts; the fused one stays put.',
  mistakes: [['Expecting the accelerometer to give heading', 'Use gyro + encoders for yaw.'], ['Variable dt treated as constant', 'Measure dt each step.'], ['α chosen without a reason', 'Relate α to the time constant you want.']],
  check: ['imu-2', 'sf-a', 'kin-3'],
  challenge: { prompt: 'Compare encoder, gyro and combined heading after ten 90° turns (the syllabus Create mission) and report mean and spread of the angle error for each.' },
  summary: ['Fuse fast-but-drifting with slow-but-stable sensors.', 'Complementary filter: α·(angle + gyro·dt) + (1−α)·reference.', 'Measure which combination works best on your floor.'],
  cards: [['Complementary filter', 'angle = α(angle + gyro·dt) + (1−α)·accel_angle', 'formula']],
});

export const kinematics = L({
  id: 'kinematics', title: 'Basic robot kinematics', topic: 'kinematics', minutes: 15,
  objectives: ['Convert wheel speeds to robot velocity and turn rate (and back)', 'Implement odometry', 'Measure and correct wheel diameter and spacing'],
  why: `Kinematics turns "drive to (2 m, 1 m)" into left and right wheel speeds — and odometry tells the robot where it thinks it is, so each air-quality sample can be placed on a map.`,
  visual: { diagram: 'diff-drive', caption: 'A differential-drive robot steers by running its wheels at different speeds.' },
  theory: `#### Forward kinematics
\`\`\`
v = (vR + vL) / 2        ω = (vR − vL) / L
\`\`\`
L = distance between the wheels. Right wheel faster → ω > 0 → turns left (counter-clockwise).

#### Inverse kinematics (commands → wheel speeds)
\`\`\`
vR = v + ω·L/2           vL = v − ω·L/2
\`\`\`

#### Odometry
\`\`\`c
x       += v * cosf(theta) * dt;
y       += v * sinf(theta) * dt;
theta   += omega * dt;
\`\`\`
Errors (wheel slip, wrong diameter, uneven floors) **accumulate** — odometry drifts even with correct code.

#### Calibrating geometry
- Drive a measured 2 m straight; correct the wheel diameter from the reported distance.
- Spin 10 full turns in place; correct L from the reported angle.`,
  worked: {
    problem: 'You want the robot to drive at 0.2 m/s while turning left at 0.5 rad/s. L = 0.15 m. What wheel speeds?',
    steps: ['ω·L/2 = 0.5 × 0.15 / 2 = 0.0375 m/s.', 'vR = 0.2 + 0.0375 = 0.2375 m/s.', 'vL = 0.2 − 0.0375 = 0.1625 m/s.'],
    answer: '**vR ≈ 0.238 m/s, vL ≈ 0.163 m/s** — then each wheel\'s PID tracks its target.',
  },
  tryIt: 'Drive a 1 m square using encoder feedback and measure how far the robot ends from its start (the syllabus Create mission). Then correct the wheel diameter and spacing and repeat.',
  mistakes: [['Swapping left/right sign conventions', 'Right faster = positive ω (left turn) in the standard convention.'], ['Using nominal wheel diameter', 'Calibrate from measured distances.'], ['Trusting odometry over long distances', 'Expect drift; correct with other sensors or landmarks.']],
  check: ['kin-1', 'kin-2', 'kn-a'],
  challenge: { prompt: 'Determine which way the robot turns for given wheel speeds in the lab.', exerciseId: 'lab-kinematics' },
  summary: ['v = (vR+vL)/2, ω = (vR−vL)/L.', 'Odometry integrates v and ω — and drifts.', 'Calibrate diameter and spacing by measurement.'],
  cards: [['Differential drive', 'v = (vR+vL)/2   ω = (vR−vL)/L', 'formula'], ['Inverse kinematics', 'vR = v + ωL/2   vL = v − ωL/2', 'formula']],
});

export const obstacles = L({
  id: 'obstacles', title: 'Obstacle detection', topic: 'control', minutes: 13,
  objectives: ['Choose and filter a distance sensor', 'Compute a safe stop distance', 'Implement avoidance with a state machine and measure its success rate'],
  why: `A mobile robot that hits furniture is not finished. Reliable obstacle avoidance — measured over repeated trials — is one of your capstone gates.`,
  visual: { diagram: 'state-machine', caption: 'DRIVING → AVOIDING on an obstacle; back to DRIVING when the path is clear.' },
  theory: `#### Sensors
| Type | Range | Notes |
|---|---|---|
| Ultrasonic (HC-SR04) | ~2–400 cm | wide beam, soft surfaces absorb, 5 V echo |
| ToF (VL53L0X/L1X) | ~3–200/400 cm | narrow beam, I2C, sunlight affects it |
| IR proximity | short | colour/reflectivity dependent |

#### Filtering
Median of 3–5 readings rejects single wild values; reject out-of-range readings.

#### Stop distance
\`\`\`
d_stop ≥ v × (sensor period + processing latency) + braking distance + margin
\`\`\`

#### Behaviour (state machine)
DRIVING → (distance < d_stop) → AVOIDING: stop, turn away (e.g. 45°), check again → PATH_CLEAR → DRIVING. Add a timeout so the robot doesn't spin forever in a corner.

#### Evaluate
Run a fixed obstacle course 20 times; report successes / attempts and describe the misses (angles, materials).`,
  worked: {
    problem: 'v = 0.3 m/s, sensor period 60 ms, braking 0.10 m, sensor error ±2 cm. Choose d_stop.',
    steps: ['Travel during one sensor period: 0.3 × 0.06 = 0.018 m.', 'Plus braking: 0.118 m.', 'Plus sensor error and margin (e.g. 0.05 m): ≈ 0.17–0.20 m.'],
    answer: 'Use **d_stop ≈ 0.20 m** at 0.3 m/s — and slow down near obstacles to shrink it.',
  },
  demo: { tool: 'interrupts', intro: 'A late sensor reading is like a polled event: the longer the period, the further the robot travels before reacting.' },
  mistakes: [['Ignoring sensor latency', 'Include it in the stop distance.'], ['Single noisy readings trigger avoidance', 'Use a median filter.'], ['Reporting only successful runs', 'Count and describe the misses.']],
  check: ['ob-a', 'sm-1', 'smx-a'],
  challenge: { prompt: 'Run 20 approaches to a set of test obstacles, record successes and misses, and enter the success rate in capstone milestone 9.' },
  summary: ['Pick the sensor for range, beam and surfaces.', 'd_stop = v·latency + braking + margin.', 'State machine + measured success rate.'],
  cards: [['Safe stop distance', 'd ≥ v·(sensor period + latency) + braking + margin', 'formula']],
});

export const navigation = L({
  id: 'navigation', title: 'Navigation and mapping', topic: 'kinematics', minutes: 15,
  objectives: ['Represent a room as an occupancy grid', 'Drive to target points with odometry and a heading controller', 'Measure and report position error honestly'],
  why: `Air-quality mapping needs each reading tied to a position. You don't need full SLAM — a measured grid, odometry and honest error reporting are enough for a strong project.`,
  visual: { md: '| | 0 | 1 | 2 | 3 | 4 |\n|---|---|---|---|---|---|\n| **3** | · | · | ■ | · | ◎ |\n| **2** | · | ✓ | ■ | · | · |\n| **1** | ✓ | ✓ | ✓ | ✓ | · |\n| **0** | R | ✓ | · | · | · |', caption: 'Occupancy grid: R = robot start, ✓ visited, ■ blocked, ◎ next target, · unknown.' },
  theory: `#### Grid map
Measure the room, split it into cells (e.g. 0.5 m). Each cell: unknown, free/visited, blocked. Store a reading's position with every sample.

#### Go-to-goal controller
\`\`\`c
float dx = gx - x, dy = gy - y;
float dist = sqrtf(dx*dx + dy*dy);
float heading_err = wrap_pi(atan2f(dy, dx) - theta);
float omega = K_h * heading_err;
float v = (fabsf(heading_err) > 0.5f) ? 0 : fminf(V_MAX, K_d * dist);   // turn first, then drive
\`\`\`
Stop when \`dist < tolerance\` (e.g. 5 cm).

#### Planning
For simple rooms, visit targets in order and mark blocked cells when the obstacle state triggers. Grid path planners (BFS/A*) are a later extension.

#### Evaluate honestly
At each target, measure the true position with a tape measure. Report mean and spread of the error, and the conditions (floor, battery).`,
  worked: {
    problem: 'The robot thinks it is at (2.00, 1.00) m; the tape measure says (1.88, 1.07) m. What is the position error?',
    steps: ['Δx = −0.12 m, Δy = 0.07 m.', 'Error = √(0.12² + 0.07²) ≈ 0.139 m.', 'Record it alongside the distance travelled to show how error grows.'],
    answer: '**≈ 14 cm** — report it with the path length and repeat over several runs.',
  },
  tryIt: 'Mark a 2 m × 2 m grid on the floor with tape, command the robot to five points, and measure the actual position at each (the syllabus Navigation mission).',
  mistakes: [['Heading errors not wrapped to ±π', 'Wrap angles so the robot turns the short way.'], ['Driving while badly misaligned', 'Turn toward the goal first, then drive.'], ['Claiming SLAM-level accuracy', 'Report your measured error honestly.']],
  check: ['nv-a', 'kin-3', 'kn-a'],
  challenge: { prompt: 'Visit five points, measure the position error at each, and record the results in capstone milestone 10.' },
  summary: ['Grid map with positions stored per reading.', 'Go-to-goal: turn toward the target, then drive.', 'Measure and report error with spread and conditions.'],
  cards: [['Position error', '√(Δx² + Δy²) between estimated and measured position', 'formula']],
});
