import {
  Award, Binary, Bot, Brain, Briefcase, Bug, CalendarCheck, CircuitBoard, Compass, Cpu, Download, Gauge, GraduationCap, Hammer, Layers,
  Lock, type LucideIcon, MousePointer2, NotebookPen, Plus, RotateCcw, Save, Search, Settings, Timer, Trash2, Upload, Wifi, Zap,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MODULES } from '../data/curriculum';
import { PROJECTS } from '../data/projects';
import { formatDate, formatMinutes, uid } from '../engine/dates';
import { ACHIEVEMENTS, LEVELS, levelInfo } from '../engine/levels';
import { effectiveWeeklyTarget, headlineStats, moduleProgress, totalMinutes, weekMinutes } from '../engine/progress';
import { downloadText } from '../lib/report';
import { toast } from '../lib/toast';
import { deleteNote, exportState, importState, resetState, saveNote, setProfile, setSettings, storageName, useApp } from '../store/store';
import type { Note } from '../store/types';
import { restoreEvidence, serializeEvidence } from '../store/evidence';
import { SkillTree } from '../components/SkillTree';
import { CloudSyncCard } from '../components/CloudSyncCard';
import { Markdown } from '../components/ui/Markdown';
import { Badge, Button, Card, CardHeader, Checkbox, cx, EmptyState, Input, Label, PageHeader, ProgressBar, Ring, Textarea } from '../components/ui';

const ICONS: Record<string, LucideIcon> = { Binary, Bot, Brain, Briefcase, Bug, CalendarCheck, CircuitBoard, Compass, Cpu, Gauge, GraduationCap, Hammer, Layers, MousePointer2, RotateCcw, Search, Timer, Wifi, Zap };

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const C = ICONS[name] ?? Award;
  return <C size={size} />;
}

const TIER = { bronze: 'from-amber-700/30', silver: 'from-slate-300/25', gold: 'from-yellow-400/30' };

