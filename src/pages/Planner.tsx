import { CalendarDays, CheckCircle2, Clock, GraduationCap, Plus, ShieldCheck, Sparkles, Target, Trash2, Wand2 } from 'lucide-react';
import { RemindersCard } from '../components/RemindersCard';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PROJECTS } from '../data/projects';
import { addDays, dayKey, daysBetween, formatDate, formatMinutes, isoToDay, uid, weekStart, WEEKDAYS } from '../engine/dates';
import { effectiveWeeklyTarget, weekMinutes, weekMinutesBySubject } from '../engine/progress';
import { toast } from '../lib/toast';
import { addSession, removeSession, setDailyGoals, setPlanner, setSettings, useApp } from '../store/store';
import { SUBJECTS, type PlanBlock, type Subject } from '../store/types';
import { Badge, Button, Card, CardHeader, Checkbox, cx, EmptyState, Input, PageHeader, Select, Slider } from '../components/ui';

const SUBJECT_COLOR: Record<Subject, string> = { programming: 'var(--accent)', electronics: 'var(--warn)', embedded: 'var(--accent-2)', robotics: 'var(--accent-3)', german: 'var(--good)' };
const axis = { stroke: 'var(--text-3)', fontSize: 11, tickLine: false, axisLine: false };

export default function Planner() {
  const s = useApp();
  const target = effectiveWeeklyTarget(s);
  const alloc = s.planner.allocation;
  const allocTotal = Object.values(alloc).reduce((a, b) => a + b, 0) || 1;
  const actual = weekMinutesBySubject(s);
  const today = dayKey();
  const goals = s.planner.dailyGoals[today] ?? [];
  const [goalText, setGoalText] = useState('');
  const [block, setBlock] = useState<{ day: number; subject: Subject; hours: number; label: string }>({ day: 0, subject: 'programming', hours: 2, label: '' });
  const [log, setLog] = useState<{ date: string; minutes: number; subject: Subject; note: string }>({ date: today, minutes: 60, subject: 'programming', note: '' });
  const [exam, setExam] = useState({ name: '', date: addDays(today, 21), topics: '' });
  const [deadline, setDeadline] = useState({ title: '', date: addDays(today, 14), projectId: '' });

  const chartData = SUBJECTS.map((sub) => ({ subject: sub.label, planned: Math.round(((alloc[sub.id] / allocTotal) * target) * 10) / 10, actual: Math.round((actual[sub.id] / 60) * 10) / 10 }));

  function autoFill() {
    const blocks: PlanBlock[] = [];
    const hours = SUBJECTS.map((x) => ({ subject: x.id, h: (alloc[x.id] / allocTotal) * target }));
    // Keep one long hardware block on Saturday (wiring and debugging need uninterrupted time).
    const hw = hours.find((x) => x.subject === 'embedded')!;
    const satBlock = Math.min(hw.h, Math.max(2, target * 0.25));
    if (satBlock >= 1) { blocks.push({ id: uid('b'), day: 5, subject: 'embedded', hours: Math.round(satBlock * 2) / 2, label: 'Robot / hardware block' }); hw.h -= satBlock; }
    const weekdays = [0, 1, 2, 3, 4, 6];
    let d = 0;
    for (const { subject, h } of hours) {
      let left = h;
      while (left >= 0.5) {
        const chunk = Math.min(left, subject === 'german' ? 0.75 : 1.5);
        blocks.push({ id: uid('b'), day: weekdays[d % weekdays.length], subject, hours: Math.round(chunk * 4) / 4, label: '' });
        left -= chunk;
        d++;
      }
    }
    setPlanner({ blocks });
    toast('success', 'Week planned', `${target} h distributed across your subjects`);
  }

  const plannedTotal = s.planner.blocks.reduce((a, b) => a + b.hours, 0);
  const recentSessions = [...s.sessions].sort((a, b) => (a.start < b.start ? 1 : -1)).slice(0, 10);

  return (
    <div className="space-y-6 fade-in">
      <PageHeader eyebrow="Study Planner" title="Plan your week" subtitle="Coursework deadlines come first in any week. A smaller week still counts, as long as you keep going." />

      <Card className={cx('p-5', s.settings.examMode && 'glow')}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-3/10 text-accent-3"><ShieldCheck size={22} /></div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-fg">University exam period mode</div>
            <p className="text-sm text-fg-2">Lowers your weekly target (minimum schedule: 4–5 h). Nothing is lost: XP, levels, unlocked modules, revision schedules and your rhythm all stay intact.</p>
          </div>
          <div className="flex items-center gap-3">
            {s.settings.examMode && <div className="w-40"><Slider id="exam-h" label="Exam-period target" value={s.settings.examModeHours} min={1} max={8} unit="h" onChange={(v) => setSettings({ examModeHours: v })} /></div>}
            <Button variant={s.settings.examMode ? 'primary' : 'secondary'} onClick={() => setSettings({ examMode: !s.settings.examMode })}>{s.settings.examMode ? 'On' : 'Turn on'}</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader icon={<CalendarDays size={18} />} title="Weekly learning calendar" subtitle={`${plannedTotal.toFixed(1)} h planned · target ${target} h · ${formatMinutes(weekMinutes(s))} done this week`}
            action={<Button size="sm" onClick={autoFill}><Wand2 size={14} /> Auto-fill week</Button>} />
          <div className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-7">
            {WEEKDAYS.map((w, day) => {
              const date = addDays(weekStart(), day);
              const dayBlocks = s.planner.blocks.filter((b) => b.day === day);
              return (
                <div key={w} className={cx('min-h-28 rounded-xl border p-2', date === today ? 'border-accent/50 bg-accent/5' : 'border-line')}>
                  <div className="mb-1.5 flex items-center justify-between text-[11px]"><span className="font-medium text-fg">{w}</span><span className="font-mono text-fg-3">{date.slice(8)}</span></div>
                  <div className="space-y-1">
                    {dayBlocks.map((b) => (
                      <div key={b.id} className="group flex items-start gap-1 rounded-lg px-1.5 py-1 text-[11px]" style={{ background: `color-mix(in srgb, ${SUBJECT_COLOR[b.subject]} 14%, transparent)`, borderLeft: `3px solid ${SUBJECT_COLOR[b.subject]}` }}>
                        <div className="min-w-0 flex-1"><div className="truncate text-fg">{b.label || SUBJECTS.find((x) => x.id === b.subject)?.label}</div><div className="font-mono text-fg-3">{b.hours} h</div></div>
                        <button className="text-fg-3 opacity-0 transition group-hover:opacity-100 hover:text-bad focus:opacity-100" aria-label="Remove block" onClick={() => setPlanner({ blocks: s.planner.blocks.filter((x) => x.id !== b.id) })}><Trash2 size={11} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid gap-2 border-t border-line p-5 sm:grid-cols-[110px_160px_90px_minmax(0,1fr)_auto]">
            <Select aria-label="Day" value={block.day} onChange={(e) => setBlock({ ...block, day: Number(e.target.value) })}>{WEEKDAYS.map((w, i) => <option key={w} value={i}>{w}</option>)}</Select>
            <Select aria-label="Subject" value={block.subject} onChange={(e) => setBlock({ ...block, subject: e.target.value as Subject })}>{SUBJECTS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</Select>
            <Input aria-label="Hours" type="number" min={0.25} step={0.25} value={block.hours} onChange={(e) => setBlock({ ...block, hours: Number(e.target.value) })} />
            <Input aria-label="Label" placeholder="Label (optional)" value={block.label} onChange={(e) => setBlock({ ...block, label: e.target.value })} />
            <Button onClick={() => setPlanner({ blocks: [...s.planner.blocks, { id: uid('b'), ...block }] })} disabled={!(block.hours > 0)}><Plus size={14} /> Add</Button>
          </div>
        </Card>

        <Card>
          <CardHeader icon={<Target size={18} />} title="Daily goals" subtitle={formatDate(new Date().toISOString())} />
          <div className="space-y-2 p-5">
            {goals.length === 0 && <p className="text-sm text-fg-3">Set one to three concrete goals for today.</p>}
            {goals.map((g) => (
              <div key={g.id} className="flex items-center gap-2">
                <div className="flex-1"><Checkbox id={`g-${g.id}`} checked={g.done} onChange={(v) => setDailyGoals(today, goals.map((x) => (x.id === g.id ? { ...x, done: v } : x)))}>{g.text}</Checkbox></div>
                <button aria-label="Remove goal" className="text-fg-3 hover:text-bad" onClick={() => setDailyGoals(today, goals.filter((x) => x.id !== g.id))}><Trash2 size={13} /></button>
              </div>
            ))}
            <form className="flex gap-2 pt-1" onSubmit={(e) => { e.preventDefault(); if (!goalText.trim()) return; setDailyGoals(today, [...goals, { id: uid('g'), text: goalText.trim(), done: false }]); setGoalText(''); }}>
              <Input aria-label="New goal" placeholder="e.g. Finish the pointers lesson" value={goalText} onChange={(e) => setGoalText(e.target.value)} />
              <Button type="submit" disabled={!goalText.trim()}><Plus size={14} /></Button>
            </form>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<Sparkles size={18} />} title="Distribute your hours" subtitle={`Share of your ${target} h weekly target`} />
          <div className="space-y-3 p-5">
            {SUBJECTS.map((sub) => (
              <div key={sub.id} className="grid grid-cols-[minmax(0,1fr)_64px] items-end gap-3">
                <Slider id={`alloc-${sub.id}`} label={sub.label} value={alloc[sub.id]} min={0} max={70} unit="%" onChange={(v) => setPlanner({ allocation: { ...alloc, [sub.id]: v } })} />
                <span className="pb-1 text-right font-mono text-xs text-fg-2">{((alloc[sub.id] / allocTotal) * target).toFixed(1)} h</span>
              </div>
            ))}
            {allocTotal !== 100 && <p className="text-[12px] text-fg-3">Shares total {allocTotal}% — hours are scaled proportionally.</p>}
          </div>
        </Card>
        <Card>
          <CardHeader icon={<Clock size={18} />} title="Study hour tracker" subtitle="Planned vs actual this week (hours)" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="subject" {...axis} interval={0} tick={{ fontSize: 10 }} />
                <YAxis {...axis} />
                <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line-strong)', borderRadius: 10, fontSize: 12 }} cursor={{ fill: 'var(--panel-2)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="planned" fill="var(--line-strong)" radius={[5, 5, 0, 0]} />
                <Bar dataKey="actual" fill="var(--accent)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Log a study session" subtitle="Time on learning pages is tracked automatically while you are active. Log hardware work, reading or classes here." />
        <div className="grid gap-2 p-5 sm:grid-cols-[160px_110px_170px_minmax(0,1fr)_auto]">
          <Input type="date" aria-label="Date" value={log.date} max={today} onChange={(e) => setLog({ ...log, date: e.target.value })} />
          <Input type="number" aria-label="Minutes" min={5} step={5} value={log.minutes} onChange={(e) => setLog({ ...log, minutes: Number(e.target.value) })} />
          <Select aria-label="Subject" value={log.subject} onChange={(e) => setLog({ ...log, subject: e.target.value as Subject })}>{SUBJECTS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</Select>
          <Input aria-label="Note" placeholder="What did you work on?" value={log.note} onChange={(e) => setLog({ ...log, note: e.target.value })} />
          <Button variant="primary" disabled={!(log.minutes >= 1)} onClick={() => { addSession(log.minutes, log.subject, 'manual', log.note, new Date(`${log.date}T12:00:00`).toISOString()); setLog({ ...log, note: '' }); toast('success', 'Session logged'); }}>Log</Button>
        </div>
        {recentSessions.length > 0 && (
          <ul className="divide-y divide-line border-t border-line">
            {recentSessions.map((x) => (
              <li key={x.id} className="flex items-center gap-3 px-5 py-2 text-sm">
                <span className="size-2 shrink-0 rounded-full" style={{ background: SUBJECT_COLOR[x.subject] }} />
                <span className="w-24 shrink-0 font-mono text-xs text-fg-3">{isoToDay(x.start)}</span>
                <span className="flex-1 truncate text-fg-2">{SUBJECTS.find((y) => y.id === x.subject)?.label}{x.note ? ` · ${x.note}` : ''}</span>
                <Badge>{x.source}</Badge>
                <span className="font-mono text-xs text-fg">{formatMinutes(x.minutes)}</span>
                <button aria-label="Delete session" className="text-fg-3 hover:text-bad" onClick={() => removeSession(x.id)}><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<GraduationCap size={18} />} title="Exam preparation schedule" subtitle="Spaced sessions before each exam: 14, 7, 3 and 1 day(s) out." />
          <div className="space-y-3 p-5">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px]">
              <Input aria-label="Exam name" placeholder="Exam (university or K-FORGE module)" value={exam.name} onChange={(e) => setExam({ ...exam, name: e.target.value })} />
              <Input type="date" aria-label="Exam date" value={exam.date} min={today} onChange={(e) => setExam({ ...exam, date: e.target.value })} />
              <Input aria-label="Topics" placeholder="Topics (comma-separated)" value={exam.topics} onChange={(e) => setExam({ ...exam, topics: e.target.value })} className="sm:col-span-2" />
            </div>
            <Button size="sm" disabled={!exam.name.trim()} onClick={() => { setPlanner({ exams: [...s.planner.exams, { id: uid('ex'), name: exam.name.trim(), date: exam.date, topics: exam.topics.split(',').map((x) => x.trim()).filter(Boolean) }] }); setExam({ ...exam, name: '', topics: '' }); }}><Plus size={14} /> Add exam</Button>
            {s.planner.exams.length === 0 ? <EmptyState title="No exams scheduled" /> : [...s.planner.exams].sort((a, b) => (a.date < b.date ? -1 : 1)).map((e) => {
              const left = daysBetween(today, e.date);
              return (
                <div key={e.id} className="rounded-xl border border-line p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 font-medium text-fg">{e.name}</span>
                    <Badge tone={left <= 3 ? 'warn' : 'neutral'}>{left >= 0 ? `${left} d` : 'past'}</Badge>
                    <button aria-label="Remove exam" className="text-fg-3 hover:text-bad" onClick={() => setPlanner({ exams: s.planner.exams.filter((x) => x.id !== e.id) })}><Trash2 size={13} /></button>
                  </div>
                  {e.topics.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{e.topics.map((t) => <Badge key={t}>{t}</Badge>)}</div>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[14, 7, 3, 1].map((n) => { const d = addDays(e.date, -n); return <Badge key={n} tone={d < today ? 'neutral' : d === today ? 'accent' : 'blue'}>{d < today ? '✓ ' : ''}D-{n} · {d.slice(5)}</Badge>; })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Project deadlines" />
          <div className="space-y-3 p-5">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px]">
              <Input aria-label="Deadline title" placeholder="e.g. Capstone milestone 5" value={deadline.title} onChange={(e) => setDeadline({ ...deadline, title: e.target.value })} />
              <Input type="date" aria-label="Deadline date" value={deadline.date} onChange={(e) => setDeadline({ ...deadline, date: e.target.value })} />
              <Select aria-label="Project" value={deadline.projectId} onChange={(e) => setDeadline({ ...deadline, projectId: e.target.value })} className="sm:col-span-2"><option value="">No linked project</option>{PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</Select>
            </div>
            <Button size="sm" disabled={!deadline.title.trim()} onClick={() => { setPlanner({ deadlines: [...s.planner.deadlines, { id: uid('dl'), title: deadline.title.trim(), date: deadline.date, projectId: deadline.projectId || undefined, done: false }] }); setDeadline({ ...deadline, title: '' }); }}><Plus size={14} /> Add deadline</Button>
            {[...s.planner.deadlines].sort((a, b) => (a.date < b.date ? -1 : 1)).map((d) => {
              const left = daysBetween(today, d.date);
              return (
                <div key={d.id} className="flex items-center gap-2 rounded-xl border border-line p-2.5">
                  <div className="flex-1"><Checkbox id={`dl-${d.id}`} checked={d.done} onChange={(v) => setPlanner({ deadlines: s.planner.deadlines.map((x) => (x.id === d.id ? { ...x, done: v } : x)) })}>{d.title}{d.projectId && <span className="text-fg-3"> · {PROJECTS.find((p) => p.id === d.projectId)?.title}</span>}</Checkbox></div>
                  {!d.done && <Badge tone={left < 0 ? 'bad' : left <= 3 ? 'warn' : 'neutral'}>{left < 0 ? `${-left} d overdue` : `${left} d`}</Badge>}
                  {d.done && <CheckCircle2 size={14} className="text-good" />}
                  <button aria-label="Remove deadline" className="text-fg-3 hover:text-bad" onClick={() => setPlanner({ deadlines: s.planner.deadlines.filter((x) => x.id !== d.id) })}><Trash2 size={13} /></button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <RemindersCard />
    </div>
  );
}
