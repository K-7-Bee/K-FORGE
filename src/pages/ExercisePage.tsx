import { ArrowLeft, CheckCircle2, Eye, FlaskConical, Lightbulb, MessageSquareText, Play, RotateCcw, ServerOff, Terminal, XCircle } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getModule } from '../data/curriculum';
import { getExercise, LAB_LEVELS } from '../data/lab';
import { type CodeExercise, DIFFICULTY_LABEL, type Response, type RubricExercise } from '../data/types';
import { describeResponse, gradeQuestion, type GradeResult, normalizeOutput } from '../engine/grading';
import { getHealth, type Health, runCode, type RunResult } from '../lib/api';
import { toast } from '../lib/toast';
import {
  addExerciseEvidence,
  getState,
  recordExerciseAttempt,
  removeExerciseEvidence,
  revealHint,
  saveExerciseDraft,
  setRubric,
  useApp,
  viewSolution,
} from '../store/store';
import { QuestionView, isAnswered } from '../components/quiz/QuestionView';
import { EvidenceUploader } from '../components/EvidenceUploader';
import { CodeBlock } from '../components/ui/CodeBlock';
import { Markdown } from '../components/ui/Markdown';
import { Badge, Button, Callout, Card, CardHeader, Checkbox, cx, EmptyState, LinkButton, Spinner, Textarea } from '../components/ui';

const CodeEditor = lazy(() => import('../components/CodeEditor'));

