import { AlertTriangle, BookOpenCheck, Brain, CheckCircle2, Layers, NotebookPen, Plus, RotateCcw, Sigma, Trash2, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ALL_FLASHCARDS } from '../data/curriculum';
import { findAnyQuestion } from '../data/lookup';
import { topicLabel } from '../data/questions';
import type { Response } from '../data/types';
import { formatDate } from '../engine/dates';
import { gradeQuestion, type GradeResult, shuffle } from '../engine/grading';
import { topicStats } from '../engine/progress';
import { dueQueue, type Grade, GRADE_LABEL, retention } from '../engine/srs';
import { addFlashcardsForTopic, removeCard, reviewCard, updateMistake, useApp } from '../store/store';
import type { SrsCard } from '../store/types';
import { QuestionView, isAnswered } from '../components/quiz/QuestionView';
import { Markdown } from '../components/ui/Markdown';
import { Badge, Button, Card, CardHeader, cx, EmptyState, PageHeader, ProgressBar, Segmented, Textarea } from '../components/ui';

type Tab = 'queue' | 'recall' | 'flashcards' | 'mistakes' | 'weak';

function ReviewCard({ card, onDone }: { card: SrsCard; onDone: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [response, setResponse] = useState<Response>();
  const [result, setResult] = useState<GradeResult>();
  const grade = (g: Grade) => { reviewCard(card.id, g); setRevealed(false); setResponse(undefined); setResult(undefined); onDone(); };
  const fc = card.kind === 'flashcard' ? ALL_FLASHCARDS.find((f) => f.id === card.refId) : undefined;
  const q = card.kind === 'question' ? findAnyQuestion(card.refId) : undefined;
  if (!fc && !q) return <Card className="p-5 text-sm text-fg-3">This card's content no longer exists. <Button size="sm" variant="ghost" onClick={() => { removeCard(card.id); onDone(); }}>Remove</Button></Card>;
  return (
    <Card className="p-5" glow>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
        <Badge tone={card.source === 'mistake' ? 'warn' : 'blue'}>{card.source === 'mistake' ? 'From a mistake' : fc?.kind ?? 'question'}</Badge>
        <Badge>{topicLabel(card.topic)}</Badge>
        <span className="text-fg-3">recall ≈ {Math.round(retention(card) * 100)}% · interval {card.interval} d · lapses {card.lapses}</span>
      </div>
      {fc && (
        <div className="space-y-4">
          <div className="text-lg font-medium text-fg">{fc.front}</div>
          {revealed ? <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 font-mono text-accent fade-in">{fc.back}</div> : <Button onClick={() => setRevealed(true)}>Show answer</Button>}
        </div>
      )}
      {q && (
        <div>
          <QuestionView q={q} response={response} onChange={(r) => setResponse(r)} result={result} hintShown={false} onShowHint={() => undefined} onSelfGrade={(ok) => { const r: Response = { kind: 'self', value: response?.kind === 'self' ? response.value : '', selfGrade: ok }; setResponse(r); setResult(gradeQuestion(q, r)); setRevealed(true); }} />
          {!result && q.type !== 'short' && <Button className="mt-3" variant="primary" disabled={!isAnswered(q, response)} onClick={() => { setResult(gradeQuestion(q, response!)); setRevealed(true); }}>Check</Button>}
        </div>
      )}
      {revealed && (
        <div className="mt-5 border-t border-line pt-4">
          <div className="mb-2 text-xs text-fg-3">How well did you recall it? {result && !result.correct && '(You answered incorrectly — "Again" is recommended.)'}</div>
          <div className="flex flex-wrap gap-2">
            {([0, 3, 4, 5] as Grade[]).map((g) => (
              <Button key={g} size="sm" variant={g === 0 ? 'danger' : g === 4 ? 'primary' : 'secondary'} onClick={() => grade(g)}>{GRADE_LABEL[g]}</Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function QuickRecall({ cards }: { cards: SrsCard[] }) {
  // Fixed for the session so the set doesn't reshuffle after every review.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pool = useMemo(() => shuffle(cards.filter((c) => c.kind === 'question' && findAnyQuestion(c.refId))).slice(0, 5), []);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [response, setResponse] = useState<Response>();
  const [result, setResult] = useState<GradeResult>();
  if (pool.length === 0) return <EmptyState icon={<Zap size={26} />} title="No recall questions yet">Questions you answer incorrectly anywhere in K-FORGE become recall questions here.</EmptyState>;
  if (i >= pool.length) return <Card className="p-5 text-center"><div className="font-mono text-3xl font-semibold text-accent">{score}/{pool.length}</div><p className="mt-1 text-sm text-fg-2">Quick daily recall complete.</p><Button className="mt-3" onClick={() => { setI(0); setScore(0); }}><RotateCcw size={14} /> Again</Button></Card>;
  const q = findAnyQuestion(pool[i].refId)!;
  return (
    <Card className="p-5">
      <div className="mb-3 flex justify-between text-xs text-fg-3"><span>Question {i + 1} of {pool.length}</span><span>score {score}</span></div>
      <QuestionView key={q.id} q={q} response={response} onChange={setResponse} result={result} hintShown={false} onShowHint={() => undefined} onSelfGrade={(ok) => { const r: Response = { kind: 'self', value: response?.kind === 'self' ? response.value : '', selfGrade: ok }; const g = gradeQuestion(q, r); setResult(g); if (g.correct) setScore(score + 1); }} />
      {!result ? (q.type !== 'short' && <Button className="mt-3" variant="primary" disabled={!isAnswered(q, response)} onClick={() => { const g = gradeQuestion(q, response!); setResult(g); if (g.correct) setScore(score + 1); }}>Check</Button>)
        : <Button className="mt-3" onClick={() => { setI(i + 1); setResponse(undefined); setResult(undefined); }}>Next</Button>}
    </Card>
  );
}

export default function Revision() {
  const s = useApp();
  const [tab, setTab] = useState<Tab>('queue');
  const [, force] = useState(0);
  const cards = Object.values(s.cards);
  const queue = dueQueue(cards);
  const weak = topicStats(s).filter((t) => t.weak);
  const fading = cards.filter((c) => c.lastReviewed && retention(c) < 0.7).sort((a, b) => retention(a) - retention(b));
  const openMistakes = s.mistakes.filter((m) => !m.resolved);
  const reviewedToday = s.reviews.filter((r) => r.at.slice(0, 10) === new Date().toISOString().slice(0, 10)).length;
  const topicsWithCards = [...new Set(ALL_FLASHCARDS.map((f) => f.topic))];

  return (
    <div className="space-y-6 fade-in">
      <PageHeader eyebrow="Revision Center" title="Spaced repetition and revision" subtitle="Mistakes become revision cards automatically. Difficult topics come back sooner; well-known ones less often (SM-2 scheduling)." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4"><div className="text-[12px] text-fg-3">Due today</div><div className="font-mono text-2xl font-semibold text-accent">{queue.length}</div></Card>
        <Card className="p-4"><div className="text-[12px] text-fg-3">Reviewed today</div><div className="font-mono text-2xl font-semibold text-fg">{reviewedToday}</div></Card>
        <Card className="p-4"><div className="text-[12px] text-fg-3">Cards in rotation</div><div className="font-mono text-2xl font-semibold text-fg">{cards.length}</div></Card>
        <Card className="p-4"><div className="text-[12px] text-fg-3">Becoming weak</div><div className={cx('font-mono text-2xl font-semibold', fading.length ? 'text-warn' : 'text-fg')}>{fading.length}</div></Card>
      </div>

      <div className="overflow-x-auto">
        <Segmented<Tab> label="Revision sections" value={tab} onChange={setTab} options={[
          { value: 'queue', label: <span className="flex items-center gap-1.5"><Layers size={13} /> Daily queue</span> },
          { value: 'recall', label: <span className="flex items-center gap-1.5"><Zap size={13} /> Quick recall</span> },
          { value: 'flashcards', label: <span className="flex items-center gap-1.5"><Sigma size={13} /> Formulas & concepts</span> },
          { value: 'mistakes', label: <span className="flex items-center gap-1.5"><NotebookPen size={13} /> Mistake notebook</span> },
          { value: 'weak', label: <span className="flex items-center gap-1.5"><AlertTriangle size={13} /> Weak topics</span> },
        ]} />
      </div>

      {tab === 'queue' && (queue.length ? (
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="flex items-center gap-3 text-sm text-fg-3"><ProgressBar value={(reviewedToday / Math.max(1, reviewedToday + queue.length)) * 100} className="max-w-xs" /> {queue.length} remaining</div>
          <ReviewCard key={queue[0].id} card={queue[0]} onDone={() => force((x) => x + 1)} />
        </div>
      ) : (
        <EmptyState icon={<CheckCircle2 size={28} />} title="Nothing due right now" action={<Button onClick={() => setTab('flashcards')}><Plus size={14} /> Add flashcard decks</Button>}>
          {cards.length ? 'Come back tomorrow — spaced repetition works because of the gaps.' : 'Complete lessons or answer questions; mistakes and lesson flashcards will appear here.'}
        </EmptyState>
      ))}

      {tab === 'recall' && <div className="mx-auto max-w-3xl"><QuickRecall cards={cards} /></div>}

      {tab === 'flashcards' && (
        <div className="space-y-4">
          <Card className="flex flex-wrap items-center gap-3 p-4">
            <span className="text-sm text-fg-2">Add a deck to your queue:</span>
            {topicsWithCards.map((t) => <Button key={t} size="sm" variant="ghost" onClick={() => addFlashcardsForTopic(t)}><Plus size={13} /> {topicLabel(t)}</Button>)}
            <Button size="sm" onClick={() => addFlashcardsForTopic('*')}>Add all</Button>
          </Card>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_FLASHCARDS.map((f) => {
              const inQueue = Boolean(s.cards[`f:${f.id}`]);
              return (
                <details key={f.id} className="group rounded-2xl border border-line bg-panel/80 p-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-2">
                    <span className="text-sm font-medium text-fg">{f.front}</span>
                    <Badge tone={f.kind === 'formula' ? 'accent' : f.kind === 'code' ? 'purple' : 'blue'}>{f.kind}</Badge>
                  </summary>
                  <p className="mt-3 font-mono text-sm text-accent">{f.back}</p>
                  <div className="mt-2 text-[11px] text-fg-3">{topicLabel(f.topic)} · {inQueue ? 'in your queue' : 'not scheduled'}</div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'mistakes' && (
        <Card>
          <CardHeader icon={<BookOpenCheck size={18} />} title="Personal mistake notebook" subtitle={`${openMistakes.length} open · ${s.mistakes.length - openMistakes.length} resolved. Write why you got it wrong — that note is the real lesson.`} />
          {s.mistakes.length === 0 ? <div className="p-5"><EmptyState title="No mistakes recorded yet">Incorrect answers from quizzes, exams and labs land here automatically.</EmptyState></div> : (
            <ul className="divide-y divide-line">
              {s.mistakes.slice(0, 60).map((m) => {
                const q = findAnyQuestion(m.qid);
                return (
                  <li key={m.id} className={cx('space-y-2 p-5', m.resolved && 'opacity-60')}>
                    <div className="flex flex-wrap items-center gap-2 text-[12px]"><Badge>{topicLabel(m.topic)}</Badge><span className="text-fg-3">{formatDate(m.at)}</span>{m.resolved && <Badge tone="good">resolved</Badge>}</div>
                    {q && <Markdown text={q.prompt} className="text-sm [&_p]:my-0.5" />}
                    <div className="text-sm text-fg-3">Your answer: <span className="font-mono text-bad">{m.given}</span></div>
                    {q && <details><summary className="cursor-pointer text-xs text-accent">Explanation</summary><Markdown text={q.explanation} className="mt-1 text-sm" /></details>}
                    <Textarea aria-label="Why did I get this wrong?" rows={2} defaultValue={m.note} placeholder="Why did I get this wrong? What will I check next time?" onBlur={(e) => e.target.value !== m.note && updateMistake(m.id, { note: e.target.value })} />
                    <Button size="sm" variant="ghost" onClick={() => updateMistake(m.id, { resolved: !m.resolved })}>{m.resolved ? 'Reopen' : <><CheckCircle2 size={13} /> Mark understood</>}</Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      {tab === 'weak' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader icon={<AlertTriangle size={18} />} title="Weak topics" subtitle={`Recent accuracy below ${s.settings.mastery}% or predicted recall below 70%.`} />
            <div className="space-y-2 p-5">
              {weak.length ? weak.map((t) => (
                <div key={t.topic} className="grid grid-cols-[minmax(0,1fr)_100px_60px] items-center gap-3 text-sm">
                  <span className="truncate text-fg-2">{topicLabel(t.topic)}</span>
                  <ProgressBar value={t.accuracy * 100} tone="warn" />
                  <span className="text-right font-mono text-xs text-fg-3">{t.total ? `${Math.round(t.accuracy * 100)}%` : '—'}{t.retention !== undefined ? ` · R${Math.round(t.retention * 100)}` : ''}</span>
                </div>
              )) : <p className="text-sm text-fg-3">No weak topics detected yet. Keep answering questions and reviewing.</p>}
            </div>
          </Card>
          <Card>
            <CardHeader icon={<Brain size={18} />} title="Concepts becoming weak" subtitle="Reviewed before, but predicted recall has dropped." />
            <ul className="space-y-2 p-5">
              {fading.length ? fading.slice(0, 12).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2 text-sm">
                  <span className="truncate text-fg-2">{c.kind === 'flashcard' ? ALL_FLASHCARDS.find((f) => f.id === c.refId)?.front : findAnyQuestion(c.refId)?.prompt.replace(/[*`]/g, '').slice(0, 60)}</span>
                  <span className="flex shrink-0 items-center gap-2"><Badge tone="warn">{Math.round(retention(c) * 100)}%</Badge><button aria-label="Remove card" className="text-fg-3 hover:text-bad" onClick={() => removeCard(c.id)}><Trash2 size={13} /></button></span>
                </li>
              )) : <p className="text-sm text-fg-3">Nothing fading. Reviews keep recall high.</p>}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
