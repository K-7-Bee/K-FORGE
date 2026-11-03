// Optional cloud sync with Supabase. The app stays local-first: every change is saved on this device
// immediately, then pushed to the cloud a few seconds later. On sign-in, focus and reconnect, the cloud
// copy is pulled and merged (mergeStates) so progress from several devices is combined, never overwritten.
import type { SupabaseClient } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { type EvidenceRecord, putRecord } from './evidence';
import { mergeStates } from './merge';
import { getState, replaceState, subscribe } from './store';
import type { AppState } from './types';

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
// Loaded lazily so the Supabase SDK is only downloaded when cloud sync is configured.
let clientP: Promise<SupabaseClient> | null = null;
function getClient(): Promise<SupabaseClient> | null {
  if (!URL_ || !KEY) return null;
  clientP ??= import('@supabase/supabase-js').then((m) => m.createClient(URL_, KEY));
  return clientP;
}

export interface CloudStatus {
  configured: boolean;
  user?: { id: string; email?: string };
  syncing: boolean;
  lastSync?: string;
  error?: string;
}

let status: CloudStatus = { configured: Boolean(URL_ && KEY), syncing: false };
const listeners = new Set<() => void>();
function setStatus(p: Partial<CloudStatus>) {
  status = { ...status, ...p };
  listeners.forEach((l) => l());
}
export function useCloud(): CloudStatus {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => status, () => status);
}

let applying = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;
let lastPulled = 0;

export async function syncNow(): Promise<void> {
  const client = await getClient();
  if (!client || !status.user || status.syncing) return;
  setStatus({ syncing: true, error: undefined });
  try {
    const { data, error } = await client.from('progress').select('state, updated_at').eq('user_id', status.user.id).maybeSingle();
    if (error) throw error;
    const local = getState();
    const remote = data?.state as AppState | undefined;
    const merged = remote ? mergeStates(local, remote) : local;
    if (JSON.stringify(merged) !== JSON.stringify(local)) {
      applying = true;
      replaceState(merged);
      applying = false;
    }
    if (!remote || JSON.stringify(merged) !== JSON.stringify(remote)) {
      const up = await client.from('progress').upsert({ user_id: status.user.id, state: getState(), updated_at: new Date().toISOString() });
      if (up.error) throw up.error;
    }
    lastPulled = Date.now();
    setStatus({ syncing: false, lastSync: new Date().toISOString() });
  } catch (e) {
    applying = false;
    setStatus({ syncing: false, error: (e as Error).message });
  }
}

function schedulePush() {
  if (applying || !status.user) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(syncNow, 4000);
}

export async function initCloud() {
  const client = await getClient();
  if (!client) return;
  client.auth.getSession().then(({ data }) => {
    if (data.session) { setStatus({ user: { id: data.session.user.id, email: data.session.user.email } }); syncNow(); }
  });
  client.auth.onAuthStateChange((_event, session) => {
    const was = status.user?.id;
    setStatus({ user: session ? { id: session.user.id, email: session.user.email } : undefined });
    if (session && session.user.id !== was) syncNow();
  });
  subscribe(schedulePush);
  const refresh = () => { if (Date.now() - lastPulled > 30_000) syncNow(); };
  window.addEventListener('online', syncNow);
  window.addEventListener('focus', refresh);
  window.addEventListener('beforeunload', () => { if (pushTimer) syncNow(); });
}

// ---------- Auth ----------

export async function signIn(email: string, password: string) {
  const client = await getClient();
  if (!client) throw new Error('Cloud sync is not configured.');
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(email: string, password: string): Promise<string> {
  const client = await getClient();
  if (!client) throw new Error('Cloud sync is not configured.');
  const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
  if (error) throw error;
  return data.session ? 'Account created and signed in.' : 'Check your email to confirm the account, then sign in.';
}

export async function sendMagicLink(email: string) {
  const client = await getClient();
  if (!client) throw new Error('Cloud sync is not configured.');
  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
  if (error) throw error;
}

export async function signOut() {
  const client = await getClient();
  if (!client) return;
  await client.auth.signOut();
  setStatus({ user: undefined, lastSync: undefined });
}

// ---------- Evidence files in Supabase Storage ----------

export async function uploadEvidence(rec: EvidenceRecord): Promise<void> {
  const client = await getClient();
  if (!client || !status.user) return;
  const path = `${status.user.id}/${rec.id}/${encodeURIComponent(rec.name)}`;
  const { error } = await client.storage.from('evidence').upload(path, rec.blob, { upsert: true, contentType: rec.type });
  if (error) console.warn('Evidence upload failed', error.message);
}

/** Fetch an evidence file uploaded from another device and cache it locally. */
export async function downloadEvidence(id: string): Promise<EvidenceRecord | undefined> {
  const client = await getClient();
  if (!client || !status.user) return undefined;
  const folder = `${status.user.id}/${id}`;
  const { data: list } = await client.storage.from('evidence').list(folder, { limit: 1 });
  const file = list?.[0];
  if (!file) return undefined;
  const { data, error } = await client.storage.from('evidence').download(`${folder}/${file.name}`);
  if (error || !data) return undefined;
  const rec: EvidenceRecord = { id, name: decodeURIComponent(file.name), type: data.type || 'application/octet-stream', size: data.size, blob: data, context: 'cloud', createdAt: file.created_at ?? new Date().toISOString() };
  await putRecord(rec);
  return rec;
}

export async function deleteCloudEvidence(id: string): Promise<void> {
  const client = await getClient();
  if (!client || !status.user) return;
  const folder = `${status.user.id}/${id}`;
  const { data: list } = await client.storage.from('evidence').list(folder);
  if (list?.length) await client.storage.from('evidence').remove(list.map((f) => `${folder}/${f.name}`));
}
