// Theme-aware SVG diagrams for lessons and questions. Colours come from CSS variables.
import type { ReactNode } from 'react';
import type { DiagramId } from '../../data/types';

const S = { stroke: 'var(--text-2)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const A = { ...S, stroke: 'var(--accent)' };
const T = ({ x, y, children, c = 'var(--text-2)', size = 12, anchor = 'middle', mono }: { x: number; y: number; children: ReactNode; c?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; mono?: boolean }) => (
  <text x={x} y={y} fill={c} fontSize={size} textAnchor={anchor} fontFamily={mono ? 'var(--font-mono)' : 'var(--font-sans)'}>{children}</text>
);

/** Horizontal resistor zig-zag from (x,y) of length 60. */
const ResH = ({ x, y, c = 'var(--text-2)' }: { x: number; y: number; c?: string }) => (
  <polyline {...S} stroke={c} points={`${x},${y} ${x + 10},${y} ${x + 15},${y - 8} ${x + 25},${y + 8} ${x + 35},${y - 8} ${x + 45},${y + 8} ${x + 50},${y} ${x + 60},${y}`} />
);
const ResV = ({ x, y, c = 'var(--text-2)' }: { x: number; y: number; c?: string }) => (
  <polyline {...S} stroke={c} points={`${x},${y} ${x},${y + 10} ${x - 8},${y + 15} ${x + 8},${y + 25} ${x - 8},${y + 35} ${x + 8},${y + 45} ${x},${y + 50} ${x},${y + 60}`} />
);
const Battery = ({ x, y }: { x: number; y: number }) => (
  <g>
    <line {...S} x1={x - 14} y1={y} x2={x + 14} y2={y} />
    <line {...S} x1={x - 8} y1={y + 8} x2={x + 8} y2={y + 8} strokeWidth={3} />
    <T x={x + 22} y={y - 2} size={11} anchor="start">+</T>
  </g>
);
const Gnd = ({ x, y }: { x: number; y: number }) => (
  <g>
    <line {...S} x1={x - 12} y1={y} x2={x + 12} y2={y} />
    <line {...S} x1={x - 7} y1={y + 5} x2={x + 7} y2={y + 5} />
    <line {...S} x1={x - 3} y1={y + 10} x2={x + 3} y2={y + 10} />
  </g>
);
const LedV = ({ x, y }: { x: number; y: number }) => (
  <g>
    <polygon points={`${x - 10},${y} ${x + 10},${y} ${x},${y + 16}`} fill="var(--accent)" fillOpacity={0.25} stroke="var(--accent)" strokeWidth={2} />
    <line {...A} x1={x - 10} y1={y + 16} x2={x + 10} y2={y + 16} />
    <line {...A} x1={x + 14} y1={y + 2} x2={x + 22} y2={y - 6} />
    <line {...A} x1={x + 16} y1={y + 9} x2={x + 24} y2={y + 1} />
  </g>
);

function Frame({ w, h, children, title }: { w: number; h: number; children: ReactNode; title: string }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={title}>
      <title>{title}</title>
      {children}
    </svg>
  );
}

