import { ArrowLeft, ArrowRight, CheckCircle2, Clock, RotateCcw, Send, XCircle } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import type { Question, Response } from '../../data/types';
import { topicLabel } from '../../data/questions';
import { describeResponse, gradeQuestion, type GradeResult } from '../../engine/grading';
import type { AnswerRecord } from '../../store/types';
import { Badge, Button, Card, cx, ProgressBar } from '../ui';
import { isAnswered, QuestionView } from './QuestionView';

export interface QuizOutcome {
  percent: number;
  passed: boolean;
}

interface Props {
  questions: Question[];
  mode: 'practice' | 'exam';
  timeLimitSec?: number;
  mastery: number;
  onComplete: (answers: AnswerRecord[]) => QuizOutcome | void;
  onRetake?: () => void;
  onExit?: () => void;
  passMessage?: ReactNode;
  failMessage?: ReactNode;
}

export function QuizRunner({ questions, mode, timeLimitSec, mastery, onComplete, onRetake, onExit, passMessage, failMessage }: Props) {
  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [results, setResults] = useState<Record<string, GradeResult>>({});
  const [hints, setHints] = useState<Set<string>>(new Set());
  const [selfGraded, setSelfGraded] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState<{ answers: AnswerRecord[]; outcome: QuizOutcome } | null>(null);
  const [remaining, setRemaining] = useState(timeLimitSec ?? 0);
  const submitRef = useRef<() => void>(() => undefined);

  const q = questions[idx];
  const answered = (qq: Question) => (qq.type === 'short' ? selfGraded.has(qq.id) : isAnswered(qq, responses[qq.id]));
  const answeredCount = questions.filter(answered).length;

  function gradeAll(): AnswerRecord[] {
    return questions.map((qq) => {
      const r = responses[qq.id];
      const res = results[qq.id] ?? (r ? gradeQuestion(qq, r) : { correct: false });
      return { qid: qq.id, topic: qq.topic, correct: res.correct, given: r ? describeResponse(qq, r) : '(no answer)', usedHint: hints.has(qq.id) };
    });
  }

  function submit() {
    const answers = gradeAll();
    const allResults: Record<string, GradeResult> = {};
    for (const qq of questions) {
      const r = responses[qq.id];
      allResults[qq.id] = results[qq.id] ?? (r ? gradeQuestion(qq, r) : { correct: false, feedback: 'No answer given.' });
    }
    setResults(allResults);
    const correct = answers.filter((a) => a.correct).length;
    const fallback = { percent: Math.round((correct / Math.max(1, answers.length)) * 100), passed: false };
    fallback.passed = fallback.percent >= mastery;
    const outcome = onComplete(answers) ?? fallback;
    setFinished({ answers, outcome });
  }
  submitRef.current = submit;

  useEffect(() => {
    if (!timeLimitSec || finished) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          submitRef.current();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLimitSec, finished]);

  const breakdown = useMemo(() => {
    if (!finished) return [];
    const m = new Map<string, { c: number; t: number }>();
    for (const a of finished.answers) {
      const s = m.get(a.topic) ?? { c: 0, t: 0 };
      s.t++;
      if (a.correct) s.c++;
      m.set(a.topic, s);
    }
    return [...m.entries()].map(([topic, s]) => ({ topic, ...s, pct: Math.round((s.c / s.t) * 100) })).sort((a, b) => a.pct - b.pct);
  }, [finished]);

  if (questions.length === 0) return <p className="text-sm text-fg-3">No questions match these settings.</p>;

  if (finished) {
    const { outcome, answers } = finished;
    return (
      <div className="space-y-5 fade-in">
        <Card className="p-5" glow={outcome.passed}>
          <div className="flex flex-wrap items-center gap-5">
            <div className={cx('grid size-20 place-items-center rounded-2xl border font-mono text-2xl font-semibold', outcome.passed ? 'border-good/50 bg-good/10 text-good' : 'border-warn/50 bg-warn/10 text-warn')}>
              {outcome.percent}%
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-lg font-semibold text-fg">
                {outcome.passed ? <CheckCircle2 className="text-good" size={20} /> : <XCircle className="text-warn" size={20} />}
                {outcome.passed ? 'Mastery reached' : `Below the ${mastery}% mastery target`}
              </div>
              <p className="mt-1 text-sm text-fg-2">
                {answers.filter((a) => a.correct).length} of {answers.length} correct.{' '}
                {outcome.passed ? passMessage : failMessage ?? 'Incorrect answers were saved to your Revision Center. Review the explanations, then retake.'}
              </p>
            </div>
            <div className="flex gap-2">
              {onRetake && <Button onClick={onRetake}><RotateCcw size={15} /> Retake</Button>}
              {onExit && <Button variant="ghost" onClick={onExit}>Done</Button>}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-fg">Performance by topic</h3>
          <div className="space-y-2.5">
            {breakdown.map((b) => (
              <div key={b.topic} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)_60px]">
                <span className="truncate text-sm text-fg-2">{topicLabel(b.topic)}</span>
                <ProgressBar value={b.pct} tone={b.pct >= mastery ? 'good' : 'warn'} className="hidden sm:block" />
                <span className="text-right font-mono text-sm text-fg">{b.c}/{b.t}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-fg">Review with explanations</h3>
          {questions.map((qq, i) => (
            <details key={qq.id} className="group rounded-2xl border border-line bg-panel/80 p-4" open={!results[qq.id]?.correct}>
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm">
                {results[qq.id]?.correct ? <CheckCircle2 size={16} className="text-good" /> : <XCircle size={16} className="text-bad" />}
                <span className="font-mono text-xs text-fg-3">Q{i + 1}</span>
                <span className="truncate text-fg-2">{qq.prompt.replace(/[*`#]/g, '').slice(0, 90)}</span>
              </summary>
              <div className="mt-3 border-t border-line pt-3">
                <QuestionView q={qq} index={i} response={responses[qq.id]} onChange={() => undefined} result={results[qq.id]} hintShown={false} onShowHint={() => undefined} />
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  }

  const res = results[q.id];
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={mode === 'exam' ? 'purple' : 'accent'}>{mode === 'exam' ? 'Exam mode' : 'Practice mode · instant feedback'}</Badge>
        <span className="text-xs text-fg-3">{answeredCount}/{questions.length} answered</span>
        {timeLimitSec ? (
          <span className={cx('ml-auto flex items-center gap-1.5 font-mono text-sm', remaining < 60 ? 'text-bad' : 'text-fg-2')} aria-live="polite">
            <Clock size={14} /> {mm}:{ss}
          </span>
        ) : null}
      </div>
      <ProgressBar value={((idx + 1) / questions.length) * 100} label="Question progress" />

      {mode === 'exam' && (
        <nav aria-label="Questions" className="flex flex-wrap gap-1.5">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setIdx(i)}
              aria-current={i === idx}
              className={cx('size-8 rounded-lg border font-mono text-xs transition', i === idx ? 'border-accent text-accent' : answered(qq) ? 'border-line-strong bg-panel-2 text-fg' : 'border-line text-fg-3')}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      )}

      <Card className="p-5">
        <QuestionView
          key={q.id}
          q={q}
          index={idx}
          response={responses[q.id]}
          onChange={(r) => setResponses((p) => ({ ...p, [q.id]: r }))}
          result={mode === 'practice' ? res : undefined}
          hintShown={hints.has(q.id)}
          onShowHint={() => setHints((h) => new Set(h).add(q.id))}
          onSelfGrade={(ok) => {
            const cur = responses[q.id];
            const value = cur?.kind === 'self' ? cur.value : '';
            const r: Response = { kind: 'self', value, selfGrade: ok };
            setResponses((p) => ({ ...p, [q.id]: r }));
            setSelfGraded((s) => new Set(s).add(q.id));
            if (mode === 'practice') setResults((p) => ({ ...p, [q.id]: gradeQuestion(q, r) }));
          }}
        />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
          <ArrowLeft size={15} /> Previous
        </Button>
        <div className="flex gap-2">
          {mode === 'practice' && !res && q.type !== 'short' && (
            <Button variant="primary" disabled={!isAnswered(q, responses[q.id])} onClick={() => setResults((p) => ({ ...p, [q.id]: gradeQuestion(q, responses[q.id]) }))}>
              Check answer
            </Button>
          )}
          {idx < questions.length - 1 ? (
            <Button variant={mode === 'practice' && res ? 'primary' : 'secondary'} disabled={mode === 'practice' && !res} onClick={() => setIdx(idx + 1)}>
              Next <ArrowRight size={15} />
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={mode === 'practice' ? !res : false}
              onClick={() => {
                if (mode === 'exam' && answeredCount < questions.length && !window.confirm(`${questions.length - answeredCount} question(s) unanswered. Submit anyway?`)) return;
                submit();
              }}
            >
              <Send size={15} /> {mode === 'exam' ? 'Submit exam' : 'Finish'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
