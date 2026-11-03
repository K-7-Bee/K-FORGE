import type { Question } from '../types';
import { L, mc, num, out, sc } from './helpers';

export const rtosLessonQuestions: Question[] = [
  sc('ea-c', 'rtos', 1, 'In a layered firmware architecture, which layer should contain register and HAL calls?', ['Application', 'Services', 'Drivers / board support', 'All of them'], 2, 'Keep hardware access in thin drivers; upper layers stay portable and testable.'),
  sc('rc-a', 'rtos', 2, 'What does "real-time" mean in an RTOS?', ['Running as fast as possible', 'Meeting timing deadlines predictably', 'Using the real-time clock', 'Running on many cores'], 1, 'Real-time is about determinism: the response happens within a known, bounded time.'),
  sc('rs-a', 'rtos', 2, 'Three tasks are ready with priorities 1, 2 and 3. Which runs?', ['Priority 1', 'Priority 2', 'Priority 3', 'They run in turn equally'], 2, 'FreeRTOS: higher number = higher priority; the highest-priority ready task runs.'),
  sc('rq-a', 'rtos', 2, 'A sensor task sends to a full queue with a timeout of 0. What happens?', ['It blocks forever', 'xQueueSend returns errQUEUE_FULL immediately', 'The oldest item is overwritten', 'The system resets'], 1, 'With timeout 0 the call does not wait; check the return value and decide (drop, count, or overwrite with xQueueOverwrite for length-1 queues).'),
  sc('rq-b', 'rtos', 2, 'Which API should an ISR use to wake a waiting task?', ['xSemaphoreGive', 'xSemaphoreGiveFromISR (or vTaskNotifyGiveFromISR)', 'vTaskDelay', 'printf'], 1, 'Only *FromISR variants are safe in interrupts; pass a "higher priority task woken" flag and yield if set.'),
  sc('mx-a', 'rtos', 2, 'What problem does mutex priority inheritance solve?', ['Deadlock', 'Priority inversion: a low-priority task holding a mutex is temporarily raised so it releases it sooner', 'Stack overflow', 'Queue overflow'], 1, 'Without inheritance, a medium-priority task can delay a high-priority task waiting on a mutex held by a low-priority task.'),
  sc('sy-a', 'rtos', 2, 'Which FreeRTOS mechanism lets a task wait until **several** conditions are all set (e.g. Wi-Fi up AND sensor ready)?', ['A mutex', 'An event group', 'A binary semaphore', 'vTaskDelay'], 1, 'Event groups hold bits; xEventGroupWaitBits can wait for any or all of them.'),
  num('fp-a', 'rtos', 2, 'A task samples every 5000 ms using vTaskDelay(pdMS_TO_TICKS(5000)) after a 40 ms read. What is its actual period?', 5040, 'ms', 'vTaskDelay is relative: 40 ms of work + 5000 ms delay = 5040 ms. vTaskDelayUntil keeps an exact 5000 ms period.', 0),
  mc('gt-a', 'git', 1, 'Which belong in a .gitignore for a firmware project? (select all)', ['Build output folders (.pio/, Debug/)', 'secrets.h with Wi-Fi passwords', 'Source files', 'IDE caches'], [0, 1, 3], 'Commit sources; ignore builds, caches and secrets.'),
  out('gt-b', 'git', 1, 'Which Git command creates and switches to a new branch called add-imu?', 'git ??? add-imu', ['switch -c', 'git switch -c', 'checkout -b', 'git checkout -b'], '`git switch -c add-imu` (or the older `git checkout -b add-imu`).'),
  sc('ut-b', 'testing', 2, 'A bug in clamp_speed let 256 through. After fixing it, what else should you do?', ['Nothing', 'Add a test for 256 so the bug cannot return unnoticed', 'Delete the old tests', 'Disable warnings'], 1, 'Every fixed bug gets a regression test.'),
  sc('hdg-a', 'debugging-tools', 2, 'Random sensor readings appear only when the motors run. What do you check first?', ['Wi-Fi password', 'Grounding, supply dips and motor wiring near sensor lines', 'The I2C address', 'The baud rate'], 1, 'Motor current causes ground bounce, supply dips and noise — measure power and grounds first.'),
  num('la-a', 'debugging-tools', 2, 'A UART runs at 115 200 baud. What minimum logic-analyzer sample rate gives about 10 samples per bit?', 1.152, 'MS/s', '115 200 × 10 ≈ 1.15 MS/s; choose the next available rate (e.g. 2 MS/s).', 0.05),
  sc('os-a', 'debugging-tools', 2, 'Which problem can an oscilloscope show that a logic analyzer cannot?', ['Decoded I2C addresses', 'The real analog shape: slow edges, ringing and supply dips', 'UART bytes', 'Pulse counts'], 1, 'A logic analyzer only reports HIGH/LOW; a scope shows the actual voltage waveform.'),
  sc('lx-a', 'linux', 1, 'What does `chmod +x build.sh` do?', ['Deletes the file', 'Makes the script executable', 'Compiles it', 'Changes its owner'], 1, 'It adds execute permission so you can run ./build.sh.'),
  mc('pc-a', 'pcb', 2, 'Which are good rules for a first robot carrier PCB? (select all)', ['Decoupling capacitors close to each IC power pin', 'A solid ground plane', 'Run motor current traces next to sensor signals', 'Test points for power, I2C and UART'], [0, 1, 3], 'Keep high-current motor paths away from sensitive signals.'),
];

