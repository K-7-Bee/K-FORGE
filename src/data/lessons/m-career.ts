import type { Question } from '../types';
import { L, mc, out, sc, tf } from './helpers';

export const careerLessonQuestions: Question[] = [
  // ---------- Capstone ----------
  mc('co-c', 'control', 2, 'Which belong to every capstone milestone before it can be completed in K-FORGE? (select all)', ['Every checklist item ticked', 'At least one evidence file', 'A measured result when the milestone defines a metric', 'A perfect result on the first try'], [0, 1, 2], 'Milestones require checklist, evidence and measurements — not perfection. Failed tests are reported honestly.'),
  sc('co-d', 'control', 1, 'Why build the robot in stages and test each before adding the next?', ['It is cheaper', 'When something breaks, only the newest stage can be the cause', 'Stages are required by law', 'It makes the robot faster'], 1, 'Incremental integration localises faults.'),
  // ---------- German ----------
  sc('dea-a', 'german', 1, 'How do you say "My name is …" in German?', ['Ich habe …', 'Ich heiße …', 'Ich bin aus …', 'Ich möchte …'], 1, '"Ich heiße …" (or "Mein Name ist …").'),
  sc('dea-b', 'german', 1, 'What does "Ich studiere Elektrotechnik" mean?', ['I teach electronics', 'I study electrical engineering', 'I repair electronics', 'I like technology'], 1, 'studieren = to study (at university); Elektrotechnik = electrical engineering.'),
  sc('deb-a', 'german', 2, 'Which sentence uses the Perfekt (spoken past) correctly?', ['Ich habe einen Roboter gebaut.', 'Ich bin einen Roboter gebaut.', 'Ich baue gestern einen Roboter.', 'Ich habe einen Roboter bauen.'], 0, 'Perfekt = haben/sein + past participle at the end: "Ich habe … gebaut."'),
  sc('deb-b', 'german', 2, 'Complete: "Ich ___ C programmieren." (I can program C)', ['muss', 'kann', 'will', 'darf'], 1, 'können = can (ability). The infinitive goes to the end.'),
  sc('dec-a', 'german', 2, 'Which word order is correct after "weil"?', ['Ich lerne Deutsch, weil ich möchte in Deutschland arbeiten.', 'Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.', 'Ich lerne Deutsch, weil möchte ich in Deutschland arbeiten.', 'Ich lerne Deutsch, weil in Deutschland ich arbeiten möchte.'], 1, 'In subordinate clauses (weil, dass, wenn) the conjugated verb goes to the end.'),
  sc('dev-a', 'german', 1, 'What is "der Schaltplan"?', ['The circuit board', 'The schematic / circuit diagram', 'The power supply', 'The timetable'], 1, 'der Schaltplan = circuit diagram; die Leiterplatte/Platine = PCB.'),
  sc('dev-b', 'german', 1, 'What is "der Kondensator"?', ['Resistor', 'Capacitor', 'Transistor', 'Connector'], 1, 'der Kondensator = capacitor; der Widerstand = resistor.'),
  sc('det-a', 'german', 2, 'How do you say "The robot measures the air quality"?', ['Der Roboter misst die Luftqualität.', 'Der Roboter messt die Luftqualität.', 'Die Roboter misst der Luftqualität.', 'Der Roboter gemessen die Luftqualität.'], 0, 'messen → er misst (vowel change e → i); die Luftqualität is feminine, accusative "die".'),
  sc('dei-a', 'german', 2, 'What is "das Vorstellungsgespräch"?', ['The job advertisement', 'The job interview', 'The application letter', 'The employment contract'], 1, 'das Vorstellungsgespräch = job interview; die Stellenanzeige = job ad; die Bewerbung = application.'),
  sc('dei-b', 'german', 2, 'Which sentence means "I am applying for the position as an embedded software developer"?', ['Ich bewerbe mich um die Stelle als Embedded-Softwareentwickler.', 'Ich bewerbe die Stelle als Embedded-Softwareentwickler.', 'Ich habe die Stelle als Embedded-Softwareentwickler.', 'Ich suche mich die Stelle.'], 0, '"sich bewerben um (+ Akk.)" = to apply for.'),
  // ---------- Career ----------
  mc('pt-a', 'career', 1, 'What should a strong project README contain? (select all)', ['A one-sentence summary with a photo or video', 'Test results with numbers', 'Known limitations', 'Every line of code pasted into the README'], [0, 1, 2], 'Summary, problem, hardware/software, diagrams, how to build, measured results, problems solved and limitations.'),
  sc('gh-a', 'career', 1, 'What makes a GitHub profile convincing to an embedded hiring manager?', ['Hundreds of forked repositories', 'Two or three pinned, documented projects with tests and measured results', 'A long list of languages', 'Daily commits of trivial changes'], 1, 'Quality, documentation and evidence beat quantity.'),
  sc('cvx-a', 'career', 1, 'How long should a junior engineer\'s CV usually be?', ['One to two pages', 'Five pages', 'Half a page', 'As long as possible'], 0, 'One or two focused pages.'),
  sc('ti-a', 'career', 2, 'An interviewer asks a question you can\'t answer immediately. What is best?', ['Guess confidently', 'Think aloud: state what you know, how you would find out, and what you would test', 'Change the subject', 'Say "I don\'t know" and stop'], 1, 'Interviewers assess reasoning; showing a method is valuable even without the final answer.'),
  sc('eq-a', 'career', 2, 'How should you answer "How do you debug an I2C sensor that doesn\'t respond?"', ['"I would rewrite the driver"', 'Power and ground → SDA/SCL wiring → pull-ups → address via scanner → logic analyzer for the ACK', '"I would try another sensor"', '"I would ask an AI"'], 1, 'Give the ordered method — and a real example from your robot if you have one.'),
  tf('ga-a', 'career', 1, 'Visa and salary rules for working in Germany change, so you should check official sources (e.g. Make it in Germany) before deciding.', true, 'K-FORGE gives orientation, not legal advice. Always verify current official information.'),
  sc('fl-a', 'career', 2, 'Which is a good first freelance job for an embedded learner?', ['Certifying a medical device', 'Connecting a sensor to an ESP32 and showing its data on a dashboard', 'Designing an automotive ECU alone', 'Writing safety-critical firmware without supervision'], 1, 'Start with small, well-defined jobs that use skills you have proven.'),
  mc('cc-a', 'career', 2, 'What should a fixed-price freelance offer state in writing? (select all)', ['Exactly what will be delivered and how it will be tested', 'What is not included', 'Price, milestones and who owns the work', 'Nothing — keep it flexible'], [0, 1, 2], 'Clear scope, exclusions, acceptance tests, price, milestones and ownership prevent disputes.'),
  sc('td-a', 'career', 1, 'When should you write your technical report?', ['After the project is finished', 'As you build — logs, photos and decisions become its evidence', 'Only if asked', 'Before starting any work'], 1, 'Writing as you go captures decisions and results while they are fresh.'),
  out('lt-a', 'career', 2, 'At $50/hour, how many paid hours per month are needed for $7,500 (before tax and unpaid work)?', '7500 / 50 = ?', ['150'], '7 500 / 50 = 150 paid hours per month (≈ 35 per week).'),
];

