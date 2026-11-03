import { ArrowRight, Bot, Briefcase, CheckCircle2, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CAPSTONE, PROJECTS } from '../data/projects';
import { DIFFICULTY_LABEL } from '../data/types';
import { uid } from '../engine/dates';
import { capstoneMilestonesDone } from '../engine/progress';
import { saveCustomProject, useApp } from '../store/store';
import { Badge, Button, Card, CardHeader, cx, Input, Label, LinkButton, PageHeader, ProgressBar, Select, Textarea } from '../components/ui';

export default function Projects() {
  const s = useApp();
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const capDone = capstoneMilestonesDone(s);
  const capP = s.projects[CAPSTONE.id];

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        eyebrow="Projects"
        title="Engineering project workspace"
        subtitle="Real hardware, tested code, measured results and documentation. Milestones complete only when their checklist, evidence and measurements are in place."
        actions={<><LinkButton to="/portfolio"><Briefcase size={15} /> Portfolio</LinkButton><Button variant="primary" onClick={() => setShowNew((v) => !v)}><Plus size={15} /> New project</Button></>}
      />

      {showNew && (
        <Card className="p-5 fade-in">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
            <div><Label htmlFor="np-title">Project title</Label><Input id="np-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Plant moisture monitor" /></div>
            <div><Label htmlFor="np-diff">Difficulty</Label><Select id="np-diff" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value) as 1 | 2 | 3)}><option value={1}>Foundation</option><option value={2}>Intermediate</option><option value={3}>Advanced</option></Select></div>
          </div>
          <div className="mt-4"><Label htmlFor="np-desc">Description</Label><Textarea id="np-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What problem does it solve? What will you measure?" /></div>
          <div className="mt-4 flex gap-2">
            <Button variant="primary" disabled={!title.trim()} onClick={() => {
              const id = uid('cp');
              saveCustomProject({ id, title: title.trim(), description: desc, difficulty, skills: [], components: '', budget: '', milestones: [{ id: uid('m'), title: 'Design and schematic', done: false, evidence: [] }, { id: uid('m'), title: 'Build and firmware', done: false, evidence: [] }, { id: uid('m'), title: 'Test and measure', done: false, evidence: [] }], tests: [], documentation: '', createdAt: new Date().toISOString() });
              navigate(`/projects/custom/${id}`);
            }}>Create</Button>
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Link to={`/projects/${CAPSTONE.id}`} className="block">
        <Card className="overflow-hidden transition hover:border-line-strong" glow>
          <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="p-5">
              <div className="flex items-center gap-2"><Badge tone="accent"><Bot size={11} /> Capstone · Phase 12</Badge>{capP?.completedAt && <Badge tone="good">Completed</Badge>}</div>
              <h2 className="mt-2 text-xl font-semibold text-fg">{CAPSTONE.title}</h2>
              <p className="mt-1 text-sm text-fg-2">{CAPSTONE.description}</p>
              <div className="mt-4 flex items-center gap-3">
                <ProgressBar value={(capDone / CAPSTONE.milestones.length) * 100} className="max-w-sm" label="Capstone milestones" />
                <span className="font-mono text-sm text-fg-2">{capDone}/{CAPSTONE.milestones.length}</span>
              </div>
            </div>
            <div className="border-t border-line bg-panel-2/40 p-5 md:border-l md:border-t-0">
              <div className="mb-2 text-[11px] uppercase tracking-widest text-fg-3">Tracked results</div>
              <ul className="space-y-1.5 text-sm">
                {CAPSTONE.metrics.slice(0, 6).map((m) => {
                  const t = [...(capP?.tests ?? [])].reverse().find((x) => x.name === m.name && x.measured);
                  return <li key={m.name} className="flex justify-between gap-2"><span className="truncate text-fg-3">{m.name}</span><span className="font-mono text-fg">{t ? `${t.measured} ${t.unit}` : '—'}</span></li>;
                })}
              </ul>
            </div>
          </div>
        </Card>
      </Link>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-fg-3">Mini-projects</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PROJECTS.filter((p) => p.kind === 'mini').map((p) => {
            const pp = s.projects[p.id];
            const done = p.milestones.filter((m) => pp?.milestones[m.id]?.completedAt).length;
            return (
              <Link key={p.id} to={`/projects/${p.id}`} className="group">
                <Card className={cx('flex h-full flex-col p-4 transition group-hover:border-line-strong', pp?.completedAt && 'border-good/40')}>
                  <div className="flex items-center justify-between"><Badge tone={p.difficulty === 3 ? 'purple' : p.difficulty === 2 ? 'accent' : 'neutral'}>{DIFFICULTY_LABEL[p.difficulty]}</Badge>{pp?.completedAt ? <CheckCircle2 size={16} className="text-good" /> : pp ? <Badge tone="blue">in progress</Badge> : null}</div>
                  <h3 className="mt-2 font-semibold text-fg">{p.title}</h3>
                  <p className="mt-1 line-clamp-3 flex-1 text-sm text-fg-3">{p.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-fg-3"><ProgressBar value={(done / p.milestones.length) * 100} /><span className="font-mono">{done}/{p.milestones.length}</span></div>
                  <div className="mt-2 text-[11px] text-fg-3">{p.budget} · +75 XP on completion</div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <Card>
        <CardHeader title="Your own projects" subtitle="Record any project with milestones, evidence, tests and documentation." />
        <div className="grid gap-2 p-5 sm:grid-cols-2">
          {s.customProjects.length === 0 && <p className="text-sm text-fg-3">No custom projects yet. Use “New project” above.</p>}
          {s.customProjects.map((c) => (
            <Link key={c.id} to={`/projects/custom/${c.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-line-strong">
              {c.completedAt ? <CheckCircle2 size={16} className="text-good" /> : <Badge>{c.milestones.filter((m) => m.done).length}/{c.milestones.length}</Badge>}
              <span className="flex-1 truncate text-sm text-fg">{c.title}</span>
              <ArrowRight size={14} className="text-fg-3" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
