// Client for the optional K-FORGE API server (server/index.mjs). The browser never holds API keys:
// the server reads them from its environment and proxies Judge0 and the AI mentor.

export interface Health {
  ok: boolean;
  judge0: boolean;
  mentor: boolean;
  model?: string;
  push?: boolean;
}

let cached: Promise<Health> | null = null;

export function getHealth(force = false): Promise<Health> {
  if (!cached || force) {
    cached = fetch('/api/health', { headers: { accept: 'application/json' } })
      .then(async (r) => (r.ok ? ((await r.json()) as Health) : { ok: false, judge0: false, mentor: false }))
      .catch(() => ({ ok: false, judge0: false, mentor: false }));
  }
  return cached;
}

export interface RunResult {
  status: string; // e.g. 'Accepted', 'Compilation Error', 'Runtime Error (NZEC)', 'Time Limit Exceeded'
  stdout: string;
  stderr: string;
  compileOutput: string;
  time?: string;
  memory?: number;
}

export async function runCode(language: 'c' | 'cpp' | 'python', source: string, stdin: string): Promise<RunResult> {
  const r = await fetch('/api/run', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ language, source, stdin }) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({ error: r.statusText }))).error ?? 'Execution service error');
  return (await r.json()) as RunResult;
}

export interface MentorRequest {
  mode: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  context?: {
    challenge?: { title: string; description: string; hints: string[] };
    hintLevel?: number;
    solutionRequested?: boolean;
    learner?: { level: string; weakTopics: string[] };
  };
}

export async function askMentor(req: MentorRequest): Promise<string> {
  const r = await fetch('/api/mentor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(req) });
  if (!r.ok) throw new Error((await r.json().catch(() => ({ error: r.statusText }))).error ?? 'Mentor service error');
  const data = (await r.json()) as { text: string };
  return data.text;
}
