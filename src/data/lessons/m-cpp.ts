import type { Question } from '../types';
import { L, mc, out, sc, tf } from './helpers';

export const cppLessonQuestions: Question[] = [
  mc('cd-a', 'cpp', 1, 'Which features does C++ add on top of C? (select all)', ['Classes', 'References', 'Namespaces', 'Pointers'], [0, 1, 2], 'Pointers already exist in C. Classes, references, namespaces, overloading and templates are C++ additions.'),
  tf('cd-b', 'cpp', 1, 'An Arduino .ino sketch is compiled as C++.', true, 'The Arduino toolchain compiles sketches with a C++ compiler — that is why Serial.begin() (a method call) works.'),
  sc('cl-a1', 'cpp', 1, 'In a C++ `class`, members are ___ by default.', ['public', 'private', 'protected', 'static'], 1, 'class defaults to private; struct defaults to public.'),
  out('cl-a2', 'cpp', 2, 'What does this print?', 'class Counter {\npublic:\n    void tick() { ++n_; }\n    int value() const { return n_; }\nprivate:\n    int n_ = 0;\n};\nCounter a, b;\na.tick(); a.tick(); b.tick();\nstd::printf("%d %d", a.value(), b.value());', ['2 1'], 'Each object has its own n_: a ticked twice, b once.'),
  sc('co-a', 'cpp', 2, 'Why prefer an explicit `begin()` over hardware set-up in the constructor of a global object on Arduino?', ['Constructors cannot take parameters', 'Global constructors run before the Arduino core initialises the hardware, and their order is unspecified', 'begin() is faster', 'Constructors cannot call functions'], 1, 'Global objects are constructed before setup(); the hardware (e.g. timers, Serial) may not be ready yet.'),
  out('co-b', 'cpp', 2, 'Given `Motor(uint8_t pwm, uint8_t dir) : pwm_pin_(pwm), dir_pin_(dir), speed_(0) {}`, what is `Motor m(5, 6); m.speed()` immediately after construction?', 'Motor m(5, 6);\nstd::printf("%d", m.speed());', ['0'], 'The initialiser list sets speed_ to 0.'),
  sc('en-a', 'cpp', 2, 'What is the main benefit of making `speed_` private with a public `set_speed()`?', ['It uses less RAM', 'set_speed can enforce limits (clamping) so speed_ is always valid', 'Private members are faster', 'It allows multiple inheritance'], 1, 'Encapsulation lets the class guarantee its invariants.'),
  sc('in-a', 'cpp', 2, 'A base class `Sensor` declares `virtual float read() = 0;`. What does `= 0` mean?', ['read() returns 0', 'read() is pure virtual: derived classes must implement it, and Sensor cannot be instantiated', 'read() is inline', 'read() is static'], 1, 'A pure virtual function makes the class abstract.'),
  tf('in-b', 'cpp', 2, 'Calling a virtual function costs a small amount of extra time and memory (a vtable lookup).', true, 'Each polymorphic class has a vtable and each object a vtable pointer; calls go through it.'),
  out('rf-a', 'cpp', 1, 'What does this print?', 'void reset(int &x) { x = 0; }\nint speed = 120;\nreset(speed);\nstd::printf("%d", speed);', ['0'], 'A reference is an alias — reset changes the caller\'s variable.'),
  tf('rf-b', 'cpp', 1, 'A C++ reference can be null and can be re-bound to another variable later.', false, 'References must be bound at creation, cannot be null and always refer to the same object.'),
  out('tp-a', 'cpp', 2, 'What does this print?', 'template <typename T>\nT clamp(T v, T lo, T hi) { return v < lo ? lo : (v > hi ? hi : v); }\nstd::printf("%d %.1f", clamp(300, -255, 255), clamp(1.5, 0.0, 1.0));', ['255 1.0'], 'The template is instantiated for int and for double.'),
  sc('sl-a', 'cpp', 2, 'Which container has a fixed size known at compile time and never allocates on the heap?', ['std::vector', 'std::string', 'std::array', 'std::map'], 2, 'std::array<T, N> is a fixed-size array with bounds-aware helpers and no dynamic allocation.'),
  sc('oe-a', 'cpp', 2, 'Which design best suits an embedded motor driver class?', ['Allocates buffers with new in every call', 'begin() for set-up, small methods, no hidden allocation, clamped inputs', 'Throws exceptions on every error', 'Uses std::vector to store pin numbers'], 1, 'Predictable timing and memory: explicit set-up, no hidden allocation, validated inputs.'),
];

