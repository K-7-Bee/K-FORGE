import { CheckCircle2, Circle, Cpu, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getModule } from '../data/curriculum';
import { EXERCISES, LAB_LEVELS } from '../data/lab';
import { DIFFICULTY_LABEL, type LabLevel } from '../data/types';
import { exerciseSolved, moduleProgress } from '../engine/progress';
import { useApp } from '../store/store';
import { Badge, Card, cx, Input, PageHeader, Segmented } from '../components/ui';

export default function Lab() {
  const s = useApp();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<'all' | 'code' | 'hardware' | 'question'>('all');
  const solvedCount = EXERCISES.filter((e) => exerciseSolved(s, e.id)).length;
  const filtered = EXERCISES.filter((e) => {
    if (q && !`${e.title} ${e.tags.join(' ')} ${e.objective}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (kind === 'code') return e.kind === 'code';
    if (kind === 'hardware') return Boolean(e.hardware);
    if (kind === 'question') return e.kind === 'question';
    return true;
  });
  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        eyebrow="Engineering Lab"
        title="Practice laboratory"
        subtitle={`Understand → Implement → Debug → Create. ${solvedCount}/${EXERCISES.length} exercises solved. Full XP is awarded once per exercise; a bonus is added when you solve without hints.`}
        actions={
          <div className="relative w-full sm:w-64">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3" />
            <Input aria-label="Search exercises" placeholder="Search exercises…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
        }
      />
      <Segmented label="Exercise type" value={kind} onChange={setKind} options={[{ value: 'all', label: 'All' }, { value: 'code', label: 'Coding' }, { value: 'question', label: 'Auto-graded' }, { value: 'hardware', label: 'Hardware' }]} />
      {LAB_LEVELS.map((lvl) => {
        const items = filtered.filter((e) => e.level === (lvl.id as LabLevel));
        if (!items.length) return null;
        return (
          <section key={lvl.id}>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-fg">{lvl.label}</h2>
              <p className="text-sm text-fg-3">{lvl.items.join(' · ')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((e) => {
                const solved = exerciseSolved(s, e.id);
                const m = getModule(e.moduleId)!;
                const locked = moduleProgress(s, m).status === 'locked';
                return (
                  <Link key={e.id} to={`/lab/${e.id}`} className="group">
                    <Card className={cx('flex h-full flex-col p-4 transition group-hover:border-line-strong', solved && 'border-good/30')}>
                      <div className="flex items-start gap-2">
                        {solved ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-good" /> : <Circle size={17} className="mt-0.5 shrink-0 text-fg-3" />}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-fg">{e.title}</div>
                          <div className="text-[12px] text-fg-3">{m.short}{locked && ' · module locked (practice allowed)'}</div>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-fg-3">{e.objective}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge tone={e.difficulty === 3 ? 'purple' : e.difficulty === 2 ? 'accent' : 'neutral'}>{DIFFICULTY_LABEL[e.difficulty]}</Badge>
                        {e.kind === 'code' && <Badge tone="blue"><Cpu size={11} /> {e.language.toUpperCase()}</Badge>}
                        {e.kind === 'rubric' && <Badge tone="warn">Evidence + rubric</Badge>}
                        {e.kind === 'question' && <Badge>Auto-graded</Badge>}
                        {e.hardware && <Badge tone="good">Hardware</Badge>}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