// ======================= Capstone =======================

export const capstoneOverview = L({
  id: 'capstone-overview', title: 'Capstone overview and workflow', topic: 'control', minutes: 14,
  objectives: ['Explain the robot\'s subsystems and how they connect', 'Plan the 15 milestones as incremental, testable stages', 'Use the project workspace to collect evidence and measurements'],
  why: `The air-quality robot proves your skills to employers: hardware, firmware, control, data and documentation in one working, measured system. Building it in tested stages is how professional teams integrate complex systems.`,
  visual: { diagram: 'robot-top', caption: 'The robot\'s main parts: ESP32, TB6612, sensors, IMU, battery and distance sensor.' },
  theory: `#### Subsystems
| Subsystem | Parts | Lessons |
|---|---|---|
| Power | 2S Li-ion, switch, fuse, buck converter | Regulators, power budget |
| Motion | TB6612, gear motors, encoders | Motor drivers, encoders, PID |
| Sensing | SCD40, BME280, MPU6050, distance sensor | I2C, sensors, IMU, obstacles |
| Control software | FreeRTOS tasks, state machine | RTOS, state machines |
| Data | MQTT, Python analysis | MQTT, pandas, plotting |

#### Workflow (Projects → Air-Quality Monitoring Mobile Robot)
1. Open a milestone: read required knowledge, components, wiring, tasks and testing procedure.
2. Build and test that stage only.
3. Record measurements in **Testing records** (targets set before testing).
4. Upload **evidence**: photos, code, logs, plots.
5. Tick the **checklist** and complete the milestone.
6. Write documentation as you go; the **report generator** assembles it.

#### Gates
Robot drives straight with measured wheel speed → avoids obstacles and streams data → documented results and portfolio.`,
  worked: {
    problem: 'Milestone 5 (wheel encoders) requires "speed accuracy" measured. How do you produce a credible number?',
    steps: ['Set a target before testing: e.g. < 5 % error at 0.2 m/s.', 'Run 10 trials: log target and measured speed for 10 s each.', 'Compute mean absolute error and its spread; record both with conditions (floor, battery).'],
    answer: 'A **pre-set target, repeated trials, mean and spread, stated conditions** — then upload the log and plot as evidence.',
  },
  tryIt: 'Open the capstone workspace, start the project, and write the targets you intend to use for each measured milestone in the Testing records (you can fill in the measured values later).',
  mistakes: [['Building everything before testing anything', 'Integrate one stage at a time.'], ['Measuring without a target', 'Set targets first so results mean something.'], ['Leaving documentation to the end', 'Write it as you build.']],
  check: ['co-c', 'co-d', 'kin-3'],
  challenge: { prompt: 'Start the capstone project and complete milestone 1 (chassis and mechanical assembly) with photos as evidence.' },
  summary: ['Power, motion, sensing, control software, data.', 'Milestone loop: build → test → measure → evidence → checklist.', 'Set targets before testing; report spread honestly.'],
  cards: [['Capstone milestone completion needs', 'Checklist, evidence, and measured results where defined', 'concept']],
});

// ======================= German =======================

export const deA1 = L({
  id: 'de-a1', title: 'A1 fundamentals', topic: 'german', minutes: 14,
  objectives: ['Introduce yourself and talk about your studies', 'Use present tense of regular verbs and sein/haben', 'Build a sustainable weekly German routine'],
  why: `Many German employers require or prefer German, and everyday life needs it. German cannot be crammed in the final months — about 60–150 hours of instruction reach A1 (Goethe-Institut guide). Start now with small daily steps.`,
  visual: { md: '| German | English |\n|---|---|\n| Ich heiße Kaushik. | My name is Kaushik. |\n| Ich komme aus Bangladesch. | I come from Bangladesh. |\n| Ich studiere Elektrotechnik. | I study electrical engineering. |\n| Ich entwickle eingebettete Systeme. | I develop embedded systems. |\n| Ich lerne seit drei Monaten Deutsch. | I have been learning German for three months. |', caption: 'Your first self-introduction.' },
  theory: `#### Present tense (regular verbs)
| | lernen | arbeiten |
|---|---|---|
| ich | lerne | arbeite |
| du | lernst | arbeitest |
| er/sie/es | lernt | arbeitet |
| wir | lernen | arbeiten |
| ihr | lernt | arbeitet |
| sie/Sie | lernen | arbeiten |

**sein:** ich bin, du bist, er ist, wir sind · **haben:** ich habe, du hast, er hat, wir haben.

#### Word order
The conjugated verb is in **position 2**: "Heute **lerne** ich Deutsch."

#### Weekly routine (~5 h, from the syllabus)
- Daily 20 min: flashcards and listening.
- 2× per week 45–60 min: course or textbook.
- 1× per week 30–60 min: speaking with a tutor or partner.
- 1× per week 20 min: write about your project in German.`,
  worked: {
    problem: 'Write a four-sentence introduction for a meetup.',
    steps: ['Name: "Ich heiße …"', 'Origin and studies: "Ich komme aus … und studiere Elektrotechnik."', 'Work: "Ich entwickle eingebettete Systeme."', 'Goal: "Ich möchte in Deutschland arbeiten."'],
    answer: '"Ich heiße Kaushik. Ich komme aus Bangladesch und studiere Elektrotechnik. Ich entwickle eingebettete Systeme. Ich möchte in Deutschland arbeiten."',
  },
  tryIt: 'Record yourself saying your introduction, listen back, and note three words to practise. Add the sentences to your flashcards.',
  mistakes: [['Verb not in position 2', 'Main clauses keep the verb second.'], ['Studying in long irregular bursts', 'Short daily sessions beat weekly marathons.'], ['Only reading, never speaking', 'Speak weekly from the start.']],
  check: ['de-4', 'dea-a', 'dea-b'],
  challenge: { prompt: 'Record a 30–60 s self-introduction in German in the lab.', exerciseId: 'lab-german-intro' },
  summary: ['Ich heiße / komme aus / studiere / entwickle.', 'Verb in position 2.', '~5 h per week, daily practice.'],
  cards: [['Ich entwickle eingebettete Systeme.', 'I develop embedded systems.', 'vocab'], ['Verb position in main clauses', 'Position 2', 'concept']],
});

