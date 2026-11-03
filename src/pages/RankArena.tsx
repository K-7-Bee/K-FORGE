import { ArrowLeft, CheckCircle2, Circle, ClipboardCheck, Crown, History, LineChart as LineIcon, Lock, Play, Sparkles, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { topicLabel } from '../data/questions';
import type { Question } from '../data/types';
import { weekStart } from '../engine/dates';
import { hasXp } from '../engine/progress';
import { buildRankTest, RANK_TEST, RANK_TEST_XP_FACTOR, rankAttempts, rankForAttempt, rankInfo, rankPool, RANKS, type RankDef } from '../engine/ranks';
import { recordTestAttempt, useApp } from '../store/store';
import type { AppState, TestAttempt } from '../store/types';
import { QuizRunner } from '../components/quiz/QuizRunner';
import { RankEmblem } from '../components/RankEmblem';
import { Badge, Button, Callout, Card, CardHeader, cx, EmptyState, LinkButton, PageHeader, ProgressBar } from '../components/ui';

const axis = { stroke: 'var(--text-3)', fontSize: 11, tickLine: false, axisLine: false };
const tooltipStyle = { background: 'var(--panel)', border: '1px solid var(--line-strong)', borderRadius: 10, color: 'var(--text)', fontSize: 12 };
const fmt = (n: number) => n.toLocaleString('en-US');
const date = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/** Cumulative XP at the end of each day that had XP, for the XP-journey chart. */
function xpJourney(s: AppState): { day: string; xp: number }[] {
  const byDay = new Map<string, number>();
  for (const t of [...s.xp].sort((a, b) => (a.at < b.at ? -1 : 1))) {
    const day = t.at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + t.amount);
  }
  let total = 0;
  return [...byDay].map(([day, xp]) => ({ day: date(day), xp: (total += xp) }));
}

function Requirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {met ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-good" /> : <Circle size={16} className="mt-0.5 shrink-0 text-fg-3" />}
      <span className={met ? 'text-fg' : 'text-fg-2'}>{children}</span>
    </li>
  );
}

