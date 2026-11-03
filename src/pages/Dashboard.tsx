import { ArrowRight, BookOpen, Brain, CheckCircle2, Circle, Clock, Compass, Cpu, FlaskConical, Gauge, GraduationCap, Hammer, RotateCcw, Sparkles, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { findLesson, getModule } from '../data/curriculum';
import { formatMinutes } from '../engine/dates';
import { levelInfo } from '../engine/levels';
import { rankInfo } from '../engine/ranks';
import { RankEmblem } from '../components/RankEmblem';
import {
  activeDaysThisWeek,
  dailyMissions,
  effectiveWeeklyTarget,
  headlineStats,
  lastCompletedLesson,
  moduleProgress,
  nextLesson,
  overallCompletion,
  streak,
  weekMinutes,
  weeklyHistory,
  xpHistory,
} from '../engine/progress';
import { dueQueue } from '../engine/srs';
import { setSettings, useApp } from '../store/store';
import type { WeeklyPreset } from '../store/types';
import { Badge, Card, CardHeader, cx, Input, LinkButton, PageHeader, ProgressBar, Ring, Segmented, Stat } from '../components/ui';

const PRESETS: Record<Exclude<WeeklyPreset, 'custom'>, { label: string; range: string; hours: number }> = {
  flexible: { label: 'Flexible', range: '8–10 h', hours: 9 },
  standard: { label: 'Standard', range: '12–16 h', hours: 14 },
  intensive: { label: 'Intensive', range: '20–22 h', hours: 21 },
};

const axis = { stroke: 'var(--text-3)', fontSize: 11, tickLine: false, axisLine: false };
const tooltipStyle = { background: 'var(--panel)', border: '1px solid var(--line-strong)', borderRadius: 10, color: 'var(--text)', fontSize: 12 };

export default function Dashboard() {
  const s = useApp();
  const info = levelInfo(s);
  const rank = rankInfo(s);
  const st = streak(s);
  const weekMin = weekMinutes(s);
  const target = effectiveWeeklyTarget(s);
  const completion = overallCompletion(s);
  const next = nextLesson(s);
  const lastId = lastCompletedLesson(s);
  const last = lastId ? findLesson(lastId) : undefined;
  const nextFound = next ? findLesson(next.lessonId) : undefined;
  const missions = dailyMissions(s);
  const stats = headlineStats(s);
  const due = dueQueue(Object.values(s.cards)).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const currentModule = next ? next.module : s.lastLesson ? getModule(s.lastLesson.moduleId) : undefined;
  const mp = currentModule ? moduleProgress(s, currentModule) : undefined;

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        title={<>{greeting}, <span className="text-accent">{s.profile.username}</span></>}
        subtitle={s.settings.examMode ? 'Exam period mode is on: a lighter weekly target, and your progress and rhythm are protected.' : 'Learn one concept, build one thing, review one idea. Consistency beats intensity.'}
      />

      {!s.placement && (
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center" glow>
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent/10 text-accent"><Compass size={24} /></div>
          <div className="flex-1">
            <div className="font-semibold text-fg">Start with the placement assessment</div>
            <p className="text-sm text-fg-2">27 questions across electrical, maths, programming logic, C, digital and microcontrollers. A strong area unlocks later modules early; foundations always stay open.</p>
          </div>
          <LinkButton to="/tests/run?kind=placement" variant="primary">Take assessment <ArrowRight size={15} /></LinkButton>
        </Card>
      )}

      {/* Welcome strip */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-5">
            <Ring value={info.xpProgress * 100} size={92} stroke={7} label={`Level ${info.level.n} progress`}>
              <div>
                <div className="font-mono text-2xl font-semibold text-fg">{info.level.n}</div>
                <div className="text-[9px] uppercase tracking-widest text-fg-3">level</div>
              </div>
            </Ring>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold text-fg">{info.level.name}</div>
              <div className="text-sm text-fg-3">{info.level.blurb}</div>
              {info.next && (
                <div className="mt-2 text-[13px] text-fg-2">
                  Next: <span className="text-fg">{info.next.name}</span> at {info.next.xp} XP
                  {info.blockedBySkills && <Badge tone="warn" className="ml-2">XP reached — skills required</Badge>}
                </div>
              )}
              {info.next && (
                <ul className="mt-1.5 space-y-0.5">
                  {info.nextRequirements.map((r) => (
                    <li key={r.label} className="flex items-center gap-1.5 text-[12px] text-fg-3">
                      {r.met ? <CheckCircle2 size={12} className="text-good" /> : <Circle size={12} />} {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<Sparkles size={14} />} label="Total XP" value={info.xp} />
          <Stat icon={<RotateCcw size={14} />} label="Learning rhythm" value={`${st.days} d`} hint={`${activeDaysThisWeek(s)}/7 active days this week`} />
          <Stat icon={<Clock size={14} />} label="This week" value={`${(weekMin / 60).toFixed(1)} h`} hint={`target ${target} h`} />
          <Stat icon={<Gauge size={14} />} label="Course completion" value={`${completion}%`} hint="core curriculum" />
        </div>
      </div>

      <Card className="flex flex-col items-center gap-4 p-5 sm:flex-row">
        <RankEmblem rank={rank.rank} size={72} float />
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="text-[12px] text-fg-3">Rank {rank.rank.n} of 6 · {rank.rank.title}</div>
          <div className="text-lg font-semibold" style={{ color: rank.rank.color }}>{rank.rank.name}</div>
          <div className="text-[13px] text-fg-2">
            {!rank.next ? 'Highest rank reached.' : rank.status === 'ready'
              ? `XP reached: score ${rank.next.minScore}% on a rank test to become ${rank.next.name}.`
              : `${(rank.next.xp - rank.xp).toLocaleString('en-US')} XP to go, then a rank test at ${rank.next.minScore}% for ${rank.next.name}.`}
          </div>
        </div>
        <LinkButton to="/rank" variant={rank.status === 'ready' ? 'primary' : 'secondary'}>Rank Arena <ArrowRight size={15} /></LinkButton>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Continue learning */}
        <Card className="lg:col-span-2">
          <CardHeader icon={<BookOpen size={18} />} title="Continue learning" subtitle={currentModule ? currentModule.title : 'Pick a module to begin'} />
          <div className="space-y-4 p-5">
            {nextFound ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-line bg-panel-2/50 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-fg-3">Last completed</div>
                    <div className="mt-0.5 text-sm text-fg">{last ? last.lesson.title : '—'}</div>
                  </div>
                  <div className="rounded-xl border border-accent/30 bg-accent/5 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-accent">Next lesson · {nextFound.lesson.minutes} min</div>
                    <div className="mt-0.5 text-sm text-fg">{nextFound.lesson.title}</div>
                  </div>
                </div>
                {mp && (
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-fg-3"><span>Module progress</span><span className="font-mono">{mp.percent}%</span></div>
                    <ProgressBar value={mp.percent} label="Module progress" />
                  </div>
                )}
                <LinkButton to={`/courses/${nextFound.module.id}/${nextFound.lesson.id}`} variant="primary">Continue <ArrowRight size={15} /></LinkButton>
              </>
            ) : (
              <p className="text-sm text-fg-2">
                Every unlocked interactive lesson is complete. Take a module exam in the <Link className="text-accent underline" to="/tests">Test Center</Link> to unlock the next phase, or keep building in the Lab.
              </p>
            )}
          </div>
        </Card>

        {/* Daily missions */}
        <Card>
          <CardHeader icon={<Target size={18} />} title="Daily mission" subtitle="+5 XP each, verified automatically" />
          <ul className="space-y-2 p-5">
            {missions.map((m) => (
              <li key={m.id} className={cx('flex items-start gap-3 rounded-xl border p-3', m.done ? 'border-good/40 bg-good/5' : 'border-line')}>
                {m.done ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-good" /> : <Circle size={18} className="mt-0.5 shrink-0 text-fg-3" />}
                <div className="min-w-0">
                  <div className={cx('text-sm font-medium', m.done ? 'text-fg' : 'text-fg-2')}>{m.title}</div>
                  <div className="text-xs text-fg-3">{m.detail}</div>
                </div>
              </li>
            ))}
            {due > 0 && <li><LinkButton to="/revision" size="sm" className="w-full">{due} card{due === 1 ? '' : 's'} due for review</LinkButton></li>}
          </ul>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader icon={<Trophy size={18} />} title="Engineering statistics" />
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          <Stat icon={<Clock size={14} />} label="Learning hours" value={stats.hours} />
          <Stat icon={<BookOpen size={14} />} label="Lessons completed" value={stats.lessons} />
          <Stat icon={<GraduationCap size={14} />} label="Tests completed" value={stats.tests} />
          <Stat icon={<Gauge size={14} />} label="Average test score" value={stats.tests ? `${stats.avgScore}%` : '—'} />
          <Stat icon={<Cpu size={14} />} label="Coding challenges" value={stats.coding} />
          <Stat icon={<FlaskConical size={14} />} label="Lab exercises" value={stats.labs} />
          <Stat icon={<Hammer size={14} />} label="Projects completed" value={stats.projects} />
          <Stat icon={<Brain size={14} />} label="Skills mastered" value={stats.skills} hint="modules fully mastered" />
        </div>
        <div className="grid gap-4 px-5 pb-5 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-xs text-fg-3">XP over the last 30 days</div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={xpHistory(s, 30)} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="day" {...axis} interval={6} />
                  <YAxis {...axis} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="total" name="Total XP" stroke="var(--accent)" fill="url(#xpFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs text-fg-3">Study hours per week (dashed = target)</div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyHistory(s, 8)} margin={{ top: 4, right: 6, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="week" {...axis} />
                  <YAxis {...axis} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--panel-2)' }} />
                  <ReferenceLine y={target} stroke="var(--accent-3)" strokeDasharray="5 4" />
                  <Bar dataKey="hours" name="Hours" fill="var(--accent-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly objective */}
      <Card>
        <CardHeader icon={<Target size={18} />} title="Weekly objective" subtitle="Choose a target that fits this week. A smaller week still counts — missed days are not punished." />
        <div className="space-y-4 p-5">
          <Segmented<WeeklyPreset>
            label="Weekly target"
            value={s.settings.weeklyPreset}
            onChange={(v) => setSettings(v === 'custom' ? { weeklyPreset: v } : { weeklyPreset: v, weeklyHours: PRESETS[v].hours })}
            options={[
              ...(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((k) => ({ value: k as WeeklyPreset, label: <span>{PRESETS[k].label} <span className="text-fg-3">{PRESETS[k].range}</span></span> })),
              { value: 'custom', label: 'Custom' },
            ]}
          />
          {s.settings.weeklyPreset === 'custom' && (
            <div className="flex max-w-xs items-center gap-2">
              <Input type="number" min={1} max={60} aria-label="Custom weekly hours" value={s.settings.weeklyHours} onChange={(e) => setSettings({ weeklyHours: Math.max(1, Math.min(60, Number(e.target.value) || 1)) })} />
              <span className="text-sm text-fg-3">hours / week</span>
            </div>
          )}
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-fg-3">
              <span>{formatMinutes(weekMin)} of {target} h{s.settings.examMode && ' (exam period)'}</span>
              <span className="font-mono">{Math.min(100, Math.round((weekMin / 60 / target) * 100))}%</span>
            </div>
            <ProgressBar value={(weekMin / 60 / target) * 100} tone={weekMin / 60 >= target ? 'good' : 'accent'} label="Weekly target progress" />
          </div>
          <p className="text-xs text-fg-3">University exams coming up? Turn on exam period mode in the <Link to="/planner" className="text-accent underline">Study Planner</Link> to lower the target without losing progress.</p>
        </div>
      </Card>
    </div>
  );
}
