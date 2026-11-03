import { ArrowLeft, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getModule } from '../data/curriculum';
import { debuggingPool, diagnosticPool, finalExamPool, PRACTICAL_EXAMS } from '../data/exams';
import { getQuestions, PLACEMENT_AREAS } from '../data/questions';
import type { Question } from '../data/types';
import { shuffle } from '../engine/grading';
import { moduleProgress } from '../engine/progress';
import { addExerciseEvidence, recordTestAttempt, removeExerciseEvidence, setRubric, useApp } from '../store/store';
import type { TestKind } from '../store/types';
import { QuizRunner } from '../components/quiz/QuizRunner';
import { EvidenceUploader } from '../components/EvidenceUploader';
import { Badge, Button, Callout, Card, CardHeader, Checkbox, EmptyState, LinkButton, PageHeader, Segmented, Slider } from '../components/ui';

interface Config { title: string; pool: Question[]; examCount: number; minutesPerQ: number; allowPractice: boolean; fixed?: boolean; blurb: string }

function configFor(kind: TestKind, ref: string): Config | null {
  if (kind === 'placement') return { title: 'Placement assessment', pool: getQuestions(PLACEMENT_AREAS.flatMap((a) => a.questionIds)), examCount: 99, minutesPerQ: 1.5, allowPractice: false, fixed: true, blurb: 'Answer honestly without notes — the goal is an accurate starting point, not a high score.' };
  if (kind === 'module') { const m = getModule(ref); return m ? { title: `${m.short} module examination`, pool: getQuestions(m.examQuestionIds), examCount: 15, minutesPerQ: 1.5, allowPractice: true, blurb: m.summary } : null; }
  if (kind === 'diagnostic') { const m = getModule(ref); return m ? { title: `${m.short} diagnostic test`, pool: diagnosticPool(ref), examCount: 10, minutesPerQ: 1.5, allowPractice: false, blurb: 'Identifies what you already know before you start the subject. Not counted as an exam.' } : null; }
  if (kind === 'final') return { title: 'Final examination', pool: finalExamPool(), examCount: 25, minutesPerQ: 2, allowPractice: true, blurb: 'Combines theory, calculations, programming and practical reasoning from every core module.' };
  if (kind === 'debugging') return { title: 'Debugging examination', pool: debuggingPool(), examCount: 12, minutesPerQ: 2.5, allowPractice: true, blurb: 'Broken code, incorrect outputs and faulty circuit scenarios. Identify and correct the problem.' };
  return null;
}