export const embArchitecture = L({
  id: 'emb-architecture', title: 'Embedded system architecture', topic: 'rtos', minutes: 13,
  objectives: ['Describe layered firmware architecture', 'Choose between a super-loop and an RTOS', 'Draw a block diagram of hardware and software'],
  why: `Architecture decisions decide whether your robot firmware stays understandable at 5 000 lines. Interviewers often ask you to sketch your system's architecture and justify it.`,
  visual: { flow: ['Application: state machine, navigation', 'Services: logging, comms, filters', 'Drivers: motor, IMU, BME280, SCD40', 'HAL / registers', 'Hardware'], caption: 'Layered firmware: each layer uses only the one below.' },
  theory: `#### Super-loop
\`\`\`c
while (1) { read_inputs(); update_state(); write_outputs(); }
\`\`\`
Simple, predictable, easy to debug. Works well while every job is short and has similar timing. Long or blocking jobs (network reconnects, 5 s sensor waits) break it.

#### RTOS
Separate tasks with priorities; slow jobs block without delaying urgent ones. Costs: RAM per task, synchronisation complexity, new bug types (races, deadlocks).

#### Choosing
| Situation | Choice |
|---|---|
| Few short jobs, tight timing | Super-loop (+ interrupts) |
| Network stack, mixed periods, blocking libraries | RTOS |

#### Documentation
A block diagram (hardware), a task/module diagram (software) and a data-flow diagram (sensor → filter → queue → MQTT) belong in every project README.`,
  worked: {
    problem: 'Pick an architecture for the air-quality robot on the ESP32.',
    steps: ['Jobs: 50 Hz motor control, 5 s CO₂ readings, Wi-Fi/MQTT with reconnects, obstacle checks.', 'Periods differ widely and Wi-Fi can block → RTOS.', 'Tasks: motor (high), sensors (medium), comms (low); queues between them; drivers below.'],
    answer: '**FreeRTOS** with three tasks and queues — the ESP32 already runs it, and Wi-Fi blocking cannot freeze motor control.',
  },
  tryIt: 'Draw two diagrams for your robot: hardware blocks with buses and power, and software tasks/modules with the data flowing between them. Add them to your project README.',
  mistakes: [['Starting with an RTOS for a trivial project', 'Use the simplest architecture that meets timing.'], ['Layer violations (app code poking registers)', 'Go through drivers.'], ['No architecture diagram', 'Draw it — it explains your design in seconds.']],
  check: ['ea-c', 'rtos-5', 'rc-a'],
  challenge: { prompt: 'Write a one-page architecture note for your robot: chosen architecture, task list with periods and priorities, and why.' },
  summary: ['Layers: app, services, drivers, HAL, hardware.', 'Super-loop for simple timing; RTOS for mixed and blocking jobs.', 'Document with block and data-flow diagrams.'],
  cards: [['Super-loop vs RTOS', 'Super-loop: simple, short jobs. RTOS: mixed periods and blocking work.', 'concept']],
});

export const rtosConcepts = L({
  id: 'rtos-concepts', title: 'Real-time operating systems', topic: 'rtos', minutes: 12,
  objectives: ['Define hard and soft real-time', 'Explain preemptive scheduling and the tick', 'List the services an RTOS provides'],
  why: `"Real-time" is often misunderstood as "fast". It means predictable. Understanding what an RTOS guarantees helps you design a robot whose motors never miss a control step.`,
  visual: { diagram: 'rtos-tasks', caption: 'An RTOS runs several tasks on one CPU and switches between them by priority.' },
  theory: `#### Real-time
- **Hard:** missing a deadline is a failure (airbag, motor commutation).
- **Soft:** occasional misses degrade quality (dashboard update).

#### Preemptive scheduling
A periodic **tick** interrupt (typically 1 ms; configTICK_RATE_HZ) lets the scheduler run. When a higher-priority task becomes ready (its delay expired, data arrived), it **preempts** the running task immediately.

#### Services
| Service | Purpose |
|---|---|
| Tasks | independent threads of execution with own stacks |
| Delays | vTaskDelay, vTaskDelayUntil |
| Queues | pass data safely |
| Semaphores, notifications | signal events |
| Mutexes | protect shared resources |
| Software timers | callbacks after a delay |

#### Costs
Context switches take microseconds; each task needs RAM for its stack; shared data needs synchronisation.`,
  worked: {
    problem: 'Classify the robot\'s jobs as hard or soft real-time.',
    steps: ['Motor speed control at 50 Hz: missing steps causes speed errors → firm/hard.', 'Emergency stop on obstacle: must react quickly → hard.', 'MQTT telemetry and dashboard: delays are tolerable → soft.'],
    answer: 'Motor control and e-stop are **hard**; telemetry is **soft** — prioritise accordingly.',
  },
  tryIt: 'On the ESP32, print `xTaskGetTickCount()` and `configTICK_RATE_HZ`, and measure how accurately a 10 ms vTaskDelayUntil loop keeps time over 1000 iterations.',
  mistakes: [['Equating real-time with speed', 'It means bounded, predictable timing.'], ['Assuming ms delays shorter than the tick work', 'Delays are rounded to ticks.'], ['Ignoring per-task RAM', 'Each task needs its own stack.']],
  check: ['rc-a', 'rtos-2', 'fr-b'],
  challenge: { prompt: 'List every job in your robot with its period, deadline and hard/soft classification in a table in your notes.' },
  summary: ['Real-time = predictable deadlines.', 'Tick-driven preemptive scheduling.', 'Tasks, queues, semaphores, mutexes, timers.'],
  cards: [['Hard vs soft real-time', 'Hard: a miss is failure. Soft: a miss degrades quality.', 'concept']],
});

