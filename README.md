# K-FORGE — Interactive Embedded Systems Engineering Academy

A local-first learning platform that takes an engineering student from circuit fundamentals to designing, programming, debugging and documenting real embedded and robotics systems. It combines a structured curriculum, interactive lessons, an Engineering Lab, a Test Center, XP and levels gated by real assessments, spaced repetition, a project workspace built around an air-quality monitoring robot, a study planner, and an optional AI Engineering Mentor.

## Quick start

```bash
npm install
npm run dev          # app on http://localhost:5173
npm run server       # optional API server on :8787 (code execution + AI mentor), proxied at /api
```

Production (one process serves the built app and the API):

```bash
npm start            # = npm run build && npm run server  →  http://localhost:8787
```

Other scripts: `npm test` (Vitest), `npm run typecheck`. Requires Node ≥ 22.9.

## Optional services (server-side only)

Copy `.env.example` to `.env`. Keys are read only by `server/index.mjs` and never reach the browser.

| Variable | Enables |
|---|---|
| `ANTHROPIC_API_KEY` (or an `ant auth login` profile) | AI Engineering Mentor (`ANTHROPIC_MODEL`, default `claude-opus-5-5`). Uses the official `@anthropic-ai/sdk`, explicit `medium` effort, and the server-side refusal fallback (`fallbacks: "default"`). |
| `JUDGE0_URL` (+ `JUDGE0_RAPIDAPI_KEY` for RapidAPI) | Real C, C++ and Python compilation and test runs for coding exercises. Self-host Judge0 CE with Docker (`JUDGE0_URL=http://localhost:2358`) or use the RapidAPI endpoint. |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (optional) | Background study reminders via Web Push. If unset, the server generates keys once and stores them in `server/data/vapid.json` (gitignored). |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (build-time, browser) | Cloud sync. These two values are public by design — row-level security restricts every row and file to its owner. Rebuild after setting them. |

**Without these services the app still works fully and honestly:**
- **Coding exercises** say plainly that the code has not been compiled. You can compile locally (the exact `gcc` command is shown), paste your program's output for each test input, and K-FORGE compares it with the expected output. That is recorded as `local-output` verification.
- **The mentor** runs as an offline guide: glossary and lesson search, each exercise's own three-level hints, practice questions from the question bank, revision recommendations from your weak topics, and structured debugging prompts.

## What is implemented

| Stage | Status |
|---|---|
| **1 — Functional MVP** | Responsive dashboard; course and module navigation; full curriculum for Phases 0–13 (prerequisites, objectives, completion requirements); **all 140 lessons in the interactive 10-section format** (objectives, real-engineering context, visual, theory, step-by-step worked example, interactive tool or hands-on activity, common mistakes, graded 3-question knowledge check, practical challenge, summary with flashcards); graded quizzes; XP and 8 levels; 19 achievements; local persistence; weekly study tracker. |
| **2 — Engineering Lab** | CodeMirror 6 editor (offline-capable, touch-friendly equivalent of Monaco); 67 exercises across Understand / Implement / Debug / Create; 42 auto-graded coding challenges in C, C++ and Python, covering every module from electronics to the capstone (every reference solution is compiled and run against its tests by `tests/lab-solutions.test.ts`); three-level hints; rubric and evidence submissions for hardware work; all 21 interactive engineering tools. |
| **3 — Advanced** | STM32, RTOS and control modules with exam pools and labs; UART/I2C/SPI visualizers; PID, motor, feedback and encoder simulators; capstone workspace with 15 milestones, testing records, evidence uploads and a report generator; Test Center with diagnostic, placement, module, final, debugging and practical examinations. |
| **4 — Personalised** | AI Mentor (server-side) with an enforced hint ladder; SM-2 spaced repetition with a daily queue, quick recall, mistake notebook and weak-topic detection; recommended starting point from the placement assessment; progress analytics; portfolio page; German and career track. |
| **Rank mode** | Rank Arena with six ranks, from Crimson Strawberry (0 XP) to Mythical Mango (15,000 XP). A rank needs its XP **and** a 20-question rank test, drawn only from completed lessons and passed modules, scored at 60–85 % while already holding that XP. Includes a score chart, an XP journey against rank thresholds, a per-topic breakdown and the test history. Only the week's first rank test earns XP (score × 1.5). Emblems are in `public/ranks/`. |
| **Sync & reminders** | Optional Supabase cloud sync that merges devices instead of overwriting them; evidence files in Supabase Storage; background Web Push reminders; full backup (progress + evidence files) export and restore. |

### Content at a glance

| | Count |
|---|---|
| Interactive lessons | 140 (49 with SVG diagrams, 40 with flow charts, 51 with comparison tables; 46 embed an engineering tool, 94 have a hands-on "Try it" activity) |
| Questions in the bank | 357, in 8 formats; every lesson check question is also in its module exam pool |
| Flashcards | 185 |
| Lab exercises | 67 (42 auto-graded coding challenges with visible and hidden test cases) |
| Interactive tools | 21 |
| Projects | 8 mini-projects + the 15-milestone capstone |

