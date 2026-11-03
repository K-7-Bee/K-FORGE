import { Award, CheckCircle2, Info, Sparkles, TrendingUp, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { onToast, type Toast } from '../../lib/toast';
import { cx } from '../ui';

const ICON = { xp: Sparkles, achievement: Award, level: TrendingUp, info: Info, error: XCircle, success: CheckCircle2 };

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(
    () =>
      onToast((t) => {
        setItems((cur) => [...cur.slice(-4), t]);
        setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== t.id)), t.kind === 'achievement' || t.kind === 'level' ? 6000 : 3200);
      }),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6" aria-live="polite">
      {items.map((t) => {
        const Icon = ICON[t.kind];
        return (
          <div
            key={t.id}
            className={cx(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-panel/95 p-3 shadow-2xl backdrop-blur fade-in',
              t.kind === 'achievement' || t.kind === 'level' ? 'border-accent/60 glow' : t.kind === 'error' ? 'border-bad/50' : 'border-line-strong',
            )}
          >
            <Icon size={18} className={cx('mt-0.5 shrink-0', t.kind === 'error' ? 'text-bad' : t.kind === 'xp' ? 'text-accent' : 'text-accent-3')} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-fg">{t.title}</div>
              {t.detail && <div className="text-xs text-fg-3">{t.detail}</div>}
            </div>
            <button onClick={() => setItems((cur) => cur.filter((x) => x.id !== t.id))} className="text-fg-3 hover:text-fg" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