export const cppDifferences = L({
  id: 'cpp-differences', title: 'C and C++ differences', topic: 'cpp', minutes: 12,
  objectives: ['List the C++ features useful in embedded work', 'Recognise C++ in Arduino and ESP32 code', 'Keep a project\'s C and C++ style consistent'],
  why: `Arduino sketches and most ESP32 libraries are C++. \`Serial.begin()\`, \`Wire.beginTransmission()\` and \`WiFi.status()\` are method calls on objects. You need enough C++ to read and write them confidently — not the whole language.`,
  visual: { md: '| Feature | C | C++ | Embedded verdict |\n|---|---|---|---|\n| Classes, encapsulation | — | ✓ | Use |\n| References | — | ✓ | Use |\n| Namespaces, enum class | — | ✓ | Use |\n| constexpr | — | ✓ | Use |\n| Overloading, templates | — | ✓ | Use sparingly |\n| new / delete, STL containers | malloc | ✓ | Caution on small MCUs |\n| Exceptions, RTTI | — | ✓ | Usually disabled |', caption: 'The useful subset of C++ for firmware.' },
  theory: `Most C compiles as C++ (with a few differences: C++ needs casts from \`void*\`, has stricter type checking, and \`bool\` is built in).

#### What C++ adds
- **Classes** bundle data with the functions that guard it.
- **References** (\`int &x\`) — aliases without pointer syntax.
- **Namespaces** (\`namespace motor { … }\`) prevent name clashes.
- **enum class** — scoped, type-safe enums.
- **constexpr** — values computed at compile time, no RAM cost.
- **Overloading** — \`log(int)\` and \`log(float)\`.

#### What to approach carefully
Frequent \`new\`, large STL containers, exceptions and heavy templates can cost RAM, flash and timing predictability — check before using them on an Uno.

#### Consistency
Choose one style per project (e.g. C drivers + C++ application classes) and stick to it. In an interview, justify every feature by its benefit.`,
  worked: {
    problem: 'Convert C-style constants into idiomatic embedded C++:\n\n```c\n#define LED_PIN 13\n#define MODE_IDLE 0\n#define MODE_RUN 1\n```',
    steps: ['Pins become typed compile-time constants: `constexpr uint8_t kLedPin = 13;`', 'Modes become a scoped enum: `enum class Mode : uint8_t { Idle, Run };`', 'Usage: `Mode m = Mode::Run;` — cannot be mixed up with an int by accident.'],
    answer: '`constexpr uint8_t kLedPin = 13;` and `enum class Mode : uint8_t { Idle, Run };` — same zero runtime cost as #define, with type checking.',
  },
  tryIt: 'Open an Arduino library you use (e.g. Wire or Servo) and find: one class, one method, one constructor and one place it uses a C-style API underneath. List them in your notes.',
  mistakes: [['Using advanced features to look clever', 'Every feature must earn its place by a concrete benefit.'], ['Mixing malloc/free with new/delete for the same object', 'Pair new with delete, malloc with free — or avoid both.'], ['Assuming the full standard library is available', 'Many embedded toolchains ship a reduced library; check first.']],
  check: ['cd-a', 'cd-b', 'cpp-4'],
  challenge: { prompt: 'Rewrite three #define constants from your own project as constexpr and one set of #define modes as an enum class. Confirm the binary size does not grow.' },
  summary: ['Use classes, references, namespaces, enum class, constexpr.', 'Be careful with new, STL containers, exceptions and heavy templates.', 'Justify features by benefit, keep style consistent.'],
  cards: [['constexpr vs #define', 'Both compile-time; constexpr is typed and scoped', 'concept']],
});

