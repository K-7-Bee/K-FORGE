import { ArrowRight, Bot, CheckCircle2, Compass, Flag, Lock, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MODULES, PHASES } from '../data/curriculum';
import { CAPSTONE } from '../data/projects';
import { capstoneMilestonesDone, moduleProgress, placementAreaLabel, recommendedPhase } from '../engine/progress';
import { useApp } from '../store/store';
import { SkillTree } from '../components/SkillTree';
import { Badge, Card, CardHeader, cx, LinkButton, PageHeader, ProgressBar } from '../components/ui';

const GATES = [
  { phase: 'Gate 1', text: 'Build a sensor project without a tutorial, and explain every line', after: 6 },
  { phase: 'Gate 2', text: 'Make the robot drive straight, with measured wheel speed', after: 10 },
  { phase: 'Gate 3', text: 'Make the robot avoid obstacles and stream air-quality data', after: 12 },
  { phase: 'Gate 4', text: 'Document your test results and finish your portfolio', after: 12 },
  { phase: 'Gate 5', text: 'Land an embedded job in Germany (or your chosen country)', after: 13 },
];

export default function LearningPath() {
  const s = useApp();
  const rec = recommendedPhase(s);
  return (
    <div className="space-y-6 fade-in">
      <PageHeader eyebrow="Learning path" title="From foundations to independent engineer" subtitle="Move forward by passing each module's exam and practical work — not because a date has arrived. Foundational material always stays open for revision." />

      <Card className="p-5" glow={!s.placement}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent"><Compass size={24} /></div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[11px] uppercase tracking-widest text-accent">Phase 0 · Initial engineering assessment</div>
            {s.placement ? (
              <>
                <div className="mt-1 font-semibold text-fg">Recommended start: Phase {rec} — {PHASES.find((p) => p.number === rec)?.title}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(s.placement.perArea).map(([area, pct]) => <Badge key={area} tone={pct >= s.settings.mastery ? 'good' : 'warn'}>{placementAreaLabel(area)}: {pct}%</Badge>)}
                </div>
              </>
            ) : (
              <div className="mt-1 text-sm text-fg-2">Take the placement assessment to get a recommended starting point. High scores unlock later modules early — they never lock you out of foundations.</div>
            )}
          </div>
          <LinkButton to="/tests/run?kind=placement" variant={s.placement ? 'secondary' : 'primary'}>{s.placement ? 'Retake' : 'Start'} <ArrowRight size={15} /></LinkButton>
        </div>
      </Card>

      <Card>
        <CardHeader title="Engineering skill tree" subtitle="Electronics → Digital → C → Embedded C/C++ → Microcontrollers → Protocols → RTOS → Control → Robotics" />
        <div className="p-5"><SkillTree state={s} /></div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ol className="relative space-y-3 border-l border-line pl-6">
          {PHASES.filter((p) => p.number > 0).map((p) => {
            const mods = MODULES.filter((m) => m.phase === p.number);
            const infos = mods.map((m) => moduleProgress(s, m));
            const pct = infos.length ? Math.round(infos.reduce((a, i) => a + i.percent, 0) / infos.length) : 0;
            const locked = infos.every((i) => i.status === 'locked');
            const mastered = infos.length > 0 && infos.every((i) => i.status === 'mastered');
            const isRec = s.placement && p.number === rec;
            return (
              <li key={p.number} className="relative">
                <span className={cx('absolute -left-[33px] top-4 grid size-5 place-items-center rounded-full border text-[10px]', mastered ? 'border-good bg-good text-bg' : locked ? 'border-line-strong bg-bg text-fg-3' : 'border-accent bg-bg text-accent')}>
                  {mastered ? <CheckCircle2 size={12} /> : locked ? <Lock size={10} /> : p.number}
                </span>
                <Card className={cx('p-4', isRec && 'glow')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-fg-3">Phase {p.number}</span>
                    {p.number === 13 && <Badge tone="purple">Career track</Badge>}
                    {isRec && <Badge tone="accent">Recommended start</Badge>}
                    {mastered && <Badge tone="good">Mastered</Badge>}
                  </div>
                  <div className="mt-1 font-semibold text-fg">{p.title}</div>
                  <p className="text-sm text-fg-3">{p.blurb}</p>
                  {p.number === 12 && <p className="mt-1 text-xs text-fg-3">Capstone milestones: {capstoneMilestonesDone(s)}/{CAPSTONE.milestones.length}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <ProgressBar value={pct} className="max-w-xs" label={`Phase ${p.number} progress`} />
                    <span className="font-mono text-xs text-fg-3">{pct}%</span>
                    <div className="ml-auto flex flex-wrap gap-2">
                      {mods.map((m) => <LinkButton key={m.id} to={`/courses/${m.id}`} size="sm">{m.short} <ArrowRight size={13} /></LinkButton>)}
                      {p.number === 12 && <LinkButton to={`/projects/${CAPSTONE.id}`} size="sm" variant="primary"><Bot size={13} /> Workspace</LinkButton>}
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>

        <div className="space-y-4">
          <Card>
            <CardHeader icon={<Flag size={18} />} title="Phase gates" subtitle="Pass each with your own code and your own explanation." />
            <ul className="space-y-2 p-5">
              {GATES.map((g) => (
                <li key={g.phase} className="rounded-xl border border-line p-3 text-sm">
                  <div className="font-mono text-[11px] text-accent">{g.phase}</div>
                  <div className="text-fg-2">{g.text}</div>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader icon={<MessageSquareText size={18} />} title="How to learn with AI" subtitle="Use AI as a tutor, not as the author of your work." />
            <ol className="list-decimal space-y-1.5 py-5 pl-10 pr-5 text-sm text-fg-2">
              <li><span className="text-fg">Try alone for 20–30 minutes.</span> Write what you expect, then test it.</li>
              <li><span className="text-fg">Check the documentation:</span> datasheet, reference manual, your notes.</li>
              <li><span className="text-fg">Ask for a hint,</span> showing your attempt and the exact error — not for the solution.</li>
              <li><span className="text-fg">Redo it without help</span> from a blank file. If you can't, you aren't finished yet.</li>
            </ol>
            <div className="px-5 pb-5"><Link to="/mentor" className="text-sm text-accent underline">Open the Engineering Mentor</Link></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
