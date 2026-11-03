import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

// Lightweight token colouring for C/C++/Python listings (no external highlighter needed).
const KEYWORDS = new Set(
  'int char float double void return if else for while do switch case break continue default struct typedef enum const volatile static unsigned signed sizeof include define ifndef endif class public private protected bool true false nullptr new delete namespace template typename constexpr auto def import from as in not and or None True False with try except elif lambda pass print self uint8_t uint16_t uint32_t int8_t int16_t int32_t size_t'.split(' '),
);

function highlight(line: string, key: number) {
  const parts: React.ReactNode[] = [];
  const re = /(\/\/.*$|#(?!include|define|ifndef|endif|if|pragma).*$|\/\*.*?\*\/)|("(?:\\.|[^"])*"|'(?:\\.|[^'])*')|(\b0x[0-9a-fA-F]+\b|\b0b[01]+\b|\b\d+(?:\.\d+)?[fuUL]*\b)|(#\w+|\b[A-Za-z_]\w*\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push(line.slice(last, m.index));
    const t = m[0];
    const k = `${key}-${i++}`;
    if (m[1]) parts.push(<span key={k} className="text-fg-3 italic">{t}</span>);
    else if (m[2]) parts.push(<span key={k} className="text-good">{t}</span>);
    else if (m[3]) parts.push(<span key={k} className="text-warn">{t}</span>);
    else if (t.startsWith('#') || KEYWORDS.has(t)) parts.push(<span key={k} className="text-accent-3">{t}</span>);
    else parts.push(t);
    last = m.index + t.length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

export function CodeBlock({ code, language, lineNumbers, highlightLine, onLineClick }: { code: string; language?: string; lineNumbers?: boolean; highlightLine?: number; onLineClick?: (line: number) => void }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');
  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-line bg-bg-2">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-fg-3">{language || 'code'}</span>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1200); }).catch(() => undefined);
          }}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-fg-3 hover:text-accent"
          aria-label="Copy code"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-6">
        <code>
          {lines.map((l, i) => (
            <div
              key={i}
              onClick={onLineClick ? () => onLineClick(i + 1) : undefined}
              className={[
                'flex',
                onLineClick ? 'cursor-pointer rounded hover:bg-panel-2' : '',
                highlightLine === i + 1 ? 'rounded bg-accent/10 ring-1 ring-accent/40' : '',
              ].join(' ')}
            >
              {(lineNumbers || onLineClick) && <span className="mr-3 inline-block w-6 shrink-0 select-none text-right text-fg-3">{i + 1}</span>}
              <span className="whitespace-pre">{highlight(l, i)}{l === '' ? ' ' : ''}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
