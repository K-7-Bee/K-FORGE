// K-FORGE API server. Holds all secrets server-side; the browser only talks to /api.
//   GET  /api/health  → which optional services are configured
//   POST /api/run     → compile & run code on a Judge0 instance (never faked)
//   POST /api/mentor  → Engineering Mentor via the Claude API
// In production it also serves the built app from ../dist.
// Start: npm run server   (reads ../.env if present; see .env.example)
import Anthropic from '@anthropic-ai/sdk';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import webpush from 'web-push';
import { dueReminders, loadSubs, loadVapid, localNow, reminderBody, saveSubs } from './reminders.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const DIST = join(here, '..', 'dist');
const PORT = Number(process.env.PORT || 8787);
const JUDGE0_URL = (process.env.JUDGE0_URL || '').replace(/\/$/, '');
const JUDGE0_KEY = process.env.JUDGE0_RAPIDAPI_KEY || '';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';
const mentorEnabled = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const anthropic = mentorEnabled ? new Anthropic() : null;

// Judge0 CE language ids: C (GCC 9.2.0), C++ (GCC 9.2.0), Python 3.8.1
const LANG = { c: 50, cpp: 54, python: 71 };
const MAX_BODY = 200_000;

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('Request too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

// ---------- Judge0 ----------
const b64 = (s) => Buffer.from(s ?? '', 'utf8').toString('base64');
const unb64 = (s) => (s ? Buffer.from(s, 'base64').toString('utf8') : '');

async function runOnJudge0({ language, source, stdin }) {
  const id = LANG[language];
  if (!id) throw Object.assign(new Error('Unsupported language'), { status: 400 });
  if (typeof source !== 'string' || source.length > 64_000) throw Object.assign(new Error('Source missing or too long'), { status: 400 });
  const headers = { 'content-type': 'application/json' };
  if (JUDGE0_KEY) {
    headers['X-RapidAPI-Key'] = JUDGE0_KEY;
    headers['X-RapidAPI-Host'] = new URL(JUDGE0_URL).host;
  }
  const r = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ language_id: id, source_code: b64(source), stdin: b64(stdin), cpu_time_limit: 2, memory_limit: 128000 }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) throw Object.assign(new Error(`Judge0 responded ${r.status}`), { status: 502 });
  const d = await r.json();
  return {
    status: d.status?.description ?? 'Unknown',
    stdout: unb64(d.stdout),
    stderr: unb64(d.stderr),
    compileOutput: unb64(d.compile_output),
    time: d.time ?? undefined,
    memory: d.memory ?? undefined,
  };
}

// ---------- Engineering Mentor ----------
const HINT_RULES = {
  0: 'The learner has not unlocked any hints for this challenge. Do not give hints about the solution itself; ask what they have tried, what they expected, and what happened. You may clarify the problem statement.',
  1: 'Give HINT 1 only: a conceptual clue that points at the relevant idea, in one or two sentences. No method steps, no code.',
  2: 'Give HINT 2 only: explain the relevant method or technique in general terms. You may name the operations involved, but do not write the solution and do not apply it to their exact values or code.',
  3: 'Give HINT 3 only: walk through a guided example on a DIFFERENT but analogous problem. Do not solve their exact problem.',
};

