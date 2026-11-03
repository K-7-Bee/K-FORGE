import { useMemo, useState } from 'react';
import { Badge, Button, Callout, cx, Input, Segmented, Select } from '../components/ui';
import { sumOfProducts, truthTable } from '../engine/logic';
import { Readout, ToolGrid } from './shared';

// ---------- Base converter ----------
export function BaseConverterTool() {
  const [bits, setBits] = useState<8 | 16>(8);
  const [value, setValue] = useState(45);
  const [signed, setSigned] = useState(false);
  const max = 2 ** bits - 1;
  const v = Math.max(0, Math.min(max, value));
  const signedVal = v >= 2 ** (bits - 1) ? v - 2 ** bits : v;
  const bin = v.toString(2).padStart(bits, '0');
  const set = (text: string, base: number) => {
    const cleaned = text.trim().replace(/^0[xb]/i, '').replace(/[\s_]/g, '');
    if (cleaned === '') return;
    let n = parseInt(cleaned, base);
    if (base === 10 && signed && n < 0) n = n + 2 ** bits;
    if (Number.isFinite(n) && n >= 0 && n <= max) setValue(n);
  };
  return (
    <ToolGrid
      controls={
        <>
          <Segmented label="Width" value={String(bits) as '8' | '16'} onChange={(x) => setBits(Number(x) as 8 | 16)} options={[{ value: '8', label: '8-bit' }, { value: '16', label: '16-bit' }]} />
          <label className="flex items-center gap-2 text-sm text-fg-2"><input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} className="accent-[var(--accent)]" /> Show signed (two's complement)</label>
          <div>
            <label htmlFor="bc-dec" className="mb-1 block text-[13px] text-fg-2">Decimal</label>
            <Input id="bc-dec" className="font-mono" key={`d${v}${signed}`} defaultValue={signed ? signedVal : v} onBlur={(e) => set(e.target.value, 10)} onKeyDown={(e) => e.key === 'Enter' && set((e.target as HTMLInputElement).value, 10)} />
          </div>
          <div>
            <label htmlFor="bc-hex" className="mb-1 block text-[13px] text-fg-2">Hexadecimal</label>
            <Input id="bc-hex" className="font-mono" key={`h${v}`} defaultValue={`0x${v.toString(16).toUpperCase().padStart(bits / 4, '0')}`} onBlur={(e) => set(e.target.value, 16)} onKeyDown={(e) => e.key === 'Enter' && set((e.target as HTMLInputElement).value, 16)} />
          </div>
          <div>
            <label htmlFor="bc-bin" className="mb-1 block text-[13px] text-fg-2">Binary</label>
            <Input id="bc-bin" className="font-mono" key={`b${v}`} defaultValue={bin} onBlur={(e) => set(e.target.value, 2)} onKeyDown={(e) => e.key === 'Enter' && set((e.target as HTMLInputElement).value, 2)} />
          </div>
          <p className="text-[12px] text-fg-3">Press Enter or leave a field to convert. Click bits to toggle them.</p>
        </>
      }
      output={
        <>
          <div className="flex flex-wrap gap-1.5">
            {bin.split('').map((b, i) => {
              const pos = bits - 1 - i;
              return (
                <button
                  key={i}
                  onClick={() => setValue(v ^ (1 << pos))}
                  aria-label={`Bit ${pos}, value ${b}`}
                  className={cx('flex w-10 flex-col items-center rounded-lg border py-1.5 transition', b === '1' ? 'border-accent bg-accent/15 text-accent' : 'border-line bg-panel-2 text-fg-3 hover:border-line-strong', i % 4 === 0 && i > 0 && 'ml-2')}
                >
                  <span className="font-mono text-lg font-semibold">{b}</span>
                  <span className="font-mono text-[9px]">{pos}</span>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Decimal" value={v} accent />
            <Readout label="Hex" value={`0x${v.toString(16).toUpperCase().padStart(bits / 4, '0')}`} />
            <Readout label="Signed" value={signedVal} sub={`int${bits}_t`} />
            <Readout label="Set bits" value={bin.split('').filter((x) => x === '1').length} />
          </div>
          <p className="font-mono text-sm text-fg-2">{bin.split('').map((b, i) => (b === '1' ? 2 ** (bits - 1 - i) : null)).filter((x) => x !== null).join(' + ') || '0'} = {v}</p>
        </>
      }
    />
  );
}

// ---------- Logic gate simulator ----------
type Gate = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'XNOR' | 'NOT';
const gateFn: Record<Gate, (a: boolean, b: boolean) => boolean> = {
  AND: (a, b) => a && b, OR: (a, b) => a || b, XOR: (a, b) => a !== b, NAND: (a, b) => !(a && b), NOR: (a, b) => !(a || b), XNOR: (a, b) => a === b, NOT: (a) => !a,
};

function GateSymbol({ gate, out }: { gate: Gate; out: boolean }) {
  const stroke = out ? 'var(--accent)' : 'var(--text-2)';
  const bubble = gate.startsWith('N') || gate === 'XNOR';
  const body =
    gate === 'AND' || gate === 'NAND' ? 'M 60 20 L 95 20 A 30 30 0 0 1 95 80 L 60 80 Z'
    : gate === 'NOT' ? 'M 60 20 L 120 50 L 60 80 Z'
    : 'M 55 20 Q 75 50 55 80 Q 110 80 130 50 Q 110 20 55 20 Z';
  const tip = gate === 'AND' || gate === 'NAND' ? 125 : gate === 'NOT' ? 120 : 130;
  return (
    <svg viewBox="0 0 200 100" className="w-full max-w-xs" role="img" aria-label={`${gate} gate`}>
      <path d={body} fill="var(--panel-2)" stroke={stroke} strokeWidth={2.5} />
      {(gate === 'XOR' || gate === 'XNOR') && <path d="M 45 20 Q 65 50 45 80" fill="none" stroke={stroke} strokeWidth={2.5} />}
      {bubble && <circle cx={tip + 6} cy={50} r={6} fill="var(--panel-2)" stroke={stroke} strokeWidth={2.5} />}
      <line x1={bubble ? tip + 12 : tip} y1={50} x2={190} y2={50} stroke={stroke} strokeWidth={2.5} />
      {gate === 'NOT' ? <line x1={10} y1={50} x2={60} y2={50} stroke="var(--text-2)" strokeWidth={2.5} /> : <><line x1={10} y1={35} x2={62} y2={35} stroke="var(--text-2)" strokeWidth={2.5} /><line x1={10} y1={65} x2={62} y2={65} stroke="var(--text-2)" strokeWidth={2.5} /></>}
    </svg>
  );
}

export function LogicGatesTool() {
  const [gate, setGate] = useState<Gate>('AND');
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const out = gateFn[gate](a, b);
  // Two-stage combinational circuit: Y = G2(G1(A, B), C)
  const [g1, setG1] = useState<Gate>('NAND');
  const [g2, setG2] = useState<Gate>('OR');
  const [c, setC] = useState(false);
  const mid = gateFn[g1](a, b);
  const y = gateFn[g2](mid, c);
  const Toggle = ({ label, v, set }: { label: string; v: boolean; set: (x: boolean) => void }) => (
    <button onClick={() => set(!v)} aria-pressed={v} className={cx('flex h-11 w-16 flex-col items-center justify-center rounded-xl border font-mono transition', v ? 'border-accent bg-accent/15 text-accent' : 'border-line-strong bg-panel-2 text-fg-3')}>
      <span className="text-[10px]">{label}</span><span className="text-base font-semibold">{v ? 1 : 0}</span>
    </button>
  );
  return (
    <div className="space-y-6">
      <ToolGrid
        controls={
          <>
            <label htmlFor="lg-gate" className="block text-[13px] text-fg-2">Gate</label>
            <Select id="lg-gate" value={gate} onChange={(e) => setGate(e.target.value as Gate)}>
              {(Object.keys(gateFn) as Gate[]).map((g) => <option key={g}>{g}</option>)}
            </Select>
            <div className="flex gap-2"><Toggle label="A" v={a} set={setA} />{gate !== 'NOT' && <Toggle label="B" v={b} set={setB} />}</div>
          </>
        }
        output={
          <>
            <div className="flex items-center gap-4"><GateSymbol gate={gate} out={out} /><Readout label="Output" value={out ? 1 : 0} accent={out} /></div>
            <table className="w-full max-w-sm text-center font-mono text-sm">
              <thead className="text-fg-3"><tr><th>A</th>{gate !== 'NOT' && <th>B</th>}<th>{gate}</th></tr></thead>
              <tbody>
                {(gate === 'NOT' ? [[false, false], [true, false]] : [[false, false], [false, true], [true, false], [true, true]]).map(([x, z]) => {
                  const active = x === a && (gate === 'NOT' || z === b);
                  return <tr key={`${x}${z}`} className={cx(active && 'bg-accent/10 text-accent')}><td>{+x}</td>{gate !== 'NOT' && <td>{+z}</td>}<td>{+gateFn[gate](x, z)}</td></tr>;
                })}
              </tbody>
            </table>
          </>
        }
      />
      <div className="rounded-2xl border border-line p-4">
        <h3 className="mb-3 text-sm font-semibold text-fg">Two-gate circuit: Y = G2( G1(A, B), C )</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle label="A" v={a} set={setA} /><Toggle label="B" v={b} set={setB} />
          <Select aria-label="First gate" value={g1} onChange={(e) => setG1(e.target.value as Gate)} className="w-28">{(Object.keys(gateFn) as Gate[]).filter((g) => g !== 'NOT').map((g) => <option key={g}>{g}</option>)}</Select>
          <span className="font-mono text-sm text-fg-3">→ {mid ? 1 : 0}</span>
          <Toggle label="C" v={c} set={setC} />
          <Select aria-label="Second gate" value={g2} onChange={(e) => setG2(e.target.value as Gate)} className="w-28">{(Object.keys(gateFn) as Gate[]).filter((g) => g !== 'NOT').map((g) => <option key={g}>{g}</option>)}</Select>
          <Readout label="Y" value={y ? 1 : 0} accent={y} />
        </div>
      </div>
    </div>
  );
}

// ---------- Truth table generator ----------
export function TruthTableTool() {
  const [expr, setExpr] = useState('E & !O & !S');
  const [compare, setCompare] = useState('');
  const result = useMemo(() => { try { return { tt: truthTable(expr) }; } catch (e) { return { error: (e as Error).message }; } }, [expr]);
  const cmp = useMemo(() => { if (!compare.trim()) return undefined; try { return { tt: truthTable(compare) }; } catch (e) { return { error: (e as Error).message }; } }, [compare]);
  const equivalent = result.tt && cmp?.tt && result.tt.vars.join() === cmp.tt.vars.join() && result.tt.rows.every((r, i) => r.output === cmp.tt!.rows[i].output);
  return (
    <ToolGrid
      controls={
        <>
          <div>
            <label htmlFor="tt-expr" className="mb-1 block text-[13px] text-fg-2">Expression</label>
            <Input id="tt-expr" className="font-mono" value={expr} onChange={(e) => setExpr(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['A & B', 'A | B', 'A ^ B', '!(A & B)', '!A | !B', "(A + B)'", 'A NAND B', '(A & B) | (!A & C)'].map((x) => <Button key={x} size="sm" variant="ghost" className="font-mono" onClick={() => setExpr(x)}>{x}</Button>)}
          </div>
          <div className="text-[12px] text-fg-3">Operators: <code>! ~ NOT '</code> · <code>&amp; * AND</code> · <code>^ XOR</code> · <code>| + OR</code> · <code>NAND NOR</code>. Up to 6 variables.</div>
          <div>
            <label htmlFor="tt-cmp" className="mb-1 block text-[13px] text-fg-2">Compare with (optional)</label>
            <Input id="tt-cmp" className="font-mono" placeholder="e.g. !A | !B" value={compare} onChange={(e) => setCompare(e.target.value)} />
          </div>
          {cmp?.error && <p className="text-sm text-bad">{cmp.error}</p>}
          {cmp?.tt && <Badge tone={equivalent ? 'good' : 'bad'}>{equivalent ? 'Equivalent for every input' : 'Not equivalent'}</Badge>}
        </>
      }
      output={
        result.error ? <Callout tone="bad" title="Syntax error">{result.error}</Callout> : result.tt && (
          <>
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-center font-mono text-sm">
                <thead className="bg-panel-2 text-fg-2"><tr>{result.tt.vars.map((v) => <th key={v} className="p-2">{v}</th>)}<th className="p-2 text-accent">Y</th></tr></thead>
                <tbody>
                  {result.tt.rows.map((r, i) => (
                    <tr key={i} className="border-t border-line">
                      {r.inputs.map((x, j) => <td key={j} className="p-1.5 text-fg-2">{+x}</td>)}
                      <td className={cx('p-1.5 font-semibold', r.output ? 'text-accent' : 'text-fg-3')}>{+r.output}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-line bg-bg-2 p-3 text-sm"><span className="text-fg-3">Sum of products: </span><span className="font-mono text-fg">{sumOfProducts(result.tt)}</span></div>
          </>
        )
      }
    />
  );
}

// ---------- Bitwise visualizer ----------
type Op = '&' | '|' | '^' | '~' | '<<' | '>>';
export function BitwiseTool() {
  const [a, setA] = useState(0b10100100);
  const [b, setB] = useState(0b00111100);
  const [op, setOp] = useState<Op>('&');
  const [n, setN] = useState(3);
  const r = (op === '&' ? a & b : op === '|' ? a | b : op === '^' ? a ^ b : op === '~' ? ~a : op === '<<' ? a << n : a >> n) & 0xff;
  const row = (label: string, v: number, accent?: boolean) => (
    <div className="flex items-center gap-2">
      <span className="w-14 text-right font-mono text-[12px] text-fg-3">{label}</span>
      <div className="flex gap-1">{v.toString(2).padStart(8, '0').split('').map((x, i) => <span key={i} className={cx('grid size-8 place-items-center rounded-md border font-mono text-sm', x === '1' ? (accent ? 'border-accent bg-accent/20 text-accent' : 'border-accent-2/50 bg-accent-2/10 text-accent-2') : 'border-line text-fg-3', i === 4 && 'ml-1.5')}>{x}</span>)}</div>
      <span className="ml-2 font-mono text-[12px] text-fg-2">0x{v.toString(16).toUpperCase().padStart(2, '0')} = {v}</span>
    </div>
  );
  const code = op === '~' ? `~a` : op === '<<' || op === '>>' ? `a ${op} ${n}` : `a ${op} b`;
  return (
    <ToolGrid
      controls={
        <>
          <Segmented label="Operation" value={op} onChange={setOp} options={(['&', '|', '^', '~', '<<', '>>'] as Op[]).map((o) => ({ value: o, label: <span className="font-mono">{o}</span> }))} />
          <div>
            <label htmlFor="bw-a" className="mb-1 block text-[13px] text-fg-2">a (hex)</label>
            <Input id="bw-a" className="font-mono" key={`a${a}`} defaultValue={`0x${a.toString(16).toUpperCase()}`} onBlur={(e) => { const v = parseInt(e.target.value.replace(/^0x/i, ''), 16); if (v >= 0 && v <= 255) setA(v); }} />
          </div>
          {op !== '~' && op !== '<<' && op !== '>>' && (
            <div>
              <label htmlFor="bw-b" className="mb-1 block text-[13px] text-fg-2">b / mask (hex)</label>
              <Input id="bw-b" className="font-mono" key={`b${b}`} defaultValue={`0x${b.toString(16).toUpperCase()}`} onBlur={(e) => { const v = parseInt(e.target.value.replace(/^0x/i, ''), 16); if (v >= 0 && v <= 255) setB(v); }} />
            </div>
          )}
          {(op === '<<' || op === '>>') && (
            <div><label htmlFor="bw-n" className="mb-1 block text-[13px] text-fg-2">Shift by</label><Input id="bw-n" type="number" min={0} max={7} value={n} onChange={(e) => setN(Math.max(0, Math.min(7, Number(e.target.value))))} /></div>
          )}
          <div className="space-y-1 text-[12px] text-fg-3">
            <div>Quick masks for bit 3:</div>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="ghost" onClick={() => { setOp('|'); setB(1 << 3); }}>set: |= (1&lt;&lt;3)</Button>
              <Button size="sm" variant="ghost" onClick={() => { setOp('&'); setB(~(1 << 3) & 0xff); }}>clear: &amp;= ~(1&lt;&lt;3)</Button>
              <Button size="sm" variant="ghost" onClick={() => { setOp('^'); setB(1 << 3); }}>flip: ^= (1&lt;&lt;3)</Button>
            </div>
          </div>
        </>
      }
      output={
        <>
          <div className="space-y-2 overflow-x-auto rounded-xl border border-line bg-bg-2 p-4">
            {row('a', a)}
            {op !== '~' && op !== '<<' && op !== '>>' && row('b', b)}
            <div className="ml-16 h-px bg-line" />
            {row('result', r, true)}
          </div>
          <p className="font-mono text-sm text-fg-2">uint8_t result = {code};  // 0x{r.toString(16).toUpperCase().padStart(2, '0')}</p>
        </>
      }
    />
  );
}
