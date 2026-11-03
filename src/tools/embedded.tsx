import { useMemo, useState } from 'react';
import { Badge, Callout, cx, Input, Segmented, Select, Slider } from '../components/ui';
import { fmtSI, Readout, ToolGrid, Wave } from './shared';

// ---------- PWM ----------
export function PwmTool() {
  const [duty, setDuty] = useState(50);
  const [freq, setFreq] = useState(490);
  const [vcc, setVcc] = useState(5);
  const periods = 3;
  const W = 520;
  const H = 120;
  const path = useMemo(() => {
    let d = `M 0 ${H - 20}`;
    for (let p = 0; p < periods; p++) {
      const x0 = (p * W) / periods;
      const xOn = x0 + ((duty / 100) * W) / periods;
      const x1 = ((p + 1) * W) / periods;
      d += duty > 0 ? ` L ${x0} 20 L ${xOn} 20 L ${xOn} ${H - 20}` : '';
      d += ` L ${x1} ${H - 20}`;
    }
    return d;
  }, [duty]);
  const avg = (duty / 100) * vcc;
  const period = 1 / freq;
  return (
    <ToolGrid
      controls={
        <>
          <Slider id="pwm-duty" label="Duty cycle" value={duty} min={0} max={100} unit="%" onChange={setDuty} />
          <Slider id="pwm-f" label="Frequency" value={freq} min={50} max={20000} step={10} unit="Hz" onChange={setFreq} />
          <Slider id="pwm-v" label="Supply / logic HIGH" value={vcc} min={1} max={12} step={0.1} unit="V" onChange={setVcc} />
        </>
      }
      output={
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-line bg-bg-2 grid-bg" role="img" aria-label={`PWM waveform at ${duty}% duty`}>
            <line x1={0} y1={H - 20 - (avg / vcc) * (H - 40)} x2={W} y2={H - 20 - (avg / vcc) * (H - 40)} stroke="var(--accent-3)" strokeDasharray="5 4" />
            <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
            <text x={W - 6} y={H - 26 - (avg / vcc) * (H - 40)} fill="var(--accent-3)" fontSize={11} textAnchor="end">average {avg.toFixed(2)} V</text>
          </svg>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Average voltage" value={fmtSI(avg, 'V')} accent />
            <Readout label="Period" value={fmtSI(period, 's')} />
            <Readout label="High time" value={fmtSI((period * duty) / 100, 's')} />
            <Readout label="analogWrite()" value={Math.round((duty / 100) * 255)} sub="8-bit value on the Uno" />
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-line p-3">
            <div className="size-10 rounded-full" style={{ background: 'var(--accent)', opacity: 0.08 + 0.92 * (duty / 100), boxShadow: `0 0 ${duty / 3}px var(--accent)` }} aria-hidden />
            <p className="text-sm text-fg-2">An LED or motor responds to the average: the eye and the motor's inertia filter out the {freq >= 100 ? 'fast' : 'slow'} switching.{freq < 100 && ' Below ~100 Hz an LED visibly flickers.'}</p>
          </div>
        </>
      }
    />
  );
}