export const cppClasses = L({
  id: 'cpp-classes', title: 'Classes and objects', topic: 'cpp', minutes: 14,
  objectives: ['Define a class with data members and methods', 'Create objects and call methods', 'Use const member functions'],
  why: `Each motor, sensor and LED on your robot is a natural object: it has pins (data) and behaviour (methods). Two motors become two objects of one class — no duplicated code.`,
  visual: { md: '| Motor (class) | |\n|---|---|\n| **private** | `uint8_t pwm_pin_, dir_pin_`<br>`int16_t speed_` |\n| **public** | `Motor(uint8_t pwm, uint8_t dir)`<br>`void begin()`<br>`void set_speed(int16_t)`<br>`int16_t speed() const` |', caption: 'A class diagram: private data, public interface.' },
  theory: `\`\`\`cpp
class Motor {
public:
    Motor(uint8_t pwm_pin, uint8_t dir_pin) : pwm_pin_(pwm_pin), dir_pin_(dir_pin) {}
    void begin() { pinMode(pwm_pin_, OUTPUT); pinMode(dir_pin_, OUTPUT); }
    void set_speed(int16_t s) {
        speed_ = s > 255 ? 255 : (s < -255 ? -255 : s);
        digitalWrite(dir_pin_, speed_ >= 0);
        analogWrite(pwm_pin_, speed_ >= 0 ? speed_ : -speed_);
    }
    int16_t speed() const { return speed_; }
private:
    uint8_t pwm_pin_, dir_pin_;
    int16_t speed_ = 0;
};

Motor left(5, 7), right(6, 8);   // two objects, one class
\`\`\`

- **Data members** hold each object's state (trailing \`_\` is a common naming convention).
- **Methods** operate on that object; inside, members are accessed directly.
- **const methods** (\`speed() const\`) promise not to modify the object.
- \`class\` defaults to **private**; \`struct\` to public.`,
  worked: {
    problem: 'Write a minimal `Led` class with on(), off(), toggle() and is_on().',
    steps: ['Private state: pin number and a bool on_.', 'Methods change on_ and write the pin.', 'is_on() is const because it only reads.'],
    answer: '```cpp\nclass Led {\npublic:\n    explicit Led(uint8_t pin) : pin_(pin) {}\n    void begin() { pinMode(pin_, OUTPUT); off(); }\n    void on()  { on_ = true;  digitalWrite(pin_, HIGH); }\n    void off() { on_ = false; digitalWrite(pin_, LOW); }\n    void toggle() { on_ ? off() : on(); }\n    bool is_on() const { return on_; }\nprivate:\n    uint8_t pin_;\n    bool on_ = false;\n};\n```',
  },
  tryIt: 'Create two Led objects on different pins and blink them at different rates without delay(), using one millis() timer per object stored inside the class.',
  mistakes: [['Making every member public', 'Expose only what callers need.'], ['Forgetting const on getters', 'Getters should be const so they work on const objects.'], ['Doing hardware set-up in a global constructor', 'Use begin() called from setup().']],
  check: ['cl-a1', 'cl-a2', 'cpp-3'],
  challenge: { prompt: 'Complete the Led class in the lab and pass its tests.', exerciseId: 'lab-cpp-led-class' },
  summary: ['A class bundles data and methods; objects are instances.', 'Members private by default in a class.', 'const methods do not modify the object.'],
  cards: [['class vs struct default access', 'class: private · struct: public', 'concept']],
});

