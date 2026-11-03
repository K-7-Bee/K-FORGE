import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge, Button, Callout, Segmented, Slider } from '../components/ui';
import { Readout, ToolGrid, Wave } from './shared';

const axis = { stroke: 'var(--text-3)', fontSize: 11 };
const tooltipStyle = { background: 'var(--panel)', border: '1px solid var(--line-strong)', borderRadius: 10, color: 'var(--text)', fontSize: 12 };

// ---------- PID simulator ----------
export interface PidParams { kp: number; ki: number; kd: number; setpoint: number; noise: number; disturbance: boolean; tau: number }

/** Simulate a first-order motor (speed in m/s) under PID control with anti-windup, as in the K-FORGE PID lesson. */
export function simulatePid(p: PidParams, seconds = 3, dt = 0.01) {
  const vmax = 0.5; // m/s at full PWM
  let speed = 0;
  let integral = 0;
  let prevError = 0;
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 2;
  const data: { t: number; target: number; speed: number; output: number }[] = [];
  for (let k = 0; k <= seconds / dt; k++) {
    const t = k * dt;
    const target = t >= 0.2 ? p.setpoint : 0;
    const measured = speed + p.noise * rand();
    const error = target - measured;
    const derivative = k === 0 ? 0 : (error - prevError) / dt;
    prevError = error;
    const candidate = integral + error * dt;
    let output = p.kp * error + p.ki * candidate + p.kd * derivative;
    if (output > 1) output = 1;
    else if (output < -1) output = -1;
    else integral = candidate; // anti-windup: integrate only when not saturated
    const load = p.disturbance && t >= 2 ? 0.25 : 0;
    speed += (dt / p.tau) * (vmax * (output - load) - speed);
    data.push({ t: Math.round(t * 100) / 100, target, speed: Math.round(speed * 1000) / 1000, output: Math.round(output * 100) / 100 });
  }
  return data;
}

export function pidMetrics(data: ReturnType<typeof simulatePid>, setpoint: number) {
  const step = data.filter((d) => d.t >= 0.2 && d.t < 2);
  const t10 = step.find((d) => d.speed >= 0.1 * setpoint)?.t;
  const t90 = step.find((d) => d.speed >= 0.9 * setpoint)?.t;
  const peak = Math.max(...step.map((d) => d.speed));
  const overshoot = Math.max(0, ((peak - setpoint) / setpoint) * 100);
  let settle: number | undefined;
  for (let i = step.length - 1; i >= 0; i--) {
    if (Math.abs(step[i].speed - setpoint) > 0.02 * setpoint) { settle = i < step.length - 1 ? step[i + 1].t - 0.2 : undefined; break; }
    if (i === 0) settle = 0;
  }
  const tail = step.filter((d) => d.t >= 1.5);
  const ss = tail.length ? Math.abs(setpoint - tail.reduce((a, d) => a + d.speed, 0) / tail.length) / setpoint * 100 : 0;
  return { rise: t10 !== undefined && t90 !== undefined ? t90 - t10 : undefined, overshoot, settle, steadyError: ss };
}

