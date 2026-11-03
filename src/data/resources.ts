import type { Resource } from './types';

// Links point to official manufacturer documentation, project homepages and recognised
// education sites. Books link to an Open Library search instead of a guessed store page.
const book = (q: string) => `https://openlibrary.org/search?q=${encodeURIComponent(q)}`;

export const RESOURCES: Resource[] = [
  // Electronics
  { id: 'r-sf-ohm', title: 'Voltage, Current, Resistance, and Ohm\'s Law', type: 'Course notes', topic: 'Electronics', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/voltage-current-resistance-and-ohms-law', description: 'Clear introduction to the four core quantities with diagrams.' },
  { id: 'r-sf-series', title: 'Series and Parallel Circuits', type: 'Course notes', topic: 'Electronics', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/series-and-parallel-circuits', description: 'How current and voltage behave in series and parallel networks.' },
  { id: 'r-sf-divider', title: 'Voltage Dividers', type: 'Course notes', topic: 'Electronics', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/voltage-dividers', description: 'Divider equation, applications and loading effects.' },
  { id: 'r-sf-pullup', title: 'Pull-up Resistors', type: 'Course notes', topic: 'Electronics', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/pull-up-resistors', description: 'Why floating inputs misbehave and how to choose pull-up values.' },
  { id: 'r-sf-caps', title: 'Capacitors', type: 'Course notes', topic: 'Electronics', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/capacitors', description: 'Capacitor types, decoupling and RC behaviour.' },
  { id: 'r-sf-diodes', title: 'Diodes', type: 'Course notes', topic: 'Electronics', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/diodes', description: 'Forward voltage, rectifiers, LEDs and flyback protection.' },
  { id: 'r-sf-transistors', title: 'Transistors', type: 'Course notes', topic: 'Electronics', difficulty: 2, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/transistors', description: 'BJTs and MOSFETs as switches and amplifiers.' },
  { id: 'r-sf-schematic', title: 'How to Read a Schematic', type: 'Course notes', topic: 'Electronics', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/how-to-read-a-schematic', description: 'Symbols, net labels and reference designators.' },
  { id: 'r-sf-multimeter', title: 'How to Use a Multimeter', type: 'Course notes', topic: 'Electronics', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/how-to-use-a-multimeter', description: 'Measuring voltage, current, resistance and continuity safely.' },
  { id: 'r-aac', title: 'All About Circuits — Textbook', type: 'Reference', topic: 'Electronics', difficulty: 2, source: 'All About Circuits', url: 'https://www.allaboutcircuits.com/textbook/', description: 'Free online textbook covering DC, AC, semiconductors and digital.' },
  { id: 'r-pefi', title: 'Practical Electronics for Inventors (Scherz & Monk)', type: 'Textbook', topic: 'Electronics', difficulty: 2, source: 'Open Library', url: book('Practical Electronics for Inventors'), description: 'Practical reference for hobbyists and engineers.' },
  { id: 'r-aoe', title: 'The Art of Electronics (Horowitz & Hill)', type: 'Textbook', topic: 'Electronics', difficulty: 3, source: 'artofelectronics.net', url: 'https://artofelectronics.net/', description: 'The deep classic — best after the basics.' },

  // Digital
  { id: 'r-sf-binary', title: 'Binary', type: 'Course notes', topic: 'Digital', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/binary', description: 'Bits, bytes and binary arithmetic.' },
  { id: 'r-sf-hex', title: 'Hexadecimal', type: 'Course notes', topic: 'Digital', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/hexadecimal', description: 'Hex notation and conversions.' },
  { id: 'r-sf-logic', title: 'Digital Logic', type: 'Course notes', topic: 'Digital', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/digital-logic', description: 'Gates, truth tables and combinational logic.' },
  { id: 'r-sf-levels', title: 'Logic Levels', type: 'Course notes', topic: 'Digital', difficulty: 2, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/logic-levels', description: '5 V vs 3.3 V logic, thresholds and level shifting.' },

  // C / C++
  { id: 'r-cppref-c', title: 'cppreference — C language', type: 'Reference', topic: 'C programming', difficulty: 2, source: 'cppreference.com', url: 'https://en.cppreference.com/w/c', description: 'Precise reference for C syntax and the standard library.' },
  { id: 'r-cppref-cpp', title: 'cppreference — C++ language', type: 'Reference', topic: 'C++', difficulty: 2, source: 'cppreference.com', url: 'https://en.cppreference.com/w/cpp', description: 'Reference for C++ language features and the standard library.' },
  { id: 'r-king', title: 'C Programming: A Modern Approach (K. N. King)', type: 'Textbook', topic: 'C programming', difficulty: 1, source: 'knking.com', url: 'http://knking.com/books/c2/', description: 'Clear and thorough, with many exercises.' },
  { id: 'r-kr', title: 'The C Programming Language (Kernighan & Ritchie)', type: 'Textbook', topic: 'C programming', difficulty: 2, source: 'Open Library', url: book('The C Programming Language Kernighan Ritchie'), description: 'A short classic — better after the basics.' },
  { id: 'r-making-embedded', title: 'Making Embedded Systems (Elecia White)', type: 'Textbook', topic: 'Embedded', difficulty: 2, source: 'Open Library', url: book('Making Embedded Systems Elecia White'), description: 'Good design habits for embedded software.' },

  // Microcontrollers
  { id: 'r-arduino-ref', title: 'Arduino Language Reference', type: 'Official documentation', topic: 'Arduino', difficulty: 1, source: 'Arduino', url: 'https://docs.arduino.cc/language-reference/', description: 'Official reference for Arduino functions, variables and structure.' },
  { id: 'r-uno', title: 'Arduino Uno Rev3 documentation', type: 'Official documentation', topic: 'Arduino', difficulty: 1, source: 'Arduino', url: 'https://docs.arduino.cc/hardware/uno-rev3/', description: 'Pinout, schematics and specifications for the Uno.' },
  { id: 'r-atmega', title: 'ATmega328P product page & datasheet', type: 'Datasheet', topic: 'Arduino', difficulty: 3, source: 'Microchip', url: 'https://www.microchip.com/en-us/product/ATmega328P', description: 'Registers, peripherals and electrical characteristics of the Uno\'s MCU.' },
  { id: 'r-esp-idf', title: 'ESP-IDF Programming Guide (ESP32)', type: 'Official documentation', topic: 'ESP32', difficulty: 2, source: 'Espressif', url: 'https://docs.espressif.com/projects/esp-idf/en/stable/esp32/', description: 'Official ESP32 hardware and software guide.' },
  { id: 'r-esp-gpio', title: 'ESP32 GPIO & RTC GPIO', type: 'Official documentation', topic: 'ESP32', difficulty: 2, source: 'Espressif', url: 'https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/gpio.html', description: 'Input-only pins, strapping pins and GPIO restrictions.' },
  { id: 'r-arduino-esp32', title: 'Arduino-ESP32 documentation', type: 'Official documentation', topic: 'ESP32', difficulty: 1, source: 'Espressif', url: 'https://docs.espressif.com/projects/arduino-esp32/en/latest/', description: 'Using the ESP32 with the Arduino core, including LEDC and Wi-Fi APIs.' },
  { id: 'r-stm32f446', title: 'STM32F446RE product page', type: 'Datasheet', topic: 'STM32', difficulty: 3, source: 'STMicroelectronics', url: 'https://www.st.com/en/microcontrollers-microprocessors/stm32f446re.html', description: 'Datasheet, reference manual and errata for the Nucleo\'s MCU.' },
  { id: 'r-nucleo', title: 'NUCLEO-F446RE board', type: 'Official documentation', topic: 'STM32', difficulty: 2, source: 'STMicroelectronics', url: 'https://www.st.com/en/evaluation-tools/nucleo-f446re.html', description: 'Board user manual, schematics and pinout.' },
  { id: 'r-cubeide', title: 'STM32CubeIDE', type: 'Official documentation', topic: 'STM32', difficulty: 2, source: 'STMicroelectronics', url: 'https://www.st.com/en/development-tools/stm32cubeide.html', description: 'Official IDE: build, flash and debug.' },
  { id: 'r-cubemx', title: 'STM32CubeMX', type: 'Official documentation', topic: 'STM32', difficulty: 2, source: 'STMicroelectronics', url: 'https://www.st.com/en/development-tools/stm32cubemx.html', description: 'Graphical pin, clock and peripheral configuration.' },
  { id: 'r-platformio', title: 'PlatformIO documentation', type: 'Official documentation', topic: 'Tools', difficulty: 2, source: 'PlatformIO', url: 'https://docs.platformio.org/', description: 'Embedded build system, library manager and unit testing.' },

  // Protocols & peripherals
  { id: 'r-sf-serial', title: 'Serial Communication (UART)', type: 'Course notes', topic: 'Protocols', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/serial-communication', description: 'Baud rates, framing and wiring.' },
  { id: 'r-sf-i2c', title: 'I2C', type: 'Course notes', topic: 'Protocols', difficulty: 2, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/i2c', description: 'Addresses, ACK/NACK, pull-ups and bus signalling.' },
  { id: 'r-sf-spi', title: 'Serial Peripheral Interface (SPI)', type: 'Course notes', topic: 'Protocols', difficulty: 2, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/serial-peripheral-interface-spi', description: 'Chip select, clock modes and full-duplex transfers.' },
  { id: 'r-sf-pwm', title: 'Pulse Width Modulation', type: 'Course notes', topic: 'Peripherals', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/pulse-width-modulation', description: 'Duty cycle, frequency and average voltage.' },
  { id: 'r-sf-adc', title: 'Analog to Digital Conversion', type: 'Course notes', topic: 'Peripherals', difficulty: 1, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/analog-to-digital-conversion', description: 'Resolution, reference voltage and conversion maths.' },
  { id: 'r-mqtt', title: 'MQTT — The Standard for IoT Messaging', type: 'Website', topic: 'IoT', difficulty: 1, source: 'mqtt.org', url: 'https://mqtt.org/', description: 'Protocol overview, specification and client libraries.' },
  { id: 'r-mosquitto', title: 'Eclipse Mosquitto broker', type: 'Official documentation', topic: 'IoT', difficulty: 1, source: 'Eclipse Foundation', url: 'https://mosquitto.org/', description: 'Lightweight MQTT broker to run on your laptop.' },

  // Sensors & drivers (robot parts)
  { id: 'r-tb6612', title: 'TB6612FNG Hookup Guide', type: 'Project reference', topic: 'Robotics', difficulty: 2, source: 'SparkFun Learn', url: 'https://learn.sparkfun.com/tutorials/tb6612fng-hookup-guide', description: 'Wiring, truth table and example code for the robot\'s motor driver.' },
  { id: 'r-bme280', title: 'BME280 environmental sensor', type: 'Datasheet', topic: 'Sensors', difficulty: 2, source: 'Bosch Sensortec', url: 'https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/', description: 'Temperature, humidity and pressure sensor documentation.' },
  { id: 'r-scd40', title: 'SCD40 CO₂ sensor', type: 'Datasheet', topic: 'Sensors', difficulty: 2, source: 'Sensirion', url: 'https://sensirion.com/products/catalog/SCD40', description: 'Photoacoustic CO₂ sensor datasheet and application notes.' },
  { id: 'r-mpu6050', title: 'MPU-6050 6-axis IMU', type: 'Datasheet', topic: 'Sensors', difficulty: 3, source: 'TDK InvenSense', url: 'https://invensense.tdk.com/products/motion-tracking/6-axis/mpu-6050/', description: 'Gyroscope and accelerometer datasheet and register map.' },

  // RTOS & tools
  { id: 'r-freertos', title: 'FreeRTOS', type: 'Official documentation', topic: 'RTOS', difficulty: 2, source: 'FreeRTOS.org', url: 'https://www.freertos.org/', description: 'Kernel documentation, API reference and the free "Mastering the FreeRTOS Real Time Kernel" guide.' },
  { id: 'r-mastering-stm32', title: 'Mastering STM32 (Carmine Noviello)', type: 'Textbook', topic: 'STM32', difficulty: 3, source: 'Open Library', url: book('Mastering STM32 Noviello'), description: 'Detailed STM32 development guide.' },
  { id: 'r-git-book', title: 'Pro Git (free book)', type: 'Reference', topic: 'Tools', difficulty: 1, source: 'git-scm.com', url: 'https://git-scm.com/book/en/v2', description: 'The official, free Git book.' },
  { id: 'r-github-docs', title: 'GitHub Docs', type: 'Official documentation', topic: 'Tools', difficulty: 1, source: 'GitHub', url: 'https://docs.github.com/', description: 'Repositories, pull requests and GitHub Actions.' },
  { id: 'r-unity', title: 'Unity — unit testing for C', type: 'Programming examples', topic: 'Testing', difficulty: 2, source: 'ThrowTheSwitch', url: 'https://github.com/ThrowTheSwitch/Unity', description: 'Lightweight C unit test framework common in embedded projects.' },
  { id: 'r-pulseview', title: 'PulseView (sigrok)', type: 'Official documentation', topic: 'Debugging', difficulty: 2, source: 'sigrok', url: 'https://sigrok.org/wiki/PulseView', description: 'Free logic analyzer software with protocol decoders.' },
  { id: 'r-kicad', title: 'KiCad documentation', type: 'Official documentation', topic: 'PCB', difficulty: 2, source: 'KiCad', url: 'https://docs.kicad.org/', description: 'Schematic capture, PCB layout and manufacturing outputs.' },
  { id: 'r-philslab', title: 'Phil\'s Lab (PCB design videos)', type: 'Video', topic: 'PCB', difficulty: 2, source: 'YouTube', url: 'https://www.youtube.com/@PhilsLab', description: 'Hands-on PCB and hardware design tutorials.' },
  { id: 'r-tlcl', title: 'The Linux Command Line (free book)', type: 'Reference', topic: 'Linux', difficulty: 1, source: 'linuxcommand.org', url: 'https://linuxcommand.org/tlcl.php', description: 'Free book on the shell and core commands.' },

  // Control
  { id: 'r-pid-matlab', title: 'Understanding PID Control (video series)', type: 'Video', topic: 'Control', difficulty: 2, source: 'MathWorks Tech Talks', url: 'https://www.mathworks.com/videos/series/understanding-pid-control.html', description: 'Brian Douglas explains PID intuitively.' },
  { id: 'r-beauregard', title: 'Improving the Beginner\'s PID', type: 'Programming examples', topic: 'Control', difficulty: 2, source: 'Brett Beauregard', url: 'http://brettbeauregard.com/blog/2011/04/improving-the-beginners-pid-introduction/', description: 'Practical PID code issues: windup, derivative kick, sample time.' },

  // Python
  { id: 'r-pytut', title: 'The Python Tutorial', type: 'Official documentation', topic: 'Python', difficulty: 1, source: 'python.org', url: 'https://docs.python.org/3/tutorial/', description: 'Official introduction to Python.' },
  { id: 'r-numpy', title: 'NumPy documentation', type: 'Official documentation', topic: 'Python', difficulty: 2, source: 'NumPy', url: 'https://numpy.org/doc/stable/', description: 'Arrays and numerical computing.' },
  { id: 'r-pandas', title: 'pandas documentation', type: 'Official documentation', topic: 'Python', difficulty: 2, source: 'pandas', url: 'https://pandas.pydata.org/docs/', description: 'DataFrames, time series and resampling.' },
  { id: 'r-matplotlib', title: 'Matplotlib documentation', type: 'Official documentation', topic: 'Python', difficulty: 2, source: 'Matplotlib', url: 'https://matplotlib.org/stable/', description: 'Plotting with labelled axes and saved figures.' },

  // Career
  { id: 'r-dw', title: 'DW Learn German', type: 'Website', topic: 'German', difficulty: 1, source: 'Deutsche Welle', url: 'https://learngerman.dw.com/en/overview', description: 'Free structured German courses including Nicos Weg (A1–B1).' },
  { id: 'r-goethe', title: 'Goethe-Institut — German exams', type: 'Website', topic: 'German', difficulty: 1, source: 'Goethe-Institut', url: 'https://www.goethe.de/en/spr/kup/prf.html', description: 'Official exam information and free practice materials.' },
  { id: 'r-miig', title: 'Make it in Germany', type: 'Website', topic: 'Career', difficulty: 1, source: 'German Federal Government', url: 'https://www.make-it-in-germany.com/en/', description: 'Official information for skilled workers: visas, recognition and job search.' },
  { id: 'r-anabin', title: 'anabin — recognition of foreign qualifications', type: 'Website', topic: 'Career', difficulty: 1, source: 'KMK', url: 'https://anabin.kmk.org/', description: 'Check whether your university and degree are recognised.' },
];
