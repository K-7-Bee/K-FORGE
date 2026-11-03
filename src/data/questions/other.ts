import type { Question } from '../types';

export const controlQuestions: Question[] = [
  {
    id: 'ctl-1', type: 'single', topic: 'control', difficulty: 1,
    prompt: 'Driving both wheels at a fixed 50 % PWM without measuring speed is an example of…',
    options: ['Closed-loop control', 'Open-loop control', 'PID control', 'Sensor fusion'],
    answer: 1,
    explanation: 'Open-loop sends a command without checking the result. Closed-loop measures and corrects.',
  },
  {
    id: 'ctl-2', type: 'single', topic: 'control', difficulty: 1,
    prompt: 'Why can two motors at the same PWM run at different speeds?',
    options: ['PWM is random', 'Motors, gears and friction are never identical', 'One motor is always faulty', 'PWM only works on one channel'],
    answer: 1,
    explanation: 'Manufacturing variation, load and friction differ. That is why the robot curves in open loop.',
  },
  {
    id: 'ctl-3', type: 'numeric', topic: 'encoders', difficulty: 2, unit: 'm/s', tolerance: 0.02,
    prompt: 'An encoder counts 35 ticks in 0.05 s. There are 700 ticks per wheel turn and the wheel is 65 mm in diameter. What is the wheel speed?',
    answer: 0.204,
    hint: 'speed = (ticks / ticks_per_turn) × (π × diameter) / Δt',
    explanation: '(35/700) × (π × 0.065 m) / 0.05 s ≈ **0.204 m/s**.',
  },
  {
    id: 'ctl-4', type: 'single', topic: 'pid', difficulty: 1,
    prompt: 'Which PID term removes steady-state error?',
    options: ['Proportional', 'Integral', 'Derivative', 'None of them'],
    answer: 1,
    explanation: 'The integral accumulates error over time and keeps pushing until the error is zero.',
  },
  {
    id: 'ctl-5', type: 'numeric', topic: 'pid', difficulty: 2, tolerance: 0.005,
    prompt: 'With Kp = 2, Ki = 1, Kd = 0, an error of 20 and dt = 0.01 s (integral starting at 0), what is the first PID output?',
    answer: 40.2,
    explanation: 'P = 2 × 20 = 40. Integral candidate = 20 × 0.01 = 0.2, times Ki = 0.2. Output = **40.2**.',
  },
  {
    id: 'ctl-6', type: 'single', topic: 'pid', difficulty: 2,
    prompt: 'You raise Kd a lot and the motor output becomes jittery. Why?',
    options: ['Kd reduces gain', 'The derivative term amplifies measurement noise', 'Kd causes integral windup', 'Kd changes the setpoint'],
    answer: 1,
    explanation: 'Differentiating a noisy signal magnifies the noise. Filter the measurement or keep Kd small.',
  },
  {
    id: 'ctl-7', type: 'single', topic: 'pid', difficulty: 3,
    prompt: 'What is "integral windup"?',
    options: [
      'The integral term grows huge while the output is saturated, causing large overshoot afterwards',
      'The motor winding overheating',
      'The derivative term reversing sign',
      'The encoder counter overflowing',
    ],
    answer: 0,
    explanation: 'Clamp the integral (or stop integrating) while the output is at its limit — as in the K-FORGE PID code.',
  },
  {
    id: 'kin-1', type: 'numeric', topic: 'kinematics', difficulty: 2, unit: 'rad/s', tolerance: 0.02,
    prompt: 'Left wheel 0.20 m/s, right wheel 0.30 m/s, wheel spacing L = 0.15 m. What is the turn rate ω?',
    answer: 0.667,
    explanation: 'ω = (v_R − v_L) / L = 0.10 / 0.15 ≈ **0.67 rad/s** (counter-clockwise: it turns left).',
  },
  {
    id: 'kin-2', type: 'single', topic: 'kinematics', difficulty: 1,
    prompt: 'Both wheels run at 0.2 m/s. What are v and ω?',
    options: ['v = 0.4 m/s, ω = 0', 'v = 0.2 m/s, ω = 0', 'v = 0, ω = 0.2 rad/s', 'v = 0.1 m/s, ω = 1'],
    answer: 1,
    explanation: 'v = (0.2 + 0.2)/2 = 0.2 m/s and ω = 0: the robot drives straight.',
  },
  {
    id: 'kin-3', type: 'single', topic: 'kinematics', difficulty: 2,
    prompt: 'Why does odometry drift even when the code is correct?',
    options: ['Encoders are always wrong', 'Small errors from wheel slip and measurement build up over time', 'Because of Wi-Fi interference', 'Odometry never drifts'],
    answer: 1,
    explanation: 'Errors integrate. Fuse with other sensors (IMU, landmarks) and report the error honestly.',
  },
  {
    id: 'imu-1', type: 'single', topic: 'imu', difficulty: 2,
    prompt: 'Why does a heading computed only from the gyro drift over time?',
    options: ['The gyro measures position', 'A small bias in angular rate is integrated, so the angle error grows steadily', 'Because of magnetic fields', 'Gyros only work when moving'],
    answer: 1,
    explanation: 'Calibrate the bias at start-up (average while still) and fuse with another reference.',
  },
  {
    id: 'imu-2', type: 'single', topic: 'imu', difficulty: 2,
    prompt: 'In `angle = 0.98*(angle + gyro*dt) + 0.02*accel_angle`, what does the 0.02 accelerometer term do?',
    options: ['Adds noise', 'Slowly pulls the angle toward the accelerometer\'s drift-free (but noisy) estimate', 'Converts degrees to radians', 'Nothing'],
    answer: 1,
    explanation: 'A complementary filter trusts the gyro short-term and the accelerometer long-term.',
  },
];