export function PidTool() {
  const [kp, setKp] = useState(2);
  const [ki, setKi] = useState(0);
  const [kd, setKd] = useState(0);
  const [setpoint, setSetpoint] = useState(0.3);
  const [noise, setNoise] = useState(0);
  const [tau, setTau] = useState(0.15);
  const [disturbance, setDisturbance] = useState(false);
  const data = useMemo(() => simulatePid({ kp, ki, kd, setpoint, noise, disturbance, tau }), [kp, ki, kd, setpoint, noise, disturbance, tau]);
  const m = pidMetrics(data, setpoint);
  const meetsSpec = m.overshoot < 10 && m.settle !== undefined && m.settle < 1.5 && m.steadyError < 1;
  return (
    <ToolGrid
      controls={
        <>
          <Slider id="pid-kp" label="Kp (proportional)" value={kp} min={0} max={15} step={0.1} onChange={setKp} />
          <Slider id="pid-ki" label="Ki (integral)" value={ki} min={0} max={40} step={0.5} onChange={setKi} />
          <Slider id="pid-kd" label="Kd (derivative)" value={kd} min={0} max={0.5} step={0.005} onChange={setKd} />
          <Slider id="pid-sp" label="Target speed" value={setpoint} min={0.05} max={0.45} step={0.01} unit="m/s" onChange={setSetpoint} />
          <Slider id="pid-tau" label="Motor time constant τ" value={tau} min={0.05} max={0.6} step={0.01} unit="s" onChange={setTau} />
          <Slider id="pid-n" label="Measurement noise" value={noise} min={0} max={0.03} step={0.001} unit="m/s" onChange={setNoise} />
          <label className="flex items-center gap-2 text-sm text-fg-2"><input type="checkbox" checked={disturbance} onChange={(e) => setDisturbance(e.target.checked)} className="accent-[var(--accent)]" /> Add a load (e.g. carpet) at t = 2 s</label>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => { setKp(2); setKi(0); setKd(0); }}>P only</Button>
            <Button size="sm" variant="ghost" onClick={() => { setKp(3); setKi(12); setKd(0); }}>PI</Button>
            <Button size="sm" variant="ghost" onClick={() => { setKp(4); setKi(14); setKd(0.03); }}>PID</Button>
          </div>
        </>
      }
      output={
        <>
          <div className="h-64 rounded-xl border border-line bg-bg-2 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
                <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
                <XAxis dataKey="t" {...axis} tickCount={7} type="number" domain={[0, 3]} unit="s" />
                <YAxis {...axis} domain={[0, 0.55]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="stepAfter" dataKey="target" stroke="var(--accent-3)" dot={false} strokeWidth={2} name="target (m/s)" isAnimationActive={false} />
                <Line type="monotone" dataKey="speed" stroke="var(--accent)" dot={false} strokeWidth={2} name="measured (m/s)" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Rise time (10–90 %)" value={m.rise !== undefined ? `${m.rise.toFixed(2)} s` : 'never'} />
            <Readout label="Overshoot" value={`${m.overshoot.toFixed(1)} %`} accent={m.overshoot < 10} />
            <Readout label="Settling (±2 %)" value={m.settle !== undefined ? `${m.settle.toFixed(2)} s` : 'not settled'} />
            <Readout label="Steady-state error" value={`${m.steadyError.toFixed(1)} %`} accent={m.steadyError < 1} />
          </div>
          <Badge tone={meetsSpec ? 'good' : 'neutral'}>{meetsSpec ? 'Meets the lab spec: < 10 % overshoot, < 1.5 s settling, < 1 % error' : 'Lab spec: < 10 % overshoot, settling < 1.5 s, error < 1 %'}</Badge>
          {ki === 0 && m.steadyError > 1 && <Callout tone="blue" title="Steady-state error with P only">A proportional controller needs some error to produce output. Add a little Ki to remove it.</Callout>}
          {kd > 0.05 && noise > 0.005 && <Callout tone="warn" title="Derivative amplifies noise">Noisy measurements make the D term jitter. Filter the speed or reduce Kd.</Callout>}
          <p className="text-[12px] text-fg-3">Model: first-order motor (max 0.5 m/s, time constant τ), output clamped to ±100 % PWM with integral anti-windup. Real motors add dead-band, gear backlash and encoder quantisation.</p>
        </>
      }
    />
  );
}