// ---------- ADC ----------
export function AdcTool() {
  const [bits, setBits] = useState(10);
  const [vref, setVref] = useState(5);
  const [vin, setVin] = useState(2.5);
  const levels = 2 ** bits;
  const code = Math.max(0, Math.min(levels - 1, Math.round((vin / vref) * (levels - 1))));
  const back = (code / (levels - 1)) * vref;
  const lsb = vref / (levels - 1);
  const steps = 16;
  return (
    <ToolGrid
      controls={
        <>
          <Segmented label="Resolution" value={String(bits) as '8' | '10' | '12' | '16'} onChange={(x) => setBits(Number(x))} options={[{ value: '8', label: '8-bit' }, { value: '10', label: '10-bit (Uno)' }, { value: '12', label: '12-bit (ESP32/STM32)' }, { value: '16', label: '16-bit' }]} />
          <Slider id="adc-ref" label="Reference voltage" value={vref} min={1} max={5} step={0.1} unit="V" onChange={setVref} />
          <Slider id="adc-in" label="Input voltage" value={vin} min={0} max={vref} step={0.001} unit="V" onChange={setVin} />
        </>
      }
      output={
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Digital code" value={code} accent sub={`0x${code.toString(16).toUpperCase()}`} />
            <Readout label="Code → voltage" value={fmtSI(back, 'V', 4)} />
            <Readout label="Resolution (1 LSB)" value={fmtSI(lsb, 'V')} />
            <Readout label="Quantisation error" value={fmtSI(Math.abs(back - vin), 'V')} />
          </div>
          <svg viewBox="0 0 520 170" className="w-full rounded-xl border border-line bg-bg-2" role="img" aria-label="ADC transfer staircase">
            {Array.from({ length: steps }).map((_, i) => (
              <rect key={i} x={20 + (i * 480) / steps} y={150 - ((i + 1) * 130) / steps} width={480 / steps} height={((i + 1) * 130) / steps} fill="var(--accent)" opacity={i === Math.floor((vin / vref) * steps * 0.9999) ? 0.35 : 0.08} />
            ))}
            <line x1={20} y1={150} x2={500} y2={20} stroke="var(--accent-3)" strokeDasharray="4 3" />
            <line x1={20 + (vin / vref) * 480} y1={10} x2={20 + (vin / vref) * 480} y2={150} stroke="var(--accent)" strokeWidth={2} />
            <text x={20} y={165} fontSize={10} fill="var(--text-3)">0 V</text><text x={500} y={165} fontSize={10} fill="var(--text-3)" textAnchor="end">{vref} V</text>
            <text x={26} y={22} fontSize={10} fill="var(--text-3)">staircase shown with 16 steps for clarity</text>
          </svg>
          <p className="font-mono text-sm text-fg-2">V = code / {levels - 1} × {vref} V</p>
          {bits === 12 && <Callout tone="blue">The ESP32 ADC is non-linear near 0 V and near full scale. Calibrate against a meter, and use ADC1 pins while Wi-Fi is on.</Callout>}
        </>
      }
    />
  );
}