export const cppConstructors = L({
  id: 'cpp-constructors', title: 'Constructors', topic: 'cpp', minutes: 12,
  objectives: ['Write constructors with initialiser lists', 'Use explicit and default member initialisers', 'Separate construction from hardware initialisation'],
  why: `Objects should start in a valid state. On microcontrollers, though, global objects are constructed *before* the hardware is ready — so knowing what belongs in a constructor and what belongs in \`begin()\` avoids mysterious start-up bugs.`,
  visual: { flow: ['Global objects constructed', 'Arduino core init()', 'setup(): call begin()', 'loop() runs forever'], caption: 'Start-up order: global constructors run before the hardware is initialised.' },
  theory: `\`\`\`cpp
class Encoder {
public:
    explicit Encoder(uint8_t pin_a, uint8_t pin_b, uint16_t counts_per_rev)
        : pin_a_(pin_a), pin_b_(pin_b), cpr_(counts_per_rev) {}   // initialiser list
    void begin();          // pinMode, attachInterrupt — hardware set-up here
private:
    uint8_t  pin_a_, pin_b_;
    uint16_t cpr_;
    volatile int32_t ticks_ = 0;                                  // default member initialiser
};
\`\`\`

- **Initialiser lists** construct members directly (required for const and reference members).
- Members are initialised in **declaration order**, not list order — keep them consistent to avoid warnings.
- **explicit** stops accidental conversions (\`Encoder e = 5;\` won't compile).
- **Default member initialisers** (\`= 0\`) give safe defaults.

#### Constructor vs begin()
Constructor: store configuration. \`begin()\`: touch hardware (pins, interrupts, I2C). Global constructor order across files is unspecified — never rely on another global object inside a constructor.`,
  worked: {
    problem: 'This class misbehaves when declared globally: `Sensor(…) { Wire.begin(); id_ = read_id(); }`. Fix it.',
    steps: ['The constructor runs before setup(), possibly before the core and Wire are ready.', 'Move Wire.begin() and read_id() into a begin() method that returns success.', 'Call sensor.begin() from setup() and check the result.'],
    answer: '```cpp\nbool Sensor::begin() {\n    Wire.begin();\n    id_ = read_id();\n    return id_ == EXPECTED_ID;\n}\n```\nConstruction stores settings; begin() talks to hardware and reports failure.',
  },
  tryIt: 'Add a constructor to your Led class that takes the pin and an optional `active_low` flag with a default value. Use `explicit` and an initialiser list.',
  mistakes: [['Hardware access in global constructors', 'Use begin() from setup().'], ['Initialiser list order differs from declaration order', 'Match the declaration order (-Wreorder warns).'], ['Implicit conversions from single-argument constructors', 'Mark them explicit.']],
  check: ['co-a', 'co-b', 'cpp-1'],
  challenge: { prompt: 'Write an Encoder class skeleton with a constructor (configuration) and begin() (attachInterrupt). Explain in a comment why the split matters.' },
  summary: ['Initialiser lists construct members directly.', 'explicit prevents accidental conversions.', 'Constructors store config; begin() touches hardware.'],
  cards: [['Why begin() instead of constructor on Arduino?', 'Global constructors run before hardware init; order across files is unspecified', 'concept']],
});

export const cppEncapsulation = L({
  id: 'cpp-encapsulation', title: 'Encapsulation', topic: 'cpp', minutes: 11,
  objectives: ['Protect class invariants with private members', 'Design minimal public interfaces', 'Use const correctness to communicate intent'],
  why: `If any code can write \`motor.speed_ = 9000\`, nothing guarantees the PWM stays in range. Encapsulation lets the Motor class promise its speed is always valid — the same idea as file-scope static in C, but per object.`,
  visual: { flow: ['Caller', 'Public method: set_speed(400)', 'Validation: clamp to ±255', 'Private state: speed_ = 255'], caption: 'All writes go through the public interface, which enforces the rules.' },
  theory: `**Invariant:** something that must always be true about an object (speed in −255…255; state is a valid enum).

- Make data **private**; offer methods that keep the invariant.
- Keep the public interface **small**: what callers need, nothing more.
- Return values, not pointers to internals (otherwise callers can bypass the rules).
- Mark read-only methods **const** and read-only parameters \`const T&\`.

\`\`\`cpp
class PidController {
public:
    void set_gains(float kp, float ki, float kd);   // validates ≥ 0
    float update(float setpoint, float measured, float dt_s);
    void reset();                                     // clears integral
private:
    float kp_ = 0, ki_ = 0, kd_ = 0, integral_ = 0, prev_error_ = 0;
};
\`\`\`
Callers cannot corrupt \`integral_\` — a common cause of windup bugs.`,
  worked: {
    problem: 'Code elsewhere sets `pid.integral_ = 0` when the robot stops. How should the class support that safely?',
    steps: ['Make integral_ private so outside code cannot touch it.', 'Add a public reset() that clears integral_ and prev_error_.', 'Callers now express intent ("reset the controller") instead of poking state.'],
    answer: 'A **reset()** method. The class keeps control of its state, and you can add more cleanup later without changing callers.',
  },
  tryIt: 'Take your Motor class and try to assign `speed_` from setup(). Read the compiler error, then add the missing public method instead.',
  mistakes: [['Public data "for convenience"', 'Add a method that enforces the invariant.'], ['Getters returning non-const references to internals', 'Return by value or const reference.'], ['Bloated interfaces', 'Remove methods no caller needs.']],
  check: ['en-a', 'cpp-1', 'cpp-3'],
  challenge: { prompt: 'Design a PidController class interface (header only) whose invariants are: gains ≥ 0, output always within the configured limits. List which methods enforce each.' },
  summary: ['Private data, public methods that keep invariants.', 'Small interfaces are easier to use correctly.', 'const communicates "read-only".'],
  cards: [['Class invariant', 'A condition that must always hold for an object; enforced by private data + methods', 'concept']],
});

