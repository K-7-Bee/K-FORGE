import { ChevronsLeft, ChevronsRight, Moon, MoreHorizontal, Pause, Play, Sun, Timer, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { levelInfo } from '../../engine/levels';
import { streak } from '../../engine/progress';
import { useAutoStudyTracker, useReminders, subjectForPath } from '../../lib/hooks';
import { toast } from '../../lib/toast';
import { addSession, setSettings, useApp } from '../../store/store';
import { SUBJECTS, type Subject } from '../../store/types';
import { cx, Select } from '../ui';
import { MOBILE_PRIMARY, NAV } from './nav';
import { Toaster } from './Toaster';

function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="K-FORGE home">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--panel-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <path d="M10 8 V24 M10 16 L20 8 M13.5 13.5 L21 24" stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <circle cx="22.5" cy="16" r="1.6" fill="var(--accent-3)" />
      </svg>
      {!compact && (
        <div className="leading-none">
          <div className="font-mono text-[15px] font-semibold tracking-[0.18em] text-fg">K-FORGE</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-fg-3">Embedded Academy</div>
        </div>
      )}
    </Link>
  );
}

function StudyTimer() {
  const location = useLocation();
  const [start, setStart] = useState<number | null>(() => {
    try { const v = sessionStorage.getItem('kforge-timer'); return v ? Number(v) : null; } catch { return null; }
  });
  const [subject, setSubject] = useState<Subject>(() => subjectForPath(location.pathname) ?? 'programming');
  const [, tick] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [start]);
  const elapsed = start ? Math.floor((Date.now() - start) / 1000) : 0;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const toggle = () => {
    if (start) {
      const minutes = Math.round(elapsed / 60);
      if (minutes >= 1) {
        addSession(minutes, subject, 'timer', 'Study timer', new Date(start).toISOString());
        toast('success', `Logged ${minutes} min of ${SUBJECTS.find((s) => s.id === subject)?.label}`);
      } else toast('info', 'Timer stopped', 'Sessions under a minute are not logged.');
      setStart(null);
      try { sessionStorage.removeItem('kforge-timer'); } catch { /* ignore */ }
    } else {
      const now = Date.now();
      setStart(now);
      try { sessionStorage.setItem('kforge-timer', String(now)); } catch { /* ignore */ }
    }
  };
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-line bg-panel-2/70 p-1">
      {!start && (
        <Select aria-label="Timer subject" value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className="hidden h-8 w-36 border-0 bg-transparent text-xs md:block">
          {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </Select>
      )}
      <button onClick={toggle} className={cx('flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition', start ? 'bg-accent/15 text-accent' : 'text-fg-2 hover:text-accent')} aria-label={start ? 'Stop study timer' : 'Start study timer'}>
        {start ? <Pause size={14} /> : <Play size={14} />}
        {start ? <span className="font-mono">{mm}:{ss}</span> : <span className="hidden whitespace-nowrap sm:inline">Study timer</span>}
        {!start && <Timer size={14} className="sm:hidden" />}
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const s = useApp();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1280);
  const [moreOpen, setMoreOpen] = useState(false);
  const info = levelInfo(s);
  const st = streak(s);
  useAutoStudyTracker();
  useReminders();

  useEffect(() => setMoreOpen(false), [location.pathname]);
  useEffect(() => {
    document.documentElement.dataset.theme = s.settings.theme;
  }, [s.settings.theme]);

  const isActive = (to: string) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink">Skip to content</a>

      {/* Sidebar: md+ (collapsible on tablet widths) */}
      <aside className={cx('fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-bg/85 backdrop-blur-xl transition-[width] duration-200 md:flex', collapsed ? 'w-[72px]' : 'w-64')}>
        <div className={cx('flex h-16 items-center border-b border-line', collapsed ? 'justify-center' : 'px-5')}>
          <Logo compact={collapsed} />
        </div>
        <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={cx(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                  collapsed && 'justify-center px-0',
                  active ? 'bg-panel-2 text-fg shadow-[inset_0_0_0_1px_var(--line-strong)]' : 'text-fg-3 hover:bg-panel-2/60 hover:text-fg',
                )}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-accent shadow-[0_0_10px_var(--accent)]" />}
                <Icon size={18} className={cx(active ? 'text-accent' : 'text-fg-3 group-hover:text-fg-2')} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          <button onClick={() => setCollapsed((c) => !c)} className={cx('flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-fg-3 hover:bg-panel-2 hover:text-fg', collapsed && 'justify-center px-0')} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> Collapse</>}
          </button>
        </div>
      </aside>

      <div className={cx('transition-[padding] duration-200', collapsed ? 'md:pl-[72px]' : 'md:pl-64')}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="md:hidden"><Logo compact /></div>
          <Link to="/profile" className="hidden items-center gap-3 rounded-xl border border-line bg-panel-2/70 px-3 py-1.5 sm:flex" aria-label="Your level">
            <span className="grid size-7 place-items-center rounded-lg bg-accent/15 font-mono text-xs font-semibold text-accent">{info.level.n}</span>
            <div className="leading-tight">
              <div className="text-[12px] font-medium text-fg">{info.level.name}</div>
              <div className="h-1 w-28 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent" style={{ width: `${info.xpProgress * 100}%` }} /></div>
            </div>
            <span className="font-mono text-xs text-fg-2">{info.xp} XP</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1 rounded-xl border border-line px-2.5 py-1.5 font-mono text-xs text-fg-2 lg:flex" title="Gentle streak: one rest day per week is allowed">
              <span className="text-accent">●</span> {st.days}-day rhythm
            </span>
            <StudyTimer />
            <button
              onClick={() => setSettings({ theme: s.settings.theme === 'dark' ? 'light' : 'dark' })}
              className="grid size-10 place-items-center rounded-xl border border-line text-fg-2 hover:text-accent"
              aria-label={`Switch to ${s.settings.theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {s.settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 md:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 backdrop-blur-xl md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-5">
          {NAV.filter((n) => MOBILE_PRIMARY.includes(n.to)).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <NavLink key={item.to} to={item.to} className={cx('flex flex-col items-center gap-1 py-2.5 text-[10px]', active ? 'text-accent' : 'text-fg-3')}>
                <Icon size={20} />
                {item.short}
              </NavLink>
            );
          })}
          <button onClick={() => setMoreOpen(true)} className={cx('flex flex-col items-center gap-1 py-2.5 text-[10px]', moreOpen ? 'text-accent' : 'text-fg-3')} aria-expanded={moreOpen} aria-controls="more-sheet">
            <MoreHorizontal size={20} /> More
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="More navigation" id="more-sheet">
          <button className="absolute inset-0 bg-black/60" onClick={() => setMoreOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-line bg-panel p-4 pb-8 fade-in">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-fg">All sections</span>
              <button onClick={() => setMoreOpen(false)} className="text-fg-3" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} className={cx('flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-[11px]', isActive(item.to) ? 'border-accent/50 text-accent' : 'border-line text-fg-2')}>
                    <Icon size={20} />
                    {item.short}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
