import { ArrowLeft, Award, Briefcase, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MODULES } from '../data/curriculum';
import { PROJECTS } from '../data/projects';
import { ACHIEVEMENTS, levelInfo } from '../engine/levels';
import { headlineStats, moduleProgress } from '../engine/progress';
import { useApp } from '../store/store';
import { Badge, Button, Card, EmptyState, PageHeader } from '../components/ui';

export default function Portfolio() {
  const s = useApp();
  const info = levelInfo(s);
  const stats = headlineStats(s);
  const shown = PROJECTS.filter((p) => s.projects[p.id] && (s.projects[p.id].completedAt || p.kind === 'capstone'));
  const custom = s.customProjects.filter((c) => c.completedAt);
  const mastered = MODULES.filter((m) => m.track === 'core' && moduleProgress(s, m).status === 'mastered');
  const badges = ACHIEVEMENTS.filter((a) => s.achievements[a.id]);

  return (
    <div className="space-y-6 fade-in">
      <Link to="/projects" className="no-print inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> Projects</Link>
      <PageHeader
        eyebrow="Engineering portfolio"
        title={s.profile.username}
        subtitle={`${s.profile.specialization} · Level ${info.level.n} ${info.level.name}`}
        actions={<Button onClick={() => window.print()} className="no-print"><Printer size={15} /> Print / save PDF</Button>}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Study hours', stats.hours], ['Projects completed', stats.projects], ['Average exam score', stats.tests ? `${stats.avgScore}%` : '—'], ['Skills mastered', stats.skills]].map(([l, v]) => (
          <Card key={String(l)} className="p-4"><div className="text-[12px] text-fg-3">{l}</div><div className="font-mono text-xl font-semibold text-fg">{v}</div></Card>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-3">Projects with measured results</h2>
        {shown.length === 0 && custom.length === 0 && <EmptyState icon={<Briefcase size={28} />} title="No completed projects yet">Complete a mini-project with evidence and measurements to feature it here.</EmptyState>}
        {shown.map((p) => {
          const pp = s.projects[p.id];
          return (
            <Card key={p.id} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-fg">{p.title}</h3>
                {pp.completedAt ? <Badge tone="good">Completed {pp.completedAt.slice(0, 10)}</Badge> : <Badge tone="blue">In progress</Badge>}
              </div>
              <p className="mt-1 text-sm text-fg-2">{p.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">{p.skills.map((x) => <Badge key={x}>{x}</Badge>)}</div>
              {pp.tests.length > 0 && (
                <table className="mt-4 w-full text-sm">
                  <thead className="text-left text-[12px] text-fg-3"><tr><th className="py-1">Metric</th><th>Target</th><th>Measured</th></tr></thead>
                  <tbody>{pp.tests.map((t) => <tr key={t.id} className="border-t border-line"><td className="py-1.5 text-fg-2">{t.name}</td><td className="font-mono text-fg-3">{t.target || '—'}</td><td className="font-mono text-accent">{t.measured} {t.unit}</td></tr>)}</tbody>
                </table>
              )}
            </Card>
          );
        })}
        {custom.map((c) => (
          <Card key={c.id} className="p-5">
            <h3 className="text-lg font-semibold text-fg">{c.title}</h3>
            <p className="mt-1 text-sm text-fg-2">{c.description}</p>
            <ul className="mt-3 space-y-1 text-sm">{c.tests.map((t) => <li key={t.id} className="flex justify-between border-t border-line pt-1"><span className="text-fg-2">{t.name}</span><span className="font-mono text-accent">{t.measured} {t.unit}</span></li>)}</ul>
          </Card>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-2 text-sm font-semibold text-fg">Mastered skills</h2>
          {mastered.length ? <div className="flex flex-wrap gap-1.5">{mastered.map((m) => <Badge key={m.id} tone="good">{m.short}</Badge>)}</div> : <p className="text-sm text-fg-3">A skill counts as mastered after its lessons, exam and practical lab.</p>}
        </Card>
        <Card className="p-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg"><Award size={15} className="text-accent" /> Achievements</h2>
          {badges.length ? <div className="flex flex-wrap gap-1.5">{badges.map((a) => <Badge key={a.id} tone="accent">{a.title}</Badge>)}</div> : <p className="text-sm text-fg-3">None yet.</p>}
        </Card>
      </div>
    </div>
  );
}