export default function RankArena() {
  const s = useApp();
  const info = rankInfo(s);
  const pool = useMemo(() => rankPool(s), [s]);
  const attempts = rankAttempts(s);
  const latest = attempts[attempts.length - 1];
  const canTest = pool.questions.length >= RANK_TEST.minPool;
  const weekXpTaken = hasXp(s, `rank-test:${weekStart()}`);
  const next = info.next;
  const nextTestMet = next ? attempts.some((a) => a.percent >= next.minScore && (a.xpAtStart ?? 0) >= next.xp) : true;

  const scores = attempts.map((a, i) => ({ n: i + 1, label: `#${i + 1} · ${date(a.finishedAt)}`, percent: a.percent, xp: a.xpAtStart ?? 0 }));
  const journey = xpJourney(s);
  const shownThresholds = RANKS.filter((r) => r.n > 1 && r.n <= info.rank.n + 1);
  const topics = latest
    ? [...latest.answers.reduce((m, a) => m.set(a.topic, { c: (m.get(a.topic)?.c ?? 0) + (a.correct ? 1 : 0), t: (m.get(a.topic)?.t ?? 0) + 1 }), new Map<string, { c: number; t: number }>())]
        .map(([topic, v]) => ({ topic, pct: Math.round((v.c / v.t) * 100), c: v.c, t: v.t }))
        .sort((a, b) => a.pct - b.pct)
    : [];

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        eyebrow="Rank mode"
        title="Rank Arena"
        subtitle="Climb six ranks by learning and proving it. Each rank needs its XP and a rank test, built only from the lessons and modules you have completed, passed at the rank's score."
        actions={canTest ? <LinkButton to="/rank/test" variant="primary"><Play size={15} /> Take a rank test</LinkButton> : undefined}
      />

      {/* Current rank and next promotion */}
      <Card glow className="overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <RankEmblem rank={info.rank} size={168} float className="mx-auto" />
          <div className="text-center lg:text-left">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-3">Rank {info.rank.n} of {RANKS.length}</div>
            <h2 className="mt-1 text-3xl font-semibold" style={{ color: info.rank.color }}>{info.rank.name}</h2>
            <div className="mt-1 text-sm text-fg-2">{info.rank.title} · {info.rank.tagline}</div>
            <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
              <Badge tone="accent"><Sparkles size={12} /> {fmt(info.xp)} XP</Badge>
              {info.best !== undefined && <Badge>Best rank test {info.best}%</Badge>}
              {info.earnedAt[info.rank.id] && <Badge tone="good">Earned {date(info.earnedAt[info.rank.id])}</Badge>}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-panel-2/50 p-4">
            {next ? (
              <>
                <div className="flex items-center gap-3">
                  <RankEmblem rank={next} size={56} locked />
                  <div>
                    <div className="text-[12px] text-fg-3">Next rank</div>
                    <div className="font-semibold text-fg">{next.name} <span className="font-normal text-fg-3">· {next.title}</span></div>
                  </div>
                </div>
                <ProgressBar className="mt-3" value={info.xpProgress * 100} label={`XP toward ${next.name}`} />
                <ul className="mt-3 space-y-1.5">
                  <Requirement met={info.xp >= next.xp}>Reach {fmt(next.xp)} XP <span className="text-fg-3">({fmt(Math.min(info.xp, next.xp))}/{fmt(next.xp)})</span></Requirement>
                  <Requirement met={nextTestMet}>Score at least {next.minScore}% on a rank test taken at {fmt(next.xp)}+ XP</Requirement>
                </ul>
                <div className="mt-3 text-[13px]">
                  {info.status === 'ready' ? (
                    <span className="text-good">XP reached — pass the rank test to be promoted.</span>
                  ) : (
                    <span className="text-fg-3">Keep learning: lessons, labs, exams, projects and daily missions all earn XP.</span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-sm text-fg-2"><Crown size={22} className="mx-auto mb-2 text-warn" />You hold the highest rank. Keep taking rank tests to show you stay at this level.</div>
            )}
          </div>
        </div>
      </Card>

      {/* Rank test */}
      <Card>
        <CardHeader icon={<ClipboardCheck size={18} />} title="Rank test" subtitle={`${RANK_TEST.questions} auto-graded questions from what you have learned · ${Math.round(RANK_TEST.questions * RANK_TEST.minutesPerQuestion)} minutes · exam conditions`} />
        <div className="space-y-4 p-5">
          {canTest ? (
            <>
              <p className="text-sm text-fg-2">Your question pool holds <span className="font-medium text-fg">{pool.questions.length} questions</span> from {pool.modules.length} module{pool.modules.length === 1 ? '' : 's'}. Questions are drawn evenly from each one, so the test grows with your learning.</p>
              <div className="flex flex-wrap gap-1.5">{pool.modules.map((m) => <Badge key={m.id}>{m.short} · {m.questions.length}</Badge>)}</div>
            </>
          ) : (
            <Callout tone="warn" icon={<Lock size={16} />} title="Not enough learned material yet">
              A rank test needs at least {RANK_TEST.minPool} questions from completed lessons; you have {pool.questions.length}. Complete a few more lessons (each one adds its knowledge-check questions), or pass a module exam to add its whole question pool.
            </Callout>
          )}
          <ul className="grid gap-1.5 text-[13px] text-fg-3 sm:grid-cols-2">
            <li>• The week's first rank test earns XP: score × {RANK_TEST_XP_FACTOR} (up to {Math.round(100 * RANK_TEST_XP_FACTOR)} XP). {weekXpTaken ? <span className="text-fg-2">Already earned this week.</span> : <span className="text-good">Available this week.</span>}</li>
            <li>• Retakes count for rank and for your chart, but earn no extra XP.</li>
            <li>• A test counts for a rank only if you already had that rank's XP when it started.</li>
            <li>• Wrong answers go to your mistake notebook and revision queue.</li>
          </ul>
          {canTest && <LinkButton to="/rank/test" variant="primary"><Play size={15} /> Start rank test</LinkButton>}
        </div>
      </Card>

      {/* Ladder */}
      <Card>
        <CardHeader icon={<Crown size={18} />} title="Rank ladder" subtitle="XP shows how much you have learned; the rank test shows you can use it." />
        <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-3 xl:grid-cols-6">
          {RANKS.map((r) => {
            const earned = r.n === 1 || Boolean(info.earnedAt[r.id]);
            const current = r.n === info.rank.n;
            return (
              <div key={r.id} className={cx('flex flex-col items-center rounded-2xl border p-3 text-center transition', current ? 'border-accent/60 bg-accent/5' : 'border-line')}>
                <RankEmblem rank={r} size={88} locked={!earned} />
                <div className="mt-2 text-[11px] font-mono text-fg-3">{r.n}</div>
                <div className="text-sm font-semibold text-fg">{r.name}</div>
                <div className="text-[12px] text-fg-2">{r.title}</div>
                <div className="mt-1 text-[11px] text-fg-3">{fmt(r.xp)} XP{r.minScore ? ` · test ≥ ${r.minScore}%` : ''}</div>
                <div className="mt-2">
                  {current ? <Badge tone="accent">Current</Badge> : earned ? <Badge tone="good">{r.n === 1 ? 'Start' : `Earned ${date(info.earnedAt[r.id])}`}</Badge> : r.n === info.rank.n + 1 ? <Badge tone="warn">Next</Badge> : <Badge><Lock size={11} /> Locked</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Progress charts */}
      <Card>
        <CardHeader icon={<LineIcon size={18} />} title="Your progress" subtitle={next ? `Dashed line: the ${next.minScore}% that ${next.name} needs.` : 'Rank-test scores and XP over time.'} />
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-xs text-fg-3">Rank-test scores</div>
            <div className="h-56">
              {scores.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scores} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="n" {...axis} allowDecimals={false} tickFormatter={(n) => `#${n}`} />
                    <YAxis {...axis} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                    <Tooltip contentStyle={tooltipStyle} labelFormatter={(_, p) => (p?.[0]?.payload as { label?: string } | undefined)?.label ?? ''} formatter={(v: number, name: string) => (name === 'Score' ? [`${v}%`, name] : [fmt(v), name])} />
                    {next && <ReferenceLine y={next.minScore} stroke={next.color} strokeDasharray="5 4" />}
                    <Line type="monotone" dataKey="percent" name="Score" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--accent)' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <EmptyState title="No rank tests yet">Your scores will be charted here after your first rank test.</EmptyState>}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs text-fg-3">XP journey (dashed lines: rank thresholds)</div>
            <div className="h-56">
              {journey.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={journey} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rankXpFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={info.rank.color} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={info.rank.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis dataKey="day" {...axis} minTickGap={24} />
                    <YAxis {...axis} allowDecimals={false} domain={[0, (max: number) => Math.max(max, ...shownThresholds.map((r) => r.xp))]} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [fmt(v), 'Total XP']} />
                    {shownThresholds.map((r) => <ReferenceLine key={r.id} y={r.xp} stroke={r.color} strokeDasharray="5 4" label={{ value: r.name, position: 'insideTopLeft', fill: r.color, fontSize: 11 }} />)}
                    <Area type="monotone" dataKey="xp" name="Total XP" stroke={info.rank.color} fill="url(#rankXpFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <EmptyState title="No XP yet">Complete a lesson to start your journey.</EmptyState>}
            </div>
          </div>
        </div>
        {latest && (
          <div className="border-t border-line p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-fg"><Target size={15} className="text-accent" /> Latest test by topic <span className="font-normal text-fg-3">· weakest first</span></div>
            <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {topics.map((t) => (
                <div key={t.topic}>
                  <div className="mb-1 flex justify-between text-[13px]"><span className="text-fg-2">{topicLabel(t.topic)}</span><span className="font-mono text-fg-3">{t.c}/{t.t}</span></div>
                  <ProgressBar value={t.pct} tone={t.pct >= 80 ? 'good' : t.pct >= 50 ? 'warn' : 'accent'} label={`${topicLabel(t.topic)} accuracy`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* History */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader icon={<History size={18} />} title="Rank-test history" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-[12px] text-fg-3">
                <tr className="border-b border-line"><th className="px-5 py-2 font-medium">Date</th><th className="px-3 py-2 font-medium">Score</th><th className="px-3 py-2 font-medium">Questions</th><th className="px-3 py-2 font-medium">XP at start</th><th className="px-5 py-2 font-medium">Qualified for</th></tr>
              </thead>
              <tbody>
                {[...attempts].reverse().map((a) => {
                  const r = rankForAttempt(a);
                  return (
                    <tr key={a.id} className="border-b border-line/60 last:border-0">
                      <td className="px-5 py-2.5 text-fg-2">{new Date(a.finishedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td className="px-3 py-2.5 font-mono text-fg">{a.percent}%</td>
                      <td className="px-3 py-2.5 font-mono text-fg-2">{a.score}/{a.total}</td>
                      <td className="px-3 py-2.5 font-mono text-fg-2">{fmt(a.xpAtStart ?? 0)}</td>
                      <td className="px-5 py-2.5"><span className="inline-flex items-center gap-2"><RankEmblem rank={r} size={24} /> <span className="text-fg-2">{r.name}</span></span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

interface Result { attempt: TestAttempt; before: RankDef; after: RankDef; target?: RankDef }

export function RankTest() {
  const s = useApp();
  const navigate = useNavigate();
  const pool = useMemo(() => rankPool(s), [s]);
  const [run, setRun] = useState<{ questions: Question[]; at: string; key: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const info = rankInfo(s);

  if (pool.questions.length < RANK_TEST.minPool && !run) {
    return <EmptyState title="Rank test locked" action={<LinkButton to="/rank">Back to Rank Arena</LinkButton>}>A rank test needs at least {RANK_TEST.minPool} questions from completed lessons; you have {pool.questions.length}.</EmptyState>;
  }

  const start = () => {
    setResult(null);
    setRun({ questions: buildRankTest(pool), at: new Date().toISOString(), key: Date.now() });
  };

  if (!run) {
    const count = Math.min(RANK_TEST.questions, pool.questions.length);
    return (
      <div className="mx-auto max-w-2xl space-y-5 fade-in">
        <Link to="/rank" className="inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> Rank Arena</Link>
        <PageHeader eyebrow="Rank mode" title="Rank test" subtitle="An aptitude test built from the lessons and modules you have completed." />
        <Card>
          <div className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
            <RankEmblem rank={info.next ?? info.rank} size={96} locked={Boolean(info.next)} />
            <div>
              {info.next ? (
                <>
                  <div className="text-sm text-fg-3">Aiming for</div>
                  <div className="text-xl font-semibold" style={{ color: info.next.color }}>{info.next.name}</div>
                  <div className="mt-1 text-sm text-fg-2">Needs {info.next.minScore}% on this test, taken at {fmt(info.next.xp)}+ XP. You have {fmt(info.xp)} XP{info.xp < info.next.xp ? ', so this test is practice for that rank' : ''}.</div>
                </>
              ) : <div className="text-sm text-fg-2">You hold the top rank. This test tracks whether you stay at that level.</div>}
            </div>
          </div>
          <div className="space-y-3 border-t border-line p-5 text-sm text-fg-2">
            <ul className="list-disc space-y-1 pl-5">
              <li>{count} questions drawn evenly from {pool.modules.length} module{pool.modules.length === 1 ? '' : 's'} you have covered, in random order.</li>
              <li>{Math.round(count * RANK_TEST.minutesPerQuestion)} minutes; the test submits itself when time runs out.</li>
              <li>Exam conditions: answers are revealed after you submit. Opening a hint is recorded.</li>
            </ul>
            <Button variant="primary" onClick={start}><Play size={15} /> Start rank test</Button>
          </div>
        </Card>
      </div>
    );
  }

  const promoted = result && result.after.n > result.before.n ? result.after : undefined;
  return (
    <div className="mx-auto max-w-3xl space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-fg">Rank test</h1>
        <Badge>{run.questions.length} questions</Badge>
      </div>
      <QuizRunner
        key={run.key}
        questions={run.questions}
        mode="exam"
        mastery={info.next?.minScore ?? RANKS[RANKS.length - 1].minScore}
        timeLimitSec={Math.round(run.questions.length * RANK_TEST.minutesPerQuestion * 60)}
        onComplete={(answers) => {
          const before = rankInfo(s);
          const attempt = recordTestAttempt({ kind: 'aptitude', ref: 'rank', title: 'Rank test', startedAt: run.at, mode: 'exam', timed: true, answers });
          const earned = rankForAttempt(attempt);
          setResult({ attempt, before: before.rank, after: earned.n > before.rank.n ? earned : before.rank, target: before.next });
          return { percent: attempt.percent, passed: before.next ? attempt.percent >= before.next.minScore : true };
        }}
        onRetake={start}
        onExit={() => navigate('/rank')}
        passMessage={result && (promoted ? (
          <span className="flex items-center gap-3"><RankEmblem rank={promoted} size={56} float /> <span><span className="font-semibold" style={{ color: promoted.color }}>Rank up: {promoted.name}!</span> {promoted.title} — {promoted.tagline}.</span></span>
        ) : result.target ? (
          <>Your score meets {result.target.name}&apos;s {result.target.minScore}%, but the test only counts once you have {fmt(result.target.xp)} XP (you started with {fmt(result.attempt.xpAtStart ?? 0)}). Keep learning, then take it again.</>
        ) : <>You hold the top rank — strong result.</>)}
        failMessage={result?.target && <>{result.target.name} needs {result.target.minScore}%. Your wrong answers are now in the Revision Center; review them and the weakest topics in Rank Arena, then try again.</>}
      />
    </div>
  );
}