// ---------- UART ----------
export function UartTool() {
  const [text, setText] = useState('Hi');
  const [baud, setBaud] = useState(9600);
  const [parity, setParity] = useState<'none' | 'even' | 'odd'>('none');
  const [stop, setStop] = useState<1 | 2>(1);
  const frames = useMemo(() => [...text.slice(0, 4)].map((ch) => {
    const code = ch.charCodeAt(0) & 0xff;
    const data = Array.from({ length: 8 }, (_, i) => ((code >> i) & 1) as 0 | 1); // LSB first
    const ones = data.filter((x) => x === 1).length;
    const par: (0 | 1)[] = parity === 'none' ? [] : [((parity === 'even' ? ones % 2 : (ones + 1) % 2) as 0 | 1)];
    return { ch, code, bits: [0 as const, ...data, ...par, ...Array<1>(stop).fill(1)], labels: ['S', ...data.map((_, i) => `D${i}`), ...par.map(() => 'P'), ...Array(stop).fill('T')] };
  }), [text, parity, stop]);
  const allBits: (0 | 1)[] = [1, ...frames.flatMap((f) => f.bits), 1];
  const allLabels = ['', ...frames.flatMap((f) => f.labels), ''];
  const bitsPerFrame = 1 + 8 + (parity === 'none' ? 0 : 1) + stop;
  return (
    <ToolGrid
      controls={
        <>
          <div><label htmlFor="uart-t" className="mb-1 block text-[13px] text-fg-2">Characters to send (up to 4)</label><Input id="uart-t" value={text} maxLength={4} onChange={(e) => setText(e.target.value)} /></div>
          <div><label htmlFor="uart-b" className="mb-1 block text-[13px] text-fg-2">Baud rate</label><Select id="uart-b" value={baud} onChange={(e) => setBaud(Number(e.target.value))}>{[9600, 19200, 57600, 115200].map((b) => <option key={b}>{b}</option>)}</Select></div>
          <Segmented label="Parity" value={parity} onChange={setParity} options={[{ value: 'none', label: 'None' }, { value: 'even', label: 'Even' }, { value: 'odd', label: 'Odd' }]} />
          <Segmented label="Stop bits" value={String(stop) as '1' | '2'} onChange={(x) => setStop(Number(x) as 1 | 2)} options={[{ value: '1', label: '1 stop' }, { value: '2', label: '2 stop' }]} />
        </>
      }
      output={
        <>
          <div className="rounded-xl border border-line bg-bg-2 p-3"><Wave bits={allBits} labels={allLabels} label="TX" /></div>
          <div className="flex flex-wrap gap-2">{frames.map((f, i) => <Badge key={i} tone="accent">'{f.ch}' = 0x{f.code.toString(16).toUpperCase()} = {f.code.toString(2).padStart(8, '0')}</Badge>)}</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="Bit time" value={fmtSI(1 / baud, 's')} accent />
            <Readout label="Frame" value={`${bitsPerFrame} bits`} sub={`8${parity[0].toUpperCase()}${stop}`} />
            <Readout label="Message time" value={fmtSI((bitsPerFrame * frames.length) / baud, 's')} />
            <Readout label="Max throughput" value={`${Math.floor(baud / bitsPerFrame)} B/s`} />
          </div>
          <p className="text-sm text-fg-3">The line idles HIGH. A LOW start bit begins each frame; data is sent least-significant bit first. Both sides must use the same baud rate — there is no clock wire.</p>
        </>
      }
    />
  );
}