function systemPrompt(mode, context = {}) {
  const lines = [
    'You are the Engineering Mentor inside K-FORGE, an academy that takes an electrical engineering student to independent embedded systems, robotics and control engineering. Be a patient, precise engineering instructor.',
    'Teaching principles:',
    '- Explain in plain language first, then add the precise engineering detail. Use real examples from embedded work (ESP32, Arduino Uno, STM32 Nucleo, I2C sensors, motor drivers, the learner\'s air-quality robot).',
    '- Encourage the learner to explain their reasoning. When they share an attempt, point at the first thing to check and ask them to predict the result before testing.',
    '- Prefer measurement and documentation: datasheet sections, multimeter/logic analyzer checks, compiler warnings.',
    '- Use metric units and C (C11) by default; C++ only where it helps embedded work. Keep code short and correct. Flag safety issues (lithium cells, mains, motor current).',
    '- Never claim you ran or compiled code. Say what you expect and how the learner can verify it.',
    '- Keep answers focused: usually under 250 words, with short code blocks when needed. Use Markdown.',
  ];
  if (context.learner) lines.push(`Learner: level "${context.learner.level}". Topics currently weak: ${(context.learner.weakTopics || []).join(', ') || 'none recorded'}.`);
  if (context.challenge) {
    lines.push(
      '',
      'The learner is working on this practical challenge:',
      `Title: ${context.challenge.title}`,
      `Description: ${context.challenge.description}`,
      'IMPORTANT LEARNING RULE: do not give a complete answer, full corrected code, or final numeric result for this challenge.',
      context.solutionRequested
        ? 'The learner has EXPLICITLY requested the full solution after working through the hints. You may now give the complete solution, explain why each part is needed, and then suggest they rebuild it from a blank file without looking.'
        : HINT_RULES[Math.max(0, Math.min(3, Number(context.hintLevel) || 0))],
    );
  }
  const modes = {
    explain: 'Mode: explain a concept simply, then with a real engineering example, then one quick question to check understanding.',
    code: 'Mode: analyse the learner\'s code. Point out the most important issue first, explain why it matters on a microcontroller, and ask a guiding question rather than rewriting everything.',
    debug: 'Mode: help identify a programming or hardware error. Use the method: reproduce, describe expected vs actual, one hypothesis, test only that, fix and retest.',
    datasheet: 'Mode: explain a datasheet section. Say which section to look in, what each value means, and which values to design to (recommended operating conditions, not absolute maximums).',
    circuit: 'Mode: explain a circuit diagram: power and ground first, the main chip, signal paths, support parts, then predicted voltages.',
    practice: 'Mode: generate 3 new practice questions on the topic with varied formats (calculation, predict-the-output, explanation). Put answers at the end under a heading "Answers" so the learner can attempt first.',
    revision: 'Mode: recommend what to revise next based on the weak topics provided, with a short plan for the next study session.',
    report: 'Mode: review a project report. Check it has measured results with spread, honest limitations, and a clear structure (abstract, design, method, results, discussion, conclusion). Give specific improvements.',
    project: 'Mode: guide an independent project. Help break it into milestones with measurable completion criteria; do not design it for them.',
  };
  lines.push('', modes[mode] || modes.explain);
  return lines.join('\n');
}

async function mentor(body) {
  if (!anthropic) throw Object.assign(new Error('The AI mentor is not configured on the server.'), { status: 503 });
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const clean = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 12_000) }));
  if (!clean.length || clean[0].role !== 'user') throw Object.assign(new Error('Conversation must start with a user message.'), { status: 400 });

  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: systemPrompt(body.mode, body.context),
    output_config: { effort: 'medium' },
    // Server-side refusal fallback: if a safety classifier declines, the API re-runs on a suitable model.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: clean,
  });

  if (response.stop_reason === 'refusal') {
    return { text: 'I can\'t help with that request. Try rephrasing it around the engineering concept you\'re learning.' };
  }
  const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
  if (response.stop_reason === 'max_tokens') return { text: `${text}\n\n_(Response was cut off — ask me to continue.)_` };
  return { text: text || 'I could not produce an answer. Please try again.' };
}

function mentorError(e) {
  if (e instanceof Anthropic.AuthenticationError) return [502, 'The server\'s Claude API credentials were rejected.'];
  if (e instanceof Anthropic.RateLimitError) return [429, 'The mentor is rate limited — try again in a moment.'];
  if (e instanceof Anthropic.BadRequestError) return [400, 'The mentor could not process that request.'];
  if (e instanceof Anthropic.APIConnectionError) return [502, 'Could not reach the Claude API.'];
  if (e instanceof Anthropic.APIError) return [502, `Claude API error (${e.status ?? 'unknown'}).`];
  return [e.status || 500, e.message || 'Server error'];
}

