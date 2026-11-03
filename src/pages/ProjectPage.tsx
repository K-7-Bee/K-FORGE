import { ArrowLeft, CheckCircle2, ChevronDown, Circle, ClipboardList, Download, FileText, Plus, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProject } from '../data/projects';
import { DIFFICULTY_LABEL, type ProjectDef } from '../data/types';
import { buildReport, downloadText } from '../lib/report';
import { toast } from '../lib/toast';
import {
  addMilestoneEvidence,
  addTestRecord,
  completeMilestone,
  completeProject,
  removeMilestoneEvidence,
  removeTestRecord,
  setFinalEvaluation,
  setMilestoneNotes,
  setProjectDocumentation,
  startProject,
  toggleMilestoneCheck,
  useApp,
} from '../store/store';
import { EvidenceUploader } from '../components/EvidenceUploader';
import { Markdown } from '../components/ui/Markdown';
import { Badge, Button, Card, CardHeader, Checkbox, cx, EmptyState, Input, LinkButton, PageHeader, ProgressBar, Segmented, Select, Textarea } from '../components/ui';

type Tab = 'overview' | 'milestones' | 'testing' | 'docs' | 'evaluation' | 'report';

function TestRecords({ def }: { def: ProjectDef }) {
  const s = useApp();
  const p = s.projects[def.id];
  const [name, setName] = useState(def.metrics[0]?.name ?? '');
  const [target, setTarget] = useState('');
  const [measured, setMeasured] = useState('');
  const [unit, setUnit] = useState(def.metrics[0]?.unit ?? '');
  const [notes, setNotes] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="mb-3 text-sm font-medium text-fg">Add a measured result</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="tr-name" className="mb-1 block text-[12px] text-fg-3">Test / metric</label>
            <Input id="tr-name" list="metric-names" value={name} onChange={(e) => { setName(e.target.value); const m = def.metrics.find((x) => x.name === e.target.value); if (m) setUnit(m.unit); }} />
            <datalist id="metric-names">{def.metrics.map((m) => <option key={m.name} value={m.name} />)}{def.milestones.filter((m) => m.metric).map((m) => <option key={m.id} value={m.metric!.name} />)}</datalist>
          </div>
          <div><label htmlFor="tr-target" className="mb-1 block text-[12px] text-fg-3">Target (set before testing)</label><Input id="tr-target" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. < 5" /></div>
          <div className="grid grid-cols-[minmax(0,1fr)_90px] gap-2">
            <div><label htmlFor="tr-meas" className="mb-1 block text-[12px] text-fg-3">Measured</label><Input id="tr-meas" value={measured} onChange={(e) => setMeasured(e.target.value)} placeholder="e.g. 3.2 ± 0.4" /></div>
            <div><label htmlFor="tr-unit" className="mb-1 block text-[12px] text-fg-3">Unit</label><Input id="tr-unit" value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
          </div>
          <div><label htmlFor="tr-ms" className="mb-1 block text-[12px] text-fg-3">Milestone (optional)</label><Select id="tr-ms" value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)}><option value="">—</option>{def.milestones.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</Select></div>
          <div className="sm:col-span-2"><label htmlFor="tr-notes" className="mb-1 block text-[12px] text-fg-3">Method / notes (runs, conditions, failures)</label><Input id="tr-notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <Button className="mt-3" variant="primary" disabled={!name.trim() || !measured.trim()} onClick={() => { addTestRecord(def.id, { name, target, measured, unit, notes, milestoneId: milestoneId || undefined }); setMeasured(''); setNotes(''); toast('success', 'Result recorded'); }}><Plus size={14} /> Add record</Button>
      </Card>
      {p?.tests.length ? (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-panel-2 text-left text-[12px] text-fg-3"><tr><th className="p-2.5">Test</th><th className="p-2.5">Target</th><th className="p-2.5">Measured</th><th className="p-2.5">Notes</th><th className="p-2.5">Date</th><th /></tr></thead>
            <tbody>
              {p.tests.map((t) => (
                <tr key={t.id} className="border-t border-line">
                  <td className="p-2.5 text-fg">{t.name}{t.milestoneId && <div className="text-[11px] text-fg-3">{def.milestones.find((m) => m.id === t.milestoneId)?.title}</div>}</td>
                  <td className="p-2.5 font-mono text-fg-2">{t.target || '—'}</td>
                  <td className="p-2.5 font-mono text-accent">{t.measured} {t.unit}</td>
                  <td className="p-2.5 text-fg-3">{t.notes}</td>
                  <td className="p-2.5 text-fg-3">{t.at.slice(0, 10)}</td>
                  <td className="p-2.5"><button onClick={() => removeTestRecord(def.id, t.id)} className="text-fg-3 hover:text-bad" aria-label="Delete record"><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState title="No measurements yet">Record targets before testing, then the measured average and spread.</EmptyState>}
    </div>
  );
}

export default function ProjectPage() {
  const { projectId = '' } = useParams();
  const s = useApp();
  const def = getProject(projectId);
  const [tab, setTab] = useState<Tab>('milestones');
  const [open, setOpen] = useState<string | null>(null);
  const [docPreview, setDocPreview] = useState(false);
  if (!def) return <EmptyState title="Project not found" action={<LinkButton to="/projects">Back to projects</LinkButton>} />;
  const p = s.projects[def.id];
  const done = def.milestones.filter((m) => p?.milestones[m.id]?.completedAt).length;
  const report = buildReport(def, p, s);

  return (
    <div className="space-y-5 fade-in">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> Projects</Link>
      <PageHeader
        eyebrow={def.kind === 'capstone' ? 'Capstone project' : 'Mini-project'}
        title={def.title}
        subtitle={def.description}
        actions={!p ? <Button variant="primary" onClick={() => startProject(def.id)}>Start project</Button> : p.completedAt ? <Badge tone="good"><CheckCircle2 size={12} /> Completed {p.completedAt.slice(0, 10)}</Badge> : undefined}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={def.difficulty === 3 ? 'purple' : 'accent'}>{DIFFICULTY_LABEL[def.difficulty]}</Badge>
        <Badge>{def.budget}</Badge>
        {def.skills.map((x) => <Badge key={x} tone="blue">{x}</Badge>)}
      </div>
      <div className="flex items-center gap-3"><ProgressBar value={(done / def.milestones.length) * 100} className="max-w-md" label="Milestones" /><span className="font-mono text-sm text-fg-2">{done}/{def.milestones.length} milestones</span></div>

      <div className="overflow-x-auto">
        <Segmented<Tab> label="Project sections" value={tab} onChange={setTab} options={[
          { value: 'overview', label: 'Overview' }, { value: 'milestones', label: 'Milestones' }, { value: 'testing', label: 'Testing records' },
          { value: 'docs', label: 'Documentation' }, { value: 'evaluation', label: 'Final evaluation' }, { value: 'report', label: 'Report' },
        ]} />
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader title="Component list" subtitle={`Estimated budget: ${def.budget}`} />
            <ul className="divide-y divide-line">{def.components.map((c) => <li key={c.name} className="flex justify-between px-5 py-2 text-sm"><span className="text-fg-2">{c.name}</span><span className="font-mono text-fg-3">× {c.qty}</span></li>)}</ul>
          </Card>
          <div className="space-y-4">
            <Card className="p-5"><div className="mb-2 text-sm font-semibold text-fg">Wiring</div><Markdown text={def.wiring} /></Card>
            <Card className="p-5"><div className="mb-2 text-sm font-semibold text-fg">Programming requirements</div><ul className="list-disc space-y-1 pl-5 text-sm text-fg-2">{def.programming.map((x) => <li key={x}>{x}</li>)}</ul></Card>
          </div>
        </div>
      )}

      {tab === 'milestones' && (
        <div className="space-y-3">
          {!p && <Card className="p-5 text-sm text-fg-2">Start the project to track milestones.</Card>}
          {def.milestones.map((m, i) => {
            const mp = p?.milestones[m.id];
            const isOpen = open === m.id;
            const checks = m.checklist.map((_, j) => Boolean(mp?.checklist[j]));
            return (
              <Card key={m.id} className={cx(mp?.completedAt && 'border-good/40')}>
                <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen}>
                  {mp?.completedAt ? <CheckCircle2 size={18} className="shrink-0 text-good" /> : <span className="grid size-6 shrink-0 place-items-center rounded-md border border-line font-mono text-[11px] text-fg-3">{i + 1}</span>}
                  <span className="min-w-0 flex-1 font-medium text-fg">{m.title}</span>
                  {m.xp > 0 && <Badge tone="accent">+{m.xp} XP</Badge>}
                  {m.metric && <Badge tone="blue" className="hidden sm:inline-flex">measure: {m.metric.name}</Badge>}
                  <ChevronDown size={16} className={cx('shrink-0 text-fg-3 transition', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="grid gap-5 border-t border-line p-5 lg:grid-cols-2">
                    <div className="space-y-4 text-sm">
                      {m.knowledge.length > 0 && <div><div className="mb-1 font-medium text-fg">Required knowledge</div><div className="flex flex-wrap gap-1.5">{m.knowledge.map((k) => <Badge key={k}>{k}</Badge>)}</div></div>}
                      {m.components.length > 0 && <div><div className="mb-1 font-medium text-fg">Components</div><p className="text-fg-2">{m.components.join(', ')}</p></div>}
                      {m.wiring && <div><div className="mb-1 font-medium text-fg">Wiring</div><Markdown text={m.wiring} /></div>}
                      <div><div className="mb-1 font-medium text-fg">Programming / build tasks</div><ul className="list-disc space-y-1 pl-5 text-fg-2">{m.tasks.map((t) => <li key={t}>{t}</li>)}</ul></div>
                      {m.testing.length > 0 && <div><div className="mb-1 font-medium text-fg">Testing procedure</div><ul className="list-disc space-y-1 pl-5 text-fg-2">{m.testing.map((t) => <li key={t}>{t}</li>)}</ul></div>}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 text-sm font-medium text-fg">Completion checklist</div>
                        {m.checklist.map((c, j) => <Checkbox key={j} id={`${m.id}-c${j}`} checked={checks[j]} onChange={() => p && toggleMilestoneCheck(def.id, m.id, j, m.checklist.length)}>{c}</Checkbox>)}
                      </div>
                      {p && (
                        <>
                          <div>
                            <div className="mb-1 text-sm font-medium text-fg">Evidence</div>
                            <EvidenceUploader ids={mp?.evidence ?? []} context={`project:${def.id}:${m.id}`} onAdd={(id) => addMilestoneEvidence(def.id, m.id, id, m.checklist.length)} onRemove={(id) => removeMilestoneEvidence(def.id, m.id, id)} hint="Photos, code, wiring diagrams, logs or videos." />
                          </div>
                          <div>
                            <label htmlFor={`${m.id}-notes`} className="mb-1 block text-sm font-medium text-fg">Notes (what failed, how you found it)</label>
                            <Textarea id={`${m.id}-notes`} rows={3} defaultValue={mp?.notes ?? ''} onBlur={(e) => setMilestoneNotes(def.id, m.id, e.target.value, m.checklist.length)} />
                          </div>
                          {m.metric && <p className="text-[12px] text-fg-3">Requires a measured "{m.metric.name}" ({m.metric.unit}, target {m.metric.target}) linked to this milestone in Testing records.</p>}
                          <Button variant="primary" disabled={Boolean(mp?.completedAt)} onClick={() => { const err = completeMilestone(def.id, m.id); if (err) toast('error', 'Not complete yet', err); else toast('success', `Milestone complete: ${m.title}`); }}>
                            {mp?.completedAt ? <><CheckCircle2 size={15} /> Completed</> : 'Mark milestone complete'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'testing' && (p ? <TestRecords def={def} /> : <Card className="p-5 text-sm text-fg-2">Start the project first.</Card>)}

      {tab === 'docs' && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-fg">Technical documentation (Markdown)</div>
            <Segmented label="Editor view" value={docPreview ? 'preview' : 'edit'} onChange={(v) => setDocPreview(v === 'preview')} options={[{ value: 'edit', label: 'Edit' }, { value: 'preview', label: 'Preview' }]} />
          </div>
          {docPreview ? <div className="min-h-48 rounded-xl border border-line p-4"><Markdown text={p?.documentation || '_Nothing written yet._'} /></div> : (
            <Textarea rows={14} aria-label="Project documentation" disabled={!p} className="font-mono text-[13px]" defaultValue={p?.documentation ?? ''} onBlur={(e) => setProjectDocumentation(def.id, e.target.value)} placeholder={'First paragraph becomes the abstract.\n\nLater paragraphs become the discussion: what worked, what failed, limitations.'} />
          )}
          <p className="mt-2 text-[12px] text-fg-3">Write as you build, not at the end. Saved when you leave the editor.</p>
        </Card>
      )}

      {tab === 'evaluation' && (
        <Card className="p-5">
          <div className="mb-2 text-sm font-medium text-fg">Final evaluation</div>
          {def.evaluation.map((e, i) => (
            <Checkbox key={i} id={`ev-${i}`} checked={Boolean(p?.finalEvaluation?.[i])} onChange={(v) => p && setFinalEvaluation(def.id, def.evaluation.map((_, j) => (j === i ? v : Boolean(p.finalEvaluation?.[j]))))}>{e}</Checkbox>
          ))}
          <div className="mt-4 rounded-xl border border-line bg-panel-2/40 p-3 text-sm text-fg-2">
            <div className="mb-1 font-medium text-fg">Completion requires</div>
            <ul className="space-y-1">
              {[
                [`All ${def.milestones.length} milestones complete`, done === def.milestones.length],
                ['At least one measured test result', Boolean(p?.tests.some((t) => t.measured.trim()))],
                ['Documentation written', Boolean(p?.documentation.trim())],
                ['Every evaluation criterion confirmed', def.evaluation.every((_, i) => p?.finalEvaluation?.[i])],
              ].map(([l, ok]) => <li key={String(l)} className="flex items-center gap-2">{ok ? <CheckCircle2 size={14} className="text-good" /> : <Circle size={14} className="text-fg-3" />}{l}</li>)}
            </ul>
          </div>
          <Button className="mt-4" variant="primary" disabled={!p || Boolean(p?.completedAt)} onClick={() => { const err = completeProject(def.id); if (err) toast('error', 'Not complete yet', err); }}>
            {p?.completedAt ? 'Project completed' : `Complete project (+${def.kind === 'capstone' ? 250 : 75} XP)`}
          </Button>
        </Card>
      )}

      {tab === 'report' && (
        <Card>
          <CardHeader icon={<FileText size={18} />} title="Project report generator" subtitle="Built from your milestones, evidence counts, measurements and documentation. Gaps are marked for you to write."
            action={<div className="flex gap-2"><Button size="sm" onClick={() => downloadText(`${def.id}-report.md`, report)}><Download size={14} /> .md</Button><Button size="sm" onClick={() => window.print()}><Printer size={14} /> Print / PDF</Button></div>} />
          <div className="p-5"><div className="rounded-xl border border-line bg-bg-2 p-5"><Markdown text={report} /></div></div>
        </Card>
      )}

      <p className="flex items-center gap-1.5 text-[12px] text-fg-3"><ClipboardList size={13} /> Milestone XP is awarded once, only after its checklist, evidence and required measurements are present.</p>
    </div>
  );
}