export const rtosScheduling = L({
  id: 'rtos-scheduling', title: 'Tasks and scheduling', topic: 'rtos', minutes: 14,
  objectives: ['Create tasks with suitable stacks and priorities', 'Explain task states', 'Avoid starvation and measure stack usage'],
  why: `Most RTOS bugs come from priorities and stacks: a task that never blocks starves others; a stack that is too small corrupts memory. Getting these right is half of RTOS engineering.`,
  visual: { md: '| State | Meaning |\n|---|---|\n| Running | Executing on the CPU |\n| Ready | Able to run, waiting for the CPU |\n| Blocked | Waiting for time, a queue, a semaphore … |\n| Suspended | Explicitly paused |', caption: 'FreeRTOS task states.' },
  theory: `\`\`\`c
xTaskCreate(motor_task, "motor", 2048, NULL, 3, &motor_handle);   // stack: bytes on ESP32
\`\`\`

#### Rules
1. The highest-priority **ready** task runs; equal priorities time-slice on each tick.
2. Every task must **block** regularly (delay, queue receive, semaphore take).
3. Priorities follow **deadlines**, not importance.

#### Stack sizing
Start generously, then measure:
\`\`\`c
UBaseType_t free_stack = uxTaskGetStackHighWaterMark(NULL);   // words in vanilla FreeRTOS, bytes on ESP-IDF
\`\`\`
Keep 20–30 % headroom. printf-style functions use lots of stack.

#### Idle task
Runs when nothing else is ready; on the ESP32 it also feeds the task watchdog — starving it triggers watchdog resets.`,
  worked: {
    problem: 'After adding a busy-wait `while (!sensor_ready()) {}` to a priority-3 task, the Wi-Fi task (priority 1) stops working. Why, and fix it?',
    steps: ['The busy-wait never blocks, so the priority-3 task is always ready.', 'Lower-priority tasks (Wi-Fi, idle) never run → starvation and watchdog warnings.', 'Fix: block while waiting — `vTaskDelay(pdMS_TO_TICKS(1))` in the loop, or better, wait on a semaphore given by the sensor\'s data-ready interrupt.'],
    answer: '**Starvation** from a non-blocking wait. Block (delay or semaphore) so lower priorities run.',
  },
  tryIt: 'Remove the delay from a high-priority task (the syllabus Debug mission), describe what stops running, then restore it and print every task\'s stack high-water mark.',
  mistakes: [['Busy-waiting in a task', 'Block on a delay, queue or semaphore.'], ['Priorities by "importance"', 'Use deadlines.'], ['Never checking stack usage', 'Print high-water marks during testing.']],
  check: ['rs-a', 'rtos-2', 'fr-b'],
  challenge: { prompt: 'Build the queue pipeline lab and report each task\'s stack high-water mark.', exerciseId: 'lab-rtos-queue' },
  summary: ['Running, ready, blocked, suspended.', 'Highest ready priority runs; tasks must block.', 'Measure stacks; keep headroom.'],
  cards: [['FreeRTOS stack check', 'uxTaskGetStackHighWaterMark(NULL)', 'code']],
});

export const rtosQueues = L({
  id: 'rtos-queues', title: 'Queues and semaphores', topic: 'rtos', minutes: 15,
  objectives: ['Pass data between tasks with queues', 'Signal events from ISRs with semaphores and notifications', 'Handle full queues and timeouts'],
  why: `Queues are how the sensor task hands samples to the Wi-Fi task without corrupting them; semaphores let an interrupt wake a task instantly. They replace fragile global flags.`,
  visual: { diagram: 'rtos-tasks', caption: 'Producer task → queue → consumer task; an ISR can wake a task with a semaphore.' },
  theory: `#### Queues (copy data)
\`\`\`c
QueueHandle_t q = xQueueCreate(10, sizeof(AirSample));
configASSERT(q != NULL);

// producer
if (xQueueSend(q, &sample, 0) != pdPASS) dropped++;          // don't block
// consumer
if (xQueueReceive(q, &sample, portMAX_DELAY) == pdPASS) publish(&sample);   // block until data
\`\`\`
Items are **copied** in, so the sender can reuse its variable immediately.

#### Binary semaphore / task notification (signal events)
\`\`\`c
void IRAM_ATTR drdy_isr(void) {
  BaseType_t woken = pdFALSE;
  vTaskNotifyGiveFromISR(sensor_task_handle, &woken);
  portYIELD_FROM_ISR(woken);
}
// in sensor task
ulTaskNotifyTake(pdTRUE, portMAX_DELAY);   // sleeps until the ISR fires
\`\`\`
Task notifications are the fastest, lightest way to wake one specific task.

#### Counting semaphores
Count events or available resources (e.g. 3 free buffers).`,
  worked: {
    problem: 'The MQTT task is slow when Wi-Fi is weak; the sensor queue (length 10, one sample per 5 s) fills up. What happens and what should you do?',
    steps: ['After 50 s without publishing, xQueueSend with timeout 0 fails.', 'Count drops so the data loss is visible in your report.', 'Options: larger queue, or a ring buffer that overwrites the oldest samples, depending on whether new or old data matters more.'],
    answer: 'Never block the producer; **count dropped samples** and size the queue for the longest outage you want to survive.',
  },
  tryIt: 'Build the sensor → queue → Wi-Fi pipeline with fake sensor data (the syllabus Implement mission). Then slow the consumer and watch the drop counter rise.',
  mistakes: [['Global variables instead of queues', 'Queues copy data safely between tasks.'], ['Non-ISR APIs inside ISRs', 'Use the FromISR variants.'], ['Ignoring xQueueSend failures', 'Check the return value and count drops.']],
  check: ['rtos-1', 'rq-a', 'rq-b'],
  challenge: { prompt: 'Implement the producer/consumer pipeline with a drop counter in the lab.', exerciseId: 'lab-rtos-queue' },
  summary: ['Queues copy data between tasks.', 'Semaphores/notifications signal events; FromISR in interrupts.', 'Handle full queues explicitly.'],
  cards: [['Wake a task from an ISR (lightest)', 'vTaskNotifyGiveFromISR + ulTaskNotifyTake', 'code']],
});

