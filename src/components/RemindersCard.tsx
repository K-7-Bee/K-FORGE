import { Bell, BellRing, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { disablePush, enablePush, pushAvailable, sendTestPush } from '../lib/push';
import { toast } from '../lib/toast';
import { setSettings, useApp } from '../store/store';
import { Badge, Button, Callout, Card, CardHeader, Checkbox, Input } from './ui';

export function RemindersCard() {
  const s = useApp();
  const r = s.settings.reminders;
  const [push, setPush] = useState<{ ok: boolean; reason?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { pushAvailable().then(setPush); }, []);

  // Keep the server's copy of time / exam mode in sync with the settings.
  useEffect(() => {
    if (r.push && push?.ok) enablePush(r.time, s.settings.examMode).catch(() => undefined);
  }, [r.time, s.settings.examMode, r.push, push?.ok]);

  async function togglePush(v: boolean) {
    setBusy(true);
    try {
      if (v) {
        await enablePush(r.time, s.settings.examMode);
        setSettings({ reminders: { ...r, push: true, enabled: true } });
        toast('success', 'Background reminders on', `Daily at ${r.time}, skipped on days you've already studied.`);
      } else {
        await disablePush();
        setSettings({ reminders: { ...r, push: false } });
      }
    } catch (e) {
      toast('error', 'Could not change background reminders', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleInApp(v: boolean) {
    if (v && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      if ((await Notification.requestPermission()) !== 'granted') { toast('error', 'Notifications blocked', 'Allow notifications for this site in your browser settings.'); return; }
    }
    setSettings({ reminders: { ...r, enabled: v } });
  }

  return (
    <Card>
      <CardHeader icon={<Bell size={18} />} title="Learning reminders" subtitle="One notification at your chosen time, only on days you haven't studied yet." />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="rem-time" className="text-sm text-fg-2">Remind me at</label>
          <Input id="rem-time" type="time" className="max-w-36" value={r.time} onChange={(e) => setSettings({ reminders: { ...r, time: e.target.value } })} />
        </div>

        <div className="rounded-xl border border-line p-3">
          <div className="flex flex-wrap items-center gap-2">
            <BellRing size={16} className="text-accent" />
            <span className="text-sm font-medium text-fg">Background reminders (push)</span>
            {r.push ? <Badge tone="good">on</Badge> : <Badge>off</Badge>}
          </div>
          <p className="mt-1 text-[13px] text-fg-3">Arrive even when K-FORGE is closed. The server keeps only your push address, reminder time and time zone — no learning data.</p>
          {push === null ? null : push.ok ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant={r.push ? 'secondary' : 'primary'} disabled={busy} onClick={() => togglePush(!r.push)}>{r.push ? 'Turn off' : 'Turn on'}</Button>
              {r.push && <Button size="sm" variant="ghost" onClick={() => sendTestPush().then((ok) => toast(ok ? 'success' : 'error', ok ? 'Test notification sent' : 'Test failed')).catch((e) => toast('error', 'Test failed', (e as Error).message))}><Send size={13} /> Send test</Button>}
            </div>
          ) : <p className="mt-2 text-[12px] text-warn">{push.reason}</p>}
        </div>

        <Checkbox id="rem-inapp" checked={r.enabled && !r.push} onChange={toggleInApp}>In-app reminder while K-FORGE is open{r.push ? ' (replaced by background reminders)' : ''}</Checkbox>
        {typeof Notification === 'undefined' && <Callout tone="warn">This browser does not support notifications.</Callout>}
      </div>
    </Card>
  );
}