export const deA2 = L({
  id: 'de-a2', title: 'A2 fundamentals', topic: 'german', minutes: 14,
  objectives: ['Talk about the past with the Perfekt', 'Use modal verbs', 'Describe your daily routine and studies'],
  why: `A2 lets you handle routine tasks and simple conversations — about 150–260 hours of instruction. Telling someone what you built last week is a perfect A2 exercise.`,
  visual: { md: '| Modal | Meaning | Example |\n|---|---|---|\n| können | can | Ich kann C programmieren. |\n| müssen | must | Ich muss den Fehler finden. |\n| wollen | want | Ich will einen Roboter bauen. |\n| möchten | would like | Ich möchte in München arbeiten. |\n| dürfen | may | Darf ich eine Frage stellen? |\n| sollen | should | Ich soll den Bericht schreiben. |', caption: 'Modal verbs: the infinitive goes to the end.' },
  theory: `#### Perfekt (spoken past)
**haben/sein + past participle at the end.**
- Ich **habe** einen Roboter **gebaut**. (bauen → gebaut)
- Ich **habe** den Fehler **gefunden**. (finden → gefunden)
- Ich **bin** nach Berlin **gefahren**. (movement → sein)

Most verbs use **haben**; verbs of movement or change of state (fahren, gehen, kommen, werden) use **sein**.

#### Modal verbs
Conjugated modal in position 2, infinitive at the end: "Ich **kann** heute nicht **kommen**."

#### Daily routine vocabulary
aufstehen (separable: ich stehe um 7 Uhr auf), frühstücken, zur Uni fahren, programmieren, Hausaufgaben machen.`,
  worked: {
    problem: 'Say in German: "Last week I built a circuit and found an error."',
    steps: ['"Last week" = Letzte Woche (time first → verb in position 2).', 'bauen → gebaut, finden → gefunden, both with haben.', 'Letzte Woche habe ich eine Schaltung gebaut und einen Fehler gefunden.'],
    answer: '"Letzte Woche habe ich eine Schaltung gebaut und einen Fehler gefunden."',
  },
  tryIt: 'Write five sentences about what you did on your robot last week using the Perfekt, and two sentences with modal verbs about what you can and want to do next.',
  mistakes: [['Participle not at the end', '"Ich habe … gebaut." — participle last.'], ['haben with movement verbs', 'Use sein: Ich bin gefahren.'], ['Conjugating the infinitive after a modal', '"Ich kann programmieren", not "programmiere".']],
  check: ['deb-a', 'deb-b', 'de-2'],
  challenge: { prompt: 'Write a short German paragraph (6–8 sentences) about your week of study and robot work, using the Perfekt and modal verbs, and ask a tutor or partner to correct it.' },
  summary: ['Perfekt: haben/sein + participle at the end.', 'Modals: modal second, infinitive last.', 'Describe routines and past work.'],
  cards: [['Ich habe den Fehler gefunden.', 'I found the error.', 'vocab'], ['Perfekt with sein', 'Movement / change of state verbs: fahren, gehen, kommen', 'concept']],
});

export const deB1 = L({
  id: 'de-b1', title: 'B1 preparation', topic: 'german', minutes: 15,
  objectives: ['Build subordinate clauses with weil, dass, wenn', 'Give opinions and reasons', 'Plan exam preparation realistically'],
  why: `B1 means managing most everyday and familiar work topics (about 260–490 hours). It opens many doors in Germany. At 5 hours per week it takes 1–2 years, so planning matters.`,
  visual: { md: '| Conjunction | Meaning | Example (verb at the end) |\n|---|---|---|\n| weil | because | …, weil der Sensor zu warm **ist**. |\n| dass | that | Ich denke, dass die Messung stimmt. |\n| wenn | if / when | Wenn das WLAN ausfällt, puffert der Roboter die Daten. |\n| obwohl | although | …, obwohl die Batterie voll **war**. |', caption: 'Subordinate clauses send the conjugated verb to the end.' },
  theory: `#### Subordinate clauses
After **weil, dass, wenn, obwohl, ob**: the conjugated verb goes to the **end**.
- Ich lerne Deutsch, **weil** ich in Deutschland arbeiten **möchte**.
- **Wenn** die Batterie leer **ist**, stoppt der Roboter. (subordinate clause first → main verb comes right after the comma)

#### Opinions and reasons
- Meiner Meinung nach … (verb next): "Meiner Meinung nach ist der PID-Regler zu aggressiv."
- Ich finde, dass … / Ein Vorteil ist … / Ein Nachteil ist …

#### Exam preparation
- Book the exam (e.g. Goethe-Zertifikat B1) when practice tests are consistently strong.
- Train all four skills: reading, listening, writing, speaking.
- Use official practice materials from the exam provider.`,
  worked: {
    problem: 'Combine: "Der Roboter fährt nicht geradeaus." + "Die Motoren sind unterschiedlich." using weil.',
    steps: ['Main clause stays: Der Roboter fährt nicht geradeaus,', 'weil-clause: verb "sind" moves to the end.', 'Der Roboter fährt nicht geradeaus, weil die Motoren unterschiedlich sind.'],
    answer: '"Der Roboter fährt nicht geradeaus, weil die Motoren unterschiedlich sind."',
  },
  tryIt: 'Write a 120-word German text about your robot project: what it does, one problem, and why you chose your solution — using at least three subordinate clauses.',
  mistakes: [['Verb not moved to the end after weil/dass', 'Subordinate clause → verb last.'], ['Booking the exam too early', 'Book when practice tests are strong.'], ['Neglecting listening', 'Practise with audio daily.']],
  check: ['dec-a', 'de-4', 'deb-a'],
  challenge: { prompt: 'Take an official B1 practice test (reading and listening sections), record your scores in your notes, and set a date to retake it.' },
  summary: ['weil/dass/wenn/obwohl → verb at the end.', 'Express opinions with reasons.', 'Book the exam when practice scores are strong.'],
  cards: [['Word order after weil', 'Conjugated verb at the end: …, weil ich arbeiten möchte.', 'concept']],
});

export const deVocab = L({
  id: 'de-vocab', title: 'Engineering vocabulary', topic: 'german', minutes: 12,
  objectives: ['Learn core electronics and embedded vocabulary with articles', 'Recognise technical words in job advertisements', 'Practise vocabulary with spaced repetition'],
  why: `German job ads and colleagues use technical words like Schnittstelle, Inbetriebnahme and Fehlersuche. Knowing them — with the right article — makes listings readable and conversations easier.`,
  visual: { md: '| German | English |\n|---|---|\n| die Spannung | voltage |\n| der Strom | current |\n| der Widerstand | resistor / resistance |\n| der Kondensator | capacitor |\n| der Schaltplan | schematic |\n| die Leiterplatte / Platine | PCB |\n| die Schnittstelle | interface |\n| die Fehlersuche | troubleshooting |\n| das Steuergerät | control unit (ECU) |\n| die Inbetriebnahme | commissioning |\n| die Messung | measurement |\n| der Regler | controller (control loop) |', caption: 'Core engineering vocabulary — always learn the article.' },
  theory: `#### Learn nouns with their article
der (masculine), die (feminine), das (neuter). Patterns help: **-ung, -heit, -keit** → die (die Messung); **-er** for agents often der (der Regler).

#### Compound nouns
German builds long words: Spannung + s + Versorgung = **die Spannungsversorgung** (power supply). The **last** part decides the article.

#### In job ads
- Kenntnisse in C/C++ — knowledge of C/C++
- Erfahrung mit Mikrocontrollern — experience with microcontrollers
- Hardwarenahe Programmierung — hardware-near (embedded) programming
- Fließende Deutschkenntnisse — fluent German

#### Practice
Add these to your Revision Center flashcards and review them daily.`,
  worked: {
    problem: 'What is the article and meaning of "Motorsteuerung"?',
    steps: ['Split: Motor + Steuerung.', 'The last part, Steuerung (-ung), is feminine → die.', 'die Motorsteuerung = motor control.'],
    answer: '**die Motorsteuerung** — motor control.',
  },
  tryIt: 'Find three real German job listings for embedded roles and highlight every technical word. Add the ten most frequent to your flashcards with articles.',
  mistakes: [['Learning nouns without articles', 'Always learn der/die/das with the noun.'], ['Guessing compound articles from the first part', 'The last component decides.'], ['Learning lists without context', 'Use each word in a sentence about your project.']],
  check: ['de-1', 'dev-a', 'dev-b'],
  challenge: { prompt: 'Write ten German sentences describing your robot, each using a different vocabulary word from this lesson.' },
  summary: ['Learn nouns with articles.', 'Compound nouns take the article of the last part.', 'Mine real job ads for vocabulary.'],
  cards: [['die Schnittstelle', 'interface', 'vocab'], ['die Inbetriebnahme', 'commissioning', 'vocab'], ['der Regler', 'controller (control loop)', 'vocab']],
});

