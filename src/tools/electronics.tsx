import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Callout, Segmented, Select, Slider } from '../components/ui';
import { fmtSI, NumberField, Readout, ToolGrid } from './shared';

// ---------- Ohm's law ----------
export function OhmsLawTool() {
  const [solveFor, setSolveFor] = useState<'V' | 'I' | 'R'>('I');
  const [v, setV] = useState(5);
  const [iMa, setIMa] = useState(9);
  const [r, setR] = useState(330);
  const I = iMa / 1000;
  const result = solveFor === 'V' ? I * r : solveFor === 'I' ? v / r : v / I;
  const V = solveFor === 'V' ? result : v;
  const Ia = solveFor === 'I' ? result : I;
  const R = solveFor === 'R' ? result : r;
  const P = V * Ia;
  return (
    <ToolGrid
      controls={
        <>
          <Segmented label="Solve for" value={solveFor} onChange={setSolveFor} options={[{ value: 'V', label: 'Voltage' }, { value: 'I', label: 'Current' }, { value: 'R', label: 'Resistance' }]} />
          {solveFor !== 'V' && <NumberField id="ohm-v" label="Voltage" unit="V" value={v} onChange={setV} />}
          {solveFor !== 'I' && <NumberField id="ohm-i" label="Current" unit="mA" value={iMa} onChange={setIMa} />}
          {solveFor !== 'R' && <NumberField id="ohm-r" label="Resistance" unit="Ω" value={r} onChange={setR} />}
        </>
      }
      output={
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Voltage" value={fmtSI(V, 'V')} accent={solveFor === 'V'} />
            <Readout label="Current" value={fmtSI(Ia, 'A')} accent={solveFor === 'I'} />
            <Readout label="Resistance" value={fmtSI(R, 'Ω')} accent={solveFor === 'R'} />
            <Readout label="Power" value={fmtSI(P, 'W')} sub={P > 0.25 ? 'exceeds ¼ W' : P > 0.125 ? 'use ≥ ¼ W' : '⅛ W is fine'} />
          </div>
          <div className="rounded-xl border border-line bg-bg-2 p-4 font-mono text-sm text-fg-2">
            {solveFor === 'I' && <>I = V / R = {v} V / {r} Ω = <span className="text-accent">{fmtSI(Ia, 'A')}</span></>}
            {solveFor === 'V' && <>V = I × R = {I} A × {r} Ω = <span className="text-accent">{fmtSI(V, 'V')}</span></>}
            {solveFor === 'R' && <>R = V / I = {v} V / {I} A = <span className="text-accent">{fmtSI(R, 'Ω')}</span></>}
            <br />P = V × I = <span className="text-fg">{fmtSI(P, 'W')}</span>
          </div>
          {Ia > 0.04 && <Callout tone="warn" title="Above a typical GPIO pin limit">Most microcontroller pins are limited to about 20–40 mA. Drive larger loads through a transistor or driver.</Callout>}
        </>
      }
    />
  );
}

// ---------- Voltage divider ----------
export function VoltageDividerTool() {
  const [vin, setVin] = useState(5);
  const [r1, setR1] = useState(1000);
  const [r2, setR2] = useState(2000);
  const [load, setLoad] = useState(0);
  const r2eff = load > 0 ? (r2 * load) / (r2 + load) : r2;
  const vout = (vin * r2eff) / (r1 + r2eff);
  const unloaded = (vin * r2) / (r1 + r2);
  const i = vin / (r1 + r2eff);
  return (
    <ToolGrid
      controls={
        <>
          <NumberField id="vd-vin" label="Input voltage" unit="V" value={vin} onChange={setVin} />
          <NumberField id="vd-r1" label="R1 (top)" unit="Ω" value={r1} onChange={setR1} />
          <NumberField id="vd-r2" label="R2 (bottom)" unit="Ω" value={r2} onChange={setR2} />
          <NumberField id="vd-load" label="Load resistance (0 = none)" unit="Ω" value={load} onChange={setLoad} />
        </>
      }
      output={
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="V_out" value={fmtSI(vout, 'V')} accent />
            <Readout label="Unloaded V_out" value={fmtSI(unloaded, 'V')} />
            <Readout label="Divider current" value={fmtSI(i, 'A')} />
            <Readout label="Power in R1" value={fmtSI(i * i * r1, 'W')} />
          </div>
          <p className="font-mono text-sm text-fg-2">V_out = V_in × R2 / (R1 + R2){load > 0 && ' with R2 ∥ R_load'}</p>
          {load > 0 && Math.abs(unloaded - vout) / unloaded > 0.05 && <Callout tone="warn" title="Loading effect">The load pulls V_out down by {fmtSI(unloaded - vout, 'V')}. That is why dividers are for signals, not power.</Callout>}
          {vout > 3.6 && vout < 5.5 && <Callout tone="bad" title="Too high for 3.3 V logic">An ESP32 input should not see more than about 3.3 V.</Callout>}
        </>
      }
    />
  );
}