const diagrams: Record<DiagramId, () => ReactNode> = {
  'led-circuit': () => (
    <Frame w={420} h={230} title="5 V source, 330 ohm resistor and LED in series">
      <line {...S} x1={60} y1={40} x2={60} y2={95} />
      <Battery x={60} y={100} />
      <line {...S} x1={60} y1={108} x2={60} y2={190} />
      <line {...S} x1={60} y1={40} x2={170} y2={40} />
      <ResH x={170} y={40} c="var(--accent-2)" />
      <line {...S} x1={230} y1={40} x2={330} y2={40} />
      <line {...S} x1={330} y1={40} x2={330} y2={95} />
      <LedV x={330} y={95} />
      <line {...S} x1={330} y1={111} x2={330} y2={190} />
      <line {...S} x1={60} y1={190} x2={330} y2={190} />
      <T x={28} y={104} c="var(--text)">5 V</T>
      <T x={200} y={24} c="var(--accent-2)">R = 330 Ω</T>
      <T x={200} y={66} size={11}>V_R ≈ 3.0 V</T>
      <T x={378} y={100} size={11}>V_LED</T>
      <T x={378} y={114} size={11}>≈ 2.0 V</T>
      <T x={195} y={212} c="var(--accent)" mono>I = 3.0 V / 330 Ω ≈ 9 mA</T>
      <path d="M 110 52 l 30 0" stroke="var(--accent)" strokeWidth={2} className="flow" />
      <polygon points="140,48 148,52 140,56" fill="var(--accent)" />
    </Frame>
  ),
  'ohm-triangle': () => (
    <Frame w={300} h={200} title="Ohm's law triangle">
      <polygon points="150,20 270,180 30,180" fill="none" stroke="var(--accent)" strokeWidth={2} />
      <line {...S} x1={90} y1={100} x2={210} y2={100} />
      <line {...S} x1={150} y1={100} x2={150} y2={180} />
      <T x={150} y={78} size={26} c="var(--text)">V</T>
      <T x={105} y={150} size={24} c="var(--text)">I</T>
      <T x={195} y={150} size={24} c="var(--text)">R</T>
      <T x={150} y={198} size={11}>Cover the quantity you want</T>
    </Frame>
  ),
  'series-parallel': () => (
    <Frame w={520} h={220} title="Series and parallel resistor networks">
      <T x={120} y={22} c="var(--text)">Series</T>
      <line {...S} x1={20} y1={60} x2={40} y2={60} />
      <ResH x={40} y={60} />
      <ResH x={100} y={60} />
      <ResH x={160} y={60} />
      <line {...S} x1={220} y1={60} x2={240} y2={60} />
      <T x={70} y={86} size={11}>R1</T><T x={130} y={86} size={11}>R2</T><T x={190} y={86} size={11}>R3</T>
      <T x={130} y={120} size={12} c="var(--accent)" mono>R = R1 + R2 + R3</T>
      <T x={130} y={140} size={11}>same current · voltages add</T>
      <T x={390} y={22} c="var(--text)">Parallel</T>
      <line {...S} x1={300} y1={100} x2={330} y2={100} />
      <line {...S} x1={330} y1={50} x2={330} y2={150} />
      <line {...S} x1={460} y1={50} x2={460} y2={150} />
      <line {...S} x1={460} y1={100} x2={490} y2={100} />
      {[50, 100, 150].map((y) => (
        <g key={y}>
          <line {...S} x1={330} y1={y} x2={365} y2={y} />
          <ResH x={365} y={y} />
          <line {...S} x1={425} y1={y} x2={460} y2={y} />
        </g>
      ))}
      <T x={395} y={185} size={12} c="var(--accent)" mono>1/R = 1/R1 + 1/R2 + 1/R3</T>
      <T x={395} y={205} size={11}>same voltage · currents add</T>
    </Frame>
  ),
  'voltage-divider': () => (
    <Frame w={300} h={240} title="Voltage divider">
      <T x={80} y={24} c="var(--text)">V_in</T>
      <line {...S} x1={80} y1={30} x2={80} y2={50} />
      <ResV x={80} y={50} />
      <line {...S} x1={80} y1={110} x2={80} y2={130} />
      <ResV x={80} y={130} />
      <line {...S} x1={80} y1={190} x2={80} y2={205} />
      <Gnd x={80} y={205} />
      <line {...A} x1={80} y1={120} x2={170} y2={120} />
      <circle cx={170} cy={120} r={4} fill="var(--accent)" />
      <T x={110} y={84} size={11} anchor="start">R1</T><T x={110} y={164} size={11} anchor="start">R2</T>
      <T x={180} y={124} c="var(--accent)" anchor="start">V_out</T>
      <T x={150} y={232} size={12} c="var(--accent)" mono>V_out = V_in·R2/(R1+R2)</T>
    </Frame>
  ),
  'pullup-button': () => (
    <Frame w={360} h={240} title="Button with pull-up resistor">
      <T x={90} y={24} c="var(--text)">5 V</T>
      <line {...S} x1={90} y1={30} x2={90} y2={45} />
      <ResV x={90} y={45} />
      <T x={115} y={80} size={11} anchor="start">10 kΩ pull-up</T>
      <line {...S} x1={90} y1={105} x2={90} y2={130} />
      <line {...A} x1={90} y1={120} x2={240} y2={120} />
      <rect x={240} y={105} width={80} height={30} rx={6} fill="var(--panel-2)" stroke="var(--accent)" />
      <T x={280} y={125} c="var(--accent)">GPIO in</T>
      <line {...S} x1={90} y1={130} x2={90} y2={150} />
      <circle cx={90} cy={150} r={3} fill="var(--text-2)" />
      <line {...S} x1={90} y1={150} x2={115} y2={140} />
      <circle cx={90} cy={178} r={3} fill="var(--text-2)" />
      <line {...S} x1={90} y1={178} x2={90} y2={200} />
      <Gnd x={90} y={200} />
      <T x={140} y={165} size={11} anchor="start">Button</T>
      <T x={180} y={228} size={11}>Released → HIGH · Pressed → LOW</T>
    </Frame>
  ),
  'mosfet-switch': () => (
    <Frame w={360} h={250} title="Low-side MOSFET motor switch with flyback diode">
      <T x={200} y={20} c="var(--text)">V_motor</T>
      <line {...S} x1={200} y1={26} x2={200} y2={50} />
      <circle cx={200} cy={75} r={22} {...S} />
      <T x={200} y={80} c="var(--text)">M</T>
      <line {...S} x1={200} y1={97} x2={200} y2={140} />
      <line {...A} x1={260} y1={50} x2={260} y2={110} />
      <line {...A} x1={200} y1={50} x2={260} y2={50} /><line {...A} x1={200} y1={110} x2={260} y2={110} />
      <polygon points="250,90 270,90 260,72" fill="none" stroke="var(--accent)" strokeWidth={2} />
      <line {...A} x1={250} y1={72} x2={270} y2={72} />
      <T x={285} y={84} size={11} anchor="start" c="var(--accent)">flyback</T>
      <line {...S} x1={190} y1={140} x2={190} y2={180} strokeWidth={3} />
      <line {...S} x1={200} y1={140} x2={200} y2={150} /><line {...S} x1={200} y1={170} x2={200} y2={180} />
      <line {...S} x1={196} y1={145} x2={200} y2={145} /><line {...S} x1={196} y1={175} x2={200} y2={175} />
      <line {...S} x1={182} y1={145} x2={182} y2={175} />
      <line {...S} x1={200} y1={180} x2={200} y2={210} />
      <Gnd x={200} y={210} />
      <line {...S} x1={60} y1={160} x2={100} y2={160} />
      <ResH x={100} y={160} />
      <line {...S} x1={160} y1={160} x2={182} y2={160} />
      <T x={40} y={164} size={11}>GPIO</T>
      <T x={130} y={148} size={11}>gate R</T>
      <ResV x={170} y={160} c="var(--text-3)" />
      <T x={150} y={238} size={11}>pull-down keeps the MOSFET off at reset</T>
    </Frame>
  ),
  'binary-byte': () => (
    <Frame w={520} h={170} title="Bit positions and weights in one byte">
      {[7, 6, 5, 4, 3, 2, 1, 0].map((b, i) => {
        const val = [0, 0, 1, 0, 1, 1, 0, 1][i];
        return (
          <g key={b}>
            <rect x={20 + i * 60} y={50} width={52} height={52} rx={8} fill={val ? 'var(--accent)' : 'var(--panel-2)'} fillOpacity={val ? 0.18 : 1} stroke={val ? 'var(--accent)' : 'var(--line-strong)'} />
            <T x={46 + i * 60} y={84} size={22} c={val ? 'var(--accent)' : 'var(--text-3)'} mono>{val}</T>
            <T x={46 + i * 60} y={40} size={11}>bit {b}</T>
            <T x={46 + i * 60} y={120} size={12} c="var(--text)" mono>{2 ** b}</T>
          </g>
        );
      })}
      <rect x={16} y={132} width={236} height={22} rx={6} fill="none" stroke="var(--accent-3)" strokeDasharray="4 3" />
      <rect x={256} y={132} width={236} height={22} rx={6} fill="none" stroke="var(--accent-3)" strokeDasharray="4 3" />
      <T x={134} y={148} size={12} c="var(--accent-3)" mono>0010 → 0x2</T>
      <T x={374} y={148} size={12} c="var(--accent-3)" mono>1101 → 0xD</T>
      <T x={260} y={20} size={12} c="var(--text)" mono>0010 1101 = 32+8+4+1 = 45 = 0x2D</T>
    </Frame>
  ),
  'c-types': () => (
    <Frame w={520} h={200} title="Sizes of exact-width C integer types">
      {[
        ['uint8_t', 1, '0 … 255'],
        ['int16_t', 2, '−32768 … 32767'],
        ['uint16_t', 2, '0 … 65535'],
        ['uint32_t', 4, '0 … 4.29 × 10⁹'],
      ].map(([name, bytes, range], r) => (
        <g key={String(name)}>
          <T x={10} y={42 + r * 42} anchor="start" c="var(--accent-3)" mono>{name}</T>
          {Array.from({ length: Number(bytes) }).map((_, i) => (
            <rect key={i} x={110 + i * 56} y={22 + r * 42} width={52} height={28} rx={5} fill="var(--accent)" fillOpacity={0.12} stroke="var(--accent)" />
          ))}
          <T x={360} y={42 + r * 42} anchor="start" size={12}>{range}</T>
        </g>
      ))}
      <T x={260} y={194} size={11}>each box = one byte (8 bits)</T>
    </Frame>
  ),
  'loop-flow': () => (
    <Frame w={420} h={260} title="Flowchart of a for loop">
      <rect x={140} y={10} width={140} height={32} rx={8} fill="var(--panel-2)" stroke="var(--line-strong)" />
      <T x={210} y={31} mono size={12}>i = 0</T>
      <line {...S} x1={210} y1={42} x2={210} y2={62} />
      <polygon points="210,62 290,95 210,128 130,95" fill="var(--panel-2)" stroke="var(--accent)" strokeWidth={2} />
      <T x={210} y={99} mono size={12} c="var(--accent)">i &lt; n ?</T>
      <line {...S} x1={210} y1={128} x2={210} y2={150} />
      <T x={222} y={143} size={11} anchor="start" c="var(--good)">true</T>
      <rect x={140} y={150} width={140} height={32} rx={8} fill="var(--panel-2)" stroke="var(--line-strong)" />
      <T x={210} y={171} size={12}>body</T>
      <line {...S} x1={210} y1={182} x2={210} y2={202} />
      <rect x={140} y={202} width={140} height={32} rx={8} fill="var(--panel-2)" stroke="var(--line-strong)" />
      <T x={210} y={223} mono size={12}>i++</T>
      <polyline {...S} points="140,218 90,218 90,95 130,95" />
      <line {...S} x1={290} y1={95} x2={360} y2={95} />
      <T x={325} y={88} size={11} c="var(--bad)">false</T>
      <T x={385} y={99} size={12}>exit</T>
    </Frame>
  ),
  'pointer-memory': () => (
    <Frame w={520} h={200} title="A pointer holding the address of a variable">
      <T x={140} y={28} c="var(--text)" mono>int q = 5;</T>
      <rect x={70} y={45} width={140} height={60} rx={10} fill="var(--panel-2)" stroke="var(--accent-2)" strokeWidth={2} />
      <T x={140} y={83} size={26} c="var(--text)" mono>5</T>
      <T x={140} y={125} size={12} mono c="var(--accent-2)">address 0x2000</T>
      <T x={380} y={28} c="var(--text)" mono>int *p = &amp;q;</T>
      <rect x={310} y={45} width={140} height={60} rx={10} fill="var(--panel-2)" stroke="var(--accent)" strokeWidth={2} />
      <T x={380} y={82} size={18} c="var(--accent)" mono>0x2000</T>
      <T x={380} y={125} size={12} mono>address 0x2010</T>
      <path d="M 310 75 C 270 75 250 75 214 75" stroke="var(--accent)" strokeWidth={2} fill="none" className="flow" />
      <polygon points="214,70 206,75 214,80" fill="var(--accent)" />
      <T x={260} y={165} size={13} c="var(--text)" mono>*p = 6;  →  q becomes 6</T>
      <T x={260} y={187} size={11}>p is *where*; *p is *what's there*</T>
    </Frame>
  ),
  'gpio-pin': () => (
    <Frame w={480} h={240} title="Arduino Uno driving an LED and reading a button">
      <rect x={170} y={30} width={140} height={180} rx={12} fill="var(--panel-2)" stroke="var(--line-strong)" />
      <T x={240} y={58} c="var(--text)">Arduino Uno</T>
      <T x={240} y={76} size={11} mono>ATmega328P</T>
      <T x={300} y={110} size={11} anchor="end" mono>D13 (PB5)</T>
      <T x={180} y={170} size={11} anchor="start" mono>D2 (PD2)</T>
      <line {...A} x1={310} y1={106} x2={340} y2={106} />
      <ResH x={340} y={106} />
      <line {...S} x1={400} y1={106} x2={420} y2={106} />
      <g transform="translate(420 106) rotate(-90)"><LedV x={0} y={0} /></g>
      <line {...S} x1={440} y1={106} x2={455} y2={106} /><line {...S} x1={455} y1={106} x2={455} y2={190} />
      <Gnd x={455} y={190} />
      <T x={370} y={94} size={11}>330 Ω</T>
      <T x={390} y={140} size={11} c="var(--accent)">OUTPUT</T>
      <line {...A} x1={170} y1={166} x2={130} y2={166} />
      <circle cx={130} cy={166} r={3} fill="var(--text-2)" />
      <line {...S} x1={130} y1={166} x2={105} y2={156} />
      <circle cx={100} cy={166} r={3} fill="var(--text-2)" />
      <line {...S} x1={100} y1={166} x2={60} y2={166} /><line {...S} x1={60} y1={166} x2={60} y2={190} />
      <Gnd x={60} y={190} />
      <T x={115} y={146} size={11}>button</T>
      <T x={110} y={222} size={11} c="var(--accent)">INPUT_PULLUP (internal ≈ 20–50 kΩ)</T>
    </Frame>
  ),
  'esp32-block': () => (
    <Frame w={520} h={260} title="ESP32 block diagram">
      <rect x={130} y={20} width={260} height={220} rx={14} fill="var(--panel-2)" stroke="var(--accent)" strokeWidth={1.5} />
      <T x={260} y={44} c="var(--text)">ESP32</T>
      {[['Xtensa core 0', 150, 60], ['Xtensa core 1', 265, 60], ['~520 KB SRAM', 150, 110], ['Flash (SPI, ~4 MB)', 265, 110], ['Wi-Fi 2.4 GHz', 150, 160], ['Bluetooth / BLE', 265, 160]].map(([l, x, y]) => (
        <g key={String(l)}>
          <rect x={Number(x)} y={Number(y)} width={105} height={36} rx={8} fill="var(--panel)" stroke="var(--line-strong)" />
          <T x={Number(x) + 52} y={Number(y) + 22} size={11}>{l}</T>
        </g>
      ))}
      <T x={260} y={222} size={11} c="var(--accent)">FreeRTOS runs setup()/loop() as a task</T>
      {['GPIO', 'ADC1/ADC2', 'LEDC PWM', 'UART'].map((p, i) => (
        <g key={p}>
          <rect x={10} y={40 + i * 48} width={100} height={30} rx={7} fill="var(--panel)" stroke="var(--accent-2)" />
          <T x={60} y={60 + i * 48} size={11} c="var(--accent-2)">{p}</T>
          <line {...S} stroke="var(--accent-2)" x1={110} y1={55 + i * 48} x2={130} y2={55 + i * 48} />
        </g>
      ))}
      {['I2C', 'SPI', 'Timers', 'Touch / DAC'].map((p, i) => (
        <g key={p}>
          <rect x={410} y={40 + i * 48} width={100} height={30} rx={7} fill="var(--panel)" stroke="var(--accent-3)" />
          <T x={460} y={60 + i * 48} size={11} c="var(--accent-3)">{p}</T>
          <line {...S} stroke="var(--accent-3)" x1={390} y1={55 + i * 48} x2={410} y2={55 + i * 48} />
        </g>
      ))}
    </Frame>
  ),
  'i2c-bus': () => (
    <Frame w={520} h={220} title="I2C bus with three sensors and pull-ups">
      <line {...A} x1={30} y1={70} x2={500} y2={70} /><T x={20} y={66} size={11} anchor="start" c="var(--accent)">SDA</T>
      <line {...S} stroke="var(--accent-3)" x1={30} y1={100} x2={500} y2={100} /><T x={20} y={118} size={11} anchor="start" c="var(--accent-3)">SCL</T>
      <ResV x={70} y={10} /><ResV x={100} y={40} c="var(--accent-3)" />
      <T x={86} y={20} size={10} anchor="start">4.7 kΩ to 3.3 V</T>
      {[['ESP32', 'controller'], ['MPU6050', '0x68'], ['BME280', '0x76'], ['SCD40', '0x62']].map(([n, a], i) => (
        <g key={n}>
          <line {...A} x1={150 + i * 95} y1={70} x2={150 + i * 95} y2={150} />
          <line {...S} stroke="var(--accent-3)" x1={170 + i * 95} y1={100} x2={170 + i * 95} y2={150} />
          <rect x={125 + i * 95} y={150} width={70} height={46} rx={8} fill="var(--panel-2)" stroke="var(--line-strong)" />
          <T x={160 + i * 95} y={170} size={11} c="var(--text)">{n}</T>
          <T x={160 + i * 95} y={186} size={10} mono>{a}</T>
        </g>
      ))}
    </Frame>
  ),
  'state-machine': () => (
    <Frame w={520} h={260} title="Robot state machine">
      {[['IDLE', 80, 130], ['DRIVING', 260, 130], ['SAMPLING', 440, 60], ['AVOIDING', 440, 200]].map(([n, x, y]) => (
        <g key={String(n)}>
          <rect x={Number(x) - 55} y={Number(y) - 20} width={110} height={40} rx={20} fill="var(--panel-2)" stroke={n === 'DRIVING' ? 'var(--accent)' : 'var(--line-strong)'} strokeWidth={2} />
          <T x={Number(x)} y={Number(y) + 5} size={12} c="var(--text)" mono>{n}</T>
        </g>
      ))}
      <line {...A} x1={135} y1={130} x2={203} y2={130} /><polygon points="203,125 211,130 203,135" fill="var(--accent)" />
      <T x={170} y={120} size={10}>START</T>
      <path d="M 300 112 Q 340 70 385 62" {...S} /><T x={330} y={74} size={10}>AT_POINT</T>
      <path d="M 400 80 Q 360 120 315 128" {...S} strokeDasharray="4 3" /><T x={372} y={118} size={10}>SAMPLE_DONE</T>
      <path d="M 300 148 Q 340 190 385 198" {...S} /><T x={330} y={196} size={10}>OBSTACLE</T>
      <path d="M 400 180 Q 360 150 318 140" {...S} strokeDasharray="4 3" /><T x={378} y={160} size={10}>PATH_CLEAR</T>
      <T x={260} y={250} size={11} c="var(--bad)">STOP from any state → IDLE</T>
    </Frame>
  ),
  'memory-layout': () => (
    <Frame w={360} h={300} title="Microcontroller memory layout">
      {[['.text (code, const) — flash', 'var(--accent-3)', 230, 50], ['.data (initialised globals)', 'var(--accent-2)', 190, 40], ['.bss (zeroed globals)', 'var(--accent-2)', 150, 40], ['heap ↑ (malloc)', 'var(--warn)', 110, 40], ['… free …', 'var(--line-strong)', 60, 50], ['stack ↓ (locals, returns)', 'var(--accent)', 20, 40]].map(([l, c, y, h]) => (
        <g key={String(l)}>
          <rect x={60} y={Number(y)} width={240} height={Number(h)} fill={String(c)} fillOpacity={0.1} stroke={String(c)} />
          <T x={180} y={Number(y) + Number(h) / 2 + 4} size={11} c="var(--text)">{l}</T>
        </g>
      ))}
      <T x={30} y={30} size={10} mono anchor="start">high</T>
      <T x={30} y={290} size={10} mono anchor="start">low</T>
    </Frame>
  ),
  'pid-loop': () => (
    <Frame w={560} h={200} title="Closed-loop wheel speed control">
      <circle cx={70} cy={80} r={16} {...S} /><T x={70} y={85} c="var(--text)">Σ</T>
      <T x={20} y={70} size={11}>target</T>
      <line {...S} x1={10} y1={80} x2={54} y2={80} />
      <line {...A} x1={86} y1={80} x2={130} y2={80} /><T x={108} y={72} size={10} c="var(--accent)">error</T>
      {[['PID', 130], ['Driver', 250], ['Motor', 370]].map(([n, x]) => (
        <g key={String(n)}>
          <rect x={Number(x)} y={60} width={90} height={40} rx={8} fill="var(--panel-2)" stroke="var(--accent)" />
          <T x={Number(x) + 45} y={85} c="var(--text)">{n}</T>
        </g>
      ))}
      <line {...S} x1={220} y1={80} x2={250} y2={80} /><T x={235} y={72} size={10}>PWM</T>
      <line {...S} x1={340} y1={80} x2={370} y2={80} />
      <line {...S} x1={460} y1={80} x2={540} y2={80} /><T x={505} y={72} size={10}>speed</T>
      <polyline {...S} stroke="var(--accent-3)" points="500,80 500,150 70,150 70,96" />
      <rect x={240} y={135} width={100} height={30} rx={8} fill="var(--panel-2)" stroke="var(--accent-3)" />
      <T x={290} y={155} size={11} c="var(--accent-3)">Encoder</T>
      <T x={62} y={115} size={11} c="var(--accent-3)">−</T>
    </Frame>
  ),
  'robot-top': () => (
    <Frame w={420} h={300} title="Top view of the air-quality robot">
      <rect x={110} y={40} width={200} height={220} rx={30} fill="var(--panel-2)" stroke="var(--accent)" strokeWidth={1.5} />
      <rect x={80} y={110} width={30} height={70} rx={6} fill="var(--line-strong)" /><rect x={310} y={110} width={30} height={70} rx={6} fill="var(--line-strong)" />
      <T x={95} y={200} size={10}>L wheel</T><T x={325} y={200} size={10}>R wheel</T>
      {[['ESP32', 160, 80], ['TB6612', 250, 80], ['SCD40', 160, 210], ['BME280', 250, 210], ['MPU6050', 210, 145], ['2S battery', 210, 175]].map(([n, x, y]) => (
        <g key={String(n)}>
          <rect x={Number(x) - 36} y={Number(y) - 13} width={72} height={24} rx={6} fill="var(--panel)" stroke="var(--line-strong)" />
          <T x={Number(x)} y={Number(y) + 4} size={10} c="var(--text)">{n}</T>
        </g>
      ))}
      <rect x={185} y={26} width={50} height={18} rx={4} fill="var(--accent)" fillOpacity={0.2} stroke="var(--accent)" />
      <T x={210} y={20} size={10} c="var(--accent)">distance sensor</T>
    </Frame>
  ),
  'mcu-block': () => (
    <Frame w={460} h={220} title="Microcontroller block diagram">
      <rect x={20} y={20} width={420} height={180} rx={14} fill="var(--panel-2)" stroke="var(--line-strong)" />
      {[['CPU core', 40, 40], ['Flash', 160, 40], ['SRAM', 280, 40], ['GPIO', 40, 130], ['Timers', 140, 130], ['ADC', 240, 130], ['UART · I2C · SPI', 330, 130]].map(([n, x, y]) => (
        <g key={String(n)}>
          <rect x={Number(x)} y={Number(y)} width={n === 'UART · I2C · SPI' ? 100 : 90} height={40} rx={8} fill="var(--panel)" stroke="var(--accent)" />
          <T x={Number(x) + (n === 'UART · I2C · SPI' ? 50 : 45)} y={Number(y) + 25} size={11} c="var(--text)">{n}</T>
        </g>
      ))}
      <line {...A} x1={40} y1={105} x2={420} y2={105} />
      <T x={230} y={100} size={10} c="var(--accent)">bus — peripherals are controlled through registers</T>
    </Frame>
  ),
  'kvl-loop': () => (
    <Frame w={440} h={230} title="Kirchhoff's voltage and current laws on a series-parallel circuit">
      <line {...S} x1={60} y1={40} x2={60} y2={95} /><Battery x={60} y={100} /><line {...S} x1={60} y1={108} x2={60} y2={190} />
      <line {...S} x1={60} y1={40} x2={120} y2={40} /><ResH x={120} y={40} c="var(--accent-2)" />
      <line {...S} x1={180} y1={40} x2={240} y2={40} />
      <circle cx={240} cy={40} r={5} fill="var(--accent)" />
      <line {...S} x1={240} y1={40} x2={240} y2={70} /><ResV x={240} y={70} /><line {...S} x1={240} y1={130} x2={240} y2={190} />
      <line {...S} x1={240} y1={40} x2={340} y2={40} /><line {...S} x1={340} y1={40} x2={340} y2={70} /><ResV x={340} y={70} /><line {...S} x1={340} y1={130} x2={340} y2={190} />
      <line {...S} x1={60} y1={190} x2={340} y2={190} />
      <T x={28} y={104} c="var(--text)">9 V</T><T x={150} y={26} c="var(--accent-2)">R1 1 kΩ</T>
      <T x={270} y={104} size={11} anchor="start">R2 2 kΩ</T><T x={370} y={104} size={11} anchor="start">R3 2 kΩ</T>
      <T x={250} y={30} size={11} c="var(--accent)" anchor="start">node A: I_in = I2 + I3</T>
      <path d="M 95 70 A 40 40 0 1 1 95 160" fill="none" stroke="var(--accent-3)" strokeDasharray="4 3" />
      <T x={120} y={120} size={11} c="var(--accent-3)">loop: 9 − V_R1 − V_R2 = 0</T>
      <T x={220} y={215} size={11} c="var(--text-3)">KVL around any loop · KCL at any node</T>
    </Frame>
  ),
  'rc-charge': () => (
    <Frame w={460} h={200} title="RC charging curve with time constants">
      <line {...S} x1={40} y1={170} x2={440} y2={170} /><line {...S} x1={40} y1={20} x2={40} y2={170} />
      <path d={Array.from({ length: 81 }, (_, i) => { const t = i / 16; return `${i === 0 ? 'M' : 'L'} ${40 + i * 5} ${170 - 140 * (1 - Math.exp(-t))}`; }).join(' ')} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
      <line x1={40} y1={30} x2={440} y2={30} stroke="var(--text-3)" strokeDasharray="4 3" />
      {[1, 2, 3, 5].map((k) => (
        <g key={k}>
          <line x1={40 + k * 80} y1={170} x2={40 + k * 80} y2={170 - 140 * (1 - Math.exp(-k))} stroke="var(--accent-3)" strokeDasharray="3 3" />
          <T x={40 + k * 80} y={186} size={11}>{k}τ</T>
          <T x={44 + k * 80} y={162 - 140 * (1 - Math.exp(-k))} size={10} anchor="start" c="var(--accent-3)">{Math.round((1 - Math.exp(-k)) * 100)}%</T>
        </g>
      ))}
      <T x={36} y={34} size={10} anchor="end">V_s</T>
      <T x={250} y={14} size={11} c="var(--accent)" mono>V_C = V_s (1 − e^(−t/RC))</T>
    </Frame>
  ),
  rectifier: () => (
    <Frame w={480} h={200} title="Half-wave and full-wave rectified waveforms">
      {([['AC input', 40, (x: number) => Math.sin(x)], ['half-wave', 100, (x: number) => Math.max(0, Math.sin(x))], ['full-wave', 160, (x: number) => Math.abs(Math.sin(x))]] as [string, number, (x: number) => number][]).map(([label, y0, f]) => (
        <g key={String(label)}>
          <line x1={90} y1={Number(y0)} x2={470} y2={Number(y0)} stroke="var(--line-strong)" />
          <path d={Array.from({ length: 191 }, (_, i) => `${i === 0 ? 'M' : 'L'} ${90 + i * 2} ${Number(y0) - 24 * (f as (x: number) => number)(i / 15)}`).join(' ')} fill="none" stroke={label === 'AC input' ? 'var(--text-2)' : 'var(--accent)'} strokeWidth={2} />
          <T x={80} y={Number(y0) + 4} size={11} anchor="end">{label}</T>
        </g>
      ))}
      <T x={280} y={194} size={11} c="var(--text-3)">a smoothing capacitor then fills the gaps → ripple DC</T>
    </Frame>
  ),
  'h-bridge': () => (
    <Frame w={420} h={240} title="H-bridge driving a motor forward">
      <line {...S} x1={80} y1={30} x2={340} y2={30} /><T x={210} y={22} c="var(--text)">V_motor</T>
      <line {...S} x1={80} y1={210} x2={340} y2={210} /><Gnd x={210} y={210} />
      {[[80, 'Q1', true], [340, 'Q2', false]].map(([x, n, on]) => <g key={String(n)}><line {...S} x1={Number(x)} y1={30} x2={Number(x)} y2={60} /><rect x={Number(x) - 18} y={60} width={36} height={36} rx={6} fill={on ? 'var(--accent)' : 'var(--panel-2)'} fillOpacity={on ? 0.2 : 1} stroke={on ? 'var(--accent)' : 'var(--line-strong)'} /><T x={Number(x)} y={83} size={11}>{n}</T></g>)}
      {[[80, 'Q3', false], [340, 'Q4', true]].map(([x, n, on]) => <g key={String(n)}><rect x={Number(x) - 18} y={144} width={36} height={36} rx={6} fill={on ? 'var(--accent)' : 'var(--panel-2)'} fillOpacity={on ? 0.2 : 1} stroke={on ? 'var(--accent)' : 'var(--line-strong)'} /><T x={Number(x)} y={167} size={11}>{n}</T><line {...S} x1={Number(x)} y1={180} x2={Number(x)} y2={210} /></g>)}
      <line {...S} x1={80} y1={96} x2={80} y2={144} /><line {...S} x1={340} y1={96} x2={340} y2={144} />
      <line {...S} x1={80} y1={120} x2={180} y2={120} /><line {...S} x1={240} y1={120} x2={340} y2={120} />
      <circle cx={210} cy={120} r={28} {...S} /><T x={210} y={125} c="var(--text)">M</T>
      <path d="M 80 98 L 80 120 L 182 120" fill="none" stroke="var(--accent)" strokeWidth={3} className="flow" />
      <path d="M 238 120 L 340 120 L 340 142" fill="none" stroke="var(--accent)" strokeWidth={3} className="flow" />
      <T x={210} y={234} size={11} c="var(--text-3)">Q1 + Q4 on → forward · Q2 + Q3 on → reverse · never Q1 + Q3 (shoot-through)</T>
    </Frame>
  ),
  'spi-bus': () => (
    <Frame w={500} h={220} title="SPI bus with one controller and two devices">
      <rect x={20} y={50} width={110} height={130} rx={10} fill="var(--panel-2)" stroke="var(--accent)" /><T x={75} y={70} c="var(--text)">Controller</T>
      {[['SCK', 95, 'var(--accent-3)'], ['MOSI', 115, 'var(--accent)'], ['MISO', 135, 'var(--accent-2)']].map(([n, y, c]) => (
        <g key={String(n)}><line x1={130} y1={Number(y)} x2={470} y2={Number(y)} stroke={String(c)} strokeWidth={2} /><T x={136} y={Number(y) - 4} size={10} anchor="start" c={String(c)}>{n}</T></g>
      ))}
      {[[260, 'CS1', 160], [400, 'CS2', 175]].map(([x, n, y]) => (
        <g key={String(n)}>
          <rect x={Number(x) - 45} y={30} width={90} height={44} rx={8} fill="var(--panel-2)" stroke="var(--line-strong)" />
          <T x={Number(x)} y={57} size={11} c="var(--text)">{n === 'CS1' ? 'Display' : 'SD card'}</T>
          {[95, 115, 135].map((yy) => <line key={yy} x1={Number(x) - 20 + (yy - 95) / 2} y1={74} x2={Number(x) - 20 + (yy - 95) / 2} y2={yy} stroke="var(--text-3)" />)}
          <polyline points={`130,${y} ${Number(x) + 25},${y} ${Number(x) + 25},74`} fill="none" stroke="var(--warn)" strokeWidth={2} />
          <T x={140} y={Number(y) + 13} size={10} anchor="start" c="var(--warn)">{n} (active LOW)</T>
        </g>
      ))}
      <T x={250} y={212} size={11} c="var(--text-3)">shared clock and data lines · one chip-select per device</T>
    </Frame>
  ),
  'diff-drive': () => (
    <Frame w={420} h={240} title="Differential drive kinematics">
      <g transform="translate(210 120) rotate(-20)">
        <rect x={-60} y={-45} width={120} height={90} rx={16} fill="var(--panel-2)" stroke="var(--accent)" />
        <rect x={-30} y={-60} width={60} height={14} rx={4} fill="var(--line-strong)" /><rect x={-30} y={46} width={60} height={14} rx={4} fill="var(--line-strong)" />
        <line x1={0} y1={-53} x2={70} y2={-53} stroke="var(--accent-2)" strokeWidth={3} /><polygon points="70,-58 80,-53 70,-48" fill="var(--accent-2)" />
        <line x1={0} y1={53} x2={45} y2={53} stroke="var(--accent-2)" strokeWidth={3} /><polygon points="45,48 55,53 45,58" fill="var(--accent-2)" />
        <line x1={0} y1={0} x2={95} y2={0} stroke="var(--accent)" strokeWidth={3} /><polygon points="95,-5 105,0 95,5" fill="var(--accent)" />
        <line x1={-75} y1={-53} x2={-75} y2={53} stroke="var(--text-3)" /><text x={-88} y={4} fill="var(--text-3)" fontSize={11}>L</text>
      </g>
      <T x={300} y={40} size={11} c="var(--accent-2)" anchor="start">v_R (faster)</T>
      <T x={250} y={200} size={11} c="var(--accent-2)" anchor="start">v_L</T>
      <T x={330} y={110} size={11} c="var(--accent)" anchor="start">v</T>
      <path d="M 120 60 A 70 70 0 0 0 110 170" fill="none" stroke="var(--accent-3)" strokeWidth={2} /><polygon points="104,166 110,178 116,166" fill="var(--accent-3)" />
      <T x={70} y={120} size={12} c="var(--accent-3)">ω</T>
      <T x={210} y={232} size={12} c="var(--accent)" mono>v = (vR+vL)/2   ω = (vR−vL)/L</T>
    </Frame>
  ),
  'gate-symbols': () => (
    <Frame w={520} h={170} title="Logic gate symbols">
      {[['AND', 'M 10 10 L 35 10 A 20 20 0 0 1 35 50 L 10 50 Z', false], ['OR', 'M 5 10 Q 20 30 5 50 Q 40 50 55 30 Q 40 10 5 10 Z', false], ['XOR', 'M 9 10 Q 24 30 9 50 Q 44 50 59 30 Q 44 10 9 10 Z', false], ['NOT', 'M 10 10 L 50 30 L 10 50 Z', true], ['NAND', 'M 10 10 L 35 10 A 20 20 0 0 1 35 50 L 10 50 Z', true], ['NOR', 'M 5 10 Q 20 30 5 50 Q 40 50 55 30 Q 40 10 5 10 Z', true]].map(([n, d, bubble], i) => (
        <g key={String(n)} transform={`translate(${15 + i * 84} 30)`}>
          <path d={String(d)} fill="var(--panel-2)" stroke="var(--accent)" strokeWidth={2} />
          {n === 'XOR' && <path d="M 2 10 Q 17 30 2 50" fill="none" stroke="var(--accent)" strokeWidth={2} />}
          {bubble && <circle cx={n === 'NOT' ? 55 : n === 'NAND' ? 60 : 60} cy={30} r={5} fill="var(--panel-2)" stroke="var(--accent)" strokeWidth={2} />}
          <T x={32} y={80} size={12} c="var(--text)" mono>{n}</T>
          <T x={32} y={100} size={10} mono>{{ AND: 'A·B', OR: 'A+B', XOR: 'A⊕B', NOT: '¬A', NAND: '¬(A·B)', NOR: '¬(A+B)' }[String(n)]}</T>
        </g>
      ))}
      <T x={260} y={160} size={11} c="var(--text-3)">a small circle (bubble) on the output means inversion</T>
    </Frame>
  ),
  'clock-wave': () => (
    <Frame w={500} h={170} title="Clock signal: period, frequency and duty cycle">
      <path d={Array.from({ length: 5 }, (_, i) => `M ${40 + i * 90} 120 L ${40 + i * 90} 40 L ${85 + i * 90} 40 L ${85 + i * 90} 120 L ${130 + i * 90} 120`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
      <line x1={40} y1={140} x2={130} y2={140} stroke="var(--accent-3)" /><T x={85} y={156} size={11} c="var(--accent-3)">period T</T>
      <line x1={40} y1={28} x2={85} y2={28} stroke="var(--accent-2)" /><T x={62} y={22} size={11} c="var(--accent-2)">t_high</T>
      {[0, 1, 2, 3, 4].map((i) => <polygon key={i} points={`${36 + i * 90},70 ${40 + i * 90},60 ${44 + i * 90},70`} fill="var(--warn)" />)}
      <T x={270} y={160} size={11} c="var(--text-3)">f = 1/T · duty = t_high / T · ▲ = rising edges, where flip-flops sample</T>
    </Frame>
  ),
  'open-closed': () => (
    <Frame w={540} h={220} title="Open-loop versus closed-loop control">
      <T x={20} y={24} anchor="start" c="var(--text)">Open loop</T>
      {[['Command', 20], ['Controller', 160], ['Motor', 300]].map(([n, x]) => <g key={String(n)}><rect x={Number(x)} y={36} width={110} height={36} rx={8} fill="var(--panel-2)" stroke="var(--line-strong)" /><T x={Number(x) + 55} y={59} size={12}>{n}</T></g>)}
      <line {...S} x1={130} y1={54} x2={160} y2={54} /><line {...S} x1={270} y1={54} x2={300} y2={54} /><line {...S} x1={410} y1={54} x2={460} y2={54} /><T x={490} y={58} size={11}>speed?</T>
      <T x={20} y={114} anchor="start" c="var(--text)">Closed loop</T>
      <circle cx={60} cy={162} r={14} {...S} /><T x={60} y={167}>Σ</T>
      {[['PID', 110], ['Driver', 230], ['Motor', 350]].map(([n, x]) => <g key={String(n)}><rect x={Number(x)} y={144} width={90} height={36} rx={8} fill="var(--panel-2)" stroke="var(--accent)" /><T x={Number(x) + 45} y={167} size={12}>{n}</T></g>)}
      <line {...A} x1={74} y1={162} x2={110} y2={162} /><line {...S} x1={200} y1={162} x2={230} y2={162} /><line {...S} x1={320} y1={162} x2={350} y2={162} /><line {...S} x1={440} y1={162} x2={500} y2={162} />
      <polyline points="470,162 470,205 60,205 60,176" fill="none" stroke="var(--accent-3)" strokeWidth={2} className="flow" /><T x={265} y={200} size={11} c="var(--accent-3)">encoder feedback</T>
    </Frame>
  ),
  quadrature: () => (
    <Frame w={500} h={170} title="Quadrature encoder signals A and B">
      {[['A', 50, 0], ['B', 110, 1]].map(([n, y, shift]) => (
        <g key={String(n)}>
          <T x={24} y={Number(y) - 4} c="var(--text)">{n}</T>
          <path d={Array.from({ length: 5 }, (_, i) => { const x = 40 + i * 88 + Number(shift) * 22; return `M ${x} ${y} L ${x} ${Number(y) - 30} L ${x + 44} ${Number(y) - 30} L ${x + 44} ${y} L ${x + 88} ${y}`; }).join(' ')} fill="none" stroke={n === 'A' ? 'var(--accent)' : 'var(--accent-2)'} strokeWidth={2.5} />
        </g>
      ))}
      {[0, 1, 2, 3].map((k) => <line key={k} x1={40 + k * 22} y1={10} x2={40 + k * 22} y2={130} stroke="var(--accent-3)" strokeDasharray="2 3" />)}
      <T x={84} y={146} size={10} c="var(--accent-3)">4 edges per cycle (x4)</T>
      <T x={300} y={160} size={11} c="var(--text-3)">forward: A leads B by 90° · reverse: B leads A</T>
    </Frame>
  ),
  'rtos-tasks': () => (
    <Frame w={520} h={200} title="FreeRTOS task layout">
      {[['Motor task', 'prio 3', 30], ['Sensor task', 'prio 2', 200], ['Wi-Fi task', 'prio 1', 370]].map(([n, p, x]) => (
        <g key={String(n)}>
          <rect x={Number(x)} y={40} width={120} height={50} rx={10} fill="var(--panel-2)" stroke="var(--accent)" />
          <T x={Number(x) + 60} y={62} c="var(--text)" size={12}>{n}</T>
          <T x={Number(x) + 60} y={80} size={10} mono>{p}</T>
        </g>
      ))}
      <rect x={300} y={130} width={110} height={36} rx={8} fill="var(--panel)" stroke="var(--accent-3)" />
      <T x={355} y={152} size={11} c="var(--accent-3)">air_queue</T>
      <path d="M 260 90 L 320 130" {...S} className="flow" stroke="var(--accent-3)" />
      <path d="M 390 130 L 430 90" {...S} className="flow" stroke="var(--accent-3)" />
      <T x={260} y={190} size={11}>Queues pass data safely; higher priority must still block.</T>
    </Frame>
  ),
};

export function Diagram({ id, caption }: { id: DiagramId; caption?: string }) {
  const render = diagrams[id];
  return (
    <figure className="my-2 overflow-hidden rounded-xl border border-line bg-bg-2 p-3 grid-bg">
      <div className="mx-auto max-w-[560px]">{render()}</div>
      {caption && <figcaption className="mt-2 text-center text-[13px] text-fg-3">{caption}</figcaption>}
    </figure>
  );
}