export const deTechnical = L({
  id: 'de-technical', title: 'Technical communication', topic: 'german', minutes: 13,
  objectives: ['Describe a system and its function in simple German', 'Report a problem and its cause', 'Present measured results'],
  why: `In a German team you will explain what you built, what went wrong and what you measured. Simple, clear sentences are far more useful than complicated grammar.`,
  visual: { md: '| Purpose | Useful phrase |\n|---|---|\n| Describe | Der Roboter misst … / Das System besteht aus … |\n| Function | Der Sensor erfasst … · Der Mikrocontroller steuert … |\n| Problem | Das Problem war, dass … · Der Motor dreht sich zu langsam. |\n| Cause | Die Ursache war … |\n| Result | Die Abweichung beträgt 3 Prozent. · Wir haben … gemessen. |', caption: 'Phrases for technical explanations.' },
  theory: `#### Describing a system
- Das System **besteht aus** einem ESP32, zwei Motoren und drei Sensoren.
- Der Roboter **misst** die Luftqualität (messen → er misst).
- Der Mikrocontroller **steuert** die Motoren.

#### Problems and causes
- Der Roboter ist nicht geradeaus gefahren.
- **Die Ursache war**, dass die Motoren unterschiedlich schnell sind.
- **Ich habe den Fehler mit dem Logikanalysator gefunden.**

#### Numbers and units
German uses a **decimal comma**: 3,3 Volt; 0,2 Meter pro Sekunde. Percentages: "drei Prozent".

#### Strategy
Short sentences, one idea each. Prepare your project explanation in advance and practise it aloud.`,
  worked: {
    problem: 'Explain in German: "The CO₂ sensor needs about three minutes to settle."',
    steps: ['Subject: Der CO₂-Sensor.', 'Verb: braucht (brauchen) in position 2.', 'Der CO₂-Sensor braucht ungefähr drei Minuten, bis der Messwert stabil ist.'],
    answer: '"Der CO₂-Sensor braucht ungefähr drei Minuten, bis der Messwert stabil ist."',
  },
  tryIt: 'Record yourself explaining your robot in English, then in simple German (the syllabus Create mission). Keep it under two minutes.',
  mistakes: [['Decimal point instead of comma', 'German: 3,3 V.'], ['Overly complex sentences', 'One idea per sentence.'], ['Irregular verb forms (er messt)', 'messen → er misst.']],
  check: ['det-a', 'de-4', 'dev-a'],
  challenge: { prompt: 'Write a five-sentence German summary of one capstone milestone: what you built, a problem, its cause, and the measured result.' },
  summary: ['Describe, explain problems and causes, report results.', 'Decimal comma and units.', 'Short sentences; practise aloud.'],
  cards: [['Die Ursache war …', 'The cause was …', 'vocab'], ['German decimal separator', 'Comma: 3,3 Volt', 'concept']],
});

export const deInterview = L({
  id: 'de-interview', title: 'Interview vocabulary', topic: 'german', minutes: 13,
  objectives: ['Use application and interview vocabulary', 'Introduce your background and projects in an interview', 'Ask polite questions about the role'],
  why: `Even when interviews are in English, German phrases show commitment — and many roles require German. Knowing the vocabulary also lets you read application portals and job ads confidently.`,
  visual: { md: '| German | English |\n|---|---|\n| die Stellenanzeige | job advertisement |\n| die Bewerbung | application |\n| sich bewerben um | to apply for |\n| der Lebenslauf | CV |\n| das Anschreiben | cover letter |\n| das Vorstellungsgespräch | job interview |\n| die Berufserfahrung | work experience |\n| die Kenntnisse | skills / knowledge |\n| das Praktikum | internship |\n| die Werkstudentenstelle | working-student job |', caption: 'Application and interview vocabulary.' },
  theory: `#### Useful sentences
- Ich bewerbe mich um die Stelle als Embedded-Softwareentwickler.
- Ich habe meinen Bachelor in Elektrotechnik im März 2028 abgeschlossen. (or "schließe … ab")
- In meinem Projekt habe ich einen Roboter entwickelt, der die Luftqualität misst.
- Ich habe Erfahrung mit C, FreeRTOS und dem ESP32.
- Meine Stärke ist die systematische Fehlersuche.

#### Polite questions
- Wie sieht ein typischer Arbeitstag aus?
- Welche Mikrocontroller verwenden Sie im Team?
- Gibt es Möglichkeiten zur Weiterbildung?

#### Formal address
Use **Sie** (formal you) with interviewers; "Sehr geehrte Frau …/Sehr geehrter Herr …" in letters.`,
  worked: {
    problem: 'Say: "In my project I developed a robot that measures air quality."',
    steps: ['Start with the time/context: In meinem Projekt → verb next: habe ich … entwickelt.', 'Relative clause with der: einen Roboter, der die Luftqualität misst (verb at the end).', 'In meinem Projekt habe ich einen Roboter entwickelt, der die Luftqualität misst.'],
    answer: '"In meinem Projekt habe ich einen Roboter entwickelt, der die Luftqualität misst."',
  },
  tryIt: 'Prepare a German one-minute "Stellen Sie sich bitte vor" (please introduce yourself) answer and three questions you would ask an interviewer.',
  mistakes: [['Using du with an interviewer', 'Use Sie.'], ['"bewerben" without "sich … um"', '"Ich bewerbe mich um die Stelle."'], ['Memorising without understanding', 'Adapt phrases to your real experience.']],
  check: ['de-3', 'dei-a', 'dei-b'],
  challenge: { prompt: 'Write a short German cover-letter paragraph (Anschreiben) describing your robot project and why you fit an embedded role.' },
  summary: ['Stellenanzeige, Bewerbung, Lebenslauf, Vorstellungsgespräch.', 'sich bewerben um; Sie in interviews.', 'Prepare an introduction and questions.'],
  cards: [['das Vorstellungsgespräch', 'job interview', 'vocab'], ['sich bewerben um', 'to apply for', 'vocab']],
});

// ======================= Career =======================