// ---------- I2C ----------
export function I2cTool() {
  const [addr, setAddr] = useState('76');
  const [rw, setRw] = useState<'W' | 'R'>('W');
  const [data, setData] = useState('F7');
  const [present, setPresent] = useState(true);
  const address = parseInt(addr, 16) & 0x7f;
  const bytes = data.split(/[\s,]+/).filter(Boolean).map((x) => parseInt(x.replace(/^0x/i, ''), 16) & 0xff).filter((x) => !Number.isNaN(x)).slice(0, 3);
  const sda: (0 | 1)[] = [1, 1, 0, 0]; // idle, start: SDA falls while SCL high
  const scl: (0 | 1)[] = [1, 1, 1, 0];
  const labels: (string | undefined)[] = ['', 'S', '', ''];
  const pushBit = (b: 0 | 1, label: string) => { sda.push(b, b); scl.push(0, 1); labels.push(label, ''); };
  const addrByte = (address << 1) | (rw === 'R' ? 1 : 0);
  for (let i = 7; i >= 1; i--) pushBit(((addrByte >> i) & 1) as 0 | 1, `A${i - 1}`);
  pushBit((addrByte & 1) as 0 | 1, rw);
  pushBit(present ? 0 : 1, present ? 'ACK' : 'NAK');
  if (present) {
    bytes.forEach((byte, bi) => {
      for (let i = 7; i >= 0; i--) pushBit(((byte >> i) & 1) as 0 | 1, `D${i}`);
      pushBit(rw === 'R' && bi === bytes.length - 1 ? 1 : 0, rw === 'R' && bi === bytes.length - 1 ? 'NAK' : 'ACK');
    });
  }
  sda.push(0, 0, 1, 1); scl.push(0, 1, 1, 1); labels.push('', 'P', '', '');
  return (
    <ToolGrid
      controls={
        <>
          <div><label htmlFor="i2c-a" className="mb-1 block text-[13px] text-fg-2">7-bit address (hex)</label><Input id="i2c-a" className="font-mono" value={addr} onChange={(e) => setAddr(e.target.value.replace(/^0x/i, ''))} /></div>
          <Segmented label="Direction" value={rw} onChange={setRw} options={[{ value: 'W', label: 'Write' }, { value: 'R', label: 'Read' }]} />
          <div><label htmlFor="i2c-d" className="mb-1 block text-[13px] text-fg-2">Data bytes (hex, up to 3)</label><Input id="i2c-d" className="font-mono" value={data} onChange={(e) => setData(e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm text-fg-2"><input type="checkbox" checked={present} onChange={(e) => setPresent(e.target.checked)} className="accent-[var(--accent)]" /> Device present at this address</label>
        </>
      }
      output={
        <>
          <div className="space-y-1 rounded-xl border border-line bg-bg-2 p-3">
            <Wave bits={scl} label="SCL" color="var(--accent-3)" height={36} />
            <Wave bits={sda} label="SDA" labels={labels} />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Readout label="Address byte" value={`0x${addrByte.toString(16).toUpperCase().padStart(2, '0')}`} accent sub={`0x${address.toString(16).toUpperCase()} << 1 | ${rw === 'R' ? 1 : 0}`} />
            <Readout label="Bytes on bus" value={1 + (present ? bytes.length : 0)} />
            <Readout label="Result" value={present ? 'ACK' : 'NACK'} sub={present ? 'device answered' : 'nobody pulled SDA low'} />
          </div>
          {!present && <Callout tone="warn" title="Address NACK">No device acknowledged. Check power, SDA/SCL wiring, pull-ups and the address (e.g. BME280 is 0x76 or 0x77 depending on SDO).</Callout>}
          <p className="text-sm text-fg-3">SDA may only change while SCL is LOW — except START (SDA falls while SCL is HIGH) and STOP (SDA rises while SCL is HIGH). Both lines are open-drain with pull-ups.</p>
        </>
      }
    />
  );
}

// ---------- SPI ----------
export function SpiTool() {
  const [mode, setMode] = useState<'0' | '1' | '2' | '3'>('0');
  const [mosi, setMosi] = useState('A5');
  const [miso, setMiso] = useState('3C');
  const cpol = mode === '2' || mode === '3' ? 1 : 0;
  const cpha = mode === '1' || mode === '3' ? 1 : 0;
  const tx = parseInt(mosi, 16) & 0xff || 0;
  const rx = parseInt(miso, 16) & 0xff || 0;
  const sck: (0 | 1)[] = [cpol as 0 | 1, cpol as 0 | 1];
  const cs: (0 | 1)[] = [1, 0];
  const mo: (0 | 1 | null)[] = [1, 1];
  const mi: (0 | 1 | null)[] = [1, 1];
  const labels: (string | undefined)[] = ['', 'CS↓'];
  const samples: number[] = [];
  for (let i = 7; i >= 0; i--) {
    const bt = ((tx >> i) & 1) as 0 | 1;
    const br = ((rx >> i) & 1) as 0 | 1;
    const lead = (1 - cpol) as 0 | 1;
    sck.push(cpha ? lead : (cpol as 0 | 1), cpha ? (cpol as 0 | 1) : lead);
    cs.push(0, 0);
    mo.push(bt, bt);
    mi.push(br, br);
    labels.push(`${i}`, '');
    // Mode 0/2 sample on the leading edge (mid-bit here); mode 1/3 shift on the leading edge
    // at the bit boundary and sample on the trailing edge — also mid-bit. Either way: second half-slot.
    samples.push(sck.length - 1);
  }
  sck.push(cpol as 0 | 1, cpol as 0 | 1); cs.push(0, 1); mo.push(1, 1); mi.push(1, 1); labels.push('', 'CS↑');
  return (
    <ToolGrid
      controls={
        <>
          <Segmented label="SPI mode" value={mode} onChange={setMode} options={['0', '1', '2', '3'].map((m) => ({ value: m as '0', label: `Mode ${m}` }))} />
          <div><label htmlFor="spi-o" className="mb-1 block text-[13px] text-fg-2">Controller sends (MOSI, hex)</label><Input id="spi-o" className="font-mono" value={mosi} onChange={(e) => setMosi(e.target.value.replace(/^0x/i, ''))} /></div>
          <div><label htmlFor="spi-i" className="mb-1 block text-[13px] text-fg-2">Device replies (MISO, hex)</label><Input id="spi-i" className="font-mono" value={miso} onChange={(e) => setMiso(e.target.value.replace(/^0x/i, ''))} /></div>
        </>
      }
      output={
        <>
          <div className="space-y-1 rounded-xl border border-line bg-bg-2 p-3">
            <Wave bits={cs} label="CS" color="var(--warn)" height={34} />
            <Wave bits={sck} label="SCK" color="var(--accent-3)" height={34} highlight={samples} />
            <Wave bits={mo} label="MOSI" labels={labels} />
            <Wave bits={mi} label="MISO" color="var(--accent-2)" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Readout label="CPOL" value={cpol} sub={`SCK idles ${cpol ? 'HIGH' : 'LOW'}`} />
            <Readout label="CPHA" value={cpha} sub={cpha ? 'sample on 2nd edge' : 'sample on 1st edge'} />
            <Readout label="Sent" value={`0x${tx.toString(16).toUpperCase().padStart(2, '0')}`} accent />
            <Readout label="Received" value={`0x${rx.toString(16).toUpperCase().padStart(2, '0')}`} />
          </div>
          <p className="text-sm text-fg-3">SPI is full-duplex: one byte goes out on MOSI while one comes back on MISO, MSB first here. Shaded columns mark the sampling edges. A device configured for a different mode reads every bit at the wrong edge.</p>
        </>
      }
    />
  );
}

// ---------- Interrupt timeline ----------
export function InterruptTool() {
  const [strategy, setStrategy] = useState<'delay' | 'millis' | 'isr'>('delay');
  const [delayMs, setDelayMs] = useState(200);
  const [pulseMs, setPulseMs] = useState(40);
  const [isrUs, setIsrUs] = useState(10);
  const events = [70, 185, 410, 560, 700, 905];
  const span = 1000;
  const result = events.map((t) => {
    if (strategy === 'isr') return { t, caught: true, latency: 0.005 };
    const period = strategy === 'delay' ? delayMs : 1; // non-blocking loop polls about every 1 ms
    const nextPoll = Math.ceil(t / period) * period;
    const caught = nextPoll <= t + pulseMs;
    return { t, caught, latency: caught ? nextPoll - t : undefined };
  });
  const caught = result.filter((r) => r.caught);
  const avgLatency = caught.length ? caught.reduce((a, r) => a + (r.latency ?? 0), 0) / caught.length : 0;
  const x = (t: number) => 20 + (t / span) * 480;
  return (
    <ToolGrid
      controls={
        <>
          <Segmented label="Strategy" value={strategy} onChange={setStrategy} options={[{ value: 'delay', label: 'Poll + delay()' }, { value: 'millis', label: 'Non-blocking' }, { value: 'isr', label: 'Interrupt' }]} />
          {strategy === 'delay' && <Slider id="it-d" label="delay() in loop" value={delayMs} min={10} max={500} step={10} unit="ms" onChange={setDelayMs} />}
          <Slider id="it-p" label="Event pulse width" value={pulseMs} min={1} max={200} unit="ms" onChange={setPulseMs} />
          {strategy === 'isr' && <Slider id="it-i" label="ISR duration" value={isrUs} min={1} max={2000} unit="µs" onChange={setIsrUs} />}
        </>
      }
      output={
        <>
          <svg viewBox="0 0 520 150" className="w-full rounded-xl border border-line bg-bg-2" role="img" aria-label="Event timeline">
            <text x={20} y={18} fontSize={11} fill="var(--text-3)">events (pulse width {pulseMs} ms)</text>
            {events.map((t) => <rect key={t} x={x(t)} y={26} width={Math.max(2, (pulseMs / span) * 480)} height={20} fill="var(--warn)" opacity={0.6} />)}
            <text x={20} y={70} fontSize={11} fill="var(--text-3)">{strategy === 'delay' ? `main loop polls every ${delayMs} ms` : strategy === 'millis' ? 'loop polls about every 1 ms' : 'interrupt fires on the edge'}</text>
            {strategy === 'delay' && Array.from({ length: Math.floor(span / delayMs) + 1 }).map((_, i) => <line key={i} x1={x(i * delayMs)} y1={78} x2={x(i * delayMs)} y2={98} stroke="var(--accent-2)" strokeWidth={2} />)}
            {strategy !== 'delay' && <rect x={20} y={84} width={480} height={8} fill={strategy === 'isr' ? 'var(--accent-3)' : 'var(--accent-2)'} opacity={0.25} />}
            {result.map((r) => (
              <g key={r.t}>
                <text x={x(r.t) + 2} y={124} fontSize={14} fill={r.caught ? 'var(--good)' : 'var(--bad)'}>{r.caught ? '✓' : '✗'}</text>
                {r.caught && r.latency !== undefined && r.latency > 1 && <line x1={x(r.t)} y1={110} x2={x(r.t + r.latency)} y2={110} stroke="var(--good)" strokeWidth={2} />}
              </g>
            ))}
            <text x={20} y={145} fontSize={10} fill="var(--text-3)">0 ms</text><text x={500} y={145} fontSize={10} fill="var(--text-3)" textAnchor="end">1000 ms</text>
          </svg>
          <div className="grid grid-cols-3 gap-3">
            <Readout label="Caught" value={`${caught.length}/${events.length}`} accent />
            <Readout label="Avg latency" value={strategy === 'isr' ? '≈ µs' : `${avgLatency.toFixed(1)} ms`} />
            <Readout label="CPU in ISR" value={strategy === 'isr' ? `${((events.length * isrUs) / 1e4).toFixed(3)} %` : '—'} />
          </div>
          {strategy === 'delay' && caught.length < events.length && <Callout tone="warn" title="Missed events">Short pulses that start and end during a delay() are never seen. Use non-blocking timing or an interrupt.</Callout>}
          {strategy === 'isr' && isrUs > 500 && <Callout tone="warn" title="Long ISR">A long ISR blocks other interrupts and the main loop. Set a flag and do the work outside the ISR.</Callout>}
        </>
      }
    />
  );
}

// ---------- Memory layout ----------
const SNIPPET: { code: string; section: string; why: string }[] = [
  { code: 'const char banner[] = "K-FORGE";', section: '.text / flash', why: 'const data can stay in flash (rodata) — on AVR use PROGMEM to keep it out of RAM.' },
  { code: 'uint16_t sample_count = 5;', section: '.data', why: 'Initialised global: the value is copied from flash to RAM at start-up.' },
  { code: 'uint16_t buffer[64];', section: '.bss', why: 'Uninitialised global: zeroed at start-up, occupies RAM only.' },
  { code: 'static uint8_t next_index;  // file scope', section: '.bss', why: 'Static storage, private to this file.' },
  { code: 'void f(void) { int16_t local = 0; }', section: 'stack', why: 'Lives in f\'s stack frame; gone when f returns.' },
  { code: 'void f(void) { static int calls = 0; }', section: '.bss', why: 'Static local: keeps its value between calls, not on the stack.' },
  { code: 'int16_t *p = malloc(32 * sizeof *p);', section: 'heap', why: 'Dynamic allocation: the pointer p may be on the stack, the 64 bytes are on the heap.' },
];
export function MemoryLayoutTool() {
  const [ram, setRam] = useState(2048);
  const [globals, setGlobals] = useState(600);
  const [heap, setHeap] = useState(300);
  const [frames, setFrames] = useState(6);
  const [frameSize, setFrameSize] = useState(80);
  const [sel, setSel] = useState(1);
  const stack = frames * frameSize;
  const free = ram - globals - heap - stack;
  const pct = (v: number) => `${Math.max(0, (v / ram) * 100)}%`;
  return (
    <div className="space-y-6">
      <ToolGrid
        controls={
          <>
            <div><label htmlFor="ml-ram" className="mb-1 block text-[13px] text-fg-2">Device RAM</label><Select id="ml-ram" value={ram} onChange={(e) => setRam(Number(e.target.value))}><option value={2048}>Arduino Uno — 2 KB</option><option value={131072}>STM32F446 — 128 KB</option><option value={532480}>ESP32 — ~520 KB</option></Select></div>
            <Slider id="ml-g" label=".data + .bss (globals)" value={globals} min={0} max={Math.min(ram, 4000)} step={10} unit="B" onChange={setGlobals} />
            <Slider id="ml-h" label="Heap in use" value={heap} min={0} max={Math.min(ram, 4000)} step={10} unit="B" onChange={setHeap} />
            <Slider id="ml-f" label="Call depth (stack frames)" value={frames} min={1} max={40} unit="" onChange={setFrames} />
            <Slider id="ml-fs" label="Bytes per frame" value={frameSize} min={16} max={400} step={8} unit="B" onChange={setFrameSize} />
          </>
        }
        output={
          <>
            <div className="flex h-12 w-full overflow-hidden rounded-xl border border-line" role="img" aria-label="RAM usage bar">
              <div className="grid place-items-center bg-accent-2/30 text-[11px] text-fg" style={{ width: pct(globals) }}>globals</div>
              <div className="grid place-items-center bg-warn/30 text-[11px] text-fg" style={{ width: pct(heap) }}>heap →</div>
              <div className={cx('grid place-items-center text-[11px]', free < 0 ? 'bg-bad/40 text-bad' : 'text-fg-3')} style={{ width: pct(Math.max(0, free)) }}>{free >= 0 ? 'free' : ''}</div>
              <div className="grid place-items-center bg-accent/30 text-[11px] text-fg" style={{ width: pct(stack) }}>← stack</div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Readout label="Stack" value={`${stack} B`} />
              <Readout label="Free" value={`${free} B`} accent={free > 0} />
              <Readout label="Used" value={`${Math.round(((ram - free) / ram) * 100)} %`} />
              <Readout label="RAM" value={`${(ram / 1024).toFixed(0)} KB`} />
            </div>
            {free < 0 ? <Callout tone="bad" title="Stack/heap collision">The stack has grown into the heap. On a small MCU this corrupts data silently or crashes. Reduce recursion, shrink large locals, or avoid malloc.</Callout> : free < ram * 0.1 ? <Callout tone="warn" title="Less than 10 % RAM free">Leave headroom for interrupts and worst-case call depth.</Callout> : null}
          </>
        }
      />
      <div className="rounded-2xl border border-line p-4">
        <h3 className="mb-3 text-sm font-semibold text-fg">Where does each declaration live?</h3>
        <div className="grid gap-2">
          {SNIPPET.map((s, i) => (
            <button key={i} onClick={() => setSel(i)} className={cx('flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition', sel === i ? 'border-accent bg-accent/5' : 'border-line hover:border-line-strong')}>
              <code className="font-mono text-[13px] text-fg">{s.code}</code>
              {sel === i && <Badge tone="accent">{s.section}</Badge>}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-fg-2"><span className="font-medium text-accent">{SNIPPET[sel].section}:</span> {SNIPPET[sel].why}</p>
      </div>
    </div>
  );
}
