import { Bot, Lightbulb, MessageSquarePlus, Send, ServerOff, Sparkles, Trash2, Unlock, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getExercise } from '../data/lab';
import { uid } from '../engine/dates';
import { levelInfo } from '../engine/levels';
import { topicStats } from '../engine/progress';
import { topicLabel } from '../data/questions';
import { askMentor, getHealth, type Health } from '../lib/api';
import { offlineAnswer, offlineHint } from '../lib/offlineMentor';
import { deleteConversation, getState, revealHint, saveConversation, setMentorHintLevel, useApp, viewSolution } from '../store/store';
import type { MentorConversation, MentorMessage } from '../store/types';
import { Markdown } from '../components/ui/Markdown';
import { Badge, Button, Callout, Card, cx, PageHeader, Select, Spinner, Textarea } from '../components/ui';

const MODES = [
  { id: 'explain', label: 'Explain a concept' },
  { id: 'code', label: 'Analyse my code' },
  { id: 'debug', label: 'Find an error' },
  { id: 'datasheet', label: 'Explain a datasheet section' },
  { id: 'circuit', label: 'Explain a circuit diagram' },
  { id: 'practice', label: 'Generate practice questions' },
  { id: 'revision', label: 'Recommend revision topics' },
  { id: 'report', label: 'Review a project report' },
  { id: 'project', label: 'Guide an independent project' },
];