export const portfolio = L({
  id: 'portfolio', title: 'Portfolio building', topic: 'career', minutes: 13,
  objectives: ['Select two or three strong projects', 'Write READMEs that let an engineer verify your skills in two minutes', 'Present measured results and limitations honestly'],
  why: `Your portfolio is proof. An engineer reviewing applications spends minutes, not hours — they want working hardware, tested code, clear results and honest limitations.`,
  visual: { flow: ['One-sentence summary + photo/video', 'Problem it solves', 'Hardware & software', 'Block + circuit diagrams', 'How to build and run', 'Test results with numbers', 'Problems solved & limitations'], caption: 'Structure of a strong project README.' },
  theory: `#### Choose depth over breadth
Two or three finished, documented projects beat ten half-finished ones. The air-quality robot plus one or two mini-projects (e.g. motor speed controller, Wi-Fi dashboard) cover hardware, firmware, control and data.

#### The README
1. Summary sentence + photo or short video.
2. The problem.
3. Main hardware and software.
4. Block diagram and circuit diagram.
5. How to build and run (exact commands).
6. **Test results with numbers** (targets and measured values).
7. Problems solved and known limitations.

#### Evidence
Code on GitHub, diagrams, photos/video, test data and a short write-up. K-FORGE's **Portfolio** page and report generator help assemble it.

#### Review
Ask someone who hasn't seen the project to read the README and tell you what it does in one sentence.`,
  worked: {
    problem: 'Rewrite a weak README opening: "This is my robot project. It uses ESP32."',
    steps: ['Lead with what it does and a result.', 'Add the key technologies.', '"A FreeRTOS-based ESP32 robot that maps indoor CO₂ and streams data over MQTT; position error 9 ± 4 cm over five targets, 98 % message delivery in a one-hour test."'],
    answer: 'Lead with **function + technologies + measured results** — the reader knows within ten seconds why it matters.',
  },
  tryIt: 'Draft the README for your best project using the seven-part structure. Use K-FORGE\'s Portfolio page to check which measured results you already have.',
  mistakes: [['Many unfinished projects', 'Finish and document two or three.'], ['Claims without numbers', 'Show measured results.'], ['Hiding limitations', 'Honest limitations build trust.']],
  check: ['pt-a', 'car-2', 'car-1'],
  challenge: { prompt: 'Get your README reviewed by someone who hasn\'t seen the project (the syllabus Create mission) and apply their feedback.' },
  summary: ['Two or three strong, documented projects.', 'Seven-part README with measured results.', 'Evidence + honest limitations.'],
  cards: [['Portfolio goal', 'Let an engineer verify your skills in about two minutes', 'concept']],
});

export const githubPresentation = L({
  id: 'github-presentation', title: 'GitHub presentation', topic: 'career', minutes: 11,
  objectives: ['Curate a professional GitHub profile', 'Structure repositories for readers', 'Show engineering discipline through history, tests and CI'],
  why: `Hiring managers click your GitHub link. Pinned, tidy repositories with clear READMEs, sensible commits and tests signal that you work like a professional.`,
  visual: { md: '| Element | Good practice |\n|---|---|\n| Profile README | One paragraph: who you are, focus, links to best projects |\n| Pinned repos | 2–4 best projects, descriptive names |\n| Repo structure | src/, include/, test/, docs/, hardware/ |\n| Commits | small, descriptive messages |\n| Quality | tests, CI badge, license, .gitignore |\n| Safety | no secrets, no build artefacts |', caption: 'What reviewers notice on GitHub.' },
  theory: `#### Repository checklist
- Descriptive name (\`air-quality-robot\`, not \`project2\`) and a one-line description.
- README with the portfolio structure.
- \`LICENSE\` (e.g. MIT) so others know what they may do.
- \`docs/\` for diagrams and the report; \`hardware/\` for KiCad files.
- Tests in \`test/\` and a CI workflow (GitHub Actions) that builds and runs them.

#### History
Small commits with clear messages show how you work. Squash noisy "fix typo" chains before merging if your workflow allows.

#### Never commit
Passwords, Wi-Fi credentials, API keys, large binaries and build outputs.`,
  worked: {
    problem: 'Which GitHub Actions job is most convincing for an embedded repo?',
    steps: ['Build the firmware with PlatformIO in CI (proves it compiles from a clean checkout).', 'Run host unit tests (pio test -e native or gcc + Unity).', 'Show the passing badge in the README.'],
    answer: 'A CI job that **builds the firmware and runs the unit tests** on every push.',
  },
  tryIt: 'Write your GitHub profile README (who you are, what you build, links to your best two repositories) and pin your best projects.',
  mistakes: [['Generic repo names', 'Use descriptive names and descriptions.'], ['Secrets in history', 'Rotate them and use ignored config files.'], ['No license', 'Add one so the code can be reviewed and reused.']],
  check: ['gh-a', 'git-1', 'gt-a'],
  challenge: { prompt: 'Add a GitHub Actions workflow to one repository that builds the code and runs its tests, and put the status badge in the README.' },
  summary: ['Profile README + pinned best projects.', 'Clean structure, license, tests, CI.', 'No secrets or build artefacts.'],
  cards: [['Most convincing CI for firmware repos', 'Build the firmware and run unit tests on every push', 'concept']],
});

export const cv = L({
  id: 'cv', title: 'CV preparation', topic: 'career', minutes: 13,
  objectives: ['Write a focused one-to-two-page CV', 'Write project lines that start with action and end with a measured result', 'Prepare English and German versions'],
  why: `Your CV decides whether an engineer looks at your portfolio at all. Specific, measured project lines stand out among hundreds of "familiar with Arduino" CVs.`,
  visual: { md: '| Weak | Strong |\n|---|---|\n| Worked on a robot using ESP32. | Built a FreeRTOS robot that streams air-quality data over MQTT, with measured position error (9 ± 4 cm) and 98 % message delivery. |\n| Knowledge of PID. | Tuned per-wheel PID speed control to < 3 % steady-state error across floor types and battery levels. |\n| Familiar with many MCUs. | Developed firmware on ATmega328P, ESP32 and STM32F446 (HAL, timers, DMA). |', caption: 'Turning weak CV lines into strong ones.' },
  theory: `#### Structure
1. Contact details, GitHub link, (optional) portfolio link.
2. Short profile: 2–3 lines on your focus.
3. **Projects** (for juniors, often before experience).
4. Experience (internships, working-student jobs, teaching assistant).
5. Education: degree, expected graduation date.
6. Skills — only what you can demonstrate in an interview.
7. Languages with levels (e.g. German B1 — CEFR; English C1).

#### Project lines
**Action verb + what + how + measured result.**

#### Germany specifics
- A German version for German-language listings.
- A tabular CV ("tabellarischer Lebenslauf") is common; follow the employer's instructions about photos and personal details.

#### Tailor
Match the keywords of each job listing — honestly.`,
  worked: {
    problem: 'Improve: "Did a temperature monitor with BME280."',
    steps: ['Action + what: "Built an I2C temperature monitor with a BME280 and a moving-average filter module".', 'How: "logging CSV over serial and plotting in Python".', 'Result: "measured noise 0.03 °C (std) and a 0.5 °C offset against a reference".'],
    answer: '"Built an I2C temperature monitor (BME280) with a moving-average filter and Python analysis; measured 0.03 °C noise and corrected a 0.5 °C offset against a reference."',
  },
  tryIt: 'Write three CV lines for projects you have actually done, each with a number from your own tests.',
  mistakes: [['Listing skills you cannot demonstrate', 'Only claim what you can discuss in depth.'], ['No numbers', 'Add measured results.'], ['One CV for every job', 'Tailor keywords to each listing.']],
  check: ['car-1', 'cvx-a', 'pt-a'],
  challenge: { prompt: 'Write three results-focused CV lines in the lab.', exerciseId: 'lab-cv-line' },
  summary: ['1–2 focused pages.', 'Action + what + how + measured result.', 'English and German versions; tailor honestly.'],
  cards: [['CV project line formula', 'Action verb + what + how + measured result', 'concept']],
});