export const rtosMutex = L({
  id: 'rtos-mutex', title: 'Mutexes', topic: 'rtos', minutes: 13,
  objectives: ['Protect shared resources with mutexes', 'Explain priority inversion and inheritance', 'Prevent deadlock'],
  why: `Two tasks reading the BME280 and SCD40 over one I2C bus will corrupt each other's transactions unless access is serialised. Mutexes do that — if you avoid their classic traps.`,
  visual: { flow: ['Task A takes I2C mutex', 'Task B tries → blocks', 'Task A finishes transaction, gives mutex', 'Task B takes mutex and runs'], caption: 'A mutex serialises access to a shared bus.' },
  theory: `\`\`\`c
SemaphoreHandle_t i2c_mutex = xSemaphoreCreateMutex();

bool read_reg(uint8_t addr, uint8_t reg, uint8_t *val) {
  if (xSemaphoreTake(i2c_mutex, pdMS_TO_TICKS(50)) != pdTRUE) return false;   // timeout, not forever
  bool ok = i2c_read(addr, reg, val);
  xSemaphoreGive(i2c_mutex);
  return ok;
}
\`\`\`

#### Mutex vs semaphore
| Mutex | Binary semaphore |
|---|---|
| Protects a resource | Signals an event |
| Has an owner (only the taker gives it back) | Any task/ISR can give |
| Priority inheritance | No inheritance |
| Never from ISRs | Give from ISRs (FromISR) |

#### Priority inversion
Low task holds the mutex, high task waits, a medium task preempts the low one → high task waits on medium. **Priority inheritance** raises the holder temporarily.

#### Deadlock
Task 1 holds A wants B; Task 2 holds B wants A. Prevent it by always taking mutexes **in the same order**, keeping critical sections short, and using timeouts.`,
  worked: {
    problem: 'The sensor task takes the I2C mutex then the log mutex; the logger takes the log mutex then the I2C mutex (to read a sensor ID). Occasionally both freeze. Fix it.',
    steps: ['Opposite lock order → classic deadlock.', 'Define a global order: always I2C mutex before log mutex.', 'Better: don\'t hold the I2C mutex while logging — copy the data, release, then log.'],
    answer: 'Use a **consistent lock order** and keep critical sections short (release before doing slow work).',
  },
  tryIt: 'Create two tasks that print long messages to Serial at the same time without a mutex and observe interleaved text. Add a mutex around the print and compare.',
  mistakes: [['Taking a mutex in an ISR', 'Use a semaphore or notification from ISRs.'], ['Holding a mutex during slow operations', 'Copy data, release, then process.'], ['Different lock orders in different tasks', 'Define one global order.']],
  check: ['rtos-3', 'rtos-4', 'mx-a'],
  challenge: { prompt: 'Wrap all I2C access in your robot firmware with one mutex-protected function and document the lock order in a comment.' },
  summary: ['Mutex = resource lock with owner and inheritance.', 'Priority inversion is solved by inheritance.', 'Deadlock: same order, short sections, timeouts.'],
  cards: [['Prevent deadlock', 'Always take mutexes in the same global order', 'concept']],
});

export const rtosSync = L({
  id: 'rtos-sync', title: 'Task synchronisation', topic: 'rtos', minutes: 12,
  objectives: ['Use task notifications and event groups', 'Synchronise start-up between tasks', 'Choose the right primitive for each job'],
  why: `The comms task should only start publishing once Wi-Fi is up and the sensors are warmed up. Event groups and notifications express those conditions cleanly instead of polling flags.`,
  visual: { md: '| Need | Primitive |\n|---|---|\n| Pass data | Queue |\n| Wake one task (fast) | Task notification |\n| Signal an event, possibly from an ISR | Binary semaphore |\n| Protect a resource | Mutex |\n| Wait for several conditions | Event group |\n| Run something later / periodically | Software timer |', caption: 'Picking a synchronisation primitive.' },
  theory: `#### Event groups
\`\`\`c
#define WIFI_UP     (1 << 0)
#define SENSORS_OK  (1 << 1)
EventGroupHandle_t sys = xEventGroupCreate();

// elsewhere: xEventGroupSetBits(sys, WIFI_UP);
EventBits_t b = xEventGroupWaitBits(sys, WIFI_UP | SENSORS_OK,
                                    pdFALSE,   // don't clear on exit
                                    pdTRUE,    // wait for ALL bits
                                    portMAX_DELAY);
\`\`\`

#### Task notifications
Each task has built-in notification values — faster and lighter than a semaphore for one-to-one signalling (\`xTaskNotify\`, \`ulTaskNotifyTake\`).

#### Software timers
\`xTimerCreate\` runs a callback in the timer service task — good for timeouts and periodic housekeeping. Keep callbacks short; never block in them.`,
  worked: {
    problem: 'The comms task should wait until Wi-Fi is up AND the SCD40 has warmed up (first valid reading), then publish every 5 s. Design it.',
    steps: ['Wi-Fi handler sets WIFI_UP (and clears it on disconnect).', 'Sensor task sets SENSORS_OK after the first valid reading.', 'Comms task: xEventGroupWaitBits(WIFI_UP | SENSORS_OK, wait for all), then publish; re-check WIFI_UP before each publish.'],
    answer: 'An **event group** with two bits; the comms task waits for both, then runs its periodic loop.',
  },
  tryIt: 'Implement the two-bit event group on your ESP32 with fake Wi-Fi and sensor tasks that set their bits after random delays, and print when the comms task starts.',
  mistakes: [['Polling global flags in a loop', 'Block on an event group or notification.'], ['Blocking inside a software-timer callback', 'Callbacks must return quickly.'], ['Using a mutex to signal events', 'Mutexes protect resources; use semaphores/notifications for events.']],
  check: ['sy-a', 'rtos-3', 'rq-b'],
  challenge: { prompt: 'Add start-up synchronisation (event group) to your robot firmware so motors stay disabled until the IMU is calibrated.' },
  summary: ['Event groups wait on combinations of conditions.', 'Notifications: fastest one-to-one wake-up.', 'Software timers for timeouts; never block in callbacks.'],
  cards: [['Wait for several conditions in FreeRTOS', 'xEventGroupWaitBits(group, bits, clear, waitAll, timeout)', 'code']],
});