// ---------- Motor speed ----------
export function MotorSpeedTool() {
  const [duty, setDuty] = useState(60);
  const [battery, setBattery] = useState(7.4);
  const [load, setLoad] = useState(20);
  const ratedV = 6;
  const noLoadRpm = 200; // at rated voltage
  const startDuty = 18; // static friction: below this the motor does not start
  const veff = (battery * duty) / 100;
  const running = duty >= startDuty;
  const rpm = running ? Math.max(0, noLoadRpm * (veff / ratedV) * (1 - load / 100)) : 0;
  const wheel = (rpm / 60) * Math.PI * 0.065;
  const current = running ? 0.12 + 1.1 * (load / 100) * (veff / ratedV) : 0;
  const curve = Array.from({ length: 21 }, (_, i) => i * 5).map((d) => {
    const v = (battery * d) / 100;
    return { d, rpm: d >= startDuty ? Math.max(0, noLoadRpm * (v / ratedV) * (1 - load / 100)) : 0 };
  });
  const maxRpm = noLoadRpm * (8.4 / ratedV);
  return (
    <ToolGrid
      controls={
        <>
          <Slider id="ms-d" label="PWM duty" value={duty} min={0} max={100} unit="%" onChange={setDuty} />
          <Slider id="ms-b" label="Battery voltage (2S Li-ion)" value={battery} min={6} max={8.4} step={0.1} unit="V" onChange={setBattery} />
          <Slider id="ms-l" label="Load (% of stall torque)" value={load} min={0} max={90} unit="%" onChange={setLoad} />
        </>
      }
      output={
        <>
          <div className="flex flex-wrap items-center gap-6">
            <svg viewBox="0 0 100 100" className="size-28" role="img" aria-label={`Wheel turning at ${Math.round(rpm)} RPM`}>
              <g style={{ transformOrigin: '50px 50px', animation: rpm > 0 ? `spin ${Math.max(0.15, 60 / Math.max(rpm, 1) / 2)}s linear infinite` : 'none' }}>
                <circle cx={50} cy={50} r={42} fill="var(--panel-2)" stroke="var(--accent)" strokeWidth={4} />
                {[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1={50} y1={50} x2={50 + 38 * Math.cos((a * Math.PI) / 180)} y2={50 + 38 * Math.sin((a * Math.PI) / 180)} stroke="var(--text-2)" strokeWidth={3} />)}
              </g>
              <circle cx={50} cy={50} r={6} fill="var(--accent)" />
            </svg>
            <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
            <div className="grid flex-1 grid-cols-2 gap-3">
              <Readout label="Shaft speed" value={`${Math.round(rpm)} RPM`} accent />
              <Readout label="Wheel speed (65 mm)" value={`${wheel.toFixed(3)} m/s`} />
              <Readout label="Effective voltage" value={`${veff.toFixed(2)} V`} />
              <Readout label="Approx. current" value={`${current.toFixed(2)} A`} />
            </div>
          </div>
          <svg viewBox="0 0 520 160" className="w-full rounded-xl border border-line bg-bg-2" role="img" aria-label="Speed versus PWM curve">
            <polyline fill="none" stroke="var(--accent)" strokeWidth={2} points={curve.map((c) => `${20 + c.d * 4.8},${145 - (c.rpm / maxRpm) * 125}`).join(' ')} />
            <circle cx={20 + duty * 4.8} cy={145 - (rpm / maxRpm) * 125} r={5} fill="var(--accent)" />
            <line x1={20 + startDuty * 4.8} y1={20} x2={20 + startDuty * 4.8} y2={145} stroke="var(--warn)" strokeDasharray="4 3" />
            <text x={24 + startDuty * 4.8} y={30} fontSize={10} fill="var(--warn)">dead-band</text>
            <text x={20} y={158} fontSize={10} fill="var(--text-3)">0 %</text><text x={500} y={158} fontSize={10} fill="var(--text-3)" textAnchor="end">100 % duty</text>
          </svg>
          {!running && duty > 0 && <Callout tone="warn" title="Below the starting duty">Static friction keeps the motor still below about {startDuty} %. Record the minimum starting PWM for each motor — they differ.</Callout>}
          <p className="text-[12px] text-fg-3">Open-loop speed changes with battery voltage and load. That is why the robot needs encoder feedback.</p>
        </>
      }
    />
  );
}