export const techInterviews = L({
  id: 'tech-interviews', title: 'Technical interviews', topic: 'career', minutes: 13,
  objectives: ['Explain your projects with the STAR structure', 'Solve coding and design questions while thinking aloud', 'Tell a convincing debugging story'],
  why: `Interviews test how you think, not just what you know. A structured, honest explanation of a real bug you found is often the strongest moment of an interview.`,
  visual: { flow: ['Situation', 'Task', 'Action (your steps)', 'Result (measured)', 'Reflection: what you learned'], caption: 'STAR(+R) structure for project and behavioural answers.' },
  theory: `#### Typical formats
- Project deep-dive: "Explain your robot's architecture."
- Fundamentals: volatile, pointers, interrupts, RTOS primitives, protocols.
- Coding: bit manipulation, ring buffers, parsing, state machines — often on a whiteboard or shared editor.
- Debugging/design: "The ESP32 resets when the motors start. What do you do?"

#### Think aloud
State assumptions, outline the approach, write clean code, test with examples (including edge cases), discuss complexity and memory.

#### The debugging story
Use STAR: situation (robot curved), task (drive straight), action (measured PWM-speed curves, found a dead-band mismatch, implemented PID), result (lateral error from 12 cm to 2 cm over 2 m), reflection.

#### Prepare
Practise explaining every line of your portfolio code without notes — the syllabus "explain test".`,
  worked: {
    problem: 'Question: "Implement a function that returns how many bits are set in a uint32_t." Outline your answer.',
    steps: ['Clarify: input range, performance needs.', 'Simple loop: while (x) { count += x & 1u; x >>= 1; } — O(32).', 'Improve: Kernighan\'s trick x &= x − 1 clears the lowest set bit — O(set bits); mention __builtin_popcount.', 'Test: 0 → 0, 0xFFFFFFFF → 32, 0x80000001 → 2.'],
    answer: 'Clarify → simple solution → improvement → tests. The process matters as much as the final code.',
  },
  tryIt: 'Record yourself answering "Tell me about a bug you found and how you proved the cause" in under three minutes, using STAR. Watch it and tighten it.',
  mistakes: [['Silent coding', 'Think aloud.'], ['Skipping tests of your solution', 'Walk through edge cases.'], ['Vague project stories', 'Use STAR with measured results.']],
  check: ['ti-a', 'eq-a', 'dbg-1'],
  challenge: { prompt: 'Practise three coding questions (bit counting, ring buffer, string parsing) on paper with a timer, then check them by compiling with tests.' },
  summary: ['STAR(+reflection) for stories.', 'Think aloud, test edge cases.', 'Know every line of your portfolio.'],
  cards: [['STAR', 'Situation, Task, Action, Result (+ Reflection)', 'concept']],
});

export const embeddedInterviewQ = L({
  id: 'embedded-interview-q', title: 'Embedded interview questions', topic: 'career', minutes: 15,
  objectives: ['Answer the most common embedded interview questions precisely', 'Connect answers to your own project experience', 'Spot follow-up questions and prepare for them'],
  why: `A handful of questions appear in almost every embedded interview. Answering them precisely — with an example from your robot — sets you apart.`,
  visual: { md: '| Question | Key points |\n|---|---|\n| What does volatile do? | Forces re-reads; for ISR-shared and hardware registers; not atomic |\n| Debug an unresponsive I2C sensor? | Power → wiring → pull-ups → address/scan → analyzer (ACK) |\n| Mutex vs semaphore? | Mutex: resource lock, ownership, priority inheritance. Semaphore: signalling, ISR-safe give |\n| Improve battery life? | Measure first; sleep modes, duty cycling, lower clock, efficient regulator, turn off radios |\n| Stack vs heap? | Locals/frames vs dynamic; fragmentation risk on MCUs |\n| Polling vs interrupts? | Latency, CPU use, complexity trade-offs |', caption: 'The classics and what a strong answer covers.' },
  theory: `#### volatile
"It tells the compiler the value may change outside the normal program flow — an ISR or hardware — so every access must really read memory. I used it for my encoder tick counter. It doesn't make access atomic: on the Uno I still copied the 16-bit counter with interrupts disabled."

#### Battery life
"First measure: average and peak current per subsystem. Then: sleep between samples (the SCD40 only updates every 5 s), lower CPU frequency, switch the radio off between MQTT bursts, use a buck instead of a linear regulator, and verify the improvement with a runtime test."

#### Follow-ups to expect
- "Why not just disable interrupts everywhere?" (latency, missed events)
- "What's priority inversion?" (low task holds mutex, medium task preempts; inheritance fixes it)
- "How did you test that?" — always have numbers ready.`,
  worked: {
    problem: 'Answer: "What is the difference between a mutex and a binary semaphore?"',
    steps: ['Purpose: mutex protects a shared resource; semaphore signals an event.', 'Ownership: only the task that took a mutex should give it; any task or ISR can give a semaphore.', 'Priority inheritance: mutexes have it (prevents priority inversion); semaphores don\'t.', 'Example: I2C bus guarded by a mutex; sensor data-ready ISR wakes a task with a semaphore/notification.'],
    answer: 'Purpose, ownership, priority inheritance — plus a concrete example from your robot.',
  },
  tryIt: 'Write your own answers to the six classic questions above in your notes, each with an example from your projects, and practise saying them aloud in under 90 seconds each.',
  mistakes: [['Textbook answers without examples', 'Tie each answer to your project.'], ['Overclaiming', 'Say what you did and what you would check.'], ['Forgetting follow-ups', 'Prepare the "why" and "how did you test it".']],
  check: ['eq-a', 'kw-1', 'rtos-3'],
  challenge: { prompt: 'Do a mock interview with a friend (or record yourself) using the six classic questions, and note which answers lacked a concrete example.' },
  summary: ['volatile, I2C debugging, mutex vs semaphore, battery life, stack vs heap, polling vs interrupts.', 'Precise answer + your own example.', 'Prepare follow-ups.'],
  cards: [['volatile in one sentence', 'Forces every access to read memory because the value can change outside normal flow; not atomic', 'concept']],
});

