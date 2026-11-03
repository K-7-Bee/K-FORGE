import { Cloud, CloudOff, LogOut, Mail, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '../engine/dates';
import { toast } from '../lib/toast';
import { sendMagicLink, signIn, signOut, signUp, syncNow, useCloud } from '../store/cloud';
import { Badge, Button, Callout, Card, CardHeader, Input, Label } from './ui';

export function CloudSyncCard() {
  const c = useCloud();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>, ok?: string) => {
    setBusy(true);
    try { const msg = await fn(); toast('success', typeof msg === 'string' ? msg : ok ?? 'Done'); } catch (e) { toast('error', 'Cloud sync', (e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Card>
      <CardHeader icon={c.user ? <Cloud size={18} /> : <CloudOff size={18} />} title="Cloud sync" subtitle="Keep progress, notes and evidence in sync across your laptop and phone." action={c.user ? <Badge tone="good">signed in</Badge> : <Badge>{c.configured ? 'signed out' : 'not configured'}</Badge>} />
      <div className="space-y-4 p-5">
        {!c.configured ? (
          <Callout tone="blue" title="Not configured">
            Cloud sync uses your own Supabase project. Create one, run <code>supabase/schema.sql</code>, then set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code> and rebuild (see README). Until then, progress stays on this device — use Full backup to move it.
          </Callout>
        ) : c.user ? (
          <>
            <p className="text-sm text-fg-2">Signed in as <span className="text-fg">{c.user.email}</span>. Changes are saved here instantly and synced a few seconds later; progress from other devices is merged, never overwritten.</p>
            <p className="text-[13px] text-fg-3">{c.syncing ? 'Syncing…' : c.lastSync ? `Last synced ${formatDate(c.lastSync)} ${new Date(c.lastSync).toLocaleTimeString()}` : 'Not synced yet'}</p>
            {c.error && <Callout tone="bad" title="Sync error">{c.error}</Callout>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => run(syncNow, 'Synced')} disabled={busy || c.syncing}><RefreshCw size={14} /> Sync now</Button>
              <Button size="sm" variant="ghost" onClick={() => run(signOut, 'Signed out — progress stays on this device')}><LogOut size={14} /> Sign out</Button>
            </div>
          </>
        ) : (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => signIn(email, password), 'Signed in'); }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="cs-email">Email</Label><Input id="cs-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label htmlFor="cs-pass">Password</Label><Input id="cs-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" variant="primary" disabled={busy || !email || password.length < 6}>Sign in</Button>
              <Button type="button" size="sm" disabled={busy || !email || password.length < 6} onClick={() => run(() => signUp(email, password))}>Create account</Button>
              <Button type="button" size="sm" variant="ghost" disabled={busy || !email} onClick={() => run(() => sendMagicLink(email), 'Magic link sent — check your email')}><Mail size={14} /> Email me a link</Button>
            </div>
            <p className="text-[12px] text-fg-3">Your existing progress on this device is merged into your account on first sign-in.</p>
          </form>
        )}
      </div>
    </Card>
  );
}
