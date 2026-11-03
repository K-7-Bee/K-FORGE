// Evidence files (photos, code, diagrams, test logs) are stored locally in IndexedDB,
// never in localStorage, so large files do not crowd out progress data.

export interface EvidenceRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  context: string; // e.g. 'exercise:lab-uno-debounce' or 'project:p-capstone:m3'
  createdAt: string;
}

const DB = 'kforge-evidence';
const STORE = 'files';
export const MAX_EVIDENCE_BYTES = 15 * 1024 * 1024;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB is not available in this browser.'));
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function putEvidence(file: File, context: string): Promise<EvidenceRecord> {
  if (file.size > MAX_EVIDENCE_BYTES) throw new Error(`${file.name} is larger than 15 MB.`);
  const rec: EvidenceRecord = {
    id: `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    blob: file,
    context,
    createdAt: new Date().toISOString(),
  };
  await tx('readwrite', (s) => s.put(rec));
  return rec;
}

export function getEvidence(id: string): Promise<EvidenceRecord | undefined> {
  return tx<EvidenceRecord | undefined>('readonly', (s) => s.get(id) as IDBRequest<EvidenceRecord | undefined>);
}

export async function deleteEvidence(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id));
}

/** Store a record as-is (restores from a backup or downloads from cloud storage). */
export async function putRecord(rec: EvidenceRecord): Promise<void> {
  await tx('readwrite', (s) => s.put(rec));
}

export function listEvidence(): Promise<EvidenceRecord[]> {
  return tx<EvidenceRecord[]>('readonly', (s) => s.getAll() as IDBRequest<EvidenceRecord[]>);
}

// ---------- Full backup (progress + evidence files) ----------

export interface SerializedEvidence extends Omit<EvidenceRecord, 'blob'> {
  data: string; // data: URL (base64)
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

export async function serializeEvidence(): Promise<SerializedEvidence[]> {
  const all = await listEvidence().catch(() => [] as EvidenceRecord[]);
  return Promise.all(all.map(async ({ blob, ...rest }) => ({ ...rest, data: await blobToDataUrl(blob) })));
}

export async function restoreEvidence(items: SerializedEvidence[]): Promise<number> {
  let n = 0;
  for (const { data, ...rest } of items) {
    const blob = await (await fetch(data)).blob();
    await putRecord({ ...rest, blob });
    n++;
  }
  return n;
}
