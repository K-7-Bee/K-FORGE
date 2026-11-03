// Boolean expression parser for the truth table generator.
// Grammar (lowest → highest precedence):  OR (| + OR) → XOR (^ XOR) → AND (& * · AND) → NOT (! ~ NOT ¬, postfix ') → atom
// Variables are single letters A–Z (case-insensitive); constants 0 and 1. NAND/NOR are supported as binary operators at AND/OR level.

export type Expr =
  | { t: 'var'; name: string }
  | { t: 'const'; v: boolean }
  | { t: 'not'; e: Expr }
  | { t: 'bin'; op: 'and' | 'or' | 'xor' | 'nand' | 'nor'; l: Expr; r: Expr };

type Tok = { k: 'var'; v: string } | { k: 'const'; v: boolean } | { k: 'op'; v: string } | { k: 'lp' } | { k: 'rp' } | { k: 'post' };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    const word = src.slice(i).match(/^(NAND|NOR|XOR|AND|OR|NOT)\b/i);
    if (word) { out.push({ k: 'op', v: word[1].toLowerCase() }); i += word[1].length; continue; }
    if (/[A-Za-z]/.test(c)) { out.push({ k: 'var', v: c.toUpperCase() }); i++; continue; }
    if (c === '0' || c === '1') { out.push({ k: 'const', v: c === '1' }); i++; continue; }
    if (c === '(') { out.push({ k: 'lp' }); i++; continue; }
    if (c === ')') { out.push({ k: 'rp' }); i++; continue; }
    if (c === "'") { out.push({ k: 'post' }); i++; continue; }
    if (c === '&' && src[i + 1] === '&') { out.push({ k: 'op', v: 'and' }); i += 2; continue; }
    if (c === '|' && src[i + 1] === '|') { out.push({ k: 'op', v: 'or' }); i += 2; continue; }
    const sym: Record<string, string> = { '&': 'and', '*': 'and', '·': 'and', '|': 'or', '+': 'or', '^': 'xor', '!': 'not', '~': 'not', '¬': 'not' };
    if (sym[c]) { out.push({ k: 'op', v: sym[c] }); i++; continue; }
    throw new Error(`Unexpected character "${c}" at position ${i + 1}`);
  }
  return out;
}

export function parseExpr(src: string): Expr {
  const toks = tokenize(src);
  if (toks.length === 0) throw new Error('Enter an expression, e.g. A & !B');
  let p = 0;
  const peek = () => toks[p];
  const isOp = (...ops: string[]) => { const t = peek(); return t?.k === 'op' && ops.includes(t.v); };

  function parseOr(): Expr {
    let l = parseXor();
    while (isOp('or', 'nor')) { const op = (toks[p++] as { v: string }).v as 'or' | 'nor'; l = { t: 'bin', op, l, r: parseXor() }; }
    return l;
  }
  function parseXor(): Expr {
    let l = parseAnd();
    while (isOp('xor')) { p++; l = { t: 'bin', op: 'xor', l, r: parseAnd() }; }
    return l;
  }
  function parseAnd(): Expr {
    let l = parseNot();
    while (isOp('and', 'nand')) { const op = (toks[p++] as { v: string }).v as 'and' | 'nand'; l = { t: 'bin', op, l, r: parseNot() }; }
    return l;
  }
  function parseNot(): Expr {
    if (isOp('not')) { p++; return { t: 'not', e: parseNot() }; }
    let e = parseAtom();
    while (peek()?.k === 'post') { p++; e = { t: 'not', e }; }
    return e;
  }
  function parseAtom(): Expr {
    const t = toks[p++];
    if (!t) throw new Error('Expression ends unexpectedly');
    if (t.k === 'var') return { t: 'var', name: t.v };
    if (t.k === 'const') return { t: 'const', v: t.v };
    if (t.k === 'lp') {
      const e = parseOr();
      if (toks[p++]?.k !== 'rp') throw new Error('Missing closing parenthesis');
      return e;
    }
    throw new Error('Expected a variable, constant or "("');
  }

  const e = parseOr();
  if (p < toks.length) throw new Error('Unexpected token after end of expression');
  return e;
}

export function variables(e: Expr, acc = new Set<string>()): string[] {
  if (e.t === 'var') acc.add(e.name);
  else if (e.t === 'not') variables(e.e, acc);
  else if (e.t === 'bin') { variables(e.l, acc); variables(e.r, acc); }
  return [...acc].sort();
}

export function evaluate(e: Expr, env: Record<string, boolean>): boolean {
  switch (e.t) {
    case 'var': return Boolean(env[e.name]);
    case 'const': return e.v;
    case 'not': return !evaluate(e.e, env);
    case 'bin': {
      const l = evaluate(e.l, env);
      const r = evaluate(e.r, env);
      switch (e.op) {
        case 'and': return l && r;
        case 'or': return l || r;
        case 'xor': return l !== r;
        case 'nand': return !(l && r);
        case 'nor': return !(l || r);
      }
    }
  }
}

export interface TruthTable {
  vars: string[];
  rows: { inputs: boolean[]; output: boolean }[];
}

export function truthTable(src: string): TruthTable {
  const e = parseExpr(src);
  const vars = variables(e);
  if (vars.length > 6) throw new Error('Use at most 6 variables (64 rows).');
  const rows = [];
  for (let n = 0; n < 1 << vars.length; n++) {
    const inputs = vars.map((_, i) => Boolean((n >> (vars.length - 1 - i)) & 1));
    const env = Object.fromEntries(vars.map((v, i) => [v, inputs[i]]));
    rows.push({ inputs, output: evaluate(e, env) });
  }
  return { vars, rows };
}

/** Sum-of-products (canonical minterm) form of a truth table. */
export function sumOfProducts(tt: TruthTable): string {
  const terms = tt.rows.filter((r) => r.output).map((r) => r.inputs.map((b, i) => (b ? tt.vars[i] : `¬${tt.vars[i]}`)).join('·'));
  if (terms.length === 0) return '0';
  if (terms.length === tt.rows.length) return '1';
  return terms.join(' + ');
}