export const cppInheritance = L({
  id: 'cpp-inheritance', title: 'Inheritance', topic: 'cpp', minutes: 13,
  objectives: ['Derive classes from a base class', 'Use virtual and pure virtual functions for interfaces', 'Judge when composition is better'],
  why: `Your robot has several distance sensors to choose from (ultrasonic, ToF). A common \`DistanceSensor\` interface lets the obstacle-avoidance code work with any of them — swap hardware without rewriting logic.`,
  visual: { md: '| DistanceSensor (abstract) | | |\n|---|---|---|\n| `virtual bool begin() = 0` | `virtual uint16_t read_mm() = 0` | `virtual ~DistanceSensor() = default` |\n| ↓ UltrasonicSensor | ↓ TofSensor | |\n| trigger/echo timing | I2C register reads | |', caption: 'One interface, two implementations.' },
  theory: `\`\`\`cpp
class DistanceSensor {
public:
    virtual bool begin() = 0;           // pure virtual → abstract class
    virtual uint16_t read_mm() = 0;
    virtual ~DistanceSensor() = default;
};

class UltrasonicSensor : public DistanceSensor {
public:
    UltrasonicSensor(uint8_t trig, uint8_t echo) : trig_(trig), echo_(echo) {}
    bool begin() override { pinMode(trig_, OUTPUT); pinMode(echo_, INPUT); return true; }
    uint16_t read_mm() override { /* pulse timing */ return 0; }
private:
    uint8_t trig_, echo_;
};

void avoid(DistanceSensor &s) { if (s.read_mm() < 200) stop(); }   // works with any sensor
\`\`\`

- \`override\` makes the compiler check you really override a base method.
- A **virtual destructor** is needed if objects are deleted through a base pointer.
- **Cost:** a vtable per class, a pointer per object, an indirect call — small, but not zero.

#### Composition first
"Has-a" is often better than "is-a": a \`Robot\` *has* two \`Motor\`s; it is not a kind of Motor.`,
  worked: {
    problem: 'Should `Robot` inherit from `Motor` to reuse set_speed()?',
    steps: ['Ask: is a Robot a kind of Motor? No — it has motors.', 'Use composition: `class Robot { Motor left_, right_; … };`', 'Robot::drive(v, w) computes wheel speeds and calls left_.set_speed() and right_.set_speed().'],
    answer: '**Composition.** Inherit only for true "is-a" relationships, typically to implement an interface.',
  },
  tryIt: 'Write the DistanceSensor interface and a FakeSensor that returns values from an array. Use it to test your obstacle-avoidance logic on a laptop — no hardware needed.',
  mistakes: [['Forgetting override', 'Always write override; typos then fail to compile instead of silently not overriding.'], ['Missing virtual destructor in a polymorphic base', 'Add virtual ~Base() = default;'], ['Inheritance for code reuse only', 'Prefer composition unless it is truly "is-a".']],
  check: ['in-a', 'in-b', 'cpp-1'],
  challenge: { prompt: 'Implement FakeSensor and unit-test a function `bool should_stop(DistanceSensor&)` with values above and below 200 mm.' },
  summary: ['Pure virtual functions define interfaces.', 'override and virtual destructors prevent subtle bugs.', 'Prefer composition ("has-a") to inheritance.'],
  cards: [['Pure virtual function', 'virtual f() = 0; makes the class abstract', 'code']],
});