### Learning-integrity rules enforced in code
- A lesson completes only by passing its knowledge check at the mastery threshold (80% by default, adjustable).
- Full XP is awarded **once per activity key**. Repeats are counted as practice (`practiceCount`) and earn no XP. There is a no-hint bonus.
- Levels need XP **and** skill requirements, such as passing module exams in exam mode, completing labs, mini-projects and capstone milestones. XP alone never unlocks a module or a level.
- Modules unlock only through a passed prerequisite exam or a mastery-level placement score. Locked modules stay readable in preview mode.
- Milestones complete only with every checklist item ticked, at least one evidence file, and any required measurement recorded. Projects also need documentation and a final evaluation.
- Incorrect answers anywhere become revision cards and mistake-notebook entries.
- The streak is gentle: one rest day per week is allowed, and exam-period mode lowers the target without touching any progress.

These rules are covered by the unit tests in `tests/`.

## Architecture

```
src/
  data/          static, typed content: curriculum, question bank, lab, projects, resources, exams
    lessons/     one file per module (m-*.ts): full lessons + their knowledge-check questions (helpers.ts builders)
  engine/        pure logic: grading, SM-2 scheduling, Boolean parser, progress/levels/achievements, ranks, dates
  store/         external store (useSyncExternalStore), persistence adapter, IndexedDB evidence,
                 cloud.ts (Supabase sync), merge.ts (device merge)
  tools/         21 interactive tools, lazy-loaded per category (registry.ts)
  components/    UI kit, quiz engine, diagrams (SVG), layout (sidebar / bottom nav), editor, skill tree
  pages/         one file per route, all lazy-loaded
  lib/           API client, offline mentor, push client, report generator, hooks (study tracking, reminders)
server/          index.mjs: /api/health, /api/run (Judge0), /api/mentor (Claude API), /api/push/*, static dist
                 reminders.mjs: push scheduling (pure, tested)
supabase/        schema.sql: progress table + evidence bucket with row-level security
public/          PWA manifest, icon, service worker (offline cache + push notifications)
tests/           Vitest: engines, content integrity (every lesson has all 10 sections), store rules, merge, reminders,
                 lab solutions (compiles every coding exercise; needs gcc/g++/Python, skipped per language if missing)
```

Adding a coding exercise: add it to `src/data/lab-code.ts` (the `src` template tag keeps code exactly as written). `npm test` then checks that its solution passes every test without compiler warnings and that its starter compiles but does not pass.

Adding a lesson: write it with the `L()` builder in the module's `src/data/lessons/m-*.ts`, add its questions to the same file, and reference it from `src/data/curriculum.ts` with `U('lesson-id')`. The content-integrity tests fail if any section or question is missing.

- **Stack:** React 18, TypeScript (strict), Vite 6, Tailwind CSS v4 (runtime theme tokens, dark by default), React Router 6, Recharts, CodeMirror 6, lucide icons. Animations are CSS transitions, so no animation runtime is shipped.
- **Persistence:** local-first. Progress lives in `localStorage` behind the `ProgressStorage` interface (`src/store/persistence.ts`); evidence files live in IndexedDB. Every change is saved immediately.
- **Backups:** Profile → Your data offers "Export progress" (learning record) and "Full backup (with evidence)", which embeds every evidence file. Import accepts either.
- **PWA:** installable. The service worker caches the shell, the curriculum chunk and every visited asset, so previously opened lessons work offline, and it shows push reminders. It is registered in production builds only.
- **Bundle:** app code (~83 KB), React (~166 KB) and curriculum content (~617 KB, ~220 KB gzipped) are separate chunks, so code updates don't re-download the curriculum. Pages, tools, charts and the editor load on demand.
- **Accessibility:** skip link, keyboard-reachable controls, visible focus rings, ARIA roles on custom radios/checkboxes/progress bars, and live regions for feedback and timers.

## Cloud sync (optional, Supabase)

1. Create a Supabase project.
2. In its SQL editor, run `supabase/schema.sql`. It creates the `progress` table and a private `evidence` storage bucket, both with row-level security, so users only ever see their own data.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` and rebuild (`npm start`).
4. In Profile → Cloud sync, create an account or sign in (password or email link).

How it behaves:
- Changes are saved on the device first and pushed a few seconds later.
- On sign-in, window focus and reconnect, the cloud copy is pulled and **merged** (`src/store/merge.ts`). Earned progress is combined: XP once per key, earliest completion dates, best scores, solved exercises and the union of evidence. Settings and plans come from whichever device was edited most recently.
- Without configuration, the Supabase SDK is not even included in the build.

## Background reminders (Web Push)

With the server running (`npm start`), Study Planner → Learning reminders → "Turn on" subscribes this device. The server stores only the push address, reminder time, time zone and exam-mode flag in `server/data/push.json`. It sends at most one reminder per day, after the chosen local time, and skips days on which the app reported study activity. Push needs the production build (service worker) and HTTPS or localhost. In-app reminders remain available as a fallback.

## Known limitations

- **Cloud sync and push delivery were not tested against live services.** No Supabase project or browser push service was available during development. The merge logic and reminder scheduling are unit-tested, and the UI was verified in its not-configured and available states, but the first real sign-in and the first delivered push notification still need a manual check.
- The curriculum is bundled for offline use, so first load downloads ~220 KB of gzipped lesson content. It is cached afterwards.
- Hardware labs and capstone milestones are self-assessed against rubrics and backed by your evidence files. K-FORGE cannot inspect a physical circuit.

## Content sources

The curriculum, worked examples, quizzes, schedules and capstone milestones follow the *Embedded Systems Roadmap and Syllabus* (Nov 2026). The Resource Library links only to official documentation and recognised educational sites; books link to an Open Library search rather than a guessed store page.
