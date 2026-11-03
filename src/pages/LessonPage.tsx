import { AlertTriangle, ArrowLeft, ArrowRight, BookMarked, CheckCircle2, FlaskConical, Lock, NotebookPen, Save } from 'lucide-react';
import { type ReactNode, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findLesson } from '../data/curriculum';
import { getQuestions } from '../data/questions';
import { getExercise } from '../data/lab';
import { shuffle } from '../engine/grading';
import { uid } from '../engine/dates';
import { lessonDone, moduleProgress } from '../engine/progress';
import { getTool } from '../tools/registry';
import { markStudied, openLesson, recordLessonCheck, saveNote, useApp } from '../store/store';
import { QuizRunner } from '../components/quiz/QuizRunner';
import { Diagram } from '../components/visuals/Diagrams';
import { Markdown } from '../components/ui/Markdown';
import { Badge, Button, Callout, Card, cx, EmptyState, LinkButton, Spinner, Textarea } from '../components/ui';

const SECTIONS = [
  ['learn', 'What you will learn'],
  ['why', 'Why it matters'],
  ['visual', 'Visual explanation'],
  ['theory', 'Core theory'],
  ['worked', 'Worked example'],
  ['demo', 'Interactive demo'],
  ['mistakes', 'Common mistakes'],
  ['check', 'Knowledge check'],
  ['challenge', 'Practical challenge'],
  ['summary', 'Summary & review'],
] as const;

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid size-7 place-items-center rounded-lg border border-accent/40 bg-accent/10 font-mono text-xs text-accent">{n}</span>
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function FlowVisual({ steps, caption }: { steps: string[]; caption: string }) {
  return (
    <figure className="rounded-xl border border-line bg-bg-2 p-4 grid-bg">
      <ol className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {steps.map((st, i) => (
          <li key={i} className="flex items-center gap-2 sm:flex-1 sm:basis-36">
            <div className="flex-1 rounded-xl border border-accent/40 bg-panel/90 px-3 py-2.5 text-center text-[13px] text-fg">
              <span className="mr-1.5 font-mono text-[11px] text-accent">{i + 1}</span>{st}
            </div>
            {i < steps.length - 1 && <ArrowRight size={16} className="hidden shrink-0 text-accent sm:block" />}
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 text-center text-[13px] text-fg-3">{caption}</figcaption>
    </figure>
  );
}

function NoteBox({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const s = useApp();
  const existing = s.notes.find((n) => n.lessonId === lessonId);
  const [body, setBody] = useState(existing?.body ?? '');
  const [saved, setSaved] = useState(false);
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-fg"><NotebookPen size={15} className="text-accent" /> My notes</div>
      <Textarea aria-label="Lesson notes" rows={4} value={body} onChange={(e) => { setBody(e.target.value); setSaved(false); }} placeholder="Explain the idea in your own words, record what went wrong, or what you'd test next…" />
      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" onClick={() => { saveNote({ id: existing?.id ?? uid('note'), title: lessonTitle, body, tags: ['lesson'], lessonId }); setSaved(true); }} disabled={!body.trim()}><Save size={14} /> Save note</Button>
        {saved && <span className="text-xs text-good">Saved to your profile</span>}
      </div>
    </Card>
  );
}

function WorkedExample({ problem, steps, answer }: { problem: string; steps: string[]; answer: string }) {
  const [shown, setShown] = useState(0);
  return (
    <Card className="p-5">
      <Markdown text={`**Problem.** ${problem}`} />
      <p className="mt-2 text-xs text-fg-3">Try each step yourself before revealing it.</p>
      <ol className="mt-3 space-y-2">
        {steps.slice(0, shown).map((st, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-line bg-panel-2/50 p-3 fade-in">
            <span className="font-mono text-xs text-accent">{i + 1}</span>
            <Markdown text={st} className="[&_p]:m-0" />
          </li>
        ))}
      </ol>
      {shown < steps.length ? (
        <Button size="sm" className="mt-3" onClick={() => setShown(shown + 1)}>Reveal step {shown + 1} of {steps.length}</Button>
      ) : (
        <div className="mt-3 rounded-xl border border-good/40 bg-good/5 p-3 fade-in"><Markdown text={`**Answer.** ${answer}`} className="[&_p]:m-0" /></div>
      )}
    </Card>
  );
}

export default function LessonPage() {
  const { moduleId = '', lessonId = '' } = useParams();
  const s = useApp();
  const found = findLesson(lessonId);
  const [round, setRound] = useState(0);
  const [active, setActive] = useState('learn');

  useEffect(() => {
    if (found && found.module.id === moduleId) openLesson(moduleId, lessonId);
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) setActive(vis.target.id);
    }, { rootMargin: '-80px 0px -60% 0px' });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [lessonId]);

  const checkQs = useMemo(() => (found?.lesson.check ? shuffle(getQuestions(found.lesson.check)) : []), [found?.lesson.check, round]);

  if (!found || found.module.id !== moduleId) return <EmptyState title="Lesson not found" action={<LinkButton to="/courses">Back to courses</LinkButton>} />;
  const { module, lesson, index } = found;
  const mp = moduleProgress(s, module);
  const locked = mp.status === 'locked';
  const done = lessonDone(s, lesson.id);
  const prev = module.lessons[index - 1];
  const next = module.lessons[index + 1];
  const tool = lesson.demo ? getTool(lesson.demo.tool) : undefined;
  const ToolComp = tool?.component;
  const exercise = lesson.challenge?.exerciseId ? getExercise(lesson.challenge.exerciseId) : undefined;

  const nav = (
    <div className="flex items-center justify-between gap-2 border-t border-line pt-5">
      {prev ? <LinkButton to={`/courses/${module.id}/${prev.id}`} variant="ghost"><ArrowLeft size={15} /> <span className="hidden sm:inline">{prev.title}</span><span className="sm:hidden">Previous</span></LinkButton> : <span />}
      {next ? <LinkButton to={`/courses/${module.id}/${next.id}`}><span className="hidden sm:inline">{next.title}</span><span className="sm:hidden">Next</span> <ArrowRight size={15} /></LinkButton> : <LinkButton to={`/courses/${module.id}`}>Module overview <ArrowRight size={15} /></LinkButton>}
    </div>
  );

  // ---------- Outline (study notes) lessons ----------
  if (lesson.status === 'outline') {
    const studied = s.lessons[lesson.id]?.studiedAt;
    return (
      <div className="mx-auto max-w-3xl space-y-5 fade-in">
        <Link to={`/courses/${module.id}`} className="inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> {module.title}</Link>
        <div>
          <div className="mb-1 flex items-center gap-2"><Badge>Study notes</Badge><span className="font-mono text-xs text-fg-3">Lesson {index + 1} of {module.lessons.length}</span></div>
          <h1 className="text-2xl font-semibold text-fg">{lesson.title}</h1>
        </div>
        <Card className="p-5">
          <div className="mb-2 text-sm font-medium text-accent">Why this matters</div>
          <p className="text-[15px] text-fg-2">{lesson.why}</p>
        </Card>
        <Card className="p-5"><Markdown text={lesson.theory} /></Card>
        <Callout tone="blue" icon={<BookMarked size={16} />} title="How this topic is assessed">
          These notes summarise the topic. You demonstrate it through the module exam, the Engineering Lab and your projects — reading alone earns no XP.
        </Callout>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => markStudied(lesson.id)} disabled={Boolean(studied)}>{studied ? <><CheckCircle2 size={15} /> Marked as studied</> : 'Mark as studied'}</Button>
          <LinkButton to="/resources" variant="ghost">Find references</LinkButton>
        </div>
        <NoteBox lessonId={lesson.id} lessonTitle={lesson.title} />
        {nav}
      </div>
    );
  }

  // ---------- Full interactive lessons ----------
  return (
    <div className="fade-in">
      <Link to={`/courses/${module.id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> {module.title}</Link>
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="accent">Interactive lesson</Badge>
          <Badge>{lesson.minutes} min</Badge>
          {done && <Badge tone="good"><CheckCircle2 size={11} /> Completed</Badge>}
          {locked && <Badge tone="warn"><Lock size={11} /> Preview</Badge>}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">{lesson.title}</h1>
      </div>

      {/* Mobile section chips */}
      <div className="sticky top-16 z-10 -mx-4 mb-4 flex gap-1.5 overflow-x-auto border-b border-line bg-bg/90 px-4 py-2 backdrop-blur lg:hidden">
        {SECTIONS.map(([id, label], i) => <a key={id} href={`#${id}`} className={cx('shrink-0 rounded-lg border px-2.5 py-1 text-[11px]', active === id ? 'border-accent text-accent' : 'border-line text-fg-3')}>{i + 1}. {label}</a>)}
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Lesson sections" className="sticky top-24 hidden h-fit space-y-0.5 lg:block">
          {SECTIONS.map(([id, label], i) => (
            <a key={id} href={`#${id}`} className={cx('flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition', active === id ? 'bg-panel-2 text-accent' : 'text-fg-3 hover:text-fg')}>
              <span className="font-mono text-[10px]">{String(i + 1).padStart(2, '0')}</span> {label}
            </a>
          ))}
        </nav>

        <div className="min-w-0 max-w-3xl space-y-10">
          <Section id="learn" n={1} title="What you will learn">
            <Card className="p-5"><ul className="space-y-2">{lesson.objectives.map((o) => <li key={o} className="flex gap-2 text-[15px] text-fg-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />{o}</li>)}</ul></Card>
          </Section>

          <Section id="why" n={2} title="Why this matters in real engineering">
            <Markdown text={lesson.why} className="text-[15px]" />
          </Section>

          <Section id="visual" n={3} title="Visual explanation">
            {lesson.visual?.diagram ? <Diagram id={lesson.visual.diagram} caption={lesson.visual.caption} />
              : lesson.visual?.flow ? <FlowVisual steps={lesson.visual.flow} caption={lesson.visual.caption} />
              : lesson.visual?.md ? <figure className="rounded-xl border border-line bg-bg-2 p-4"><Markdown text={lesson.visual.md} /><figcaption className="mt-2 text-center text-[13px] text-fg-3">{lesson.visual.caption}</figcaption></figure>
              : <p className="text-sm text-fg-3">See the interactive demonstration below.</p>}
          </Section>

          <Section id="theory" n={4} title="Core theory">
            <Markdown text={lesson.theory} className="text-[15px]" />
          </Section>

          <Section id="worked" n={5} title="Worked example">
            {lesson.worked && <WorkedExample {...lesson.worked} />}
          </Section>

          <Section id="demo" n={6} title="Interactive demonstration">
            {lesson.demo && ToolComp && (
              <div className="space-y-3">
                <Markdown text={lesson.demo.intro} />
                <Card className="p-4">
                  <Suspense fallback={<Spinner label="Loading tool" />}><ToolComp /></Suspense>
                </Card>
                <Link to={`/tools/${tool!.id}`} className="text-sm text-accent underline">Open {tool!.title} full screen</Link>
              </div>
            )}
            {!ToolComp && lesson.tryIt && (
              <Card className="p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-accent"><FlaskConical size={15} /> Try it yourself</div>
                <Markdown text={lesson.tryIt} />
              </Card>
            )}
          </Section>

          <Section id="mistakes" n={7} title="Common mistakes">
            <div className="grid gap-3">
              {lesson.mistakes?.map((m) => (
                <Card key={m.mistake} className="grid gap-2 p-4 sm:grid-cols-2">
                  <div className="flex gap-2 text-sm text-fg-2"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn" /><Markdown text={m.mistake} className="[&_p]:m-0" /></div>
                  <div className="flex gap-2 text-sm text-fg-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-good" /><Markdown text={m.fix} className="[&_p]:m-0" /></div>
                </Card>
              ))}
            </div>
          </Section>

          <Section id="check" n={8} title="Quick knowledge check">
            {locked ? (
              <Callout tone="warn" icon={<Lock size={16} />} title="Unlock the module to take the check">Pass the prerequisite exam(s) first. Lesson completion and XP require a passed check.</Callout>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-fg-3">Pass at {s.settings.mastery}% or higher to complete this lesson{done ? ' (already completed — retakes are tracked as practice)' : ' and earn 20 XP'}. Mistakes go to your Revision Center.</p>
                <QuizRunner
                  key={`${lesson.id}-${round}`}
                  questions={checkQs}
                  mode="practice"
                  mastery={s.settings.mastery}
                  onComplete={(answers) => {
                    recordLessonCheck(lesson.id, answers);
                    const pct = Math.round((answers.filter((a) => a.correct).length / answers.length) * 100);
                    return { percent: pct, passed: pct >= s.settings.mastery };
                  }}
                  onRetake={() => setRound((r) => r + 1)}
                  passMessage="Lesson complete — the flashcards for this lesson are now in your revision queue."
                />
              </div>
            )}
          </Section>

          <Section id="challenge" n={9} title="Practical challenge">
            {lesson.challenge && (
              <Card className="p-5">
                <Markdown text={lesson.challenge.prompt} />
                {exercise && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <LinkButton to={`/lab/${exercise.id}`} variant="primary"><FlaskConical size={15} /> Open "{exercise.title}"</LinkButton>
                    {s.exercises[exercise.id]?.solvedAt && <Badge tone="good"><CheckCircle2 size={11} /> Solved</Badge>}
                  </div>
                )}
                <p className="mt-3 text-xs text-fg-3">Solutions stay hidden until you attempt the challenge. Try alone first, then use the three-level hints.</p>
              </Card>
            )}
          </Section>

          <Section id="summary" n={10} title="Summary and review">
            <Card className="p-5">
              <ul className="space-y-2">{lesson.summary.map((x) => <li key={x} className="flex gap-2 text-[15px] text-fg-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" /><Markdown text={x} className="[&_p]:m-0" /></li>)}</ul>
            </Card>
            {lesson.flashcards && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {lesson.flashcards.map((f) => (
                  <details key={f.id} className="group rounded-xl border border-line bg-panel/80 p-3">
                    <summary className="cursor-pointer list-none text-sm font-medium text-fg">{f.front}</summary>
                    <p className="mt-2 font-mono text-sm text-accent">{f.back}</p>
                  </details>
                ))}
              </div>
            )}
            <div className="mt-4"><NoteBox lessonId={lesson.id} lessonTitle={lesson.title} /></div>
          </Section>

          {nav}
        </div>
      </div>
    </div>
  );
}