export const pythonQuestions: Question[] = [
  {
    id: 'py-1', type: 'output', topic: 'python', difficulty: 1,
    prompt: 'What does this print?',
    code: 'readings = [230, 235, 240]\nprint(sum(readings) / len(readings))',
    accepted: ['235.0'],
    explanation: 'Python 3 `/` is true division, giving the float **235.0**.',
  },
  {
    id: 'py-2', type: 'output', topic: 'python', difficulty: 1,
    prompt: 'What does this print?',
    code: 'line = "1000,650,235"\nfields = line.split(",")\nprint(len(fields), fields[1])',
    accepted: ['3 650'],
    explanation: 'split gives three strings; index 1 is "650". Output **3 650**.',
  },
  {
    id: 'py-3', type: 'single', topic: 'pandas', difficulty: 2,
    prompt: 'What does `df["co2"].resample("1h").mean()` do to 10-minute readings (with a datetime index)?',
    options: ['Deletes rows', 'Groups readings into 1-hour bins and averages each bin', 'Sorts the data', 'Shifts timestamps by one hour'],
    answer: 1,
    explanation: 'resample groups by time window; mean aggregates each window → one value per hour.',
  },
  {
    id: 'py-4', type: 'single', topic: 'pandas', difficulty: 2,
    prompt: 'When evaluating a model on time-series sensor data, how should you split train and test data?',
    options: ['Random shuffle', 'By time — train on earlier data, test on later data', 'Use the same data for both', 'Test on the first 10 rows'],
    answer: 1,
    explanation: 'Random splits leak future information into training. Split by time and compare with a simple baseline.',
  },
  {
    id: 'py-5', type: 'truefalse', topic: 'python', difficulty: 1,
    prompt: 'Two sensor values moving together proves that one causes the other.',
    answer: false,
    explanation: 'Correlation is not causation. Both may depend on a third factor (e.g. people in the room).',
  },
  {
    id: 'py-6', type: 'output', topic: 'python', difficulty: 2,
    prompt: 'What does this print?',
    code: 'import numpy as np\na = np.array([1, 2, 3])\nprint((a * 2).tolist())',
    accepted: ['[2, 4, 6]'],
    explanation: 'NumPy operations are element-wise: **[2, 4, 6]**.',
  },
];

