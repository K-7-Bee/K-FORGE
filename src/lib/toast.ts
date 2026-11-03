export type ToastKind = 'xp' | 'achievement' | 'level' | 'info' | 'error' | 'success';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  detail?: string;
}

type Listener = (t: Toast) => void;
const listeners = new Set<Listener>();
let next = 1;

export function toast(kind: ToastKind, title: string, detail?: string): void {
  const t = { id: next++, kind, title, detail };
  listeners.forEach((l) => l(t));
}

export function onToast(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