// ---------- Resistor colour code ----------
const BANDS = [
  { name: 'Black', hex: '#111', digit: 0, mult: 1 },
  { name: 'Brown', hex: '#7a4a1f', digit: 1, mult: 10, tol: 1 },
  { name: 'Red', hex: '#d33', digit: 2, mult: 100, tol: 2 },
  { name: 'Orange', hex: '#f08a24', digit: 3, mult: 1e3 },
  { name: 'Yellow', hex: '#f5d90a', digit: 4, mult: 1e4 },
  { name: 'Green', hex: '#2ea44f', digit: 5, mult: 1e5, tol: 0.5 },
  { name: 'Blue', hex: '#2f6fe0', digit: 6, mult: 1e6, tol: 0.25 },
  { name: 'Violet', hex: '#8e44ad', digit: 7, mult: 1e7, tol: 0.1 },
  { name: 'Grey', hex: '#888', digit: 8, mult: 1e8 },
  { name: 'White', hex: '#eee', digit: 9, mult: 1e9 },
  { name: 'Gold', hex: '#c9a227', mult: 0.1, tol: 5 },
  { name: 'Silver', hex: '#bbb', mult: 0.01, tol: 10 },
];
export function ResistorColorTool() {
  const [count, setCount] = useState<'4' | '5'>('4');
  // 4-band reads [d1, d2, mult, tol]; 5-band reads [d1, d2, d3, mult, tol]. Default: 330 Ω ± 5 %.
  const [b, setB] = useState(['Orange', 'Orange', 'Brown', 'Gold', 'Brown']);
  const get = (n: string) => BANDS.find((x) => x.name === n)!;
  const digits = count === '4' ? [b[0], b[1]] : [b[0], b[1], b[2]];
  const multName = count === '4' ? b[2] : b[3];
  const tolName = count === '4' ? b[3] : b[4];
  const base = Number(digits.map((d) => get(d).digit ?? 0).join(''));
  const value = base * get(multName).mult;
  const tol = get(tolName).tol;
  const slots = count === '4' ? ['Digit 1', 'Digit 2', 'Multiplier', 'Tolerance'] : ['Digit 1', 'Digit 2', 'Digit 3', 'Multiplier', 'Tolerance'];
  const valid = (slot: string) => BANDS.filter((x) => (slot.startsWith('Digit') ? x.digit !== undefined : slot === 'Multiplier' ? true : x.tol !== undefined));
  const bandIdx = (i: number) => (count === '4' && i === 3 ? 3 : i);
  return (
    <ToolGrid
      controls={
        <>
          <Segmented label="Band count" value={count} onChange={setCount} options={[{ value: '4', label: '4-band' }, { value: '5', label: '5-band' }]} />
          {slots.map((slot, i) => (
            <div key={slot}>
              <label className="mb-1 block text-[13px] text-fg-2" htmlFor={`band-${i}`}>{slot}</label>
              <Select id={`band-${i}`} value={b[bandIdx(i)]} onChange={(e) => setB((cur) => cur.map((x, j) => (j === bandIdx(i) ? e.target.value : x)))}>
                {valid(slot).map((x) => <option key={x.name}>{x.name}</option>)}
              </Select>
            </div>
          ))}
        </>
      }
      output={
        <>
          <svg viewBox="0 0 320 90" className="w-full max-w-md" role="img" aria-label="Resistor bands">
            <line x1={0} y1={45} x2={320} y2={45} stroke="var(--text-3)" strokeWidth={3} />
            <rect x={70} y={20} width={180} height={50} rx={22} fill="#d9c7a1" />
            {slots.map((_, i) => (
              <rect key={i} x={95 + i * (count === '4' ? 32 : 26) + (i === slots.length - 1 ? 12 : 0)} y={20} width={12} height={50} fill={get(b[bandIdx(i)]).hex} />
            ))}
          </svg>
          <div className="grid grid-cols-2 gap-3">
            <Readout label="Resistance" value={fmtSI(value, 'Ω')} accent />
            <Readout label="Tolerance" value={tol !== undefined ? `± ${tol} %` : '—'} sub={tol !== undefined ? `${fmtSI(value * (1 - tol / 100), 'Ω')} … ${fmtSI(value * (1 + tol / 100), 'Ω')}` : undefined} />
          </div>
        </>
      }
    />
  );
}

