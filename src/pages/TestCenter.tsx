import { ArrowRight, Bug, CheckCircle2, ClipboardCheck, Compass, GraduationCap, Hammer, History, Lock, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CORE_MODULES, FULL_LESSONS, MODULES } from '../data/curriculum';
import { PRACTICAL_EXAMS } from '../data/exams';
import { topicLabel } from '../data/questions';
import { formatDate } from '../engine/dates';
import { attemptsFor, bestPercent, moduleProgress, topicStats } from '../engine/progress';
import { setSettings, useApp } from '../store/store';
import { Badge, Card, CardHeader, cx, EmptyState, LinkButton, PageHeader, ProgressBar, Slider } from '../components/ui';

const axis = { stroke: 'var(--text-3)', fontSize: 11, tickLine: false, axisLine: false };

export default function TestCenter() {
  const s = useApp();
  const history = s.attempts.filter((a) => a.kind !== 'quiz').slice(-30).map((a, i) => ({ i: i + 1, percent: a.percent, title: a.title }));
  const topics = topicStats(s).filter((t) => t.total > 0);
  const recent = [...s.attempts].reverse().slice(0, 12);

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        eyebrow="Test Center"
        title="Examinations and assessment"
        subtitle="Practice mode gives instant feedback; exam mode counts toward progress. Passing an exam shows knowledge — practical labs and projects show skill. You need both."
      />

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-center">
          <div>
            <div className="font-medium text-fg">Mastery target: {s.settings.mastery}%</div>
            <p className="text-sm text-fg-3">The score needed to pass checks and exams. 80% is the recommended default.</p>
          </div>
          <Slider id="mastery" label="Mastery target" value={s.settings.mastery} min={60} max={100} step={5} unit="%" onChange={(v) => setSettings({ mastery: v })} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader icon={<Compass size={18} />} title="Placement assessment" subtitle="Find your starting point (27 questions)." />
          <div className="p-5">
            {s.placement && <p className="mb-3 text-sm text-fg-2">Last taken {formatDate(s.placement.at)}.</p>}
            <LinkButton to="/tests/run?kind=placement" variant={s.placement ? 'secondary' : 'primary'}>{s.placement ? 'Retake' : 'Start'} <ArrowRight size={14} /></LinkButton>
          </div>
        </Card>
        <Card>
          <CardHeader icon={<GraduationCap size={18} />} title="Final examination" subtitle="Theory, calculations, programming and reasoning across all modules." />
          <div className="p-5">
            {bestPercent(s, 'final', 'final') !== undefined && <p className="mb-3 text-sm text-fg-2">Best: {bestPercent(s, 'final', 'final')}%</p>}
            <LinkButton to="/tests/run?kind=final&ref=final">Configure <ArrowRight size={14} /></LinkButton>
          </div>
        </Card>
        <Card>
          <CardHeader icon={<Bug size={18} />} title="Debugging examination" subtitle="Broken code, wrong outputs and faulty circuits." />
          <div className="p-5">
            {bestPercent(s, 'debugging', 'debug') !== undefined && <p className="mb-3 text-sm text-fg-2">Best: {bestPercent(s, 'debugging', 'debug')}%</p>}
            <LinkButton to="/tests/run?kind=debugging&ref=debug">Configure <ArrowRight size={14} /></LinkButton>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader icon={<ClipboardCheck size={18} />} title="Module examinations" subtitle="Unlocks the next modules when passed in exam mode." />
        <div className="grid gap-2 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {MODULES.map((m) => {
            const mp = moduleProgress(s, m);
            const best = mp.examBest;
            const n = attemptsFor(s, 'module', m.id).length;
            return (
              <div key={m.id} className={cx('flex items-center gap-3 rounded-xl border p-3', mp.examPassed ? 'border-good/40' : 'border-line')}>
                {mp.status === 'locked' ? <Lock size={16} className="shrink-0 text-fg-3" /> : mp.examPassed ? <CheckCircle2 size={16} className="shrink-0 text-good" /> : <ClipboardCheck size={16} className="shrink-0 text-accent" />}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-fg">{m.short}</div>
                  <div className="text-[11px] text-fg-3">{best !== undefined ? `best ${best}% · ${n} attempt${n === 1 ? '' : 's'}` : `${m.examQuestionIds.length} questions in pool`}</div>
                </div>
                <div className="flex gap-1">
                  <LinkButton size="sm" variant="ghost" to={`/tests/run?kind=diagnostic&ref=${m.id}`}><Stethoscope size={13} /></LinkButton>
                  {mp.status !== 'locked' && <LinkButton size="sm" to={`/tests/run?kind=module&ref=${m.id}`}>Exam</LinkButton>}
                </div>
              </div>
            );
          })}
        </div>
        <p className="px-5 pb-5 text-[12px] text-fg-3"><Stethoscope size={12} className="inline" /> Diagnostic tests check what you already know before studying a subject — always available, never counted as exams.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Lesson quizzes" subtitle="Short knowledge checks inside each interactive lesson." />
          <ul className="divide-y divide-line">
            {FULL_LESSONS.map(({ module, lesson }) => {
              const best = s.lessons[lesson.id]?.bestCheck;
              return (
                <li key={lesson.id}>
                  <Link to={`/courses/${module.id}/${lesson.id}#check`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-panel-2/50">
                    <span className="min-w-0 flex-1 truncate text-sm text-fg-2">{lesson.title}</span>
                    {best !== undefined ? <Badge tone={best >= s.settings.mastery ? 'good' : 'warn'}>{best}%</Badge> : <Badge>not taken</Badge>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <CardHeader icon={<Hammer size={18} />} title="Practical examinations" subtitle="Requirements, constraints and a marking rubric. Self-assessed with evidence." />
          <div className="space-y-2 p-5">
            {PRACTICAL_EXAMS.map((p) => {
              const best = bestPercent(s, 'practical', p.id);
              return (
                <Link key={p.id} to={`/tests/practical/${p.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-line-strong">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-fg">{p.title}</div>
                    <div className="text-[11px] text-fg-3">{CORE_MODULES.find((m) => m.id === p.moduleId)?.short}</div>
                  </div>
                  {best !== undefined && <Badge tone={best >= s.settings.mastery ? 'good' : 'warn'}>{best}%</Badge>}
                  <ArrowRight size={14} className="text-fg-3" />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<History size={18} />} title="Score history" />
          <div className="h-56 p-4">
            {history.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="i" {...axis} />
                  <YAxis {...axis} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line-strong)', borderRadius: 10, fontSize: 12 }} labelFormatter={(_, p) => p?.[0]?.payload?.title ?? ''} />
                  <ReferenceLine y={s.settings.mastery} stroke="var(--accent-3)" strokeDasharray="5 4" />
                  <Line type="monotone" dataKey="percent" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No tests yet">Your scores will appear here.</EmptyState>}
          </div>
        </Card>
        <Card>
          <CardHeader title="Performance by topic" subtitle="Based on your most recent answers per topic." />
          <div className="max-h-56 space-y-2 overflow-y-auto p-5">
            {topics.length ? topics.map((t) => (
              <div key={t.topic} className="grid grid-cols-[minmax(0,1fr)_100px_44px] items-center gap-3">
                <span className="truncate text-sm text-fg-2">{topicLabel(t.topic)} {t.weak && <Badge tone="warn">weak</Badge>}</span>
                <ProgressBar value={t.accuracy * 100} tone={t.weak ? 'warn' : 'good'} />
                <span className="text-right font-mono text-xs text-fg-3">{t.correct}/{t.total}</span>
              </div>
            )) : <p className="text-sm text-fg-3">Answer questions to see your strengths and gaps.</p>}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent attempts" subtitle="Incorrect answers are saved automatically to the Revision Center's mistake notebook." action={<LinkButton size="sm" to="/revision">Mistake notebook</LinkButton>} />
        {recent.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[12px] text-fg-3"><tr><th className="px-5 py-2">Test</th><th className="px-2 py-2">Mode</th><th className="px-2 py-2">Score</th><th className="px-5 py-2">Date</th></tr></thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id} className="border-t border-line">
                    <td className="px-5 py-2 text-fg-2">{a.title}</td>
                    <td className="px-2 py-2"><Badge tone={a.mode === 'exam' ? 'purple' : 'neutral'}>{a.mode}{a.timed ? ' · timed' : ''}</Badge></td>
                    <td className="px-2 py-2 font-mono"><span className={a.passed ? 'text-good' : 'text-warn'}>{a.percent}%</span> <span className="text-fg-3">({a.score}/{a.total})</span></td>
                    <td className="px-5 py-2 text-fg-3">{formatDate(a.finishedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="p-5"><EmptyState title="No attempts yet" /></div>}
      </Card>
    </div>
  );
}