// ---------- Feedback loop ----------
export function FeedbackLoopTool() {
  const [sp, setSp] = useState(100);
  const [kp, setKp] = useState(1.5);
  const [ki, setKi] = useState(0);
  const [dist, setDist] = useState(0);
  const [running, setRunning] = useState(true);
  const [st, setSt] = useState({ y: 0, i: 0, k: 0, hist: [] as number[] });
  const plantGain = 1;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSt((s) => {
        const e = sp - s.y;
        const i = s.i + e * 0.1;
        const u = kp * e + ki * i;
        const y = s.y + 0.25 * (plantGain * u - dist - s.y);
        return { y, i, k: s.k + 1, hist: [...s.hist.slice(-59), e] };
      });
    }, 120);
    return () => clearInterval(t);
  }, [running, sp, kp, ki, dist]);
  const e = sp - st.y;
  const u = kp * e + ki * st.i;
  const expectedSs = ki === 0 ? (sp + dist / 1) / (1 + kp * plantGain) : 0;
  const Box = ({ x, label, value }: { x: number; label: string; value: string }) => (
    <g>
      <rect x={x} y={40} width={110} height={52} rx={10} fill="var(--panel-2)" stroke="var(--accent)" />
      <text x={x + 55} y={62} textAnchor="middle" fill="var(--text)" fontSize={12}>{label}</text>
      <text x={x + 55} y={80} textAnchor="middle" fill="var(--accent)" fontSize={12} fontFamily="var(--font-mono)">{value}</text>
    </g>
  );
  return (
    <ToolGrid
      controls={
        <>
          <Slider id="fb-sp" label="Setpoint" value={sp} min={0} max={200} unit="RPM" onChange={setSp} />
          <Slider id="fb-kp" label="Kp" value={kp} min={0} max={5} step={0.1} onChange={setKp} />
          <Slider id="fb-ki" label="Ki" value={ki} min={0} max={2} step={0.05} onChange={setKi} />
          <Slider id="fb-d" label="Disturbance (load)" value={dist} min={0} max={80} unit="RPM" onChange={setDist} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setRunning((r) => !r)}>{running ? <Pause size={14} /> : <Play size={14} />} {running ? 'Pause' : 'Run'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setSt({ y: 0, i: 0, k: 0, hist: [] })}><RotateCcw size={14} /> Reset</Button>
          </div>
        </>
      }
      output={
        <>
          <svg viewBox="0 0 560 160" className="w-full rounded-xl border border-line bg-bg-2" role="img" aria-label="Feedback loop with live values">
            <circle cx={40} cy={66} r={16} fill="none" stroke="var(--text-2)" strokeWidth={2} /><text x={40} y={71} textAnchor="middle" fill="var(--text)">Σ</text>
            <text x={40} y={30} textAnchor="middle" fill="var(--text-3)" fontSize={11}>SP {sp}</text>
            <line x1={56} y1={66} x2={90} y2={66} stroke="var(--accent)" strokeWidth={2} className="flow" />
            <text x={73} y={58} textAnchor="middle" fill="var(--accent)" fontSize={10}>e={e.toFixed(1)}</text>
            <Box x={90} label="Controller" value={`u=${u.toFixed(1)}`} />
            <line x1={200} y1={66} x2={250} y2={66} stroke="var(--accent)" strokeWidth={2} className="flow" />
            <Box x={250} label="Motor" value={`load −${dist}`} />
            <line x1={360} y1={66} x2={450} y2={66} stroke="var(--accent)" strokeWidth={2} className="flow" />
            <text x={470} y={70} fill="var(--text)" fontSize={13} fontFamily="var(--font-mono)">{st.y.toFixed(1)} RPM</text>
            <polyline points="410,66 410,130 40,130 40,82" fill="none" stroke="var(--accent-3)" strokeWidth={2} className="flow" />
            <text x={225} y={148} textAnchor="middle" fill="var(--accent-3)" fontSize={11}>measured speed (feedback)</text>
          </svg>
          <div className="grid grid-cols-3 gap-3">
            <Readout label="Error" value={e.toFixed(1)} accent />
            <Readout label="Iteration" value={st.k} />
            <Readout label={ki === 0 ? 'Predicted P-only error' : 'Integral state'} value={ki === 0 ? expectedSs.toFixed(1) : st.i.toFixed(1)} />
          </div>
          <svg viewBox="0 0 520 80" className="w-full rounded-xl border border-line bg-bg-2" role="img" aria-label="Error history">
            <line x1={0} y1={40} x2={520} y2={40} stroke="var(--line-strong)" />
            <polyline fill="none" stroke="var(--accent)" strokeWidth={2} points={st.hist.map((v, i) => `${i * (520 / 60)},${40 - Math.max(-38, Math.min(38, (v / Math.max(sp, 1)) * 38))}`).join(' ')} />
          </svg>
          <p className="text-sm text-fg-3">With P only, a steady error of about SP / (1 + Kp) remains. Integral action keeps adding output until the error is zero — even under load.</p>
        </>
      }
    />
  );
}