export const freertosPractical = L({
  id: 'freertos-practical', title: 'FreeRTOS practical development', topic: 'rtos', minutes: 15,
  objectives: ['Build the robot\'s sensor → queue → Wi-Fi pipeline', 'Use vTaskDelayUntil for exact periods', 'Measure timing jitter and stack use'],
  why: `This lesson turns the RTOS concepts into the actual task layout of your air-quality robot — and shows you how to prove it meets its timing.`,
  visual: { diagram: 'rtos-tasks', caption: 'Robot task layout: motor (3), sensors (2), Wi-Fi (1), connected by a queue.' },
  theory: `\`\`\`c
QueueHandle_t air_q;

void sensor_task(void *arg) {
  TickType_t last = xTaskGetTickCount();
  for (;;) {
    AirSample s = read_air_sample();
    if (xQueueSend(air_q, &s, 0) != pdPASS) dropped++;
    vTaskDelayUntil(&last, pdMS_TO_TICKS(5000));      // exact 5 s period
  }
}

void wifi_task(void *arg) {
  AirSample s;
  for (;;) if (xQueueReceive(air_q, &s, portMAX_DELAY) == pdPASS) publish(&s);
}

void motor_task(void *arg) {
  TickType_t last = xTaskGetTickCount();
  for (;;) { control_step(); vTaskDelayUntil(&last, pdMS_TO_TICKS(20)); }   // 50 Hz
}

void setup() {
  air_q = xQueueCreate(10, sizeof(AirSample));
  configASSERT(air_q);
  xTaskCreatePinnedToCore(motor_task,  "motor",  4096, NULL, 3, NULL, 1);
  xTaskCreatePinnedToCore(sensor_task, "sensor", 4096, NULL, 2, NULL, 1);
  xTaskCreatePinnedToCore(wifi_task,   "wifi",   6144, NULL, 1, NULL, 0);
}
\`\`\`

#### vTaskDelay vs vTaskDelayUntil
\`vTaskDelay(n)\` waits n ticks **from now** (period = work + n). \`vTaskDelayUntil\` waits until a fixed absolute time — no drift.

#### Measure
Record \`esp_timer_get_time()\` at each motor step, compute the period's min/max/std (jitter) while Wi-Fi is active.`,
  worked: {
    problem: 'You measure the motor task period: mean 20.0 ms, min 19.2 ms, max 24.8 ms during MQTT bursts. Is that acceptable, and how could you improve it?',
    steps: ['Jitter up to 4.8 ms (24 %) — the derivative term will see noisy dt.', 'Check priorities: motor must be highest, and Wi-Fi pinned to the other core.', 'Use measured dt in the PID (not a constant) and move heavy work out of high-priority tasks.'],
    answer: 'Too much jitter for smooth control. **Pin Wi-Fi to core 0, keep motor highest priority on core 1, and use measured dt**.',
  },
  tryIt: 'Add a motor task to the pipeline and measure how much its timing varies while Wi-Fi is active (the syllabus Create mission). Report min/max/standard deviation of the period.',
  mistakes: [['vTaskDelay for periodic loops', 'Use vTaskDelayUntil for fixed periods.'], ['Creating the queue after starting tasks', 'Create and check it first.'], ['Not measuring jitter', 'Record timestamps and compute the spread.']],
  check: ['fp-a', 'rtos-5', 'rtos-1'],
  challenge: { prompt: 'Build the full three-task pipeline in the lab and report timing and stack measurements.', exerciseId: 'lab-rtos-queue' },
  summary: ['Motor (3), sensors (2), Wi-Fi (1) with a queue.', 'vTaskDelayUntil for exact periods.', 'Measure jitter and stacks.'],
  cards: [['vTaskDelay vs vTaskDelayUntil', 'Relative delay (drifts) vs absolute period (no drift)', 'concept']],
});

export const git = L({
  id: 'git', title: 'Git and GitHub', topic: 'git', minutes: 14,
  objectives: ['Use the everyday Git workflow with branches', 'Write useful commits and pull requests', 'Keep secrets and build files out of repositories'],
  why: `Your GitHub is your portfolio — employers will look at it. Git also lets you recover from any mistake and find exactly which change introduced a bug.`,
  visual: { flow: ['git switch -c feature', 'edit + test', 'git add <files>', 'git commit -m "…"', 'git push -u origin feature', 'Pull request + review → merge'], caption: 'The everyday branch workflow.' },
  theory: `\`\`\`bash
git status                      # what changed
git switch -c add-motor-driver  # new branch
git add src/motor.c src/motor.h
git commit -m "Add motor speed control with clamping"
git push -u origin add-motor-driver
git log --oneline --graph       # history
git diff                        # unstaged changes
\`\`\`

#### Good commits
- Small, working steps; one purpose each.
- Message: imperative summary ("Add …", "Fix …"), optional body explaining *why*.

#### Pull requests (even solo)
Describe what changed, how you tested it, and include measurements or screenshots.

#### .gitignore
Build outputs (\`.pio/\`, \`Debug/\`), IDE caches, and **secrets** (\`secrets.h\`). If a secret is committed, **change it** — deleting it later leaves it in history.

#### Finding bugs
\`git bisect\` binary-searches history to find the commit that broke something.`,
  worked: {
    problem: 'The robot drove straight last week; today it curves. You have 30 commits since. How do you find the culprit quickly?',
    steps: ['`git bisect start`, mark the current commit bad and last week\'s tag good.', 'Git checks out the midpoint; test it and mark good/bad.', 'About log₂(30) ≈ 5 tests later, Git names the first bad commit.'],
    answer: '**git bisect** — about 5 test runs instead of 30.',
  },
  tryIt: 'Put your Chapter 11 project on GitHub with a README and at least three commits; create a branch, introduce a bug on purpose, find it with git diff, and fix it on the branch (the syllabus missions).',
  mistakes: [['Huge "update" commits', 'Commit small, described steps.'], ['Committing secrets', 'Use .gitignore; rotate leaked secrets.'], ['Committing build outputs', 'Ignore build folders.']],
  check: ['git-1', 'gt-a', 'gt-b'],
  challenge: { prompt: 'Open a pull request on your own repository for one feature, with a description of how you tested it, and merge it.' },
  summary: ['status, switch -c, add, commit, push, PR.', 'Small commits with clear messages.', 'Ignore builds and secrets; bisect to find regressions.'],
  cards: [['Find the commit that broke something', 'git bisect', 'code'], ['Leaked secret in Git', 'Change it — history keeps the old value', 'concept']],
});

