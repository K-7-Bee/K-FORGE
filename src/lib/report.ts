import type { ProjectDef } from '../data/types';
import type { AppState, CustomProject, ProjectProgress } from '../store/types';

const todo = (what: string) => `_[Write: ${what}]_`;

function testsTable(tests: ProjectProgress['tests']): string {
  if (!tests.length) return todo('record measured results in Testing records');
  return ['| Test | Target | Measured | Unit | Date | Notes |', '|---|---|---|---|---|---|', ...tests.map((t) => `| ${t.name} | ${t.target || '—'} | ${t.measured || '—'} | ${t.unit} | ${t.at.slice(0, 10)} | ${t.notes.replace(/\|/g, '/') || ''} |`)].join('\n');
}

/** Builds a technical report in Markdown from the project's recorded data. Gaps are marked for the learner to write. */
export function buildReport(def: ProjectDef, p: ProjectProgress | undefined, s: AppState): string {
  const done = def.milestones.filter((m) => p?.milestones[m.id]?.completedAt);
  const docParas = (p?.documentation ?? '').trim();
  const lines = [
    `# ${def.title}`,
    '',
    `**Author:** ${s.profile.username}  `,
    `**Generated:** ${new Date().toISOString().slice(0, 10)} with K-FORGE  `,
    `**Status:** ${p?.completedAt ? `completed ${p.completedAt.slice(0, 10)}` : `${done.length}/${def.milestones.length} milestones complete`}`,
    '',
    '## Abstract',
    docParas ? docParas.split(/\n\s*\n/)[0] : todo('the problem, your method and the main measured result in 3–5 sentences'),
    '',
    '## 1. Introduction',
    def.description,
    '',
    def.kind === 'capstone' ? `${todo('why indoor air mapping matters and what this project adds')}\n\n## 2. Related work\n${todo('what others have done and the gap you address — do a literature search before claiming novelty')}\n` : '',
    `## ${def.kind === 'capstone' ? 3 : 2}. System design`,
    '### Components',
    ['| Component | Qty | Note |', '|---|---|---|', ...def.components.map((c) => `| ${c.name} | ${c.qty} | ${c.note ?? ''} |`)].join('\n'),
    '',
    `**Estimated budget:** ${def.budget}`,
    '',
    '### Wiring',
    def.wiring,
    '',
    '### Firmware requirements',
    ...def.programming.map((x) => `- ${x}`),
    '',
    `## ${def.kind === 'capstone' ? 4 : 3}. Method and milestones`,
    ...def.milestones.map((m) => {
      const mp = p?.milestones[m.id];
      const notes = mp?.notes?.trim();
      return `- **${m.title}** — ${mp?.completedAt ? `done ${mp.completedAt.slice(0, 10)}` : 'not complete'}${mp?.evidence.length ? ` · ${mp.evidence.length} evidence file(s)` : ''}${notes ? `\n  - Notes: ${notes.replace(/\n/g, ' ')}` : ''}`;
    }),
    '',
    `## ${def.kind === 'capstone' ? 5 : 4}. Results`,
    testsTable(p?.tests ?? []),
    '',
    'Report the average and spread over repeated runs, not only your best run. Describe any test that failed.',
    '',
    `## ${def.kind === 'capstone' ? 6 : 5}. Discussion`,
    docParas && docParas.split(/\n\s*\n/).length > 1 ? docParas.split(/\n\s*\n/).slice(1).join('\n\n') : todo('what worked, what did not, limitations and error sources'),
    '',
    `## ${def.kind === 'capstone' ? 7 : 6}. Conclusion`,
    todo('what you learned and what comes next'),
    '',
    '## Evaluation criteria',
    ...def.evaluation.map((e, i) => `- [${p?.finalEvaluation?.[i] ? 'x' : ' '}] ${e}`),
  ];
  return lines.filter((l) => l !== '').join('\n').replace(/\n(#+ )/g, '\n\n$1');
}

export function buildCustomReport(c: CustomProject, s: AppState): string {
  return [
    `# ${c.title}`,
    `**Author:** ${s.profile.username} · **Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '## Description',
    c.description || todo('describe the project'),
    '',
    `**Skills:** ${c.skills.join(', ') || '—'}  `,
    `**Budget:** ${c.budget || '—'}`,
    '',
    '## Components',
    c.components || todo('list components'),
    '',
    '## Milestones',
    ...c.milestones.map((m) => `- [${m.done ? 'x' : ' '}] ${m.title}`),
    '',
    '## Results',
    testsTable(c.tests),
    '',
    '## Documentation',
    c.documentation || todo('write up design, testing and limitations'),
  ].join('\n');
}

export function downloadText(filename: string, text: string, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