export function TestRun() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const s = useApp();
  const kind = (params.get('kind') ?? 'module') as TestKind;
  const ref = params.get('ref') ?? kind;
  const cfg = configFor(kind, ref);

  const [mode, setMode] = useState<'practice' | 'exam'>(kind === 'diagnostic' || kind === 'placement' ? 'exam' : 'practice');
  const [timed, setTimed] = useState(false);
  const [randomize, setRandomize] = useState(true);
  const [difficulty, setDifficulty] = useState<'all' | '1' | '2' | '3'>('all');
  const [practiceCount, setPracticeCount] = useState(10);
  const [started, setStarted] = useState<{ questions: Question[]; at: string; key: number } | null>(null);

  const filtered = useMemo(() => (cfg ? cfg.pool.filter((q) => mode === 'exam' || difficulty === 'all' || String(q.difficulty) === difficulty) : []), [cfg, mode, difficulty]);

  if (!cfg) return <EmptyState title="Unknown test" action={<LinkButton to="/tests">Back to the Test Center</LinkButton>} />;
  const module = kind === 'module' ? getModule(ref) : undefined;
  if (module && moduleProgress(s, module).status === 'locked') {
    return <EmptyState title="This module exam is locked" action={<LinkButton to={`/courses/${module.id}`}>See prerequisites</LinkButton>}>Pass the prerequisite exam(s) first. XP alone never unlocks a module.</EmptyState>;
  }

  const count = mode === 'exam' ? Math.min(cfg.examCount, cfg.pool.length) : Math.min(practiceCount, filtered.length);
  const start = () => {
    const base = mode === 'exam' ? cfg.pool : filtered;
    const picked = cfg.fixed ? (randomize ? shuffle(base) : base) : (randomize ? shuffle(base) : base).slice(0, count);
    setStarted({ questions: picked, at: new Date().toISOString(), key: Date.now() });
  };

  if (started) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-fg">{cfg.title}</h1>
          <Badge>{started.questions.length} questions</Badge>
        </div>
        <QuizRunner
          key={started.key}
          questions={started.questions}
          mode={mode}
          mastery={s.settings.mastery}
          timeLimitSec={timed ? Math.round(started.questions.length * cfg.minutesPerQ * 60) : undefined}
          onComplete={(answers) => {
            const a = recordTestAttempt({ kind, ref, title: cfg.title, startedAt: started.at, mode, timed, answers });
            return { percent: a.percent, passed: a.passed };
          }}
          onRetake={start}
          onExit={() => navigate(kind === 'placement' ? '/path' : '/tests')}
          passMessage={kind === 'module' && mode === 'exam' ? 'Exam passed — dependent modules are now unlocked. Remember: mastery also needs the practical lab.' : kind === 'placement' ? 'See your recommended starting point on the Learning Path.' : undefined}
          failMessage={kind === 'placement' ? 'That is useful information — your recommended start is on the Learning Path.' : kind === 'module' && mode === 'practice' ? 'Practice attempts never count as exam passes. Review the explanations, then try exam mode.' : undefined}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 fade-in">
      <Link to="/tests" className="inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> Test Center</Link>
      <PageHeader title={cfg.title} subtitle={cfg.blurb} />
      <Card>
        <CardHeader title="Test settings" />
        <div className="space-y-5 p-5">
          {cfg.allowPractice && (
            <div>
              <div className="mb-1.5 text-[13px] text-fg-2">Mode</div>
              <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: 'practice', label: 'Practice — instant feedback' }, { value: 'exam', label: 'Exam — counts toward progress' }]} />
            </div>
          )}
          <Checkbox id="timed" checked={timed} onChange={setTimed}>Timed ({Math.round(count * cfg.minutesPerQ)} minutes for {count} questions; auto-submits at zero)</Checkbox>
          <Checkbox id="random" checked={randomize} onChange={setRandomize}>Randomise question selection and order</Checkbox>
          {mode === 'practice' && !cfg.fixed && (
            <>
              <div>
                <div className="mb-1.5 text-[13px] text-fg-2">Difficulty</div>
                <Segmented label="Difficulty" value={difficulty} onChange={setDifficulty} options={[{ value: 'all', label: 'All' }, { value: '1', label: 'Foundation' }, { value: '2', label: 'Intermediate' }, { value: '3', label: 'Advanced' }]} />
              </div>
              <Slider id="count" label="Number of questions" value={Math.min(practiceCount, filtered.length)} min={1} max={Math.max(1, filtered.length)} onChange={setPracticeCount} />
            </>
          )}
          {mode === 'exam' && kind === 'module' && <Callout tone="blue">Exam mode uses {count} randomly selected questions of all difficulties. Pass at {s.settings.mastery}% to unlock dependent modules. Hints stay hidden unless you open them; they are recorded.</Callout>}
          {filtered.length === 0 ? <p className="text-sm text-bad">No questions match this difficulty.</p> : (
            <Button variant="primary" onClick={start}><Play size={15} /> Start {mode === 'exam' ? 'exam' : 'practice'}</Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export function PracticalExamPage() {
  const { examId = '' } = useParams();
  const s = useApp();
  const exam = PRACTICAL_EXAMS.find((p) => p.id === examId);
  if (!exam) return <EmptyState title="Practical exam not found" action={<LinkButton to="/tests">Back</LinkButton>} />;
  const prog = s.exercises[exam.id];
  const checks = exam.rubric.map((_, i) => Boolean(prog?.rubric?.[i]));
  const evidence = prog?.evidence ?? [];
  const total = exam.rubric.reduce((a, r) => a + r.points, 0);
  const score = exam.rubric.reduce((a, r, i) => a + (checks[i] ? r.points : 0), 0);
  return (
    <div className="mx-auto max-w-3xl space-y-5 fade-in">
      <Link to="/tests" className="inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> Test Center</Link>
      <PageHeader eyebrow="Practical examination" title={exam.title} subtitle={exam.task} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5"><div className="mb-2 text-sm font-semibold text-fg">Requirements</div><ul className="list-disc space-y-1 pl-5 text-sm text-fg-2">{exam.requirements.map((r) => <li key={r}>{r}</li>)}</ul></Card>
        <Card className="p-5"><div className="mb-2 text-sm font-semibold text-fg">Constraints</div><ul className="list-disc space-y-1 pl-5 text-sm text-fg-2">{exam.constraints.map((r) => <li key={r}>{r}</li>)}</ul></Card>
      </div>
      <Card>
        <CardHeader title="Marking rubric" subtitle={`Self-assessed: ${score}/${total} points (${Math.round((score / total) * 100)}%). Only tick criteria your evidence demonstrates.`} />
        <div className="space-y-1 p-5">
          {exam.rubric.map((r, i) => (
            <Checkbox key={i} id={`px-${i}`} checked={checks[i]} onChange={(v) => setRubric(exam.id, checks.map((c, j) => (j === i ? v : c)))}>
              <span className="font-mono text-accent">{r.points} pts</span> · {r.criterion}
            </Checkbox>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="Evidence" subtitle={exam.evidence} />
        <div className="p-5"><EvidenceUploader ids={evidence} context={`practical:${exam.id}`} onAdd={(id) => addExerciseEvidence(exam.id, id)} onRemove={(id) => removeExerciseEvidence(exam.id, id)} /></div>
      </Card>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          disabled={evidence.length === 0}
          onClick={() => {
            const now = new Date().toISOString();
            const a = recordTestAttempt({
              kind: 'practical', ref: exam.id, title: `Practical: ${exam.title}`, startedAt: now, mode: 'exam', timed: false,
              answers: exam.rubric.map((r, i) => ({ qid: `${exam.id}:${i}`, topic: 'practical', correct: checks[i], given: r.criterion, usedHint: false })),
              points: { score, total },
            });
            if (!a.passed) window.alert(`Recorded ${a.percent}%. Below the ${a.mastery}% mastery target — improve the weakest criteria and resubmit.`);
          }}
        >
          Submit practical exam
        </Button>
        {evidence.length === 0 && <span className="text-xs text-fg-3">Upload evidence before submitting.</span>}
      </div>
    </div>
  );
}
