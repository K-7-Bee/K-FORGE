// Background study reminders via Web Push. Subscriptions live in server/data/push.json.
// The browser reports "studied today" so learners who already studied are not nagged.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DATA = join(here, 'data');
const SUBS_FILE = join(DATA, 'push.json');
const VAPID_FILE = join(DATA, 'vapid.json');

/** Local wall-clock date and time ("YYYY-MM-DD", "HH:MM") for an IANA time zone. */
export function localNow(now, timeZone) {
  let parts;
  try {
    parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now).map((p) => [p.type, p.value]));
  } catch {
    parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now).map((p) => [p.type, p.value]));
  }
  return { day: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/**
 * Which subscriptions should get a reminder now: their local time has reached the chosen time,
 * they have not been reminded today, and they have not studied today.
 */
export function dueReminders(subs, now = new Date()) {
  return Object.values(subs).filter((s) => {
    const { day, time } = localNow(now, s.timeZone);
    return time >= s.time && s.lastSent !== day && s.lastActive !== day;
  });
}

export function reminderBody(sub) {
  return sub.examMode
    ? 'Exam period: a 15-minute review keeps your knowledge fresh — your progress is safe.'
    : "Time for today's study session — learn one concept, build one thing, review one idea.";
}

export function loadSubs() {
  try {
    return existsSync(SUBS_FILE) ? JSON.parse(readFileSync(SUBS_FILE, 'utf8')) : {};
  } catch {
    return {};
  }
}

export function saveSubs(subs) {
  mkdirSync(DATA, { recursive: true });
  writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
}

/** VAPID keys from the environment, else generated once and stored in server/data/vapid.json. */
export function loadVapid(webpush) {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) return { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
  if (existsSync(VAPID_FILE)) return JSON.parse(readFileSync(VAPID_FILE, 'utf8'));
  const keys = webpush.generateVAPIDKeys();
  mkdirSync(DATA, { recursive: true });
  writeFileSync(VAPID_FILE, JSON.stringify(keys, null, 2));
  return keys;
}
