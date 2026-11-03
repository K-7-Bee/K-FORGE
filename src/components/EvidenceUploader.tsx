import { Download, FileText, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { deleteEvidence, type EvidenceRecord, getEvidence, putEvidence } from '../store/evidence';
import { toast } from '../lib/toast';
import { deleteCloudEvidence, downloadEvidence, uploadEvidence } from '../store/cloud';
import { Button } from './ui';

function EvidenceItem({ id, onRemove }: { id: string; onRemove: () => void }) {
  const [rec, setRec] = useState<EvidenceRecord | null | undefined>(undefined);
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let alive = true;
    let objectUrl: string | undefined;
    getEvidence(id)
      .then((r) => r ?? downloadEvidence(id))
      .then((r) => {
        if (!alive) return;
        setRec(r ?? null);
        if (r) { objectUrl = URL.createObjectURL(r.blob); setUrl(objectUrl); }
      })
      .catch(() => alive && setRec(null));
    return () => { alive = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id]);
  if (rec === undefined) return <li className="h-14 animate-pulse rounded-xl bg-panel-2" />;
  if (rec === null) return <li className="flex items-center justify-between rounded-xl border border-line p-2 text-xs text-fg-3">File not found on this device <Button size="sm" variant="ghost" onClick={onRemove}>Remove</Button></li>;
  const isImage = rec.type.startsWith('image/');
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-panel-2/40 p-2">
      {isImage && url ? <img src={url} alt={rec.name} className="size-12 rounded-lg object-cover" /> : <div className="grid size-12 place-items-center rounded-lg bg-panel-2 text-fg-3">{isImage ? <ImageIcon size={18} /> : <FileText size={18} />}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-fg">{rec.name}</div>
        <div className="text-[11px] text-fg-3">{(rec.size / 1024).toFixed(0)} KB · {new Date(rec.createdAt).toLocaleDateString()}</div>
      </div>
      {url && <a href={url} download={rec.name} className="grid size-8 place-items-center rounded-lg text-fg-3 hover:text-accent" aria-label={`Download ${rec.name}`}><Download size={15} /></a>}
      <button onClick={async () => { await deleteEvidence(id).catch(() => undefined); deleteCloudEvidence(id).catch(() => undefined); onRemove(); }} className="grid size-8 place-items-center rounded-lg text-fg-3 hover:text-bad" aria-label={`Delete ${rec.name}`}><Trash2 size={15} /></button>
    </li>
  );
}

/** Upload photos, code files, diagrams and test logs. Files stay in this browser's IndexedDB. */
export function EvidenceUploader({ ids, context, onAdd, onRemove, hint }: { ids: string[]; context: string; onAdd: (id: string) => void; onRemove: (id: string) => void; hint?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <input
        ref={input}
        type="file"
        multiple
        className="hidden"
        accept="image/*,video/*,.c,.h,.cpp,.hpp,.ino,.py,.txt,.csv,.json,.md,.pdf,.zip,audio/*"
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          setBusy(true);
          for (const f of files) {
            try {
              const rec = await putEvidence(f, context);
              onAdd(rec.id);
              uploadEvidence(rec).catch(() => undefined); // no-op unless signed in to cloud sync
            } catch (err) {
              toast('error', 'Upload failed', (err as Error).message);
            }
          }
          setBusy(false);
          e.target.value = '';
        }}
      />
      <Button size="sm" onClick={() => input.current?.click()} disabled={busy}><Upload size={14} /> {busy ? 'Saving…' : 'Upload evidence'}</Button>
      {hint && <p className="text-[12px] text-fg-3">{hint}</p>}
      {ids.length > 0 && <ul className="grid gap-2 sm:grid-cols-2">{ids.map((id) => <EvidenceItem key={id} id={id} onRemove={() => onRemove(id)} />)}</ul>}
      <p className="text-[11px] text-fg-3">Files are stored in this browser (IndexedDB), up to 15 MB each, and also in your cloud storage when cloud sync is on. Keep important evidence in your GitHub repository too.</p>
    </div>
  );
}