export const careerQuestions: Question[] = [
  {
    id: 'de-1', type: 'single', topic: 'german', difficulty: 1,
    prompt: 'What does **die Spannung** mean?',
    options: ['current', 'voltage', 'resistance', 'circuit board'],
    answer: 1,
    explanation: 'die Spannung = voltage. der Strom = current, der Widerstand = resistor/resistance.',
  },
  {
    id: 'de-2', type: 'single', topic: 'german', difficulty: 1,
    prompt: 'What does **die Fehlersuche** mean?',
    options: ['job advertisement', 'interface', 'debugging / troubleshooting', 'control unit'],
    answer: 2,
    explanation: 'Fehler = error, Suche = search → troubleshooting.',
  },
  {
    id: 'de-3', type: 'single', topic: 'german', difficulty: 1,
    prompt: 'Which word means **CV**?',
    options: ['die Stellenanzeige', 'der Lebenslauf', 'die Leiterplatte', 'die Schnittstelle'],
    answer: 1,
    explanation: 'der Lebenslauf = CV. die Stellenanzeige = job advertisement.',
  },
  {
    id: 'de-4', type: 'single', topic: 'german', difficulty: 2,
    prompt: '"Ich entwickle eingebettete Systeme" means…',
    options: ['I repair cars', 'I develop embedded systems', 'I study electrical engineering', 'I am looking for a job'],
    answer: 1,
    explanation: 'entwickeln = to develop, eingebettete Systeme = embedded systems.',
  },
  {
    id: 'car-1', type: 'single', topic: 'career', difficulty: 1,
    prompt: 'Which CV line is strongest?',
    options: [
      'Worked on a robot using ESP32.',
      'Built a FreeRTOS robot that streams air-quality data over MQTT, with measured position error and message delivery rate.',
      'Familiar with many microcontrollers.',
      'Passionate about embedded systems.',
    ],
    answer: 1,
    explanation: 'Start with what you did and give a measured result. Claims without evidence are weak.',
  },
  {
    id: 'car-2', type: 'single', topic: 'career', difficulty: 1,
    prompt: 'How many projects should a junior portfolio feature prominently?',
    options: ['One', 'Two or three strong, documented projects', 'As many as possible, finished or not', 'None — certificates matter more'],
    answer: 1,
    explanation: 'An engineer should be able to verify your skills in about two minutes.',
  },
];

/** Placement-only maths questions. */
export const mathQuestions: Question[] = [
  {
    id: 'math-1', type: 'numeric', topic: 'math', difficulty: 1, tolerance: 0,
    prompt: 'Convert 4.7 kΩ to ohms.',
    answer: 4700,
    explanation: 'k = 10³ → 4.7 × 1000 = **4700 Ω**.',
  },
  {
    id: 'math-2', type: 'numeric', topic: 'math', difficulty: 1, unit: 'µs', tolerance: 0,
    prompt: 'What is 0.000250 s in microseconds?',
    answer: 250,
    explanation: '1 µs = 10⁻⁶ s → 0.000250 s = **250 µs**.',
  },
  {
    id: 'math-3', type: 'numeric', topic: 'math', difficulty: 2, tolerance: 0.01,
    prompt: 'Solve for x: 3x + 4 = 19.',
    answer: 5,
    explanation: '3x = 15 → x = **5**.',
  },
  {
    id: 'math-4', type: 'numeric', topic: 'math', difficulty: 2, unit: '%', tolerance: 0.01,
    prompt: 'A motor should run at 200 RPM but measures 190 RPM. What is the error as a percentage of the target?',
    answer: 5,
    explanation: '(200 − 190) / 200 × 100 = **5 %**.',
  },
];
