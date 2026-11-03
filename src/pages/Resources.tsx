import { ExternalLink, Search } from 'lucide-react';
import { useState } from 'react';
import { RESOURCES } from '../data/resources';
import { DIFFICULTY_LABEL, type ResourceType } from '../data/types';
import { Badge, Card, Input, PageHeader, Select } from '../components/ui';

export default function Resources() {
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('all');
  const [type, setType] = useState<'all' | ResourceType>('all');
  const topics = [...new Set(RESOURCES.map((r) => r.topic))].sort();
  const types = [...new Set(RESOURCES.map((r) => r.type))].sort();
  const list = RESOURCES.filter((r) => (topic === 'all' || r.topic === topic) && (type === 'all' || r.type === type) && (!q || `${r.title} ${r.description} ${r.source}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-6 fade-in">
      <PageHeader eyebrow="Resource Library" title="Reference materials" subtitle="Official manufacturer documentation and recognised engineering education resources. Every entry links to its original source — K-FORGE hosts no copies. Check the current edition and availability before buying books." />
      <Card className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_200px_200px]">
        <div className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3" /><Input aria-label="Search resources" placeholder="Search title, description, source…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" /></div>
        <Select aria-label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)}><option value="all">All topics</option>{topics.map((t) => <option key={t}>{t}</option>)}</Select>
        <Select aria-label="Type" value={type} onChange={(e) => setType(e.target.value as typeof type)}><option value="all">All types</option>{types.map((t) => <option key={t}>{t}</option>)}</Select>
      </Card>
      <p className="text-sm text-fg-3">{list.length} resource{list.length === 1 ? '' : 's'}</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <a key={r.id} href={r.url} target="_blank" rel="noreferrer noopener" className="group">
            <Card className="flex h-full flex-col p-4 transition group-hover:border-accent/40">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-fg">{r.title}</h3>
                <ExternalLink size={15} className="mt-0.5 shrink-0 text-fg-3 group-hover:text-accent" />
              </div>
              <p className="mt-1 flex-1 text-sm text-fg-3">{r.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="blue">{r.topic}</Badge>
                <Badge>{r.type}</Badge>
                <Badge tone={r.difficulty === 3 ? 'purple' : r.difficulty === 2 ? 'accent' : 'neutral'}>{DIFFICULTY_LABEL[r.difficulty]}</Badge>
              </div>
              <div className="mt-2 truncate font-mono text-[11px] text-fg-3">{r.source} · {new URL(r.url).hostname}</div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