// ---------- Web Push reminders ----------
const vapid = loadVapid(webpush);
webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:kforge@localhost', vapid.publicKey, vapid.privateKey);
let subs = loadSubs();

async function pushTo(sub, payload) {
  try {
    await webpush.sendNotification(sub.subscription, JSON.stringify(payload), { TTL: 3600 });
    return true;
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 410) { delete subs[sub.subscription.endpoint]; saveSubs(subs); } // expired subscription
    else console.error('[push]', e.statusCode ?? '', e.message);
    return false;
  }
}

async function handlePush(path, body) {
  const endpoint = body?.subscription?.endpoint ?? body?.endpoint;
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://')) throw Object.assign(new Error('Invalid push endpoint'), { status: 400 });
  if (path === '/api/push/subscribe') {
    const time = /^\d{2}:\d{2}$/.test(body.time) ? body.time : '19:00';
    subs[endpoint] = { ...subs[endpoint], subscription: body.subscription, time, timeZone: String(body.timeZone || 'UTC'), examMode: Boolean(body.examMode), updatedAt: new Date().toISOString() };
    saveSubs(subs);
    return { ok: true };
  }
  if (path === '/api/push/unsubscribe') { delete subs[endpoint]; saveSubs(subs); return { ok: true }; }
  const sub = subs[endpoint];
  if (!sub) throw Object.assign(new Error('Not subscribed'), { status: 404 });
  if (path === '/api/push/activity') { sub.lastActive = String(body.day || ''); saveSubs(subs); return { ok: true }; }
  if (path === '/api/push/test') return { ok: await pushTo(sub, { title: 'K-FORGE', body: 'Background reminders are working.', url: '/' }) };
  throw Object.assign(new Error('Not found'), { status: 404 });
}

setInterval(async () => {
  for (const sub of dueReminders(subs)) {
    const { day } = localNow(new Date(), sub.timeZone);
    sub.lastSent = day;
    saveSubs(subs);
    await pushTo(sub, { title: 'K-FORGE', body: reminderBody(sub), url: '/' });
  }
}, 60_000);

// ---------- Static files (production) ----------
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

function serveStatic(req, res) {
  if (!existsSync(DIST)) { res.writeHead(404); res.end('Build the app first (npm run build), or use npm run dev.'); return; }
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(DIST, urlPath));
  if (!file.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html'); // SPA fallback
  const ext = extname(file);
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': file.includes(`${join('dist', 'assets')}`) ? 'public, max-age=31536000, immutable' : 'no-cache' });
  createReadStream(file).pipe(res);
}

createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  try {
    if (path === '/api/health') return send(res, 200, { ok: true, judge0: Boolean(JUDGE0_URL), mentor: mentorEnabled, model: mentorEnabled ? MODEL : undefined, push: true });
    if (path === '/api/push/key') return send(res, 200, { publicKey: vapid.publicKey });
    if (path.startsWith('/api/push/') && req.method === 'POST') return send(res, 200, await handlePush(path, await readJson(req)));
    if (path === '/api/run' && req.method === 'POST') {
      if (!JUDGE0_URL) return send(res, 503, { error: 'No Judge0 endpoint configured (JUDGE0_URL).' });
      return send(res, 200, await runOnJudge0(await readJson(req)));
    }
    if (path === '/api/mentor' && req.method === 'POST') {
      try { return send(res, 200, await mentor(await readJson(req))); } catch (e) { const [s, m] = mentorError(e); console.error('[mentor]', e?.message); return send(res, s, { error: m }); }
    }
    if (path.startsWith('/api/')) return send(res, 404, { error: 'Not found' });
    return serveStatic(req, res);
  } catch (e) {
    console.error('[api]', e?.message);
    return send(res, e.status || 500, { error: e.message || 'Server error' });
  }
}).listen(PORT, () => {
  console.log(`K-FORGE API on http://localhost:${PORT}  ·  Judge0: ${JUDGE0_URL ? 'on' : 'off'}  ·  Mentor: ${mentorEnabled ? `on (${MODEL})` : 'off'}`);
});
