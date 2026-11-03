/// <reference types="node" />
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { EXERCISES } from '../src/data/lab';
import type { CodeExercise } from '../src/data/types';
import { normalizeOutput } from '../src/engine/grading';

// Compiles every coding exercise's reference solution and starter with the local toolchain and runs
// its tests: the solution must pass all of them (and compile without warnings), the starter must
// compile and fail at least one. Languages whose toolchain is missing are skipped, not failed.

const WIN = process.platform === 'win32';
const has = (cmd: string, args = ['--version']) => spawnSync(cmd, args, { stdio: 'ignore' }).status === 0;
const PYTHON = ['python3', 'python'].find((p) => has(p));
const AVAILABLE = { c: has('gcc'), cpp: has('g++'), python: Boolean(PYTHON) };

const dir = mkdtempSync(join(tmpdir(), 'kforge-lab-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function run(cmd: string, args: string[], stdin = ''): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => p.kill(), 10_000);
    p.stdout.on('data', (d) => (stdout += d));
    p.stderr.on('data', (d) => (stderr += d));
    p.on('error', reject);
    p.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
    p.stdin.end(stdin);
  });
}

/** Builds the program and returns the command that runs it, plus any compiler warnings. */
async function build(ex: CodeExercise, code: string, tag: string): Promise<{ cmd: string; args: string[]; warnings: string }> {
  const base = join(dir, `${ex.id}-${tag}`);
  if (ex.language === 'python') {
    writeFileSync(`${base}.py`, code);
    return { cmd: PYTHON!, args: ['-I', `${base}.py`], warnings: '' };
  }
  const file = `${base}.${ex.language === 'cpp' ? 'cpp' : 'c'}`;
  const exe = WIN ? `${base}.exe` : base;
  writeFileSync(file, code);
  const flags = ex.language === 'cpp' ? ['-std=c++14'] : ['-std=c11'];
  if (WIN) flags.push('-D__USE_MINGW_ANSI_STDIO=1');
  const r = await run(ex.language === 'cpp' ? 'g++' : 'gcc', [...flags, '-Wall', '-Wextra', '-O1', file, '-o', exe]);
  if (r.code !== 0) throw new Error(`${ex.id} (${tag}) does not compile:\n${r.stderr}`);
  return { cmd: exe, args: [], warnings: r.stderr.trim() };
}

async function results(ex: CodeExercise, code: string, tag: string) {
  const prog = await build(ex, code, tag);
  const out: { label: string; pass: boolean; got: string }[] = [];
  for (const t of ex.tests) {
    const r = await run(prog.cmd, prog.args, t.stdin);
    out.push({ label: t.label, pass: r.code === 0 && normalizeOutput(r.stdout) === normalizeOutput(t.expected), got: r.stdout + r.stderr });
  }
  return { out, warnings: prog.warnings };
}

const CODE = EXERCISES.filter((e): e is CodeExercise => e.kind === 'code');

describe('coding exercises against a real compiler', () => {
  for (const ex of CODE) {
    it.skipIf(!AVAILABLE[ex.language]).concurrent(`${ex.id} (${ex.language})`, async () => {
      const solution = await results(ex, ex.solution, 'solution');
      for (const r of solution.out) expect(r.pass, `${ex.id} solution fails "${r.label}", got:\n${r.got}`).toBe(true);
      expect(solution.warnings, `${ex.id} solution has compiler warnings`).toBe('');
      const starter = await results(ex, ex.starter, 'starter');
      expect(starter.out.some((r) => !r.pass), `${ex.id} starter already passes every test`).toBe(true);
    }, 60_000);
  }
});

describe('coding exercise content', () => {
  it('every coding exercise has visible and hidden tests and a starter that differs from the solution', () => {
    for (const ex of CODE) {
      expect(ex.tests.some((t) => !t.hidden), `${ex.id} visible test`).toBe(true);
      expect(ex.tests.length, `${ex.id} test count`).toBeGreaterThanOrEqual(2);
      expect(ex.starter.trim(), `${ex.id} starter`).not.toBe(ex.solution.trim());
    }
    expect(CODE.length).toBeGreaterThanOrEqual(40);
  });
});
