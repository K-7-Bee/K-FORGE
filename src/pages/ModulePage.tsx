import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, ClipboardCheck, FileText, FlaskConical, Lock, Target, Wrench } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getModule } from '../data/curriculum';
import { EXERCISES } from '../data/lab';
import { CAPSTONE } from '../data/projects';
import { moduleProgress, lessonDone, exerciseSolved } from '../engine/progress';
import { useApp } from '../store/store';
import { Badge, Callout, Card, CardHeader, cx, EmptyState, LinkButton, PageHeader, ProgressBar } from '../components/ui';
import { LAB_LEVELS } from '../data/lab';

export default function ModulePage() {
  const { moduleId = '' } = useParams();
  const s = useApp();
  const m = getModule(moduleId);
  if (!m) return <EmptyState title="Module not found" action={<LinkButton to="/courses">Back to courses</LinkButton>} />;
  const mp = moduleProgress(s, m);
  const exercises = EXERCISES.filter((e) => e.moduleId === m.id);
  const locked = mp.status === 'locked';

  const reqs = [
    { label: `Complete all ${mp.fullLessons} interactive lessons (pass each knowledge check)`, met: mp.completedLessons === mp.fullLessons, detail: `${mp.completedLessons}/${mp.fullLessons}` },
    { label: `Pass the module examination in exam mode (≥ ${s.settings.mastery}%)`, met: mp.examPassed, detail: mp.examBest !== undefined ? `best ${mp.examBest}%` : 'not attempted' },
    { label: m.id === 'm-capstone' ? 'Complete the capstone project with evidence and measurements' : 'Complete at least one practical lab with verified results', met: mp.practicalDone, detail: mp.practicalLabel },
  ];

  return (
    <div className="space-y-6 fade-in">
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> All courses</Link>
      <PageHeader
        eyebrow={`Phase ${m.phase}${m.track === 'career' ? ' · Career track' : ''}`}
        title={m.title}
        subtitle={m.summary}
        actions={
          <>
            {!locked && <LinkButton to={`/tests/run?kind=module&ref=${m.id}`} variant="primary"><ClipboardCheck size={15} /> Module exam</LinkButton>}
            {m.id === 'm-capstone' && <LinkButton to={`/projects/${CAPSTONE.id}`}>Open workspace <ArrowRight size={15} /></LinkButton>}
          </>
        }
      />

      {locked && (
        <Callout tone="warn" icon={<Lock size={16} />} title="Locked — preview mode">
          Pass the prerequisite exam{mp.missingPrereqs.length > 1 ? 's' : ''} for {mp.missingPrereqs.map((p) => <Link key={p.id} to={`/courses/${p.id}`} className="mx-1 text-accent underline">{p.short}</Link>)}
          {m.placementAreas?.length ? ' or score at mastery level in the matching placement area' : ''} to unlock knowledge checks and the exam. You can still read every lesson. XP alone never unlocks a module.
        </Callout>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader icon={<Target size={18} />} title="Learning objectives" />
          <ul className="grid gap-2 p-5 sm:grid-cols-2">
            {m.objectives.map((o) => <li key={o} className="flex gap-2 text-sm text-fg-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-accent" /> {o}</li>)}
          </ul>
          <div className="border-t border-line px-5 py-4 text-sm text-fg-2"><span className="font-medium text-fg">Real engineering use: </span>{m.realWorld}</div>
        </Card>
        <Card>
          <CardHeader title="Completion requirements" subtitle={`${mp.percent}% complete`} />
          <div className="space-y-3 p-5">
            <ProgressBar value={mp.percent} label="Module completion" />
            {reqs.map((r) => (
              <div key={r.label} className="flex gap-2 text-sm">
                {r.met ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-good" /> : <Circle size={16} className="mt-0.5 shrink-0 text-fg-3" />}
                <div><div className={r.met ? 'text-fg' : 'text-fg-2'}>{r.label}</div><div className="text-[12px] text-fg-3">{r.detail}</div></div>
              </div>
            ))}
            <div className="border-t border-line pt-3 text-[12px] text-fg-3">
              Prerequisites: {m.prerequisites.length ? m.prerequisites.map((p) => getModule(p)?.short).join(', ') : 'none'}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader icon={<BookOpen size={18} />} title="Lessons" subtitle="Every lesson follows the 10-step interactive structure and completes when you pass its knowledge check." />
        <ol className="divide-y divide-line">
          {m.lessons.map((l, i) => {
            const done = lessonDone(s, l.id);
            const studied = s.lessons[l.id]?.studiedAt;
            return (
              <li key={l.id}>
                <Link to={`/courses/${m.id}/${l.id}`} className="flex items-center gap-4 px-5 py-3 transition hover:bg-panel-2/50">
                  <span className={cx('grid size-8 shrink-0 place-items-center rounded-lg border font-mono text-xs', done ? 'border-good/50 bg-good/10 text-good' : l.status === 'full' ? 'border-accent/40 text-accent' : 'border-line text-fg-3')}>
                    {done ? <CheckCircle2 size={15} /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-fg">{l.title}</div>
                    <div className="text-[12px] text-fg-3">{l.status === 'full' ? `Interactive · ${l.minutes} min · knowledge check` : `Study notes${studied ? ' · studied' : ''}`}</div>
                  </div>
                  {l.status === 'full' ? <Badge tone="accent">+20 XP</Badge> : <FileText size={15} className="text-fg-3" />}
                  {l.demo && <Wrench size={15} className="hidden text-fg-3 sm:block" />}
                </Link>
              </li>
            );
          })}
        </ol>
      </Card>

      {exercises.length > 0 && (
        <Card>
          <CardHeader icon={<FlaskConical size={18} />} title="Practical laboratory" subtitle="Exercises marked ★ satisfy this module's practical requirement." />
          <div className="grid gap-2 p-5 sm:grid-cols-2">
            {exercises.map((e) => (
              <Link key={e.id} to={`/lab/${e.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-line-strong">
                {exerciseSolved(s, e.id) ? <CheckCircle2 size={16} className="shrink-0 text-good" /> : <Circle size={16} className="shrink-0 text-fg-3" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-fg">{m.labIds.includes(e.id) && <span className="text-warn">★ </span>}{e.title}</div>
                  <div className="text-[11px] text-fg-3">{LAB_LEVELS.find((l) => l.id === e.level)?.label}{e.hardware ? ' · hardware' : ''}</div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
