import { ArrowRight, BookOpen, CheckCircle2, Lock, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CAREER_MODULES, CORE_MODULES } from '../data/curriculum';
import type { Module } from '../data/types';
import { moduleProgress } from '../engine/progress';
import { useApp } from '../store/store';
import type { AppState } from '../store/types';
import { Badge, Card, cx, Input, PageHeader, ProgressBar } from '../components/ui';

function ModuleCard({ m, s }: { m: Module; s: AppState }) {
  const mp = moduleProgress(s, m);
  const full = m.lessons.filter((l) => l.status === 'full').length;
  return (
    <Link to={`/courses/${m.id}`} className="group block">
      <Card className={cx('flex h-full flex-col p-4 transition group-hover:border-line-strong', mp.status === 'learning' && 'border-accent/40')}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-widest text-fg-3">Phase {m.phase}</span>
          {mp.status === 'locked' ? <Badge><Lock size={11} /> Locked</Badge> : mp.status === 'mastered' ? <Badge tone="good"><CheckCircle2 size={11} /> Mastered</Badge> : mp.status === 'learning' ? <Badge tone="accent">In progress</Badge> : <Badge tone="blue">Available</Badge>}
        </div>
        <h3 className="mt-2 font-semibold text-fg">{m.title}</h3>
        <p className="mt-1 line-clamp-3 flex-1 text-sm text-fg-3">{m.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <Badge><BookOpen size={11} /> {m.lessons.length} lessons</Badge>
          {full > 0 && <Badge tone="accent">{full} interactive</Badge>}
          <Badge>{m.examQuestionIds.length}-question exam pool</Badge>
        </div>
        {mp.missingPrereqs.length > 0 && <p className="mt-2 text-[12px] text-fg-3">Requires: {mp.missingPrereqs.map((p) => p.short).join(', ')}</p>}
        <div className="mt-3 flex items-center gap-3">
          <ProgressBar value={mp.percent} label={`${m.title} progress`} />
          <span className="font-mono text-xs text-fg-3">{mp.percent}%</span>
          <ArrowRight size={15} className="text-fg-3 transition group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
      </Card>
    </Link>
  );
}

export default function Courses() {
  const s = useApp();
  const [q, setQ] = useState('');
  const match = (m: Module) => !q || `${m.title} ${m.summary} ${m.lessons.map((l) => l.title).join(' ')}`.toLowerCase().includes(q.toLowerCase());
  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        eyebrow="Courses"
        title="Engineering curriculum"
        subtitle="Each module has objectives, prerequisites, lessons, worked examples, labs, knowledge checks and a module exam. Interactive lessons award XP only when you pass their knowledge check."
        actions={
          <div className="relative w-full sm:w-72">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3" />
            <Input aria-label="Search courses" placeholder="Search modules and lessons…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
        }
      />
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-fg-3">Core engineering track</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{CORE_MODULES.filter(match).map((m) => <ModuleCard key={m.id} m={m} s={s} />)}</div>
      </section>
      <section>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-widest text-fg-3">Career & professional development</h2>
        <p className="mb-3 text-sm text-fg-3">Separate from the engineering skill tree — these never gate technical progress.</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{CAREER_MODULES.filter(match).map((m) => <ModuleCard key={m.id} m={m} s={s} />)}</div>
      </section>
    </div>
  );
}