export const cppReferences = L({
  id: 'cpp-references', title: 'References', topic: 'cpp', minutes: 11,
  objectives: ['Use references to modify arguments without pointer syntax', 'Pass large objects by const reference', 'Know when a pointer is still the right choice'],
  why: `References make APIs clearer: \`read(sample)\` instead of \`read(&sample)\`, and no NULL checks. Passing large structs by const reference avoids copying them on every call.`,
  visual: { md: '| | Pointer `T*` | Reference `T&` |\n|---|---|---|\n| Can be null | yes | no |\n| Can be re-seated | yes | no |\n| Syntax | `*p`, `p->x`, `&x` at call | like a normal variable |\n| Use when | optional / re-pointable / arrays | always refers to one valid object |', caption: 'Pointer versus reference.' },
  theory: `\`\`\`cpp
void reset(int16_t &speed) { speed = 0; }        // modifies caller's variable
float mean(const AirSample &s);                 // read-only, no copy

int16_t v = 120;
reset(v);       // v is now 0 — no & at the call site
\`\`\`

- A reference is an **alias**: once bound, it always refers to the same object.
- It cannot be null, so no NULL checks are needed.
- \`const T&\` passes large objects cheaply and read-only.
- Small types (int, float, enums) are fine to pass by value.

#### Still use pointers when
- "No object" is a valid value (optional).
- You need to re-point (iterating arrays, linked structures).
- Interfacing with C APIs and hardware registers.

**Danger:** never return a reference to a local variable — it dangles exactly like a pointer would.`,
  worked: {
    problem: 'Rewrite `SensorStatus read_temp(int16_t *out)` in C++ style.',
    steps: ['The output is always required → a reference fits: `SensorStatus read_temp(int16_t &out_tenths_c);`', 'No NULL check needed inside.', 'Call: `int16_t t; if (read_temp(t) == SensorStatus::Ok) …`'],
    answer: '`SensorStatus read_temp(int16_t &out);` — clearer and impossible to pass NULL. Keep the pointer version if callers may want to skip the output.',
  },
  tryIt: 'Write `void swap_ref(int &a, int &b)` and compare it with the pointer version from the C pointers lesson. Which call site reads more clearly?',
  mistakes: [['Returning a reference to a local', 'Return by value instead.'], ['Passing large structs by value repeatedly', 'Use const T&.'], ['Using non-const references for read-only inputs', 'Mark them const.']],
  check: ['rf-a', 'rf-b', 'cpp-5'],
  challenge: { prompt: 'Refactor one function in your own code that takes a pointer to a required output into a reference, and one that takes a large struct by value into const reference.' },
  summary: ['A reference is a non-null alias that cannot be re-seated.', 'const T& for large read-only inputs.', 'Pointers remain right for optional and re-pointable cases.'],
  cards: [['Pass a large struct read-only', 'const T& — no copy, no modification', 'code']],
});

