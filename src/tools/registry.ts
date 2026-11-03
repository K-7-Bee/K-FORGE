import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { ToolId } from '../data/types';

export type ToolCategory = 'Electronics' | 'Digital systems' | 'Embedded systems' | 'Control systems';

export interface ToolDef {
  id: ToolId;
  title: string;
  category: ToolCategory;
  description: string;
  component: LazyExoticComponent<ComponentType>;
}

const el = (name: keyof typeof import('./electronics')) => lazy(() => import('./electronics').then((m) => ({ default: m[name] as ComponentType })));
const dg = (name: keyof typeof import('./digital')) => lazy(() => import('./digital').then((m) => ({ default: m[name] as ComponentType })));
const em = (name: keyof typeof import('./embedded')) => lazy(() => import('./embedded').then((m) => ({ default: m[name] as ComponentType })));
const ct = (name: keyof typeof import('./control')) => lazy(() => import('./control').then((m) => ({ default: m[name] as ComponentType })));

export const TOOLS: ToolDef[] = [
  { id: 'ohms-law', title: "Ohm's Law Calculator", category: 'Electronics', description: 'Solve for V, I or R and check power.', component: el('OhmsLawTool') },
  { id: 'voltage-divider', title: 'Voltage Divider', category: 'Electronics', description: 'Output voltage, current and loading effect.', component: el('VoltageDividerTool') },
  { id: 'resistor-color', title: 'Resistor Colour Code', category: 'Electronics', description: 'Decode 4- and 5-band resistors.', component: el('ResistorColorTool') },
  { id: 'series-parallel', title: 'Series & Parallel Resistors', category: 'Electronics', description: 'Equivalent resistance with per-resistor V, I, P.', component: el('SeriesParallelTool') },
  { id: 'power', title: 'Power Calculator', category: 'Electronics', description: 'V·I, I²R, V²/R and linear-regulator heat.', component: el('PowerTool') },
  { id: 'circuit-builder', title: 'Basic Circuit Builder', category: 'Electronics', description: 'Build parallel LED/resistor branches and see currents.', component: el('CircuitBuilderTool') },
  { id: 'base-converter', title: 'Binary / Decimal / Hex Converter', category: 'Digital systems', description: 'Convert and toggle individual bits.', component: dg('BaseConverterTool') },
  { id: 'logic-gates', title: 'Logic Gate Simulator', category: 'Digital systems', description: 'Toggle inputs and chain two gates.', component: dg('LogicGatesTool') },
  { id: 'truth-table', title: 'Truth Table Generator', category: 'Digital systems', description: 'Parse Boolean expressions and test equivalence.', component: dg('TruthTableTool') },
  { id: 'bitwise', title: 'Bitwise Operation Visualizer', category: 'Digital systems', description: 'AND, OR, XOR, NOT and shifts bit by bit.', component: dg('BitwiseTool') },
  { id: 'pwm', title: 'PWM Simulator', category: 'Embedded systems', description: 'Duty cycle, frequency and average voltage.', component: em('PwmTool') },
  { id: 'adc', title: 'ADC Value Visualizer', category: 'Embedded systems', description: 'Resolution, reference and quantisation.', component: em('AdcTool') },
  { id: 'uart', title: 'UART Communication Visualizer', category: 'Embedded systems', description: 'Frames, start/stop bits and baud timing.', component: em('UartTool') },
  { id: 'i2c', title: 'I2C Communication Demonstration', category: 'Embedded systems', description: 'Address, R/W, ACK/NACK on SDA/SCL.', component: em('I2cTool') },
  { id: 'spi', title: 'SPI Communication Demonstration', category: 'Embedded systems', description: 'Modes 0–3 with MOSI/MISO/SCK/CS.', component: em('SpiTool') },
  { id: 'interrupts', title: 'Interrupt Timeline', category: 'Embedded systems', description: 'Polling with delay vs non-blocking vs ISR.', component: em('InterruptTool') },
  { id: 'memory-layout', title: 'Memory Layout Visualizer', category: 'Embedded systems', description: 'Stack, heap, .data, .bss and collisions.', component: em('MemoryLayoutTool') },
  { id: 'pid', title: 'PID Controller Simulator', category: 'Control systems', description: 'Tune gains; measure rise, overshoot, settling.', component: ct('PidTool') },
  { id: 'motor-speed', title: 'Motor Speed Visualization', category: 'Control systems', description: 'PWM, battery voltage, load and dead-band.', component: ct('MotorSpeedTool') },
  { id: 'feedback-loop', title: 'Feedback Loop Visualization', category: 'Control systems', description: 'Watch error, output and disturbance live.', component: ct('FeedbackLoopTool') },
  { id: 'encoder', title: 'Encoder Pulse Counter', category: 'Control systems', description: 'Quadrature A/B, counts and speed resolution.', component: ct('EncoderTool') },
];

export function getTool(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}