// ---------- Series / parallel ----------
export function SeriesParallelTool() {
  const [mode, setMode] = useState<'series' | 'parallel'>('parallel');
  const [rs, setRs] = useState([1000, 2200, 4700]);
  const [v, setV] = useState(5);
  const valid = rs.filter((x) => x > 0);
  const total = mode === 'series' ? valid.reduce((a, b) => a + b, 0) : 1 / valid.reduce((a, b) => a + 1 / b, 0);
  const I = v / total;
  return (
    <ToolGrid
      controls={
        <>
          <Segmented label="Connection" value={mode} onChange={setMode} options={[{ value: 'series', label: 'Series' }, { value: 'parallel', label: 'Parallel' }]} />
          <NumberField id="sp-v" label="Supply voltage" unit="V" value={v} onChange={setV} />
          {rs.map((r, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1"><NumberField id={`sp-r${i}`} label={`R${i + 1}`} unit="Ω" value={r} onChange={(x) => setRs((c) => c.map((y, j) => (j === i ? x : y)))} /></div>
              <Button variant="ghost" size="sm" aria-label={`Remove R${i + 1}`} disabled={rs.length <= 1} onClick={() => setRs((c) => c.filter((_, j) => j !== i))}><Trash2 size={14} /></Button>
            </div>
          ))}
          <Button size="sm" onClick={() => setRs((c) => [...c, 1000])} disabled={rs.length >= 8}><Plus size={14} /> Add resistor</Button>
        </>
      }
      output={
        <>
          <div className="grid grid-cols-2 gap-3">
            <Readout label="Equivalent resistance" value={fmtSI(total, 'Ω')} accent />
            <Readout label="Total current" value={fmtSI(I, 'A')} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-panel-2 text-left text-fg-2"><tr><th className="p-2">Resistor</th><th className="p-2">Voltage</th><th className="p-2">Current</th><th className="p-2">Power</th></tr></thead>
              <tbody className="font-mono text-fg">
                {valid.map((r, i) => {
                  const vi = mode === 'series' ? I * r : v;
                  const ii = mode === 'series' ? I : v / r;
                  return <tr key={i} className="border-t border-line"><td className="p-2">R{i + 1} = {fmtSI(r, 'Ω')}</td><td className="p-2">{fmtSI(vi, 'V')}</td><td className="p-2">{fmtSI(ii, 'A')}</td><td className="p-2">{fmtSI(vi * ii, 'W')}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-fg-3">{mode === 'series' ? 'Same current everywhere; voltages add up to the supply.' : `Same voltage across every branch; the total (${fmtSI(total, 'Ω')}) is below the smallest branch.`}</p>
        </>
      }
    />
  );
}

// ---------- Power ----------
export function PowerTool() {
  const [mode, setMode] = useState<'VI' | 'IR' | 'VR' | 'REG'>('VI');
  const [v, setV] = useState(3);
  const [i, setI] = useState(0.009);
  const [r, setR] = useState(330);
  const [vin, setVin] = useState(8);
  const [vout, setVout] = useState(5);
  const p = mode === 'VI' ? v * i : mode === 'IR' ? i * i * r : mode === 'VR' ? (v * v) / r : (vin - vout) * i;
  return (
    <ToolGrid
      controls={
        <>
          <Segmented label="Formula" value={mode} onChange={setMode} options={[{ value: 'VI', label: 'V·I' }, { value: 'IR', label: 'I²R' }, { value: 'VR', label: 'V²/R' }, { value: 'REG', label: 'Linear reg.' }]} />
          {(mode === 'VI' || mode === 'VR') && <NumberField id="pw-v" label="Voltage" unit="V" value={v} onChange={setV} />}
          {(mode === 'VI' || mode === 'IR' || mode === 'REG') && <NumberField id="pw-i" label="Current" unit="A" value={i} onChange={setI} />}
          {(mode === 'IR' || mode === 'VR') && <NumberField id="pw-r" label="Resistance" unit="Ω" value={r} onChange={setR} />}
          {mode === 'REG' && <><NumberField id="pw-vin" label="V_in" unit="V" value={vin} onChange={setVin} /><NumberField id="pw-vout" label="V_out" unit="V" value={vout} onChange={setVout} /></>}
        </>
      }
      output={
        <>
          <Readout label={mode === 'REG' ? 'Heat in regulator' : 'Power'} value={fmtSI(p, 'W')} accent sub={mode === 'REG' ? `Efficiency ≈ ${Math.round((vout / vin) * 100)} %` : undefined} />
          <div className="flex flex-wrap gap-2">
            {[0.125, 0.25, 0.5, 1].map((rating) => <Badge key={rating} tone={p * 2 <= rating ? 'good' : p <= rating ? 'warn' : 'bad'}>{rating} W rating: {p * 2 <= rating ? 'safe (2× margin)' : p <= rating ? 'no margin' : 'overloaded'}</Badge>)}
          </div>
        </>
      }
    />
  );
}

// ---------- Circuit builder ----------
interface Branch { id: number; resistors: number[]; led: 'none' | 'red' | 'green' | 'blue' }
const LED_VF = { none: 0, red: 1.9, green: 2.1, blue: 3.0 };
export function CircuitBuilderTool() {
  const [vs, setVs] = useState(5);
  const [series, setSeries] = useState(0);
  const [branches, setBranches] = useState<Branch[]>([{ id: 1, resistors: [330], led: 'red' }, { id: 2, resistors: [1000], led: 'none' }]);

  // Solve: V_s → R_series → node A; branches from A to ground. Branch: R_b + LED (V_f, conducts only if V_A > V_f).
  const solved = useMemo(() => {
    const rb = branches.map((b) => b.resistors.reduce((a, x) => a + Math.max(0, x), 0));
    const vf = branches.map((b) => LED_VF[b.led]);
    // Bisection on node voltage V_A in [0, vs]: KCL (vs - VA)/Rs = Σ branch currents.
    const branchI = (va: number, k: number) => (va > vf[k] && rb[k] > 0 ? (va - vf[k]) / rb[k] : 0);
    if (series <= 0) {
      return { va: vs, currents: branches.map((_, k) => branchI(vs, k)), shorted: rb.some((r, k) => r === 0 && vf[k] < vs) };
    }
    let lo = 0;
    let hi = vs;
    for (let it = 0; it < 60; it++) {
      const mid = (lo + hi) / 2;
      const f = (vs - mid) / series - branches.reduce((a, _, k) => a + branchI(mid, k), 0);
      if (f > 0) lo = mid; else hi = mid;
    }
    const va = (lo + hi) / 2;
    return { va, currents: branches.map((_, k) => branchI(va, k)), shorted: false };
  }, [vs, series, branches]);

  const total = solved.currents.reduce((a, b) => a + b, 0);
  const update = (id: number, patch: Partial<Branch>) => setBranches((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  return (
    <ToolGrid
      controls={
        <>
          <Slider id="cb-vs" label="Supply voltage" value={vs} min={1} max={12} step={0.1} unit="V" onChange={setVs} />
          <NumberField id="cb-rs" label="Series resistor before the branches (0 = none)" unit="Ω" value={series} onChange={setSeries} />
          {branches.map((b, idx) => (
            <div key={b.id} className="space-y-2 rounded-xl border border-line p-3">
              <div className="flex items-center justify-between text-[13px] font-medium text-fg">
                Branch {idx + 1}
                <Button variant="ghost" size="sm" aria-label={`Remove branch ${idx + 1}`} disabled={branches.length <= 1} onClick={() => setBranches((bs) => bs.filter((x) => x.id !== b.id))}><Trash2 size={14} /></Button>
              </div>
              <NumberField id={`cb-r-${b.id}`} label="Resistance" unit="Ω" value={b.resistors[0]} onChange={(x) => update(b.id, { resistors: [x] })} />
              <Select aria-label="LED" value={b.led} onChange={(e) => update(b.id, { led: e.target.value as Branch['led'] })}>
                <option value="none">No LED</option>
                <option value="red">Red LED (≈1.9 V)</option>
                <option value="green">Green LED (≈2.1 V)</option>
                <option value="blue">Blue LED (≈3.0 V)</option>
              </Select>
            </div>
          ))}
          <Button size="sm" disabled={branches.length >= 5} onClick={() => setBranches((bs) => [...bs, { id: Date.now(), resistors: [470], led: 'green' }])}><Plus size={14} /> Add parallel branch</Button>
        </>
      }
      output={
        <>
          <svg viewBox={`0 0 ${200 + branches.length * 90} 230`} className="w-full rounded-xl border border-line bg-bg-2 grid-bg" role="img" aria-label="Circuit schematic">
            <line x1={40} y1={40} x2={40} y2={200} stroke="var(--text-2)" strokeWidth={2} />
            <text x={18} y={124} fill="var(--text)" fontSize={12}>{vs.toFixed(1)}V</text>
            <line x1={28} y1={110} x2={52} y2={110} stroke="var(--text-2)" strokeWidth={2} /><line x1={33} y1={118} x2={47} y2={118} stroke="var(--text-2)" strokeWidth={4} />
            <line x1={40} y1={40} x2={130} y2={40} stroke="var(--accent)" strokeWidth={2} className={total > 0 ? 'flow' : ''} />
            {series > 0 && <text x={70} y={30} fill="var(--accent-2)" fontSize={11}>{fmtSI(series, 'Ω')}</text>}
            <line x1={130} y1={40} x2={130 + branches.length * 90} y2={40} stroke="var(--text-2)" strokeWidth={2} />
            <line x1={40} y1={200} x2={130 + branches.length * 90} y2={200} stroke="var(--text-2)" strokeWidth={2} />
            {branches.map((b, k) => {
              const x = 170 + k * 90;
              const on = b.led !== 'none' && solved.currents[k] > 0.0005;
              const col = { none: 'var(--text-3)', red: '#ef4444', green: '#22c55e', blue: '#3b82f6' }[b.led];
              const brightness = Math.min(1, solved.currents[k] / 0.015);
              return (
                <g key={b.id}>
                  <line x1={x} y1={40} x2={x} y2={70} stroke="var(--text-2)" strokeWidth={2} />
                  <rect x={x - 8} y={70} width={16} height={40} rx={3} fill="none" stroke="var(--text-2)" strokeWidth={2} />
                  <text x={x + 14} y={94} fill="var(--text-2)" fontSize={10}>{fmtSI(b.resistors[0], 'Ω')}</text>
                  <line x1={x} y1={110} x2={x} y2={130} stroke="var(--text-2)" strokeWidth={2} />
                  {b.led !== 'none' ? (
                    <g>
                      <circle cx={x} cy={145} r={14} fill={col} opacity={on ? 0.15 + brightness * 0.6 : 0.08} style={{ filter: on ? `drop-shadow(0 0 ${6 + brightness * 10}px ${col})` : undefined }} />
                      <polygon points={`${x - 8},${137} ${x + 8},${137} ${x},${152}`} fill={col} />
                      <line x1={x - 8} y1={152} x2={x + 8} y2={152} stroke={col} strokeWidth={2} />
                    </g>
                  ) : <line x1={x} y1={130} x2={x} y2={160} stroke="var(--text-2)" strokeWidth={2} />}
                  <line x1={x} y1={160} x2={x} y2={200} stroke="var(--text-2)" strokeWidth={2} />
                  <text x={x} y={222} textAnchor="middle" fill="var(--accent)" fontSize={11} fontFamily="var(--font-mono)">{fmtSI(solved.currents[k], 'A', 2)}</text>
                </g>
              );
            })}
          </svg>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Readout label="Total current" value={fmtSI(total, 'A')} accent />
            <Readout label="Branch node voltage" value={fmtSI(solved.va, 'V')} />
            <Readout label="Supply power" value={fmtSI(total * vs, 'W')} />
          </div>
          {branches.map((b, k) => b.led !== 'none' && solved.currents[k] > 0.025 && <Callout key={b.id} tone="bad" title={`Branch ${k + 1}: LED overcurrent`}>{fmtSI(solved.currents[k], 'A')} exceeds a typical 20 mA LED rating. Increase the resistor.</Callout>)}
          {branches.map((b, k) => b.led !== 'none' && solved.currents[k] === 0 && <Callout key={`off-${b.id}`} tone="warn" title={`Branch ${k + 1}: LED is off`}>The voltage available ({fmtSI(solved.va, 'V')}) is below the LED's forward voltage ({LED_VF[b.led]} V).</Callout>)}
          <p className="text-[12px] text-fg-3">Model: ideal source, LEDs as fixed forward-voltage drops that conduct only above V_f. Real LEDs have a soft knee — expect small differences when you measure.</p>
        </>
      }
    />
  );
}
