import { ArrowLeft, CheckCircle2, Download, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { uid } from '../engine/dates';
import { buildCustomReport, downloadText } from '../lib/report';
import { toast } from '../lib/toast';
import { completeCustomProject, deleteCustomProject, saveCustomProject, useApp } from '../store/store';
import type { CustomProject } from '../store/types';
import { EvidenceUploader } from '../components/EvidenceUploader';
import { Markdown } from '../components/ui/Markdown';
import { Badge, Button, Card, CardHeader, Checkbox, EmptyState, Input, Label, LinkButton, PageHeader, Textarea } from '../components/ui';

export default function CustomProjectPage() {
  const { id = '' } = useParams();
  const s = useApp();
  const navigate = useNavigate();
  const c = s.customProjects.find((x) => x.id === id);
  const [newMs, setNewMs] = useState('');
  const [test, setTest] = useState({ name: '', target: '', measured: '', unit: '' });
  if (!c) return <EmptyState title="Project not found" action={<LinkButton to="/projects">Back</LinkButton>} />;
  const save = (patch: Partial<CustomProject>) => saveCustomProject({ ...c, ...patch });

  return (
    <div className="space-y-5 fade-in">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> Projects</Link>
      <PageHeader eyebrow="Your project" title={c.title} subtitle={c.description}
        actions={<>
          {c.completedAt && <Badge tone="good"><CheckCircle2 size={12} /> Completed</Badge>}
          <Button size="sm" onClick={() => downloadText(`${c.title.replace(/\W+/g, '-').toLowerCase()}.md`, buildCustomReport(c, s))}><Download size={14} /> Report</Button>
          <Button size="sm" variant="danger" onClick={() => { if (window.confirm('Delete this project?')) { deleteCustomProject(c.id); navigate('/projects'); } }}><Trash2 size={14} /></Button>
        </>} />

      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <div><Label htmlFor="cp-title">Title</Label><Input id="cp-title" defaultValue={c.title} onBlur={(e) => save({ title: e.target.value || c.title })} /></div>
        <div><Label htmlFor="cp-budget">Estimated budget</Label><Input id="cp-budget" defaultValue={c.budget} onBlur={(e) => save({ budget: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label htmlFor="cp-desc">Description</Label><Textarea id="cp-desc" defaultValue={c.description} onBlur={(e) => save({ description: e.target.value })} /></div>
        <div><Label htmlFor="cp-skills" hint="comma-separated">Required skills</Label><Input id="cp-skills" defaultValue={c.skills.join(', ')} onBlur={(e) => save({ skills: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} /></div>
        <div><Label htmlFor="cp-comp">Component list</Label><Textarea id="cp-comp" rows={2} defaultValue={c.components} onBlur={(e) => save({ components: e.target.value })} /></div>
      </Card>

      <Card>
        <CardHeader title="Milestones" subtitle="Tick when done and attach evidence." />
        <div className="space-y-3 p-5">
          {c.milestones.map((m) => (
            <div key={m.id} className="rounded-xl border border-line p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1"><Checkbox id={`ms-${m.id}`} checked={m.done} onChange={(v) => save({ milestones: c.milestones.map((x) => (x.id === m.id ? { ...x, done: v } : x)) })}>{m.title}</Checkbox></div>
                <button className="text-fg-3 hover:text-bad" aria-label="Remove milestone" onClick={() => save({ milestones: c.milestones.filter((x) => x.id !== m.id) })}><Trash2 size={14} /></button>
              </div>
              <div className="mt-2 pl-6">
                <EvidenceUploader ids={m.evidence} context={`custom:${c.id}:${m.id}`} onAdd={(eid) => save({ milestones: c.milestones.map((x) => (x.id === m.id ? { ...x, evidence: [...x.evidence, eid] } : x)) })} onRemove={(eid) => save({ milestones: c.milestones.map((x) => (x.id === m.id ? { ...x, evidence: x.evidence.filter((e) => e !== eid) } : x)) })} />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Input aria-label="New milestone" placeholder="Add a milestone…" value={newMs} onChange={(e) => setNewMs(e.target.value)} />
            <Button disabled={!newMs.trim()} onClick={() => { save({ milestones: [...c.milestones, { id: uid('m'), title: newMs.trim(), done: false, evidence: [] }] }); setNewMs(''); }}><Plus size={14} /></Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Testing records" />
        <div className="space-y-3 p-5">
          <div className="grid gap-2 sm:grid-cols-5">
            <Input aria-label="Test name" placeholder="Test" value={test.name} onChange={(e) => setTest({ ...test, name: e.target.value })} className="sm:col-span-2" />
            <Input aria-label="Target" placeholder="Target" value={test.target} onChange={(e) => setTest({ ...test, target: e.target.value })} />
            <Input aria-label="Measured" placeholder="Measured" value={test.measured} onChange={(e) => setTest({ ...test, measured: e.target.value })} />
            <Input aria-label="Unit" placeholder="Unit" value={test.unit} onChange={(e) => setTest({ ...test, unit: e.target.value })} />
          </div>
          <Button size="sm" disabled={!test.name || !test.measured} onClick={() => { save({ tests: [...c.tests, { ...test, id: uid('tr'), at: new Date().toISOString(), notes: '' }] }); setTest({ name: '', target: '', measured: '', unit: '' }); }}><Plus size={14} /> Add</Button>
          <ul className="space-y-1 text-sm">{c.tests.map((t) => <li key={t.id} className="flex justify-between rounded-lg border border-line px-3 py-2"><span className="text-fg-2">{t.name}</span><span className="font-mono text-accent">{t.measured} {t.unit} <span className="text-fg-3">(target {t.target || '—'})</span></span></li>)}</ul>
        </div>
      </Card>

      <Card className="p-5">
        <Label htmlFor="cp-doc">Documentation (Markdown)</Label>
        <Textarea id="cp-doc" rows={8} className="font-mono text-[13px]" defaultValue={c.documentation} onBlur={(e) => save({ documentation: e.target.value })} />
        {c.documentation && <div className="mt-3 rounded-xl border border-line p-4"><Markdown text={c.documentation} /></div>}
      </Card>

      <Button variant="primary" disabled={Boolean(c.completedAt)} onClick={() => { const err = completeCustomProject(c.id); if (err) toast('error', 'Not complete yet', err); }}>
        {c.completedAt ? 'Completed' : 'Complete project (+75 XP)'}
      </Button>
    </div>
  );
}