export const cppTemplates = L({
  id: 'cpp-templates', title: 'Basic templates', topic: 'cpp', minutes: 12,
  objectives: ['Write simple function templates', 'Understand that templates are instantiated per type', 'Watch code size when using templates'],
  why: `A clamp, a moving-average filter or a ring buffer is the same logic for int16_t, uint32_t and float. Templates let you write it once, type-safely, with zero runtime cost.`,
  visual: { flow: ['template<typename T> clamp(T, T, T)', 'clamp(300, -255, 255) → int version', 'clamp(1.5, 0.0, 1.0) → double version', 'Two functions in the binary'], caption: 'The compiler generates one copy of the template per type used.' },
  theory: `\`\`\`cpp
template <typename T>
T clamp(T v, T lo, T hi) { return v < lo ? lo : (v > hi ? hi : v); }

template <typename T, size_t N>
class RingBuffer {
public:
    void push(const T &x) { data_[head_] = x; head_ = (head_ + 1) % N; if (count_ < N) ++count_; }
    size_t size() const { return count_; }
private:
    T data_[N]{};
    size_t head_ = 0, count_ = 0;
};

RingBuffer<AirSample, 50> pending;   // fixed size, no heap
\`\`\`

- Templates are **instantiated at compile time** for each type (and size) used.
- No runtime cost, but **each instantiation adds code** — many types → bigger flash.
- Errors in template code can be verbose; read the first line.
- Prefer simple templates; avoid template metaprogramming in firmware.`,
  worked: {
    problem: 'Why does `clamp(300, -255, 255.0)` fail to compile with the clamp template above?',
    steps: ['T is deduced from each argument: int, int and double.', 'The deductions conflict, so the compiler cannot choose T.', 'Fix: make types match (`255`), or specify T: `clamp<double>(300, -255, 255.0)`.'],
    answer: '**Conflicting template argument deduction.** Make all arguments the same type or give T explicitly.',
  },
  tryIt: 'Implement the RingBuffer template, instantiate it for uint16_t and for a struct, and check the flash size difference after adding the second type.',
  mistakes: [['Mixing argument types in a single-T template', 'Use matching types or explicit template arguments.'], ['Instantiating for many types on small MCUs', 'Check flash usage; limit the variety.'], ['Over-engineering with complex templates', 'Keep templates simple and readable.']],
  check: ['tp-a', 'cpp-4', 'sl-a'],
  challenge: { prompt: 'Write `template <typename T> T moving_average(const T *v, size_t n)` and test it with int16_t and float arrays on your laptop.' },
  summary: ['Templates generate type-specific code at compile time.', 'Zero runtime cost, some flash cost per instantiation.', 'Keep them simple.'],
  cards: [['Template cost', 'No runtime overhead; extra code size per instantiation', 'concept']],
});

export const cppStl = L({
  id: 'cpp-stl', title: 'Standard library essentials', topic: 'cpp', minutes: 12,
  objectives: ['Choose embedded-safe standard library facilities', 'Use std::array, algorithms and std::min/max', 'Recognise containers that allocate dynamically'],
  why: `The standard library saves time and bugs — but some parts allocate memory behind your back. On the ESP32 that is often fine; on a 2 KB Uno it can be fatal.`,
  visual: { md: '| Facility | Allocates? | Embedded use |\n|---|---|---|\n| `std::array<T,N>` | no | ✓ fixed buffers |\n| `<algorithm>`: `std::sort`, `std::min`, `std::max`, `std::clamp` (C++17) | no | ✓ |\n| `<cstdint>`, `<cstring>`, `<cmath>` | no | ✓ |\n| `std::vector`, `std::string` | **yes** | ESP32 OK, Uno caution |\n| `std::map`, `std::list` | **yes**, per element | avoid on small MCUs |\n| `std::function` | may allocate | caution |', caption: 'Which parts of the standard library allocate memory.' },
  theory: `#### Embedded-friendly
\`\`\`cpp
#include <array>
#include <algorithm>

std::array<uint16_t, 8> samples{};
std::sort(samples.begin(), samples.end());
uint16_t median = samples[samples.size() / 2];
int16_t pwm = std::clamp<int16_t>(cmd, -255, 255);   // C++17
\`\`\`

#### Allocating containers
\`std::vector\` grows by reallocating — fragmentation and unpredictable timing. If you use one, call \`reserve()\` once at start-up and never grow it later.

#### Availability
The AVR (Uno) toolchain ships **no** C++ standard library by default; ESP32 and STM32 toolchains do. Check before relying on it.

#### Exceptions and RTTI
Often disabled (\`-fno-exceptions -fno-rtti\`) to save flash. Use return codes instead.`,
  worked: {
    problem: 'Compute the median of 5 distance readings to reject an ultrasonic outlier, without heap allocation.',
    steps: ['Store readings in `std::array<uint16_t, 5> r`.', 'Copy and sort: `auto s = r; std::sort(s.begin(), s.end());`', 'Median = s[2]. A single wild reading cannot move it much.'],
    answer: '`std::array` + `std::sort` + index 2 — a robust median filter with no dynamic memory.',
  },
  tryIt: 'On your laptop, implement the median-of-5 filter with std::array and test it with inputs {120, 118, 950, 121, 119}. The result should be 120.',
  mistakes: [['Growing std::vector in a control loop', 'Reserve once or use std::array.'], ['Assuming the STL exists on AVR', 'Check your toolchain.'], ['Throwing exceptions in firmware', 'Use status codes; exceptions are often disabled.']],
  check: ['sl-a', 'cpp-4', 'oe-a'],
  challenge: { prompt: 'Replace a hand-written sort or min/max loop in your project with <algorithm>, and confirm behaviour with a unit test.' },
  summary: ['std::array and <algorithm> are safe and useful.', 'vector/string/map allocate — caution on small MCUs.', 'Exceptions and RTTI are often disabled.'],
  cards: [['Fixed-size container with no heap', 'std::array<T, N>', 'code']],
});