export const unitTesting = L({
  id: 'unit-testing', title: 'Unit testing', topic: 'testing', minutes: 14,
  objectives: ['Write unit tests for pure firmware logic on a laptop', 'Choose normal, boundary and invalid test cases', 'Use a test framework such as Unity'],
  why: `Testing logic on your laptop takes seconds; testing on the robot takes minutes and a charged battery. Tests also prove your code works — strong evidence in a portfolio.`,
  visual: { flow: ['Pure function (no hardware)', 'Test cases: normal, limits, invalid', 'Run on laptop (gcc)', 'Fix until green', 'Same code runs on the MCU'], caption: 'Host-side unit testing for firmware.' },
  theory: `#### Plain asserts
\`\`\`c
#include <assert.h>
int main(void) {
  assert(clamp_speed(300)  == 255);
  assert(clamp_speed(-300) == -255);
  assert(clamp_speed(255)  == 255);    // boundary
  assert(clamp_speed(0)    == 0);
  return 0;                            // silent = all passed
}
\`\`\`

#### Unity
\`\`\`c
#include "unity.h"
void test_clamp_limits(void) {
  TEST_ASSERT_EQUAL_INT16(255, clamp_speed(256));
  TEST_ASSERT_EQUAL_INT16(-255, clamp_speed(-256));
}
int main(void) { UNITY_BEGIN(); RUN_TEST(test_clamp_limits); return UNITY_END(); }
\`\`\`
PlatformIO runs Unity tests with \`pio test\` (on the host with \`-e native\`).

#### What to test
- State machine transitions (one test per arrow).
- PID maths (known first outputs).
- Filters, conversions (ADC → volts), parsers (CSV lines, commands).
- Every bug you fix → a new regression test.`,
  worked: {
    problem: 'Write test cases for `uint16_t adc_to_mv(uint16_t raw)` (0–1023 → 0–5000 mV, clamped at 3300).',
    steps: ['Normal: raw 512 → 2502 mV (512 × 5000 / 1023).', 'Boundaries: raw 0 → 0; raw 675 → 3299 (just below the clamp); raw 1023 → 3300 (clamped).', 'Overflow guard: raw 1023 must not overflow a 16-bit intermediate.'],
    answer: 'Tests at **0, 512, 675, 1023** cover normal values, the clamp boundary and the overflow risk.',
  },
  tryIt: 'Write tests for next_state() covering every arrow in the robot state machine (the syllabus Create mission) and run them with gcc on your laptop.',
  mistakes: [['Testing only happy paths', 'Include limits and invalid inputs.'], ['Logic tangled with hardware', 'Extract pure functions to test them.'], ['Fixing a bug without a test', 'Add a regression test every time.']],
  check: ['test-1', 'ut-b', 'db-a'],
  challenge: { prompt: 'Make clamp_speed pass its boundary tests in the lab.', exerciseId: 'lab-unit-test' },
  summary: ['Pure logic tested on the host.', 'Normal, boundary, invalid cases.', 'Regression test for every bug.'],
  cards: [['Test case categories', 'Normal values, boundaries/limits, invalid inputs', 'concept']],
});

export const hwDebugging2 = L({
  id: 'hw-debugging-2', title: 'Hardware debugging', topic: 'debugging-tools', minutes: 13,
  objectives: ['Map symptoms to first checks', 'Choose the right instrument', 'Write a short debug report'],
  why: `"Board won't start", "resets when motors run", "sensor not found", "garbled serial", "random readings" — five symptoms cover most hardware faults you'll meet. Each has a fast first check.`,
  visual: { md: '| Symptom | Check first | Likely causes |\n|---|---|---|\n| Board won\'t start | Supply voltage | Dead battery, short, reversed power |\n| Resets when motors start | Supply during start-up (scope) | Inrush dip, weak converter |\n| Sensor not found | I2C scan, SDA/SCL | Address, wiring, pull-ups |\n| Garbled serial | Baud rate, ground | Mismatch, no common ground |\n| Motor won\'t run | Driver pins, motor voltage | STBY low, no PWM, wiring |\n| Random readings | Grounds, sensor power | Floating pin, loose wire, noise |', caption: 'Symptom → first check (from the syllabus).' },
  theory: `#### Measurement habits
1. **Predict** the value before measuring.
2. Check **ground** first.
3. Change **one thing at a time**.
4. Sample digital signals ~10× faster than they change.
5. Stay within instrument limits (cheap logic analyzers: ≈ 5 V inputs).

#### Instruments
| Tool | Shows | Use for |
|---|---|---|
| Multimeter | steady V, I, R, continuity | power, shorts, broken wires |
| Logic analyzer | digital timing + decoded protocols | UART, I2C, SPI, PWM |
| Oscilloscope | real voltage over time | noise, dips, slow edges, ringing |

#### Debug report (one page)
Symptom → prediction → measurement → cause → fix → how you verified it. This is exactly the story interviewers ask for.`,
  worked: {
    problem: 'The ESP32 resets every time both motors start at full PWM. Walk through the investigation.',
    steps: ['Predict: 5 V rail should stay above ~4.75 V.', 'Measure with a scope (or a meter\'s min-hold): the rail dips to 3.9 V for 2 ms at start.', 'Cause: motor inrush draws the battery and buck converter down.', 'Fix: ramp PWM over 200 ms, add bulk capacitance near the driver, and separate motor and logic supply paths; verify no dip below 4.75 V.'],
    answer: '**Supply dip from inrush current.** Ramping + bulk capacitance + better wiring, verified by measurement.',
  },
  tryIt: 'Ask a friend to add one wiring fault to a working circuit, find it with your instruments using the symptom table, and write the one-page debug report (the syllabus missions).',
  mistakes: [['Measuring without a prediction', 'Write the expected value first.'], ['Using a logic analyzer for analog problems', 'Use a scope for dips and noise.'], ['Exceeding instrument input limits', 'Check the analyzer\'s maximum voltage.']],
  check: ['tool-3', 'hdg-a', 'mm-3'],
  challenge: { prompt: 'Write a one-page debug report for a real fault you found in any of your builds, using the symptom → prediction → measurement → cause → fix → verification format.' },
  summary: ['Six symptoms, six first checks.', 'Predict, ground first, one change at a time.', 'Meter, analyzer, scope — each for its job.'],
  cards: [['ESP32 resets when motors start', 'Check the supply rail during start-up — inrush dip', 'concept']],
});