export function AchievementGrid({ compact }: { compact?: boolean }) {
  const s = useApp();
  return (
    <div className={cx('grid gap-3', compact ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')}>
      {ACHIEVEMENTS.map((a) => {
        const at = s.achievements[a.id];
        return (
          <div key={a.id} className={cx('relative overflow-hidden rounded-2xl border p-4 transition', at ? 'border-accent/40 bg-panel glow' : 'border-line bg-panel-2/30')}>
            {at && <div className={cx('pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent', TIER[a.tier])} />}
            <div className="relative flex items-start gap-3">
              <div className={cx('grid size-11 shrink-0 place-items-center rounded-xl border', at ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-fg-3')}>{at ? <Icon name={a.icon} /> : <Lock size={18} />}</div>
              <div className="min-w-0">
                <div className={cx('font-medium', at ? 'text-fg' : 'text-fg-3')}>{a.title}</div>
                {!compact && <div className="text-[12px] text-fg-3">{a.description}</div>}
                <div className="mt-1 text-[10px] uppercase tracking-widest text-fg-3">{a.tier}{at ? ` · ${formatDate(at)}` : ' · locked'}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AchievementsPage() {
  const s = useApp();
  const n = Object.keys(s.achievements).length;
  return (
    <div className="space-y-6 fade-in">
      <PageHeader eyebrow="Achievements" title="Achievement collection" subtitle={`${n} of ${ACHIEVEMENTS.length} unlocked. Every badge requires real work — passed assessments, verified exercises or completed milestones.`} actions={<Link to="/profile" className="text-sm text-accent underline">Back to profile</Link>} />
      <AchievementGrid />
    </div>
  );
}

function Notes() {
  const s = useApp();
  const [editing, setEditing] = useState<Note | null>(null);
  const [q, setQ] = useState('');
  const list = s.notes.filter((n) => !q || `${n.title} ${n.body} ${n.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Card>
      <CardHeader icon={<NotebookPen size={18} />} title="Personal notes" subtitle="Lesson notes and your own engineering log." action={<Button size="sm" onClick={() => setEditing({ id: uid('note'), title: '', body: '', tags: [], updatedAt: '' })}><Plus size={14} /> New</Button>} />
      <div className="space-y-3 p-5">
        {editing && (
          <div className="space-y-2 rounded-xl border border-accent/40 p-3 fade-in">
            <Input aria-label="Note title" placeholder="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Textarea aria-label="Note body" rows={5} placeholder="Markdown supported" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
            <Input aria-label="Tags" placeholder="Tags (comma-separated)" value={editing.tags.join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
            <div className="flex gap-2"><Button size="sm" variant="primary" disabled={!editing.title.trim() && !editing.body.trim()} onClick={() => { saveNote({ ...editing, title: editing.title || 'Untitled' }); setEditing(null); }}><Save size={14} /> Save</Button><Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
          </div>
        )}
        {s.notes.length > 3 && <Input aria-label="Search notes" placeholder="Search notes…" value={q} onChange={(e) => setQ(e.target.value)} />}
        {list.length === 0 && !editing && <EmptyState title="No notes yet">Write notes on any lesson page or start one here.</EmptyState>}
        {list.map((n) => (
          <details key={n.id} className="rounded-xl border border-line p-3">
            <summary className="flex cursor-pointer list-none items-center gap-2">
              <span className="min-w-0 flex-1 truncate font-medium text-fg">{n.title}</span>
              {n.tags.map((t) => <Badge key={t}>{t}</Badge>)}
              <span className="text-[11px] text-fg-3">{formatDate(n.updatedAt)}</span>
            </summary>
            <div className="mt-2 border-t border-line pt-2">
              <Markdown text={n.body || '_empty_'} className="text-sm" />
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditing(n)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => window.confirm('Delete this note?') && deleteNote(n.id)}><Trash2 size={13} /> Delete</Button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </Card>
  );
}

export default function Profile() {
  const s = useApp();
  const info = levelInfo(s);
  const stats = headlineStats(s);
  const fileRef = useRef<HTMLInputElement>(null);
  const completedModules = MODULES.filter((m) => moduleProgress(s, m).status === 'mastered');
  const passedExams = MODULES.filter((m) => moduleProgress(s, m).examPassed);
  const projects = PROJECTS.filter((p) => s.projects[p.id]);

  return (
    <div className="space-y-6 fade-in">
      <PageHeader eyebrow="Profile & achievements" title={s.profile.username} subtitle={s.profile.specialization} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Card className="p-5">
          <div className="flex items-center gap-5">
            <Ring value={info.xpProgress * 100} size={96} stroke={7}><div><div className="font-mono text-2xl font-semibold text-fg">{info.level.n}</div><div className="text-[9px] uppercase tracking-widest text-fg-3">level</div></div></Ring>
            <div>
              <div className="text-lg font-semibold text-fg">{info.level.name}</div>
              <div className="font-mono text-sm text-accent">{info.xp} XP</div>
              <div className="text-sm text-fg-3">{info.next ? `${Math.max(0, info.next.xp - info.xp)} XP to ${info.next.name}` : 'Highest level reached'}</div>
            </div>
          </div>
          <ol className="mt-5 space-y-1.5">
            {LEVELS.map((l) => (
              <li key={l.n} className={cx('flex items-center gap-2 text-sm', l.n <= info.level.n ? 'text-fg' : 'text-fg-3')}>
                <span className={cx('grid size-6 place-items-center rounded-md border font-mono text-[11px]', l.n <= info.level.n ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line')}>{l.n}</span>
                <span className="flex-1">{l.name}</span>
                <span className="font-mono text-[11px]">{l.xp} XP{l.requirements.length ? ` + ${l.requirements.length} req.` : ''}</span>
              </li>
            ))}
          </ol>
        </Card>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ['Study time', formatMinutes(totalMinutes(s))],
            ['This week', `${(weekMinutes(s) / 60).toFixed(1)} / ${effectiveWeeklyTarget(s)} h`],
            ['Lessons completed', stats.lessons],
            ['Exams passed', passedExams.length],
            ['Average test score', stats.tests ? `${stats.avgScore}%` : '—'],
            ['Projects completed', stats.projects],
            ['Coding challenges', stats.coding],
            ['Lab exercises', stats.labs],
            ['Badges', `${Object.keys(s.achievements).length}/${ACHIEVEMENTS.length}`],
          ].map(([l, v]) => <Card key={String(l)} className="p-4"><div className="text-[12px] text-fg-3">{l}</div><div className="mt-0.5 font-mono text-lg font-semibold text-fg">{v}</div></Card>)}
        </div>
      </div>

      <Card>
        <CardHeader title="Engineering skill tree" subtitle="Locked · available · learning · mastered. Any module you've studied stays open for revision." />
        <div className="p-5"><SkillTree state={s} /></div>
      </Card>

      <Card>
        <CardHeader title="Achievement badges" action={<Link to="/achievements" className="text-sm text-accent underline">View collection</Link>} />
        <div className="p-5"><AchievementGrid compact /></div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Courses" subtitle="Mastered modules and exam performance" />
          <ul className="divide-y divide-line">
            {MODULES.map((m) => {
              const mp = moduleProgress(s, m);
              return (
                <li key={m.id}>
                  <Link to={`/courses/${m.id}`} className="grid grid-cols-[minmax(0,1fr)_90px_60px] items-center gap-3 px-5 py-2 text-sm hover:bg-panel-2/50">
                    <span className={cx('truncate', mp.status === 'mastered' ? 'text-good' : 'text-fg-2')}>{m.short}</span>
                    <ProgressBar value={mp.percent} tone={mp.status === 'mastered' ? 'good' : 'accent'} />
                    <span className="text-right font-mono text-xs text-fg-3">{mp.examBest !== undefined ? `${mp.examBest}%` : '—'}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="px-5 pb-4 text-[12px] text-fg-3">{completedModules.length} mastered · right column shows best exam score</p>
        </Card>
        <Card>
          <CardHeader title="Projects" />
          <div className="space-y-2 p-5">
            {projects.length === 0 && s.customProjects.length === 0 ? <p className="text-sm text-fg-3">No projects started yet.</p> : null}
            {projects.map((p) => {
              const pp = s.projects[p.id];
              const done = p.milestones.filter((m) => pp.milestones[m.id]?.completedAt).length;
              return <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm hover:border-line-strong"><span className="text-fg-2">{p.title}</span>{pp.completedAt ? <Badge tone="good">completed</Badge> : <Badge>{done}/{p.milestones.length}</Badge>}</Link>;
            })}
            {s.customProjects.map((c) => <Link key={c.id} to={`/projects/custom/${c.id}`} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm hover:border-line-strong"><span className="text-fg-2">{c.title}</span>{c.completedAt ? <Badge tone="good">completed</Badge> : <Badge>custom</Badge>}</Link>)}
          </div>
        </Card>
      </div>

      <Notes />

      <CloudSyncCard />

      <Card>
        <CardHeader icon={<Settings size={18} />} title="Settings" />
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div><Label htmlFor="pf-name">Username</Label><Input id="pf-name" defaultValue={s.profile.username} onBlur={(e) => e.target.value.trim() && setProfile({ username: e.target.value.trim() })} /></div>
          <div><Label htmlFor="pf-spec">Engineering specialization</Label><Input id="pf-spec" defaultValue={s.profile.specialization} onBlur={(e) => setProfile({ specialization: e.target.value })} /></div>
          <Checkbox id="pf-light" checked={s.settings.theme === 'light'} onChange={(v) => setSettings({ theme: v ? 'light' : 'dark' })}>Light theme (dark is the default)</Checkbox>
          <Checkbox id="pf-track" checked={s.settings.autoTrack} onChange={(v) => setSettings({ autoTrack: v })}>Track study time automatically on learning pages</Checkbox>
        </div>
        <div className="border-t border-line p-5">
          <div className="mb-2 text-sm font-medium text-fg">Your data</div>
          <p className="mb-3 text-sm text-fg-3">Progress is saved locally ({storageName}). "Export progress" saves your learning record only; "Full backup" also includes every evidence file (photos, code, logs) so you can restore everything on another device.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => downloadText(`k-forge-progress-${new Date().toISOString().slice(0, 10)}.json`, exportState(), 'application/json')}><Download size={14} /> Export progress</Button>
            <Button size="sm" onClick={async () => {
              const evidence = await serializeEvidence();
              downloadText(`k-forge-full-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ kforge: 'full-backup', version: 1, state: JSON.parse(exportState()), evidence }), 'application/json');
              toast('success', 'Full backup created', `${evidence.length} evidence file(s) included`);
            }}><Download size={14} /> Full backup (with evidence)</Button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              e.target.value = '';
              try {
                const parsed = JSON.parse(await f.text());
                if (parsed?.kforge === 'full-backup') {
                  const n = await restoreEvidence(parsed.evidence ?? []);
                  const err = importState(JSON.stringify(parsed.state));
                  if (err) toast('error', 'Import failed', err); else toast('success', 'Full backup restored', `${n} evidence file(s) restored`);
                } else {
                  const err = importState(JSON.stringify(parsed));
                  if (err) toast('error', 'Import failed', err);
                }
              } catch {
                toast('error', 'Import failed', 'Could not read that file.');
              }
            }} />
            <Button size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import progress or backup</Button>
            <Button size="sm" variant="danger" onClick={() => { if (window.confirm('Reset ALL progress on this device? Export a backup first.')) resetState(); }}><Trash2 size={14} /> Reset progress</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