export const germanyApps = L({
  id: 'germany-apps', title: 'Germany job application preparation', topic: 'career', minutes: 14,
  objectives: ['Check degree recognition with official sources', 'Research the German embedded job market with real listings', 'Plan applications, documents and timeline'],
  why: `A job in Germany is your first target. Preparation — recognised qualifications, the right documents, evidence of skills and German progress — matters as much as technical skill. Rules change, so you must learn to check official sources yourself.`,
  visual: { flow: ['Check degree on anabin (ZAB if unclear)', 'Collect 20 real job listings', 'Count required skills & languages', 'Update learning plan', 'Prepare CV (EN/DE), portfolio, certificates', 'Apply and track'], caption: 'An evidence-driven application plan.' },
  theory: `#### Official sources (check current rules)
- **anabin** (KMK): is your university and degree recognised? If unclear, the ZAB can issue a statement of comparability.
- **Make it in Germany** (federal government portal): visas such as the EU Blue Card and the Opportunity Card, recognition, job search.
- Salary thresholds and visa requirements change yearly — always use the current official figures. This lesson is orientation, not legal advice.

#### Market research
Collect **20 real junior embedded listings** (e.g. company career pages, StepStone, LinkedIn, the Federal Employment Agency's job board). Count the most frequent skills (C/C++, RTOS, STM32, CAN, Python, Git) and language requirements. Update your plan from that evidence.

#### Documents
- CV (English and German versions), cover letter (Anschreiben) per role.
- Degree certificates and transcripts (translations if required).
- Language certificates (e.g. Goethe B1).
- Portfolio / GitHub link with measured results.

#### Tracking
Keep a table: company, role, date applied, contact, status, follow-up date.`,
  worked: {
    problem: 'From 20 listings you count: C (19), C++ (14), RTOS (11), STM32 (9), CAN (8), Python (12), German B2 required (7). How do you adjust your plan?',
    steps: ['C, RTOS, STM32 and Python are covered by K-FORGE phases 3, 8, 9 and 11 — prioritise finishing them with evidence.', 'CAN appears in 40 % of listings — schedule the "Later: CAN bus" topic sooner, especially for automotive roles.', '35 % require German B2 — keep the German routine; target roles requiring B1 or English first.'],
    answer: 'Let the **evidence reorder priorities**: move CAN earlier, keep German steady, and target listings that match your current level.',
  },
  tryIt: 'Create a job-listing tracker (spreadsheet or K-FORGE note) and add your first five real listings with their required skills and languages.',
  mistakes: [['Relying on outdated visa or salary figures', 'Check the current official sources.'], ['Planning from generic advice', 'Plan from real listings.'], ['One generic application for all roles', 'Tailor CV keywords and cover letters.']],
  check: ['ga-a', 'car-1', 'cvx-a'],
  challenge: { prompt: 'Check your university and degree on anabin and save the result (the syllabus Understand mission), then analyse 20 job listings and summarise the top skills.' },
  summary: ['anabin / ZAB for recognition; Make it in Germany for visas.', 'Analyse 20 real listings; adjust your plan.', 'Tailored documents and a tracking table.'],
  cards: [['Check degree recognition (Germany)', 'anabin; ZAB statement of comparability if unclear', 'concept']],
});

export const freelancing = L({
  id: 'freelancing', title: 'Freelancing fundamentals', topic: 'career', minutes: 12,
  objectives: ['Identify suitable first freelance jobs', 'Scope work with clear deliverables and tests', 'Avoid legal and safety pitfalls'],
  why: `Freelancing can grow beside a job once your skills are proven. Starting with small, well-defined jobs builds references without risking your reputation.`,
  visual: { md: '| Good first job | Why |\n|---|---|\n| Sensor + dashboard | Uses skills you have practised |\n| Debug an Arduino/ESP32 project | Short, with a clear result |\n| Small prototype firmware | Builds a client example |\n| Clean and plot sensor data with Python | Uses your data skills |', caption: 'Suitable first freelance jobs (from the syllabus).' },
  theory: `#### When to start
After you can finish projects **without AI writing the solution** — clients pay for reliable results.

#### Before accepting a job
1. Write exactly what you'll deliver and how it will be tested.
2. List what is **not** included (certification, mass production support, enclosure design…).
3. Agree a fixed price, milestones and who owns the work.
4. Don't work on **safety-critical** products without qualified engineering supervision.
5. Check visa, tax and employment rules where you live; an employer's contract may limit side jobs.

#### Delivering
Version control, a README, a short test report and a handover call. Happy clients become references and repeat work.

#### Reality check
Embedded freelancing is a smaller market than web development — a job remains the main plan.`,
  worked: {
    problem: 'A client asks: "Make my ESP32 send temperature to my phone." What do you clarify before quoting?',
    steps: ['Hardware: which sensor and board? Who supplies it?', 'Delivery: phone app, web dashboard or existing app (e.g. via MQTT)? Update rate? Accuracy?', 'Acceptance test: e.g. "readings within ±0.5 °C of a reference, updated every 10 s, for 24 h without restart"; exclusions; price and milestones.'],
    answer: 'Clarify **hardware, delivery channel, measurable acceptance tests, exclusions and price** — then write them down.',
  },
  tryIt: 'Pick one of your mini-projects and write a fixed-price offer for it as if for a client (the syllabus Create mission): deliverables, acceptance tests, exclusions, price, milestones.',
  mistakes: [['Vague scope', 'Write deliverables and tests.'], ['Underpricing to win work', 'Price for quality and your time, including support.'], ['Ignoring legal/visa/contract limits', 'Check them before accepting.']],
  check: ['fl-a', 'cc-a', 'pt-a'],
  challenge: { prompt: 'Make one sample project and write a clear fixed-price offer for it (the syllabus Create mission).' },
  summary: ['Start small after proving skills.', 'Deliverables, tests, exclusions, price, ownership.', 'No safety-critical work without supervision; check legal limits.'],
  cards: [['Freelance offer essentials', 'Deliverables, acceptance tests, exclusions, price, milestones, ownership', 'concept']],
});

export const clientComms = L({
  id: 'client-comms', title: 'Client communication', topic: 'career', minutes: 11,
  objectives: ['Run a requirements conversation', 'Report progress and problems clearly', 'Handle scope changes professionally'],
  why: `Most failed freelance projects fail on communication, not code. Clear requirements, regular updates and honest problem reports keep clients happy and projects on track.`,
  visual: { flow: ['Requirements call', 'Written scope & acceptance tests', 'Milestone updates (weekly)', 'Change requests → new quote', 'Demo + handover', 'Follow-up & feedback'], caption: 'Client communication over a project.' },
  theory: `#### Requirements
Ask open questions: "What problem should this solve?", "How will you know it works?", "What must happen if Wi-Fi fails?". Summarise in writing and get agreement.

#### Progress updates
Short and regular (e.g. weekly): what is done, what is next, blockers, any risk to the deadline — with evidence (photo, video, test result).

#### Bad news early
"The SCD40 needs ~3 minutes to settle, so readings every 10 s won't be meaningful. Options: (a) sample every 5 min, (b) add a second sensor, (c) accept a moving estimate." Explain, offer options, let the client decide.

#### Scope changes
New requests are welcome — with a written change: what changes, the impact on price and schedule.`,
  worked: {
    problem: 'Halfway through, the client asks to add a display. How do you respond?',
    steps: ['Acknowledge and clarify the requirement (size, what to show, power).', 'Estimate the extra work and parts.', 'Send a written change request: added deliverable, extra cost, new date — start after approval.'],
    answer: 'A **written change request** with cost and schedule impact, approved before work starts.',
  },
  tryIt: 'Write a weekly status update for your own robot project as if a client funded it: done, next, blockers, risks, with one piece of evidence.',
  mistakes: [['Silence when problems appear', 'Report early with options.'], ['Accepting changes verbally', 'Confirm scope changes in writing.'], ['Updates without evidence', 'Attach photos, videos or test results.']],
  check: ['cc-a', 'fl-a', 'td-a'],
  challenge: { prompt: 'Draft a requirements questionnaire (8–10 questions) you would send to a client before quoting a sensor-and-dashboard project.' },
  summary: ['Clarify and confirm requirements in writing.', 'Regular, evidence-based updates; bad news early with options.', 'Scope changes via written change requests.'],
  cards: [['Handling a scope change', 'Written change request with cost and schedule impact, approved first', 'concept']],
});