// ---------- Encoder ----------
export function EncoderTool() {
  const [rpm, setRpm] = useState(60);
  const [ppr, setPpr] = useState(11);
  const [gear, setGear] = useState(30);
  const [mult, setMult] = useState<'1' | '2' | '4'>('4');
  const [dtMs, setDtMs] = useState(20);
  const [dir, setDir] = useState<'fwd' | 'rev'>('fwd');
  const [count, setCount] = useState(0);
  const countsPerWheelTurn = ppr * gear * Number(mult);
  const rate = (rpm / 60) * countsPerWheelTurn * (dir === 'fwd' ? 1 : -1); // counts per second
  useEffect(() => {
    const t = setInterval(() => setCount((c) => c + rate * 0.1), 100);
    return () => clearInterval(t);
  }, [rate]);
  const ticksInWindow = Math.floor(Math.abs(rate) * (dtMs / 1000));
  const measuredRpm = (ticksInWindow / countsPerWheelTurn) * (60 / (dtMs / 1000));
  const resolutionRpm = (1 / countsPerWheelTurn) * (60 / (dtMs / 1000));
  // Quadrature: B lags A by 90° forward, leads in reverse. 4 slots per cycle.
  const cycles = 6;
  const A: (0 | 1)[] = [];
  const B: (0 | 1)[] = [];
  for (let c = 0; c < cycles; c++) {
    A.push(1, 1, 0, 0);
    if (dir === 'fwd') B.push(0, 1, 1, 0); else B.push(1, 0, 0, 1);
  }
  return (
    <ToolGrid
      controls={
        <>
          <Slider id="enc-r" label="Wheel speed" value={rpm} min={0} max={300} unit="RPM" onChange={setRpm} />
          <Slider id="enc-p" label="Encoder pulses per motor turn (PPR)" value={ppr} min={1} max={64} onChange={setPpr} />
          <Slider id="enc-g" label="Gear ratio" value={gear} min={1} max={100} unit=": 1" onChange={setGear} />
          <Segmented label="Decoding" value={mult} onChange={setMult} options={[{ value: '1', label: 'x1' }, { value: '2', label: 'x2' }, { value: '4', label: 'x4' }]} />
          <Slider id="enc-dt" label="Measurement window Δt" value={dtMs} min={5} max={200} step={5} unit="ms" onChange={setDtMs} />
          <Segmented label="Direction" value={dir} onChange={setDir} options={[{ value: 'fwd', label: 'Forward' }, { value: 'rev', label: 'Reverse' }]} />
        </>
      }
      output={
        <>
          <div className="space-y-1 rounded-xl border border-line bg-bg-2 p-3">
            <Wave bits={A} label="A" />
            <Wave bits={B} label="B" color="var(--accent-2)" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Live count" value={Math.round(count)} accent sub={dir === 'fwd' ? 'counting up' : 'counting down'} />
            <Readout label="Counts / wheel turn" value={countsPerWheelTurn} sub={`${ppr} × ${gear} × ${mult}`} />
            <Readout label={`Ticks in ${dtMs} ms`} value={ticksInWindow} />
            <Readout label="Measured speed" value={`${measuredRpm.toFixed(1)} RPM`} sub={`resolution ±${resolutionRpm.toFixed(1)} RPM`} />
          </div>
          {resolutionRpm > rpm * 0.1 && rpm > 0 && <Callout tone="warn" title="Coarse measurement">At this speed and window, one tick changes the reading by {resolutionRpm.toFixed(1)} RPM. Use a longer window, x4 decoding, or measure the time between edges.</Callout>}
          <p className="text-sm text-fg-3">In forward rotation A leads B by 90°; in reverse B leads A. The decoder uses that order to count up or down. Counts given "per motor turn" must be multiplied by the gear ratio for the wheel.</p>
        </>
      }
    />
  );
}