export const cppOopEmbedded = L({
  id: 'cpp-oop-embedded', title: 'OOP for embedded systems', topic: 'cpp', minutes: 14,
  objectives: ['Map peripherals and devices to classes', 'Design classes with explicit set-up and no hidden allocation', 'Compose a robot from device objects'],
  why: `Good embedded C++ looks like a parts list: \`Motor left, right; Encoder enc_l, enc_r; Bme280 env;\`. Each class owns one device, is set up explicitly and behaves predictably — exactly what reviewers and interviewers want to see.`,
  visual: { flow: ['Robot (composition)', 'Motor ×2, Encoder ×2', 'Bme280, Scd40, Mpu6050', 'I2cBus / GPIO / timers'], caption: 'A robot composed of device objects, each owning one piece of hardware.' },
  theory: `#### Design rules
1. **One class per device or peripheral**: Motor, Encoder, Bme280.
2. **Constructor = configuration, begin() = hardware**, returning success.
3. **No hidden allocation**: buffers are members with fixed sizes.
4. **Validate inputs** (clamp speeds, check ranges) inside the class.
5. **Report errors** with return values or a status() method — not exceptions.
6. **Inject dependencies**: pass the I2C bus or a sensor interface in, so you can substitute fakes in tests.

\`\`\`cpp
class Robot {
public:
    Robot(Motor &l, Motor &r, DistanceSensor &d) : left_(l), right_(r), dist_(d) {}
    bool begin() { return left_.begin() && right_.begin() && dist_.begin(); }
    void drive(float v, float w);          // kinematics → wheel speeds
private:
    Motor &left_, &right_;
    DistanceSensor &dist_;
};
\`\`\`

#### Interrupts and classes
An ISR cannot be a normal member function. Use a static function that forwards to an instance, and keep shared members volatile.`,
  worked: {
    problem: 'How do you attach an encoder interrupt to a member of an Encoder object on Arduino?',
    steps: ['attachInterrupt needs a plain function pointer, not a member function.', 'Keep a static pointer to the instance and a static ISR: `static Encoder *instance_; static void isr() { instance_->on_edge(); }`', 'In begin(): `instance_ = this; attachInterrupt(digitalPinToInterrupt(pin_a_), isr, CHANGE);` and make ticks_ volatile.'],
    answer: 'A **static trampoline** forwards the interrupt to the object. (For two encoders, use two static instance pointers or a small table.)',
  },
  tryIt: 'Sketch the class list for your robot: for each class write its constructor parameters, begin() responsibilities, public methods and which hardware it owns.',
  mistakes: [['God objects that do everything', 'One device or responsibility per class.'], ['Hidden new/delete inside classes', 'Fixed-size members; allocate nothing at runtime.'], ['Hard-coded dependencies', 'Pass interfaces in so tests can use fakes.']],
  check: ['oe-a', 'co-a', 'en-a'],
  challenge: { prompt: 'Write header files for Motor, Encoder and Robot following the design rules, and explain each design choice in one comment line.' },
  summary: ['One class per device; compose the robot.', 'Explicit begin(), no hidden allocation, validated inputs.', 'Static trampolines bridge ISRs to objects.'],
  cards: [['ISR to member function', 'Static function forwarding to a stored instance pointer', 'concept']],
});