export const logicAnalyzer = L({
  id: 'logic-analyzer', title: 'Logic analyzer', topic: 'debugging-tools', minutes: 13,
  objectives: ['Capture digital signals with PulseView', 'Decode UART, I2C and SPI', 'Choose sample rate and trigger'],
  why: `A logic analyzer shows exactly what happened on the wires: the address byte, the missing ACK, the wrong baud rate. It turns hours of guessing into a two-minute capture.`,
  visual: { diagram: 'i2c-bus', caption: 'Clip channels to SDA and SCL (and GND) to decode every I2C transaction.' },
  theory: `#### Set-up
1. Connect **GND first**, then channels to the signals.
2. In PulseView (sigrok), choose the sample rate (≥ 10× the signal rate) and number of samples.
3. Set a **trigger** (e.g. falling edge on SDA = START) to capture the moment you care about.
4. Add a **protocol decoder**: UART (set baud), I2C (SDA/SCL), SPI (SCK/MOSI/MISO/CS, mode).

#### Sample rate guide
| Signal | Rate | Sample at |
|---|---|---|
| UART 115 200 | 115 kbit/s | ≥ 1–2 MS/s |
| I2C 400 kHz | 400 kHz | ≥ 4 MS/s |
| SPI 4 MHz | 4 MHz | ≥ 24 MS/s (check analyzer limits) |

#### Limits
Cheap 8-channel analyzers (24 MS/s) handle UART and I2C well; fast SPI may exceed them. They see only HIGH/LOW — a noisy or slow edge can look clean. Inputs are typically 5 V max.

#### Tip
Toggle a spare GPIO in your code ("debug pin") and capture it together with the bus to correlate code and signals.`,
  worked: {
    problem: 'A capture of an I2C read shows: START, 0xEC, NACK, STOP. What does it mean?',
    steps: ['0xEC = address 0x76 with write bit 0.', 'NACK after the address: no device acknowledged 0x76.', 'Check the sensor address (0x77 if SDO high?), its power, and wiring.'],
    answer: '**No device at 0x76.** Try 0x77 or check power and wiring — the capture tells you the bus itself works.',
  },
  tryIt: 'Measure your Uno\'s PWM frequency and duty cycle with the logic analyzer (the syllabus Implement mission), then decode a Serial.println at 9600 baud.',
  mistakes: [['No ground connection', 'Clip GND first.'], ['Sample rate too low', 'At least ~10× the signal rate.'], ['Trusting the analyzer for analog problems', 'It hides noise and slow edges — use a scope.']],
  check: ['tool-1', 'tool-2', 'la-a'],
  challenge: { prompt: 'Capture an I2C transaction with your logic analyzer and decode the address and ACK (the syllabus Debug mission). Save the screenshot as evidence.' },
  summary: ['GND first, ≥ 10× sample rate, trigger, decoder.', 'UART, I2C, SPI decoding in PulseView.', 'Digital only — use a scope for analog issues.'],
  cards: [['Logic analyzer sample rate rule', '≥ about 10× the signal rate', 'concept']],
});

export const oscilloscope = L({
  id: 'oscilloscope', title: 'Oscilloscope fundamentals', topic: 'debugging-tools', minutes: 13,
  objectives: ['Set time/div, volts/div and triggers', 'Measure supply dips, noise and edge quality', 'Use probes correctly'],
  why: `Some bugs only exist in the analog world: a 2 ms supply dip that resets the ESP32, ringing on a long I2C wire, a slow MOSFET gate edge. The scope is the only tool that shows them.`,
  visual: { diagram: 'clock-wave', caption: 'A scope shows the real voltage over time — edges, levels and timing.' },
  theory: `#### Controls
- **Volts/div** and **offset** — vertical scale.
- **Time/div** — horizontal scale.
- **Trigger** — level and edge that start the capture (e.g. falling below 4.6 V on the 5 V rail). **Single** mode captures one event.
- **Coupling:** DC (absolute levels) or AC (small ripple on top of DC).

#### Probes
- Set the probe and the scope channel to the same attenuation (×1 or ×10).
- Use a **short ground spring** for fast edges; a long ground lead adds ringing.
- Ground clips connect to earth on mains scopes — never clip them to a non-ground point.

#### Measurements on the robot
- 5 V rail during motor start (dips, ripple).
- PWM edges at the MOSFET gate and drain.
- I2C rise times (pull-up strength vs bus capacitance).

No scope of your own? Ask to use the university lab, as the syllabus suggests.`,
  worked: {
    problem: 'How do you capture a brief supply dip that happens only when the motors start?',
    steps: ['Channel on the 5 V rail, DC coupling, 0.5 V/div with offset so 5 V is on screen.', 'Trigger: falling edge at 4.7 V, single-shot mode.', 'Time/div ≈ 1 ms; start the motors; the scope freezes the dip.'],
    answer: '**Single-shot trigger on a falling edge below the normal rail** catches the dip and shows its depth and duration.',
  },
  tryIt: 'In a university lab, measure your Uno\'s PWM signal and the 5 V rail while switching a load. Record the rise time and any ripple.',
  mistakes: [['Long ground leads on fast signals', 'Use the probe\'s ground spring.'], ['Probe attenuation mismatch', 'Match ×1/×10 on probe and channel.'], ['Free-running when hunting rare events', 'Use single-shot triggering.']],
  check: ['os-a', 'tool-3', 'hdg-a'],
  challenge: { prompt: 'Capture the motor start-up supply behaviour of your robot (or a motor on a bench supply) and record the minimum voltage and dip duration in capstone milestone 3.' },
  summary: ['Volts/div, time/div, trigger, coupling.', 'Short grounds, matched attenuation.', 'Single-shot triggers catch rare events.'],
  cards: [['Catch a rare supply dip', 'Single-shot trigger, falling edge below the normal rail', 'concept']],
});

