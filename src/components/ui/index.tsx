import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';
import { Link } from 'react-router-dom';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

// ---------- Layout primitives ----------

export function Card({ children, className, glow, as: As = 'section' }: { children: ReactNode; className?: string; glow?: boolean; as?: 'section' | 'div' | 'article' }) {
  return (
    <As className={cx('rounded-2xl border border-line bg-panel/80 backdrop-blur-sm', glow && 'glow', className)}>
      {children}
    </As>
  );
}

export function CardHeader({ title, subtitle, icon, action }: { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-panel-2 text-accent">{icon}</div>}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-fg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-fg-3">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, eyebrow, actions }: { title: ReactNode; subtitle?: ReactNode; eyebrow?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-3xl text-[15px] text-fg-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

// ---------- Buttons & badges ----------

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:brightness-110 shadow-[0_0_20px_-6px_var(--accent)]',
  secondary: 'border border-line-strong bg-panel-2 text-fg hover:border-accent/60 hover:text-accent',
  ghost: 'text-fg-2 hover:bg-panel-2 hover:text-fg',
  danger: 'border border-bad/40 bg-bad/10 text-bad hover:bg-bad/20',
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }>(
  function Button({ variant = 'secondary', size = 'md', className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={cx(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40',
          size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm',
          variants[variant],
          className,
        )}
        {...rest}
      />
    );
  },
);

export function LinkButton({ to, children, variant = 'secondary', size = 'md', className }: { to: string; children: ReactNode; variant?: Variant; size?: 'sm' | 'md'; className?: string }) {
  return (
    <Link
      to={to}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150',
        size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm',
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

type Tone = 'neutral' | 'accent' | 'blue' | 'purple' | 'good' | 'warn' | 'bad';
const tones: Record<Tone, string> = {
  neutral: 'border-line-strong text-fg-2 bg-panel-2',
  accent: 'border-accent/40 text-accent bg-accent/10',
  blue: 'border-accent-2/40 text-accent-2 bg-accent-2/10',
  purple: 'border-accent-3/40 text-accent-3 bg-accent-3/10',
  good: 'border-good/40 text-good bg-good/10',
  warn: 'border-warn/40 text-warn bg-warn/10',
  bad: 'border-bad/40 text-bad bg-bad/10',
};

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={cx('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium', tones[tone], className)}>{children}</span>;
}

// ---------- Progress ----------

export function ProgressBar({ value, className, tone = 'accent', label }: { value: number; className?: string; tone?: 'accent' | 'good' | 'warn' | 'blue'; label?: string }) {
  const color = { accent: 'bg-accent', good: 'bg-good', warn: 'bg-warn', blue: 'bg-accent-2' }[tone];
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-line', className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cx('h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({ value, size = 64, stroke = 6, children, label }: { value: number; size?: number; stroke?: number; children?: ReactNode; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(pct)}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset .6s ease', filter: 'drop-shadow(0 0 4px var(--accent))' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-panel-2/60 p-3.5">
      <div className="flex items-center gap-2 text-[12px] text-fg-3">
        {icon && <span className="text-accent">{icon}</span>}
        {label}
      </div>
      <div className="mt-1 font-mono text-xl font-semibold text-fg">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-fg-3">{hint}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center">
      {icon && <div className="mb-3 text-fg-3">{icon}</div>}
      <div className="font-medium text-fg">{title}</div>
      {children && <div className="mt-1 max-w-md text-sm text-fg-3">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Callout({ tone = 'accent', title, children, icon }: { tone?: 'accent' | 'warn' | 'bad' | 'good' | 'blue'; title?: ReactNode; children: ReactNode; icon?: ReactNode }) {
  const t = { accent: 'border-accent/30 bg-accent/5', warn: 'border-warn/30 bg-warn/5', bad: 'border-bad/30 bg-bad/5', good: 'border-good/30 bg-good/5', blue: 'border-accent-2/30 bg-accent-2/5' }[tone];
  const c = { accent: 'text-accent', warn: 'text-warn', bad: 'text-bad', good: 'text-good', blue: 'text-accent-2' }[tone];
  return (
    <div className={cx('flex gap-3 rounded-xl border p-3.5 text-sm', t)} role="note">
      {icon && <div className={cx('mt-0.5 shrink-0', c)}>{icon}</div>}
      <div className="min-w-0 text-fg-2">
        {title && <div className={cx('mb-0.5 font-medium', c)}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

// ---------- Form controls ----------

const field = 'w-full rounded-xl border border-line-strong bg-bg-2 px-3 text-sm text-fg placeholder:text-fg-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cx(field, 'h-10', className)} {...rest} />;
});

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(field, 'min-h-24 py-2.5 leading-relaxed', className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(field, 'h-10 pr-8', className)} {...rest}>
      {children}
    </select>
  );
}

export function Label({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-fg-2">
      {children}
      {hint && <span className="ml-1 font-normal text-fg-3">{hint}</span>}
    </label>
  );
}

export function Slider({ label, value, min, max, step = 1, unit, onChange, id }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void; id: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] text-fg-2">{label}</label>
        <span className="font-mono text-[13px] text-accent">{Number.isInteger(step) ? value : value.toFixed(String(step).split('.')[1]?.length ?? 2)}{unit ? ` ${unit}` : ''}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap rounded-xl border border-line bg-bg-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx('rounded-lg px-3 py-1.5 text-[13px] font-medium transition', value === o.value ? 'bg-panel-2 text-accent shadow-[inset_0_0_0_1px_var(--line-strong)]' : 'text-fg-3 hover:text-fg')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Checkbox({ checked, onChange, children, id }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; id: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 rounded-lg py-1 text-sm text-fg-2 hover:text-fg">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]" />
      <span className={cx(checked && 'text-fg')}>{children}</span>
    </label>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-line-strong bg-panel-2 px-1.5 py-0.5 font-mono text-[11px] text-fg-2">{children}</kbd>;
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-fg-3" role="status">
      <span className="size-4 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
      {label}
    </div>
  );
}
