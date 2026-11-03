import { CheckCircle2, Lightbulb, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { Question, Response } from '../../data/types';
import { correctAnswerText, type GradeResult } from '../../engine/grading';
import { Badge, Button, cx, Input, Textarea } from '../ui';
import { CodeBlock } from '../ui/CodeBlock';
import { Markdown } from '../ui/Markdown';
import { Diagram } from '../visuals/Diagrams';
import { DIFFICULTY_LABEL } from '../../data/types';
import { topicLabel } from '../../data/questions';

const TYPE_LABEL: Record<Question['type'], string> = {
  single: 'Single choice',
  circuit: 'Circuit interpretation',
  multi: 'Multiple choice',
  truefalse: 'True or false',
  numeric: 'Numerical',
  output: 'Predict the output',
  codefix: 'Code correction',
  short: 'Short explanation',
};

export function isAnswered(q: Question, r: Response | undefined): boolean {
  if (!r) return false;
  switch (r.kind) {
    case 'choice':
    case 'bool':
      return true;
    case 'multi':
      return r.value.length > 0;
    case 'text':
      return r.value.trim().length > 0;
    case 'codefix':
      return r.line > 0 && r.text.trim().length > 0;
    case 'self':
      return q.type === 'short' && r.value.trim().length > 0;
  }
}

interface Props {
  q: Question;
  index?: number;
  response?: Response;
  onChange: (r: Response) => void;
  /** When set, the question is locked and feedback is shown. */
  result?: GradeResult;
  hintShown: boolean;
  onShowHint: () => void;
  /** Short answers: called when the learner self-grades after seeing the model answer. */
  onSelfGrade?: (ok: boolean) => void;
}

export function QuestionView({ q, index, response, onChange, result, hintShown, onShowHint, onSelfGrade }: Props) {
  const locked = Boolean(result);
  const [modelShown, setModelShown] = useState(false);

  return (
    <div className="fade-in">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {index !== undefined && <span className="font-mono text-xs text-fg-3">Q{index + 1}</span>}
        <Badge tone="blue">{TYPE_LABEL[q.type]}</Badge>
        <Badge>{topicLabel(q.topic)}</Badge>
        <Badge tone={q.difficulty === 3 ? 'purple' : q.difficulty === 2 ? 'accent' : 'neutral'}>{DIFFICULTY_LABEL[q.difficulty]}</Badge>
      </div>
      <Markdown text={q.prompt} className="text-[15px] [&_p]:text-fg" />
      {q.diagram && <Diagram id={q.diagram} />}
      {q.code && q.type !== 'codefix' && <CodeBlock code={q.code} language={q.topic.startsWith('py') ? 'python' : 'c'} />}

      <div className="mt-3">
        {(q.type === 'single' || q.type === 'circuit') && (
          <div role="radiogroup" className="grid gap-2">
            {q.options.map((opt, i) => {
              const selected = response?.kind === 'choice' && response.value === i;
              const isAnswer = locked && i === q.answer;
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={selected}
                  disabled={locked}
                  onClick={() => onChange({ kind: 'choice', value: i })}
                  className={cx(
                    'flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition',
                    selected ? 'border-accent bg-accent/10 text-fg' : 'border-line bg-panel-2/50 text-fg-2 hover:border-line-strong hover:text-fg',
                    isAnswer && 'border-good bg-good/10',
                    locked && selected && !result?.correct && 'border-bad bg-bad/10',
                  )}
                >
                  <span className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[10px]', selected ? 'border-accent text-accent' : 'border-line-strong text-fg-3')}>{String.fromCharCode(65 + i)}</span>
                  <span><Markdown text={opt} className="[&_p]:m-0 [&_p]:text-inherit" /></span>
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'multi' && (
          <div className="grid gap-2">
            <p className="text-xs text-fg-3">Select all that apply.</p>
            {q.options.map((opt, i) => {
              const sel = response?.kind === 'multi' && response.value.includes(i);
              const isAnswer = locked && q.answers.includes(i);
              return (
                <button
                  key={i}
                  role="checkbox"
                  aria-checked={sel}
                  disabled={locked}
                  onClick={() => {
                    const cur = response?.kind === 'multi' ? response.value : [];
                    onChange({ kind: 'multi', value: sel ? cur.filter((x) => x !== i) : [...cur, i] });
                  }}
                  className={cx(
                    'flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition',
                    sel ? 'border-accent bg-accent/10 text-fg' : 'border-line bg-panel-2/50 text-fg-2 hover:border-line-strong',
                    isAnswer && 'border-good bg-good/10',
                  )}
                >
                  <span className={cx('mt-0.5 grid size-4 shrink-0 place-items-center rounded border', sel ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong')}>{sel && '✓'}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'truefalse' && (
          <div className="flex gap-2">
            {[true, false].map((v) => {
              const sel = response?.kind === 'bool' && response.value === v;
              return (
                <Button key={String(v)} disabled={locked} variant={sel ? 'primary' : 'secondary'} onClick={() => onChange({ kind: 'bool', value: v })} className="min-w-24">
                  {v ? 'True' : 'False'}
                </Button>
              );
            })}
          </div>
        )}

        {q.type === 'numeric' && (
          <div className="flex max-w-xs items-center gap-2">
            <Input
              inputMode="decimal"
              aria-label="Numerical answer"
              disabled={locked}
              value={response?.kind === 'text' ? response.value : ''}
              onChange={(e) => onChange({ kind: 'text', value: e.target.value })}
              placeholder="Your answer"
              className="font-mono"
            />
            {q.unit && <span className="font-mono text-sm text-fg-2">{q.unit}</span>}
          </div>
        )}

        {q.type === 'output' && (
          <Textarea
            aria-label="Predicted output"
            disabled={locked}
            rows={2}
            className="font-mono"
            value={response?.kind === 'text' ? response.value : ''}
            onChange={(e) => onChange({ kind: 'text', value: e.target.value })}
            placeholder="Exact output"
          />
        )}

        {q.type === 'codefix' && (
          <div>
            <p className="text-xs text-fg-3">1. Click the line that contains the bug. 2. Rewrite that line correctly.</p>
            <CodeBlock
              code={q.code}
              language="c"
              highlightLine={response?.kind === 'codefix' ? response.line : undefined}
              onLineClick={locked ? undefined : (line) => onChange({ kind: 'codefix', line, text: q.code.split('\n')[line - 1].trim() })}
            />
            {response?.kind === 'codefix' && response.line > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-fg-3">line {response.line}</span>
                <Input aria-label="Corrected line" disabled={locked} className="font-mono" value={response.text} onChange={(e) => onChange({ kind: 'codefix', line: response.line, text: e.target.value })} />
              </div>
            )}
          </div>
        )}

        {q.type === 'short' && (
          <div className="space-y-3">
            <Textarea
              aria-label="Your explanation"
              disabled={locked || modelShown}
              rows={4}
              value={response?.kind === 'self' ? response.value : ''}
              onChange={(e) => onChange({ kind: 'self', value: e.target.value, selfGrade: false })}
              placeholder="Explain in your own words…"
            />
            {!locked && !modelShown && (
              <Button size="sm" disabled={!isAnswered(q, response)} onClick={() => setModelShown(true)}>
                Compare with model answer
              </Button>
            )}
            {(modelShown || locked) && (
              <div className="rounded-xl border border-accent-2/30 bg-accent-2/5 p-3 text-sm">
                <div className="mb-1 font-medium text-accent-2">Model answer</div>
                <p className="text-fg-2">{q.modelAnswer}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {q.keywords.map((k) => {
                    const hit = response?.kind === 'self' && response.value.toLowerCase().includes(k.toLowerCase().replace(/\s*=\s*$/, '').trim());
                    return <Badge key={k} tone={hit ? 'good' : 'neutral'}>{hit ? '✓ ' : ''}{k}</Badge>;
                  })}
                </div>
                {!locked && onSelfGrade && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-fg-3">Be honest — this is self-assessed:</span>
                    <Button size="sm" variant="primary" onClick={() => onSelfGrade(true)}>My answer covers the key ideas</Button>
                    <Button size="sm" onClick={() => onSelfGrade(false)}>I missed important points</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {q.hint && !locked && (
        <div className="mt-3">
          {hintShown ? (
            <div className="flex gap-2 rounded-xl border border-warn/30 bg-warn/5 p-3 text-sm text-fg-2">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-warn" />
              <Markdown text={q.hint} className="[&_p]:m-0" />
            </div>
          ) : (
            <button onClick={onShowHint} className="flex items-center gap-1.5 text-xs text-fg-3 hover:text-warn">
              <Lightbulb size={13} /> Show hint
            </button>
          )}
        </div>
      )}

      {result && (
        <div className={cx('mt-4 rounded-xl border p-3.5 text-sm', result.correct ? 'border-good/40 bg-good/5' : 'border-bad/40 bg-bad/5')} role="status">
          <div className={cx('mb-1 flex items-center gap-2 font-medium', result.correct ? 'text-good' : 'text-bad')}>
            {result.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {result.correct ? 'Correct' : 'Not quite'}
            {result.selfAssessed && <Badge>self-assessed</Badge>}
          </div>
          {result.feedback && <p className="mb-1 text-fg-2">{result.feedback}</p>}
          {!result.correct && q.type !== 'short' && (
            <p className="mb-1 text-fg-2">
              Correct answer: <span className="font-mono text-fg">{correctAnswerText(q)}</span>
            </p>
          )}
          <Markdown text={q.explanation} className="[&_p]:my-1" />
        </div>
      )}
    </div>
  );
}