export const linux = L({
  id: 'linux', title: 'Linux fundamentals', topic: 'linux', minutes: 13,
  objectives: ['Navigate and manage files from the shell', 'Build and test with make and scripts', 'Access serial ports and debug with gdb'],
  why: `Most embedded teams build, test and automate on Linux — even for microcontrollers. Basic shell fluency is expected in junior job interviews and makes CI pipelines possible.`,
  visual: { md: '| Command | Purpose |\n|---|---|\n| `pwd`, `ls -la`, `cd` | where am I, list, move |\n| `cp`, `mv`, `mkdir -p`, `rm` | manage files |\n| `grep -rn "I2C" .` | search code with line numbers |\n| `chmod +x run.sh` | make a script executable |\n| `ls /dev/tty*` | find serial ports |\n| `make` | run build rules |\n| `gdb ./program` | debug a program |', caption: 'Commands you will use every week.' },
  theory: `#### A small Makefile
\`\`\`make
CC = gcc
CFLAGS = -std=c11 -Wall -Wextra -g

test: test_filter.c filter.c
\t$(CC) $(CFLAGS) test_filter.c filter.c -o test
\t./test
\`\`\`
(Recipe lines must start with a **tab**.)

#### Scripts
\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail
make test | tee results.txt
\`\`\`

#### Serial ports
Devices appear as \`/dev/ttyUSB0\` or \`/dev/ttyACM0\`. Join the \`dialout\` group (\`sudo usermod -aG dialout $USER\`, then log out/in) instead of using sudo for every access.

#### gdb basics
\`break filter_add\`, \`run\`, \`next\`, \`step\`, \`print sum\`, \`backtrace\`.

#### Windows
Use **WSL** to get a real Linux environment on your laptop.`,
  worked: {
    problem: 'Find every place your project calls `Wire.begin` and count them.',
    steps: ['`grep -rn "Wire.begin" src/` lists file:line for each call.', 'Count: `grep -rn "Wire.begin" src/ | wc -l`.', 'More than one call may mean conflicting I2C initialisation.'],
    answer: '`grep -rn "Wire.begin" src/ | wc -l` — fast code search is a daily skill.',
  },
  tryIt: 'In WSL or Linux: build and test your filter module with the Makefile above, then use gdb to pause inside filter_add and print sum (the syllabus missions).',
  mistakes: [['Spaces instead of a tab in Makefile recipes', 'Recipes need a leading tab.'], ['Using sudo for serial access every time', 'Join the dialout group.'], ['Running commands you don\'t understand with sudo', 'Read what a command does first.']],
  check: ['lin-1', 'lx-a', 'git-1'],
  challenge: { prompt: 'Write a script that builds your project, runs its tests and saves the results to a file (the syllabus Create mission), and commit it.' },
  summary: ['Navigate, search, manage files from the shell.', 'make + scripts automate builds and tests.', 'dialout group for serial; gdb for debugging.'],
  cards: [['Search code recursively with line numbers', 'grep -rn "text" .', 'code']],
});

export const pcb = L({
  id: 'pcb', title: 'Basic PCB design', topic: 'pcb', minutes: 15,
  objectives: ['Follow the KiCad workflow from schematic to manufacturing files', 'Apply layout rules for mixed motor and sensor boards', 'Prepare a board for bring-up and testing'],
  why: `A custom carrier board makes the robot reliable — no loose jumper wires — and shows employers you can take a project beyond breadboards.`,
  visual: { flow: ['Schematic', 'Assign footprints', 'Electrical rules check', 'Layout + routing', 'Design rules check', 'Gerbers → order', 'Assemble & test in sections'], caption: 'The KiCad workflow.' },
  theory: `#### Workflow (KiCad)
1. Draw the schematic with clear net labels.
2. Assign a **footprint** to every symbol (the physical pad pattern).
3. Run **ERC** (unconnected pins, conflicting outputs).
4. Place parts: connectors at edges, decoupling close to ICs, sensors away from heat.
5. Route: power first, wide traces for current; then signals.
6. Run **DRC** with your manufacturer's rules (min trace/space, drill sizes).
7. Export Gerbers and drill files; inspect them in a Gerber viewer.

#### Rules for the robot board
- 100 nF decoupling at every IC power pin.
- Solid ground plane on one layer.
- Keep motor current and the buck converter's switching loop away from sensor signals.
- Trace width from a calculator for the motor current (≈ 1 mm for ~2 A on 1 oz copper, outer layer — check a calculator).
- Test points for power, ground, I2C and UART; label connectors and pin 1.
- Reverse-polarity protection and a fuse on the battery input.
- Keep air sensors away from the regulator and motor driver.`,
  worked: {
    problem: 'Your first robot board: in which order should you assemble and power it?',
    steps: ['Inspect for shorts between power and ground (continuity) before soldering anything.', 'Assemble the power section first (input protection, buck); power up with a current-limited supply and measure 5 V and 3.3 V.', 'Add the ESP32 module, then one subsystem at a time (I2C sensors, motor driver), testing each.'],
    answer: '**Power section first, current-limited, then one subsystem at a time** — a fault then has only one place to hide.',
  },
  tryIt: 'Install KiCad and design a small LED + button board (the syllabus Implement mission): schematic, footprints, ERC, layout, DRC — fix and explain every DRC error.',
  mistakes: [['Decoupling capacitors far from the IC', 'Place them right at the power pins.'], ['Motor traces near sensor signals', 'Separate high-current and sensitive areas.'], ['Assembling everything before the first power-up', 'Bring up in sections with a current-limited supply.']],
  check: ['pcb-1', 'pc-a', 'comp-1'],
  challenge: { prompt: 'Design a robot carrier board in KiCad (ESP32, motor driver, I2C header, power input with protection) and share the schematic and layout in your repository (the syllabus Create mission).' },
  summary: ['Schematic → footprints → ERC → layout → DRC → Gerbers.', 'Decoupling, ground plane, separate motor and sensor areas.', 'Bring up in sections.'],
  cards: [['Schematic symbol vs footprint', 'Symbol: electrical function. Footprint: physical copper pads.', 'concept']],
});
