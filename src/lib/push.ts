// Background reminders via Web Push. Works when the app is closed, as long as the K-FORGE
// server is running and the browser supports push. Requires the production build (service worker).
import { getHealth } from './api';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function pushSupportedInBrowser(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && typeof Notification !== 'undefined';
}

export async function pushAvailable(): Promise<{ ok: boolean; reason?: string }> {
  if (!pushSupportedInBrowser()) return { ok: false, reason: 'This browser does not support push notifications.' };
  if (!import.meta.env.PROD) return { ok: false, reason: 'Background push needs the production build (npm start); the dev server has no service worker.' };
  const h = await getHealth();
  if (!h.push) return { ok: false, reason: 'The K-FORGE server is not running, so background reminders are unavailable.' };
  return { ok: true };
}

async function post(path: string, body: unknown) {
  const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({ error: r.statusText }))).error ?? 'Push service error');
  return r.json();
}

export async function enablePush(time: string, examMode: boolean): Promise<void> {
  if ((await Notification.requestPermission()) !== 'granted') throw new Error('Notifications are blocked for this site.');
  const reg = await navigator.serviceWorker.ready;
  const { publicKey } = await (await fetch('/api/push/key')).json();
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource }));
  await post('/api/push/subscribe', { subscription: sub.toJSON(), time, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, examMode });
}

export async function disablePush(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await post('/api/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => undefined);
  await sub.unsubscribe();
}

async function currentEndpoint(): Promise<string | undefined> {
  if (!pushSupportedInBrowser()) return undefined;
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription())?.endpoint;
}

/** Tell the server the learner studied today, so the evening reminder is skipped. */
export async function reportActivity(day: string): Promise<void> {
  const endpoint = await currentEndpoint();
  if (endpoint) await post('/api/push/activity', { endpoint, day }).catch(() => undefined);
}

export async function sendTestPush(): Promise<boolean> {
  const endpoint = await currentEndpoint();
  if (!endpoint) throw new Error('Not subscribed on this device.');
  return (await post('/api/push/test', { endpoint })).ok;
}
