import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain ESM server module without type declarations
import { dueReminders, localNow } from '../server/reminders.mjs';

const sub = (over: Record<string, unknown> = {}) => ({ subscription: { endpoint: 'https://push.example/1' }, time: '19:00', timeZone: 'Europe/Berlin', ...over });

describe('push reminder scheduling', () => {
  // 2026-11-03 18:30 UTC = 19:30 in Berlin (CET, UTC+1)
  const now = new Date(Date.UTC(2026, 10, 3, 18, 30));

  it('computes local time in the subscriber time zone', () => {
    expect(localNow(now, 'Europe/Berlin')).toEqual({ day: '2026-11-03', time: '19:30' });
    expect(localNow(now, 'Asia/Dhaka')).toEqual({ day: '2026-11-04', time: '00:30' });
  });

  it('is due after the chosen local time, once per day', () => {
    expect(dueReminders({ a: sub() }, now)).toHaveLength(1);
    expect(dueReminders({ a: sub({ time: '20:00' }) }, now)).toHaveLength(0);
    expect(dueReminders({ a: sub({ lastSent: '2026-11-03' }) }, now)).toHaveLength(0);
  });

  it('skips learners who already studied today', () => {
    expect(dueReminders({ a: sub({ lastActive: '2026-11-03' }) }, now)).toHaveLength(0);
    expect(dueReminders({ a: sub({ lastActive: '2026-11-02' }) }, now)).toHaveLength(1);
  });

  it('falls back to UTC for an invalid time zone', () => {
    expect(localNow(now, 'Not/AZone')).toEqual({ day: '2026-11-03', time: '18:30' });
  });
});
