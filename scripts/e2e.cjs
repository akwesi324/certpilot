// End-to-end test in headless Edge/Chrome (DevTools protocol): register -> setup -> practice ->
// simulation (answers hidden, submit) -> timer expiry enforced by the server. Cleans up after.
/* eslint-disable @typescript-eslint/no-require-imports -- plain Node script, run without a bundler */
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const CP = path.resolve(__dirname, '..');
const { PrismaClient } = require(path.join(CP, 'node_modules/@prisma/client'));
const EDGE = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE = process.env.BASE_URL || 'http://localhost:3001';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const prisma = new PrismaClient();
const results = [];
const check = (n, ok, d = '') => results.push([ok ? 'PASS' : 'FAIL', n, d]);

(async () => {
  const email = `e2e-${Date.now()}@test.local`;
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cp-e2e-'));
  const port = 9300 + Math.floor(Math.random() * 300);
  const edge = spawn(EDGE, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--window-size=1366,1000', 'about:blank'], { stdio: 'ignore' });
  let ws;
  for (let i = 0; i < 50 && !ws; i++) { await sleep(200); try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const p = l.find((t) => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch { /* wait */ } }
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const waiting = new Map(); const errors = [];
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); }
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errors.push(d.params.args.map((a) => a.value || a.description || '').join(' ').slice(0, 200));
    if (d.method === 'Runtime.exceptionThrown') errors.push(`EXC ${(d.params.exceptionDetails.exception || {}).description || d.params.exceptionDetails.text}`.slice(0, 200));
  });
  const cdp = (method, params = {}) => new Promise((res, rej) => { const i = ++id; waiting.set(i, (d) => (d.error ? rej(new Error(d.error.message)) : res(d.result))); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (e) => (await cdp('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result.value;
  const waitFor = async (e, what, n = 200) => { for (let i = 0; i < n; i++) { if (await ev(e).catch(() => false)) return; await sleep(250); } throw new Error(`timeout: ${what} @ ${await ev('location.href')} :: ${(await ev('document.body.innerText')).slice(0, 200)}`); };
  const shot = async (name) => { await sleep(600); const r = await cdp('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(os.tmpdir(), `certpilot-${name}.png`), Buffer.from(r.data, 'base64')); };
  const setVal = (sel, v) => ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(v)}); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  const click = (text, scope = 'button, a, label') => ev(`(() => { const b = [...document.querySelectorAll(${JSON.stringify(scope)})].find(x => x.textContent.trim().includes(${JSON.stringify(text)}) && !x.disabled); if (!b) throw new Error('no element: ' + ${JSON.stringify(text)}); b.click(); return true; })()`);
  try {
    await cdp('Page.enable'); await cdp('Runtime.enable');
    await cdp('Page.navigate', { url: `${BASE}/` });
    await waitFor(`document.body.innerText.includes('study partner')`, 'landing');
    await shot('1-landing');
    check('landing page + copyright', await ev(`document.body.innerText.includes('MaskedOps')`));

    await cdp('Page.navigate', { url: `${BASE}/register` });
    await waitFor(`!!document.querySelector('input[name=name]')`, 'register form'); await sleep(2500);
    await setVal('input[name=name]', 'Ama Mensah'); await setVal('input[name=email]', email); await setVal('input[name=password]', 'correct horse 1');
    await click('Create account');
    await waitFor(`location.pathname === '/setup'`, 'setup after register');
    await sleep(2000);
    await click('CompTIA Security+', 'label');
    await setVal('input[name=examDate]', '2026-12-15'); await setVal('input[name=institution]', 'KNUST Cyber Club');
    await shot('2-setup');
    await click('Save and continue');
    await waitFor(`location.pathname === '/dashboard' && document.body.innerText.includes('Readiness by domain')`, 'dashboard');
    check('setup saved: exam + institution on dashboard', await ev(`document.body.innerText.includes('CompTIA Security+') && document.body.innerText.includes('KNUST Cyber Club')`));
    await shot('3-dashboard');

    // Practice: 10 questions; answer each, check feedback appears with explanations for all 4 options
    await setVal('select[name=count]', '10');
    await click('Start practice');
    await waitFor(`location.pathname.startsWith('/test/') && document.body.innerText.includes('Question 1 of 10')`, 'practice start');
    await sleep(1500);
    let correct = 0;
    for (let q = 0; q < 10; q++) {
      await ev(`document.querySelectorAll('[role=radio]')[${q % 4}].click()`);
      await click('Check answer');
      await waitFor(`/Correct\\.|Not quite/.test(document.body.innerText)`, `feedback ${q}`);
      const fb = await ev(`(() => { const t = document.body.innerText; return { ok: !t.includes('Not quite'), n: (t.match(/^[ABCD]\\. /gm) || []).length }; })()`);
      if (fb.ok) correct++;
      if (q === 0) { check('practice: explanation for every option shown', fb.n >= 4, `${fb.n} option explanations`); await shot('4-practice-feedback'); }
      if (q < 9) await click('Next');
    }
    await click('Finish');
    await waitFor(`!!document.querySelector('[role=dialog]')`, 'confirm');
    await ev(`[...document.querySelectorAll('[role=dialog] button')].find(b => b.textContent.trim() === 'Submit').click()`);
    await waitFor(`location.pathname.endsWith('/results') && document.body.innerText.includes('By domain')`, 'practice results');
    const score = await ev(`document.querySelector('.rounded-full .text-2xl').textContent`);
    check('practice score matches answers', score === `${correct * 10}%`, `UI ${score}, counted ${correct}/10`);
    await shot('5-results');

    // Simulation: bank has 25 Security+ questions -> shortened, time scaled: 25/90 * 90 min = 25 min
    await cdp('Page.navigate', { url: `${BASE}/exams/secplus` });
    await waitFor(`document.body.innerText.includes('Exam simulation')`, 'exam page'); await sleep(2000);
    await click('Start simulation');
    await waitFor(`location.pathname.startsWith('/test/') && document.body.innerText.includes('of 25')`, 'simulation start');
    const simId = await ev(`location.pathname.split('/')[2]`);
    await sleep(1500);
    const clock = await ev(`[...document.querySelectorAll('span')].map(s => s.textContent).find(t => /^\\d+:\\d\\d$/.test(t))`);
    check('simulation: 25 questions, ~25 min timer', /^2[45]:\d\d$/.test(clock || ''), clock);
    await ev(`document.querySelectorAll('[role=radio]')[0].click()`); await sleep(800);
    check('simulation: no answer revealed after choosing', await ev(`!/Correct\\.|Not quite/.test(document.body.innerText)`));
    await click('Flag for review'); await sleep(500);
    await shot('6-simulation');
    const dbItem = await prisma.attemptItem.findFirst({ where: { attemptId: simId, position: 0 } });
    check('simulation answer + flag saved server-side', dbItem.selected !== null && dbItem.flagged === true);
    // Server enforces the deadline: move it into the past, reload -> auto-submitted as EXPIRED
    await prisma.attempt.update({ where: { id: simId }, data: { expiresAt: new Date(Date.now() - 60_000) } });
    await cdp('Page.navigate', { url: `${BASE}/test/${simId}` });
    await waitFor(`location.pathname.endsWith('/results')`, 'expired -> results');
    const sim = await prisma.attempt.findUnique({ where: { id: simId } });
    check('expired simulation auto-submitted by server', sim.status === 'EXPIRED' && sim.scorePercent !== null, `${sim.status} ${sim.scorePercent}%`);
    check('results say time ran out', await ev(`document.body.innerText.includes('Time ran out')`));
    // Retake works
    await cdp('Page.navigate', { url: `${BASE}/history` });
    await waitFor(`document.body.innerText.includes('Review')`, 'history');
    check('history lists both tests', (await ev(`document.querySelectorAll('tbody tr').length`)) === 2);
    check('no browser console errors', errors.length === 0, errors.join(' | '));
  } catch (e) {
    check('script', false, e.message);
  } finally {
    const u = await prisma.user.findUnique({ where: { email } });
    if (u) await prisma.user.delete({ where: { id: u.id } });
    await prisma.authThrottle.deleteMany({ where: { key: { startsWith: 'register:' } } });
    await prisma.$disconnect();
    ws.close(); edge.kill(); await sleep(400);
    try { fs.rmSync(prof, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch { /* edge exiting */ }
    for (const [s, n, d] of results) console.log(s.padEnd(5), n, d ? `(${d})` : '');
    console.log(`${results.filter((x) => x[0] === 'PASS').length}/${results.length} passed`);
  }
})();