function Hints({ id, hints }: { id: string; hints: [string, string, string] }) {
  const s = useApp();
  const used = s.exercises[id]?.hintsUsed ?? 0;
  const labels = ['Hint 1 · conceptual clue', 'Hint 2 · the method', 'Hint 3 · guided example'];
  return (
    <Card>
      <CardHeader icon={<Lightbulb size={18} />} title="Hints" subtitle="Reveal one level at a time. Using any hint removes the no-hint bonus — the learning matters more than the bonus." />
      <div className="space-y-2 p-5">
        {hints.map((h, i) => (
          <div key={i}>
            {i < used ? (
              <div className="rounded-xl border border-warn/30 bg-warn/5 p-3 fade-in">
                <div className="mb-1 text-[12px] font-medium text-warn">{labels[i]}</div>
                <Markdown text={h} className="text-sm [&_p]:m-0" />
              </div>
            ) : i === used ? (
              <Button size="sm" variant="ghost" onClick={() => revealHint(id, i + 1)}><Lightbulb size={14} /> Reveal {labels[i]}</Button>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

function CodeSubmission({ ex }: { ex: CodeExercise }) {
  const s = useApp();
  const prog = s.exercises[ex.id];
  const [code, setCode] = useState(prog?.lastCode ?? ex.starter);
  const [health, setHealth] = useState<Health | null>(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ label: string; hidden?: boolean; stdin: string; expected: string; run?: RunResult; pass: boolean; error?: string }[] | null>(null);
  const [localOut, setLocalOut] = useState<string[]>(() => ex.tests.map(() => ''));
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { getHealth().then(setHealth); }, []);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { if (code !== (getState().exercises[ex.id]?.lastCode ?? ex.starter)) saveExerciseDraft(ex.id, { lastCode: code }); }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [code, ex.id, ex.starter]);

  async function runTests() {
    setRunning(true);
    setResults(null);
    const out: NonNullable<typeof results> = [];
    for (const t of ex.tests) {
      try {
        const run = await runCode(ex.language, code, t.stdin);
        const pass = run.status === 'Accepted' && normalizeOutput(run.stdout) === normalizeOutput(t.expected);
        out.push({ label: t.label, hidden: t.hidden, stdin: t.stdin, expected: t.expected, run, pass });
        if (run.status === 'Compilation Error') break; // no point running the rest
      } catch (e) {
        out.push({ label: t.label, hidden: t.hidden, stdin: t.stdin, expected: t.expected, pass: false, error: (e as Error).message });
        break;
      }
    }
    setResults(out);
    setRunning(false);
    const allRan = out.length === ex.tests.length && !out.some((r) => r.error);
    if (!allRan && out.some((r) => r.error)) { toast('error', 'Execution service error', out.find((r) => r.error)?.error); return; }
    const allPass = allRan && out.every((r) => r.pass);
    recordExerciseAttempt(ex.id, allPass, 'compiled');
    if (allPass) toast('success', 'All tests passed', 'Verified by a real compiler run.');
  }

  function verifyLocal() {
    const pass = ex.tests.every((t, i) => normalizeOutput(localOut[i]) === normalizeOutput(t.expected));
    recordExerciseAttempt(ex.id, pass, 'local-output');
    setResults(ex.tests.map((t, i) => ({ label: t.label, hidden: t.hidden, stdin: t.stdin, expected: t.expected, pass: normalizeOutput(localOut[i]) === normalizeOutput(t.expected) })));
    if (pass) toast('success', 'Outputs match', 'Recorded as verified with your local compiler output.');
  }

  const compileCmd = ex.language === 'python' ? 'python3 main.py < input.txt' : ex.language === 'cpp' ? 'g++ -std=c++17 -Wall -Wextra main.cpp -o main && ./main < input.txt' : 'gcc -std=c11 -Wall -Wextra main.c -o main && ./main < input.txt';

  return (
    <Card>
      <CardHeader icon={<Terminal size={18} />} title="Submission" subtitle={`${ex.language.toUpperCase()} · ${ex.tests.length} test cases (${ex.tests.filter((t) => t.hidden).length} hidden)`}
        action={<Button size="sm" variant="ghost" onClick={() => { if (window.confirm('Reset the editor to the starter code?')) setCode(ex.starter); }}><RotateCcw size={14} /> Reset</Button>} />
      <div className="space-y-4 p-5">
        <Suspense fallback={<div className="grid h-[340px] place-items-center rounded-xl border border-line"><Spinner label="Loading editor" /></div>}>
          <CodeEditor value={code} onChange={setCode} language={ex.language} />
        </Suspense>

        {health === null ? <Spinner label="Checking execution service" /> : health.judge0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={runTests} disabled={running}><Play size={15} /> {running ? 'Compiling & running…' : 'Compile and run tests'}</Button>
            <span className="text-xs text-fg-3">Runs on the configured Judge0 sandbox.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <Callout tone="warn" icon={<ServerOff size={16} />} title="No code execution service is configured — your code has not been compiled">
              K-FORGE never pretends to run code. Either start the API server with a Judge0 endpoint (see README), or compile on your own machine and paste the program's output for each test input below.
            </Callout>
            <div className="rounded-xl border border-line bg-bg-2 p-3 font-mono text-[12px] text-fg-2">{compileCmd}</div>
            <div className="grid gap-3">
              {ex.tests.map((t, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[12px] text-fg-3">Test {i + 1} input{t.hidden ? ' (hidden test — expected output not shown)' : ''}</div>
                    <pre className="max-h-32 overflow-auto rounded-lg bg-bg-2 p-2 font-mono text-[12px] text-fg">{t.stdin || '(empty)'}</pre>
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] text-fg-3" htmlFor={`local-${i}`}>Your program's output</label>
                    <Textarea id={`local-${i}`} rows={2} className="font-mono text-[12px]" value={localOut[i]} onChange={(e) => setLocalOut((o) => o.map((x, j) => (j === i ? e.target.value : x)))} />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" onClick={verifyLocal} disabled={localOut.some((o) => !o.trim())}>Check my local outputs</Button>
          </div>
        )}

        {results && (
          <div className="space-y-2" aria-live="polite">
            {results.map((r, i) => (
              <div key={i} className={cx('rounded-xl border p-3 text-sm', r.pass ? 'border-good/40 bg-good/5' : 'border-bad/40 bg-bad/5')}>
                <div className="flex items-center gap-2 font-medium">
                  {r.pass ? <CheckCircle2 size={15} className="text-good" /> : <XCircle size={15} className="text-bad" />}
                  <span className={r.pass ? 'text-good' : 'text-bad'}>Test {i + 1}: {r.label}</span>
                  {r.run && <Badge>{r.run.status}</Badge>}
                  {r.run?.time && <span className="ml-auto font-mono text-[11px] text-fg-3">{r.run.time}s</span>}
                </div>
                {r.error && <p className="mt-1 text-fg-2">{r.error}</p>}
                {r.run?.compileOutput && <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-bg-2 p-2 font-mono text-[12px] text-bad">{r.run.compileOutput}</pre>}
                {!r.pass && !r.hidden && !r.run?.compileOutput && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <div><div className="text-[11px] text-fg-3">Input</div><pre className="overflow-auto rounded bg-bg-2 p-1.5 font-mono text-[12px]">{r.stdin}</pre></div>
                    <div><div className="text-[11px] text-fg-3">Expected</div><pre className="overflow-auto rounded bg-bg-2 p-1.5 font-mono text-[12px] text-good">{r.expected}</pre></div>
                    <div><div className="text-[11px] text-fg-3">Got</div><pre className="overflow-auto rounded bg-bg-2 p-1.5 font-mono text-[12px] text-bad">{r.run ? r.run.stdout || '(no output)' : localOut[i] || '(empty)'}</pre></div>
                  </div>
                )}
                {r.run?.stderr && <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-bg-2 p-2 font-mono text-[12px] text-warn">{r.run.stderr}</pre>}
                {!r.pass && r.hidden && <p className="mt-1 text-[12px] text-fg-3">Hidden test — think about edge cases (zero, limits, empty input).</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function RubricSubmission({ ex }: { ex: RubricExercise }) {
  const s = useApp();
  const prog = s.exercises[ex.id];
  const rubric = ex.rubric.map((_, i) => Boolean(prog?.rubric?.[i]));
  const evidence = prog?.evidence ?? [];
  const ready = rubric.every(Boolean) && evidence.length > 0;
  return (
    <Card>
      <CardHeader icon={<FlaskConical size={18} />} title="Submission: rubric and evidence" subtitle="Self-assessed against the rubric, backed by your own evidence. Be honest — this is your engineering record." />
      <div className="space-y-5 p-5">
        <div>
          <div className="mb-2 text-sm font-medium text-fg">Marking rubric</div>
          {ex.rubric.map((r, i) => (
            <Checkbox key={i} id={`rub-${ex.id}-${i}`} checked={rubric[i]} onChange={(v) => setRubric(ex.id, rubric.map((x, j) => (j === i ? v : x)))}>{r}</Checkbox>
          ))}
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-fg">Evidence <span className="font-normal text-fg-3">— {ex.evidence}</span></div>
          <EvidenceUploader ids={evidence} context={`exercise:${ex.id}`} onAdd={(id) => addExerciseEvidence(ex.id, id)} onRemove={(id) => removeExerciseEvidence(ex.id, id)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" disabled={!ready || Boolean(prog?.solvedAt)} onClick={() => recordExerciseAttempt(ex.id, true, 'self-assessed')}>
            {prog?.solvedAt ? <><CheckCircle2 size={15} /> Submitted</> : 'Submit for completion'}
          </Button>
          {!ready && <span className="text-xs text-fg-3">Tick every rubric item and upload at least one file.</span>}
        </div>
      </div>
    </Card>
  );
}

export default function ExercisePage() {
  const { exerciseId = '' } = useParams();
  const s = useApp();
  const ex = getExercise(exerciseId);
  const [response, setResponse] = useState<Response>();
  const [result, setResult] = useState<GradeResult>();
  if (!ex) return <EmptyState title="Exercise not found" action={<LinkButton to="/lab">Back to the lab</LinkButton>} />;
  const prog = s.exercises[ex.id];
  const solved = Boolean(prog?.solvedAt);
  const attempted = (prog?.attempts ?? 0) > 0;
  const m = getModule(ex.moduleId)!;

  return (
    <div className="space-y-5 fade-in">
      <Link to="/lab" className="inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> Engineering Lab</Link>
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Badge tone="accent">{LAB_LEVELS.find((l) => l.id === ex.level)?.label}</Badge>
          <Badge tone={ex.difficulty === 3 ? 'purple' : 'neutral'}>{DIFFICULTY_LABEL[ex.difficulty]}</Badge>
          <Link to={`/courses/${m.id}`}><Badge>{m.short}</Badge></Link>
          {ex.hardware && <Badge tone="good">Hardware</Badge>}
          {solved && <Badge tone="good"><CheckCircle2 size={11} /> Solved · {prog?.verification}</Badge>}
        </div>
        <h1 className="text-2xl font-semibold text-fg">{ex.title}</h1>
        <p className="mt-1 text-sm text-fg-3"><span className="text-fg-2">Learning objective:</span> {ex.objective}</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-fg-3">Problem</h2>
            <Markdown text={ex.description} className="text-[15px]" />
            {ex.io && (<><h3 className="mt-4 mb-1 text-sm font-semibold text-fg">Input / output</h3><Markdown text={ex.io} /></>)}
          </Card>

          {ex.kind === 'question' && (
            <Card className="p-5">
              <QuestionView q={ex.question} response={response} onChange={(r) => { setResponse(r); setResult(undefined); }} result={result} hintShown={false} onShowHint={() => undefined} />
              {!result && (
                <Button variant="primary" className="mt-4" disabled={!isAnswered(ex.question, response)} onClick={() => {
                  const r = gradeQuestion(ex.question, response!);
                  setResult(r);
                  recordExerciseAttempt(ex.id, r.correct, 'auto', r.correct ? undefined : { qid: ex.question.id, topic: ex.question.topic, correct: false, given: describeResponse(ex.question, response!), usedHint: (prog?.hintsUsed ?? 0) > 0 });
                }}>Submit answer</Button>
              )}
              {result && !result.correct && <Button className="mt-4" onClick={() => { setResult(undefined); }}><RotateCcw size={14} /> Try again</Button>}
            </Card>
          )}
          {ex.kind === 'code' && <CodeSubmission ex={ex} />}
          {ex.kind === 'rubric' && <RubricSubmission ex={ex} />}

          {solved && (
            <Card className="p-5" glow>
              <h2 className="mb-2 flex items-center gap-2 font-semibold text-good"><CheckCircle2 size={17} /> Detailed explanation</h2>
              <Markdown text={ex.explanation} />
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Hints id={ex.id} hints={ex.hints} />
          <Card className="p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-fg"><MessageSquareText size={15} className="text-accent" /> Stuck after trying?</div>
            <p className="text-sm text-fg-3">The Engineering Mentor follows the same three-level hint rule and asks you to explain your reasoning.</p>
            <LinkButton to={`/mentor?challenge=${ex.id}`} size="sm" className="mt-3">Ask the mentor</LinkButton>
          </Card>
          {ex.kind === 'code' && (
            <Card className="p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-fg"><Eye size={15} className="text-accent" /> Reference solution</div>
              {!attempted ? (
                <p className="text-sm text-fg-3">Hidden until you submit at least one attempt.</p>
              ) : prog?.solutionViewed ? (
                <CodeBlock code={ex.solution} language={ex.language} lineNumbers />
              ) : (
                <>
                  <p className="text-sm text-fg-3">Viewing it before solving removes the no-hint bonus. Afterwards, rebuild it from a blank file without looking.</p>
                  <Button size="sm" className="mt-3" onClick={() => { if (window.confirm('Reveal the full reference solution?')) viewSolution(ex.id); }}>Reveal solution</Button>
                </>
              )}
            </Card>
          )}
          <Card className="p-5 text-sm text-fg-3">
            <div className="mb-1 font-medium text-fg">Record</div>
            Attempts: {prog?.attempts ?? 0} · Hints used: {prog?.hintsUsed ?? 0}/3{prog?.solvedAt ? ` · Solved ${new Date(prog.solvedAt).toLocaleDateString()}` : ''}
            {(s.practiceCount[`ex:${ex.id}`] ?? 0) > 0 && <div>Repeat practice: {s.practiceCount[`ex:${ex.id}`]}× (tracked, no extra XP)</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}