export const techDocs = L({
  id: 'tech-docs', title: 'Technical project documentation', topic: 'career', minutes: 13,
  objectives: ['Structure a technical report', 'Present methods and results with evidence', 'Write as you build'],
  why: `Your technical report turns the robot into a verifiable result — for employers, professors and possibly a student conference. Good documentation is also part of compliance and handover in industry.`,
  visual: { flow: ['Abstract', 'Introduction', 'Related work', 'System design', 'Method', 'Results', 'Discussion', 'Conclusion'], caption: 'Technical report structure (from the syllabus).' },
  theory: `#### Sections
1. **Abstract:** problem, method, main measured result.
2. **Introduction:** why indoor air mapping matters; what you add.
3. **Related work:** what others did; the gap (do a literature search before claiming novelty).
4. **System design:** hardware, firmware, data flow (block diagrams).
5. **Method:** adaptive sampling approach, test set-up, metrics.
6. **Results:** tables and plots with spread.
7. **Discussion:** what worked, what didn't, limitations.
8. **Conclusion:** what you learned; next steps.

#### Writing practice
- Write each section as the work happens; logs, photos and decisions become evidence.
- Figures numbered and referenced; units everywhere.
- Report averages with spread and describe failed tests.
- Follow the rules of the venue (including on AI use) if you submit to a conference; ask a professor to review early.

K-FORGE's **report generator** assembles your project data into this structure and marks what still needs writing.`,
  worked: {
    problem: 'Write an abstract sentence for your robot using the pattern problem → method → result.',
    steps: ['Problem: indoor CO₂ varies across a room, but fixed sensors measure one point.', 'Method: a mobile robot with adaptive sampling chooses where to measure next.', 'Result: compared with a fixed grid, it reached similar map error with fewer samples (state your numbers).'],
    answer: '"Indoor CO₂ varies across rooms, but fixed sensors measure a single point. We present a low-cost mobile robot that uses Gaussian-process adaptive sampling to choose measurement locations; compared with a fixed grid, it achieved [X] ppm map error with [Y] % fewer samples."',
  },
  tryIt: 'Open the capstone report generator in Projects, read which sections are marked "[Write: …]", and draft the System design section from your milestones.',
  mistakes: [['Writing everything at the end', 'Write as you build.'], ['Results without spread or conditions', 'Report mean, spread and conditions.'], ['Claiming novelty without a literature search', 'Search first; describe the gap honestly.']],
  check: ['td-a', 'pt-a', 'nv-a'],
  challenge: { prompt: 'Write the abstract and system design sections of your capstone report and generate the report from the project workspace.' },
  summary: ['Abstract → conclusion structure.', 'Evidence: figures, tables, spread, failures.', 'Write as you build; follow venue rules.'],
  cards: [['Abstract pattern', 'Problem → method → main measured result', 'concept']],
});

export const longTerm = L({
  id: 'long-term', title: 'Long-term business opportunities', topic: 'career', minutes: 12,
  objectives: ['Estimate hours needed for an income goal at different rates', 'Plan a path from employment to independent work', 'Define readiness criteria before going independent'],
  why: `Earning $7,000–8,000 a month independently is a long-term goal that depends on experience, specialisation and repeat clients — not on a platform. Doing the arithmetic early shows why rates and specialisation matter more than hours.`,
  visual: { md: '| Hourly rate (USD) | Paid hours / month for $7,500 | Paid hours / week |\n|---|---|---|\n| 30 | 250 | ≈ 58 |\n| 50 | 150 | ≈ 35 |\n| 80 | ≈ 94 | ≈ 22 |\n| 120 | ≈ 63 | ≈ 15 |', caption: 'Example rates (not market data), before taxes, fees and unpaid work such as sales.' },
  theory: `#### The arithmetic
\`paid hours = income target / hourly rate\`. Real income is lower after taxes, platform fees and unpaid time (sales, admin, learning) — so raising your rate matters more than working more.

#### A possible path (from the syllabus)
1. **Years 1–2 in a job:** learn professional development, build a specialty.
2. **Side projects, if allowed:** small projects, client references.
3. **Specialise:** one valuable problem (e.g. low-power IoT sensor nodes, motor control) instead of everything.
4. **Repeat income:** support contracts, reusable tools, a product.
5. **Test before moving:** keep working until independent income is steady.
6. **Business side:** check rules for tax, banking and receiving foreign payments where you live.

#### Readiness test
Several months of steady income, enough savings for slow periods, and **more than one client**. Set exact numbers from your real expenses when you get there.`,
  worked: {
    problem: 'After tax and fees you keep 70 % of revenue, and 30 % of your working time is unpaid. How many total working hours per week do you need for $7,500 net at $80/h?',
    steps: ['Revenue needed = 7,500 / 0.7 ≈ $10,714/month.', 'Paid hours = 10,714 / 80 ≈ 134/month ≈ 31/week.', 'Total hours = 31 / 0.7 ≈ 44 hours/week.'],
    answer: '**≈ 44 hours per week** — showing why specialisation and higher rates are the real levers.',
  },
  tryIt: 'Build a small spreadsheet: target income, tax/fee rate, unpaid-time share and hourly rate → required weekly hours. Try rates of $30, $50, $80 and $120.',
  mistakes: [['Ignoring taxes, fees and unpaid time', 'Model them explicitly.'], ['Going independent with one client', 'Wait for several clients and savings.'], ['Being a generalist', 'Specialise in a valuable problem.']],
  check: ['lt-a', 'fl-a', 'cc-a'],
  challenge: { prompt: 'Write a one-page long-term plan: target specialty, steps for the next five years, and the readiness criteria (income, savings, clients) you will use before going independent.' },
  summary: ['Hours = target / rate — then add taxes and unpaid time.', 'Job → specialise → side projects → repeat income → test.', 'Readiness: steady income, savings, several clients.'],
  cards: [['Income lever that matters most', 'Higher rates through specialisation (not more hours)', 'concept']],
});