export default function Mentor() {
  const s = useApp();
  const [params] = useSearchParams();
  const challengeId = params.get('challenge') ?? undefined;
  const challenge = challengeId ? getExercise(challengeId) : undefined;
  const [health, setHealth] = useState<Health | null>(null);
  const [convId, setConvId] = useState<string | null>(null);
  const [mode, setMode] = useState(challenge ? 'debug' : 'explain');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getHealth().then(setHealth); }, []);
  useEffect(() => {
    if (challenge) {
      const existing = s.mentor.conversations.find((c) => c.challengeId === challenge.id);
      setConvId(existing?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId]);

  const conv = s.mentor.conversations.find((c) => c.id === convId);
  const messages = conv?.messages ?? [];
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages.length, busy]);

  const ai = Boolean(health?.mentor);
  const hintLevel = challenge ? s.mentor.hintLevels[challenge.id] ?? 0 : 0;

  function persist(next: MentorMessage[], title?: string): MentorConversation {
    const c: MentorConversation = conv
      ? { ...conv, messages: next, updatedAt: new Date().toISOString() }
      : { id: uid('mc'), title: title ?? next[0]?.content.slice(0, 60) ?? 'Conversation', mode, challengeId: challenge?.id, messages: next, updatedAt: new Date().toISOString() };
    saveConversation(c);
    setConvId(c.id);
    return c;
  }

  async function send(text: string, opts: { hintLevel?: number; solution?: boolean } = {}) {
    if (!text.trim() || busy) return;
    setError(undefined);
    const userMsg: MentorMessage = { role: 'user', content: text.trim(), at: new Date().toISOString() };
    const history = [...messages, userMsg];
    persist(history, challenge ? `Challenge: ${challenge.title}` : undefined);
    setInput('');
    setBusy(true);
    try {
      let reply: string;
      let offline = false;
      const level = opts.hintLevel ?? hintLevel;
      if (ai) {
        const st = getState();
        reply = await askMentor({
          mode,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          context: {
            challenge: challenge ? { title: challenge.title, description: challenge.description, hints: [] } : undefined,
            hintLevel: level,
            solutionRequested: opts.solution,
            learner: { level: levelInfo(st).level.name, weakTopics: topicStats(st).filter((t) => t.weak).slice(0, 5).map((t) => topicLabel(t.topic)) },
          },
        });
      } else {
        offline = true;
        reply = challenge && (opts.hintLevel !== undefined || opts.solution) ? offlineHint(challenge, level, Boolean(opts.solution)) : offlineAnswer(mode, text, getState());
      }
      persist([...history, { role: 'assistant', content: reply, at: new Date().toISOString(), offline }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function requestHint(level: number) {
    if (!challenge) return;
    setMentorHintLevel(challenge.id, level);
    revealHint(challenge.id, level); // hints used here count the same as in the lab
    send(`Please give me hint ${level}.`, { hintLevel: level });
  }

  function requestSolution() {
    if (!challenge || !window.confirm('Show the complete solution? Try rebuilding it from a blank file afterwards.')) return;
    viewSolution(challenge.id);
    send('I have worked through all three hints. Please show me the full solution and explain it.', { hintLevel: 3, solution: true });
  }

  return (
    <div className="space-y-5 fade-in">
      <PageHeader eyebrow="AI Mentor" title="Engineering Mentor" subtitle="A patient engineering instructor. It gives hints in three levels, asks you to explain your reasoning, and reveals full solutions only when you explicitly ask." />

      {health === null ? <Spinner label="Checking mentor service" /> : !ai && (
        <Callout tone="warn" icon={<ServerOff size={16} />} title="Offline guide — no AI is configured">
          The server has no Claude API key, so the mentor runs in offline mode: glossary and lesson search, the exercise's own three-level hints, practice questions from the question bank, revision recommendations and structured debugging prompts. Set <code>ANTHROPIC_API_KEY</code> for the API server to enable the AI mentor (see README). Keys are never stored in the browser.
        </Callout>
      )}

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <Button className="w-full" onClick={() => { setConvId(null); setError(undefined); }}><MessageSquarePlus size={15} /> New conversation</Button>
          <Card className="max-h-[50vh] overflow-y-auto p-2">
            {s.mentor.conversations.length === 0 && <p className="p-3 text-sm text-fg-3">No conversations yet.</p>}
            {s.mentor.conversations.map((c) => (
              <div key={c.id} className={cx('group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm', c.id === convId ? 'bg-panel-2 text-fg' : 'text-fg-3 hover:bg-panel-2/60')}>
                <button className="min-w-0 flex-1 truncate text-left" onClick={() => setConvId(c.id)}>{c.title}</button>
                <button aria-label="Delete conversation" className="opacity-0 transition group-hover:opacity-100 hover:text-bad focus:opacity-100" onClick={() => { deleteConversation(c.id); if (c.id === convId) setConvId(null); }}><Trash2 size={13} /></button>
              </div>
            ))}
          </Card>
        </aside>

        <div className="min-w-0 space-y-3">
          {challenge && (
            <Card className="p-4" glow>
              <div className="flex flex-wrap items-center gap-2"><Badge tone="accent">Challenge</Badge><span className="font-medium text-fg">{challenge.title}</span></div>
              <p className="mt-1 text-sm text-fg-3">{challenge.objective}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[1, 2, 3].map((l) => (
                  <Button key={l} size="sm" variant={hintLevel >= l ? 'secondary' : l === hintLevel + 1 ? 'primary' : 'ghost'} disabled={busy || l !== hintLevel + 1} onClick={() => requestHint(l)}>
                    <Lightbulb size={13} /> Hint {l}{l === 1 ? ': concept' : l === 2 ? ': method' : ': guided example'}
                  </Button>
                ))}
                <Button size="sm" variant="danger" disabled={busy || hintLevel < 3} onClick={requestSolution}><Unlock size={13} /> Full solution</Button>
              </div>
              <p className="mt-2 text-[12px] text-fg-3">Each hint unlocks after the previous one. The full solution needs all three hints and an explicit request. Using hints removes the exercise's no-hint bonus.</p>
            </Card>
          )}

          <Card className="flex h-[min(62vh,640px)] flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
              {messages.length === 0 && (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <Bot size={30} className="mx-auto text-accent" />
                    <p className="mt-2 font-medium text-fg">What are you working on?</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-fg-3">Show your attempt, the exact error and what you've tried. Ask for the next clue, not the full solution.</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {['Why does my I2C scanner find nothing?', 'Explain pull-up resistors, then quiz me', 'What does volatile do?', 'Generate practice questions on PID'].map((x) => (
                        <button key={x} onClick={() => setInput(x)} className="rounded-lg border border-line px-3 py-1.5 text-xs text-fg-2 hover:border-accent/50 hover:text-accent">{x}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cx('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                  <div className={cx('grid size-8 shrink-0 place-items-center rounded-lg', m.role === 'user' ? 'bg-accent-2/15 text-accent-2' : 'bg-accent/15 text-accent')}>{m.role === 'user' ? <User size={15} /> : <Bot size={15} />}</div>
                  <div className={cx('max-w-[85%] rounded-2xl border px-4 py-2.5', m.role === 'user' ? 'border-accent-2/30 bg-accent-2/5' : 'border-line bg-panel-2/50')}>
                    {m.role === 'user' ? <p className="whitespace-pre-wrap text-sm text-fg">{m.content}</p> : <Markdown text={m.content} className="text-sm [&_p]:my-1.5" />}
                    {m.offline && <div className="mt-1 text-[10px] uppercase tracking-wider text-fg-3">offline guide</div>}
                  </div>
                </div>
              ))}
              {busy && <div className="flex gap-3"><div className="grid size-8 place-items-center rounded-lg bg-accent/15 text-accent"><Sparkles size={15} className="pulse-dot" /></div><Spinner label="Thinking" /></div>}
              {error && <Callout tone="bad">{error}</Callout>}
              <div ref={endRef} />
            </div>
            <form className="space-y-2 border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); send(input); }}>
              <Textarea
                aria-label="Message the mentor"
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(input); } }}
                placeholder={mode === 'code' ? 'Paste your code and describe what it should do…' : 'Ask a question, explain your reasoning, or paste an error…'}
                className="font-[inherit]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Select aria-label="Mentor mode" value={mode} onChange={(e) => setMode(e.target.value)} className="h-9 w-auto text-xs">{MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</Select>
                <span className="hidden text-[11px] text-fg-3 sm:inline">Ctrl + Enter to send</span>
                <Button type="submit" variant="primary" className="ml-auto" disabled={busy || !input.trim()}><Send size={14} /> Send</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
