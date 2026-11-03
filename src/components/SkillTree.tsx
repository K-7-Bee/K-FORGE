import { CheckCircle2, Lock, PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CORE_MODULES } from '../data/curriculum';
import { moduleProgress, type ModuleStatus } from '../engine/progress';
import type { AppState } from '../store/types';
import { cx } from './ui';

// Layered layout of the core skill tree (left → right follows prerequisites).
const LAYERS: string[][] = [
  ['m-electronics', 'm-c', 'm-python'],
  ['m-digital', 'm-cpp'],
  ['m-arch', 'm-arduino'],
  ['m-esp32', 'm-stm32', 'm-control'],
  ['m-rtos'],
  ['m-capstone'],
];

const STATUS: Record<ModuleStatus, { label: string; cls: string; icon: typeof Lock }> = {
  locked: { label: 'Locked', cls: 'border-line text-fg-3 bg-panel-2/40', icon: Lock },
  available: { label: 'Available', cls: 'border-accent-2/50 text-fg bg-accent-2/5', icon: Sparkles },
  learning: { label: 'Learning', cls: 'border-accent/60 text-fg bg-accent/5 glow', icon: PlayCircle },
  mastered: { label: 'Mastered', cls: 'border-good/60 text-fg bg-good/10', icon: CheckCircle2 },
};

export function SkillTree({ state }: { state: AppState }) {
  const byId = new Map(CORE_MODULES.map((m) => [m.id, m]));
  const W = 1100;
  const colW = W / LAYERS.length;
  const pos = new Map<string, { x: number; y: number }>();
  LAYERS.forEach((layer, c) => layer.forEach((id, r) => pos.set(id, { x: c * colW + colW / 2, y: 70 + r * 120 + (3 - layer.length) * 60 })));
  const H = 400;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3 text-[12px]">
        {(Object.keys(STATUS) as ModuleStatus[]).map((k) => {
          const Icon = STATUS[k].icon;
          return <span key={k} className="flex items-center gap-1.5 text-fg-3"><Icon size={13} /> {STATUS[k].label}</span>;
        })}
      </div>
      {/* Desktop: graph */}
      <div className="relative hidden overflow-x-auto md:block">
        <div className="relative" style={{ width: W, height: H }}>
          <svg className="absolute inset-0" width={W} height={H} aria-hidden>
            {CORE_MODULES.flatMap((m) =>
              m.prerequisites.map((p) => {
                const a = pos.get(p);
                const b = pos.get(m.id);
                if (!a || !b) return null;
                const done = moduleProgress(state, byId.get(p)!).examPassed;
                return <path key={`${p}-${m.id}`} d={`M ${a.x + 80} ${a.y} C ${a.x + 140} ${a.y}, ${b.x - 140} ${b.y}, ${b.x - 80} ${b.y}`} fill="none" stroke={done ? 'var(--accent)' : 'var(--line-strong)'} strokeWidth={2} strokeDasharray={done ? undefined : '5 5'} />;
              }),
            )}
          </svg>
          {[...pos.entries()].map(([id, p]) => {
            const m = byId.get(id)!;
            const mp = moduleProgress(state, m);
            const st = STATUS[mp.status];
            const Icon = st.icon;
            return (
              <Link key={id} to={`/courses/${id}`} className={cx('absolute flex w-40 -translate-x-1/2 -translate-y-1/2 flex-col gap-1 rounded-xl border p-2.5 transition hover:-translate-y-[calc(50%+2px)]', st.cls)} style={{ left: p.x, top: p.y }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-fg-3">PHASE {m.phase}</span>
                  <Icon size={13} className={mp.status === 'mastered' ? 'text-good' : mp.status === 'learning' ? 'text-accent' : ''} />
                </div>
                <div className="text-[13px] font-medium leading-tight">{m.short}</div>
                <div className="h-1 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent" style={{ width: `${mp.percent}%` }} /></div>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Mobile: ordered list */}
      <ol className="space-y-2 md:hidden">
        {LAYERS.flat().map((id) => {
          const m = byId.get(id)!;
          const mp = moduleProgress(state, m);
          const st = STATUS[mp.status];
          const Icon = st.icon;
          return (
            <li key={id}>
              <Link to={`/courses/${id}`} className={cx('flex items-center gap-3 rounded-xl border p-3', st.cls)}>
                <Icon size={16} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{m.short}</div>
                  <div className="text-[11px] text-fg-3">Phase {m.phase} · {st.label} · {mp.percent}%</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
