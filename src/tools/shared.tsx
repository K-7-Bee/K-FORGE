import type { ReactNode } from 'react';
import { cx } from '../components/ui';

export function fmtSI(value: number, unit: string, digits = 3): string {
  if (!Number.isFinite(value)) return `— ${unit}`;
  if (value === 0) return `0 ${unit}`;
  const prefixes: [number, string][] = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n']];
  const abs = Math.abs(value);
  for (const [f, p] of prefixes) {
    if (abs >= f * 0.9999) return `${Number((value / f).toPrecision(digits))} ${p}${unit}`;
  }
  return `${Number((value / 1e-9).toPrecision(digits))} n${unit}`;
}

export function ToolGrid({ controls, output }: { controls: ReactNode; output: ReactNode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div className="space-y-4 rounded-2xl border border-line bg-panel-2/40 p-4">{controls}</div>
      <div className="min-w-0 space-y-4">{output}</div>
    </div>
  );
}

export function Readout({ label, value, accent, sub }: { label: string; value: ReactNode; accent?: boolean; sub?: ReactNode }) {
  return (
    <div className={cx('rounded-xl border p-3', accent ? 'border-accent/40 bg-accent/5' : 'border-line bg-panel-2/50')}>
      <div className="text-[11px] uppercase tracking-wider text-fg-3">{label}</div>
      <div className={cx('mt-0.5 font-mono text-lg font-semibold', accent ? 'text-accent' : 'text-fg')} aria-live="polite">{value}</div>
      {sub && <div className="text-[11px] text-fg-3">{sub}</div>}
    </div>
  );
}

/** Digital waveform: each entry is one time slot (0/1, or null for idle/high-Z drawn dashed). */
export function Wave({ bits, label, color = 'var(--accent)', labels, height = 46, highlight }: { bits: (0 | 1 | null)[]; label: string; color?: string; labels?: (string | undefined)[]; height?: number; highlight?: number[] }) {
  const w = 22;
  const hi = 8;
  const lo = height - 14;
  let d = '';
  bits.forEach((b, i) => {
    const y = b === 1 ? hi : lo;
    const x0 = i * w;
    if (i === 0) d += `M ${x0} ${y}`;
    else d += ` L ${x0} ${y}`;
    d += ` L ${x0 + w} ${y}`;
  });
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-right font-mono text-[11px] text-fg-3">{label}</span>
      <div className="min-w-0 overflow-x-auto">
        <svg width={bits.length * w + 2} height={height} role="img" aria-label={`${label} waveform`}>
          {highlight?.map((i) => <rect key={i} x={i * w} y={0} width={w} height={height} fill="var(--accent)" opacity={0.07} />)}
          <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
          {labels?.map((l, i) => l && <text key={i} x={i * w + w / 2} y={height - 1} fontSize={9} textAnchor="middle" fill="var(--text-3)" fontFamily="var(--font-mono)">{l}</text>)}
        </svg>
      </div>
    </div>
  );
}

export function NumberField({ label, value, onChange, unit, step = 'any', id, min }: { label: string; value: number; onChange: (v: number) => void; unit?: string; step?: string; id: string; min?: number }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[13px] text-fg-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          step={step}
          min={min}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
          className="h-10 w-full rounded-xl border border-line-strong bg-bg-2 px-3 font-mono text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {unit && <span className="w-10 shrink-0 font-mono text-sm text-fg-3">{unit}</span>}
      </div>
    </div>
  );
}
