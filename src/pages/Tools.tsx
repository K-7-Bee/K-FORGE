import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTool, TOOLS, type ToolCategory } from '../tools/registry';
import { Card, EmptyState, Input, LinkButton, PageHeader, Spinner } from '../components/ui';

const CATS: ToolCategory[] = ['Electronics', 'Digital systems', 'Embedded systems', 'Control systems'];

export function ToolsIndex() {
  const [q, setQ] = useState('');
  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        eyebrow="Engineering tools"
        title="Interactive engineering tools"
        subtitle="Every tool takes your input and updates immediately. Use them to check calculations, explore behaviour and build intuition — then confirm with real measurements."
        actions={<div className="relative w-full sm:w-64"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-3" /><Input aria-label="Search tools" placeholder="Search tools…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" /></div>}
      />
      {CATS.map((c) => {
        const items = TOOLS.filter((t) => t.category === c && (!q || `${t.title} ${t.description}`.toLowerCase().includes(q.toLowerCase())));
        if (!items.length) return null;
        return (
          <section key={c}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-fg-3">{c}</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((t) => (
                <Link key={t.id} to={`/tools/${t.id}`} className="group">
                  <Card className="flex h-full items-center gap-3 p-4 transition group-hover:border-accent/40">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-fg">{t.title}</div>
                      <div className="text-sm text-fg-3">{t.description}</div>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-fg-3 transition group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function ToolPage() {
  const { toolId = '' } = useParams();
  const tool = getTool(toolId);
  if (!tool) return <EmptyState title="Tool not found" action={<LinkButton to="/tools">All tools</LinkButton>} />;
  const C = tool.component;
  return (
    <div className="space-y-5 fade-in">
      <Link to="/tools" className="inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-accent"><ArrowLeft size={14} /> Engineering tools</Link>
      <PageHeader eyebrow={tool.category} title={tool.title} subtitle={tool.description} />
      <Card className="p-4 sm:p-5">
        <Suspense fallback={<Spinner label="Loading tool" />}><C /></Suspense>
      </Card>
    </div>
  );
}
