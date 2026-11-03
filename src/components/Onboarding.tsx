import { ArrowRight, Compass } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setProfile, setSettings, useApp } from '../store/store';
import type { WeeklyPreset } from '../store/types';
import { Button, Input, Label, Segmented } from './ui';

const PRESET_HOURS: Record<Exclude<WeeklyPreset, 'custom'>, number> = { flexible: 9, standard: 14, intensive: 21 };

export function Onboarding() {
  const s = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [spec, setSpec] = useState(s.profile.specialization);
  const [preset, setPreset] = useState<Exclude<WeeklyPreset, 'custom'>>('standard');
  if (s.profile.onboarded) return null;

  const finish = (placement: boolean) => {
    setProfile({ username: name.trim() || 'Engineer', specialization: spec, onboarded: true });
    setSettings({ weeklyPreset: preset, weeklyHours: PRESET_HOURS[preset] });
    navigate(placement ? '/tests/run?kind=placement' : '/');
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="ob-title">
      <div className="w-full max-w-lg rounded-3xl border border-line-strong bg-panel p-6 shadow-2xl fade-in sm:p-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Welcome to K-FORGE</div>
        <h1 id="ob-title" className="mt-1 text-2xl font-semibold text-fg">From tutorials to independent engineering</h1>
        <p className="mt-2 text-sm text-fg-2">Learn one concept, build it on hardware, measure it, and explain it. XP rewards verified work — never passive clicking.</p>
        <div className="mt-6 space-y-4">
          <div><Label htmlFor="ob-name">What should we call you?</Label><Input id="ob-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div>
          <div><Label htmlFor="ob-spec">Specialization</Label><Input id="ob-spec" value={spec} onChange={(e) => setSpec(e.target.value)} /></div>
          <div>
            <Label>Weekly study target</Label>
            <Segmented label="Weekly target" value={preset} onChange={setPreset} options={[{ value: 'flexible', label: 'Flexible 8–10 h' }, { value: 'standard', label: 'Standard 12–16 h' }, { value: 'intensive', label: 'Intensive 20–22 h' }]} />
            <p className="mt-1.5 text-[12px] text-fg-3">You can change it every week. Exam periods have their own lighter mode.</p>
          </div>
        </div>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Button variant="primary" className="flex-1" onClick={() => finish(true)}><Compass size={15} /> Take the placement assessment</Button>
          <Button variant="ghost" onClick={() => finish(false)}>Explore first <ArrowRight size={15} /></Button>
        </div>
      </div>
    </div>
  );
}
