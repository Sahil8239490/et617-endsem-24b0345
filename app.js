// =====================================================================
//  app.js — the logic of the tutor. Text lives in content.js.
//  1 helpers · 2 saved state · 3 question generator · 4 diagnosis +
//  decision rule · 5 dashboard + chapters · 6 practice flow ·
//  7 AI feedback · 8 teacher dashboard · 9 wiring
// =====================================================================

// ---------- 1. Helpers ----------
const $ = (id) => document.getElementById(id);
const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sign = () => (Math.random() < 0.5 ? 1 : -1);
const round2 = (n) => Math.round(n * 100) / 100;
const same = (a, b) => a !== null && b !== null && Math.abs(a - b) < 0.001;
const term = (n) => (n >= 0 ? `+ ${n}` : `− ${-n}`);
const coef = (a) => (a === 1 ? "x" : `${a}x`);
const num = (n) => (n < 0 ? `−${-n}` : `${n}`);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const lcm = (a, b) => { const g = (p, q) => (q ? g(q, p % q) : p); return (a * b) / g(a, b); };
const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
const COUNT_LABELS = { one: "Exactly one solution", none: "No solution", infinite: "Infinitely many solutions" };

// Show a number as a fraction when it is not whole: 0.75 -> "3/4"
function toFrac(n) {
  if (Number.isInteger(n)) return num(n);
  for (let d = 2; d <= 200; d++) if (Math.abs(n * d - Math.round(n * d)) < 1e-9) return `${num(Math.round(n * d))}/${d}`;
  return String(round2(n));
}
// Read "21", "-3.5", "−60/23" -> number (NaN if not a number)
function parseAnswer(s) {
  const t = String(s).replace(/−/g, "-").replace(/\s/g, "");
  const m = t.match(/^(-?\d+)\/(-?\d+)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

// ---------- 2. Saved state (browser localStorage) ----------
const KEY = "equation_arena_v2";
const freshState = () => ({ level: 1, attempts: [], session: null, sessionsDone: 0 });
let state = load();
let current = null;   // question on screen
let chosen = null;    // selected option

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || freshState(); } catch { return freshState(); } }
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
const chapterById = (id) => CONTENT.chapters.find((c) => c.id === id);
const chapterForLevel = (lvl) => CONTENT.chapters.find((c) => c.level === lvl);

// ---------- 3. Automatic question generator ----------
// Each question stores the correct answer and the answer produced by a
// misconception, so a wrong answer can be diagnosed.
function generate(level, qNum) {
  let q;
  if (level === 1) {                       // ax + b = cx + d
    let a, b, c, d, x;
    do { c = rand(1, 4); a = c + rand(1, 4); x = rand(-5, 8); b = sign() * rand(1, 9); d = a * x + b - c * x; } while (d === 0 || d === b);
    q = { plain: `${coef(a)} ${term(b)} = ${coef(c)} ${term(d)}`, x, signAns: (d - b) / (a + c), fracAns: null,
      steps: [`Subtract ${coef(c)} from both sides and move ${num(b)}: ${a}x − ${coef(c)} = ${num(d)} ${term(-b)}`, `${a - c}x = ${num(d - b)}`, `x = ${num(x)}`] };
  } else if (level === 2) {                // −k(x + b) = c
    let k, b, x;
    do { k = -rand(2, 5); b = sign() * rand(1, 6); x = rand(-4, 8); } while (x + b === 0);
    const c = k * (x + b);
    q = { plain: `−${-k}(x ${term(b)}) = ${num(c)}`, x, signAns: (c + k * b) / k, fracAns: null,
      steps: [`Expand: ${num(k)}x ${term(k * b)} = ${num(c)}   since (${num(k)}) × (${num(b)}) = ${num(k * b)}`, `${num(k)}x = ${num(c - k * b)}`, `x = ${num(c - k * b)} ÷ (${num(k)}) = ${num(x)}`] };
  } else if (level === 3) {                // x/a + x/b = c
    let a, b;
    do { a = rand(2, 6); b = rand(2, 6); } while (a === b);
    const L = lcm(a, b), x = L * rand(1, 3) * sign(), c = x / a + x / b;
    q = { html: `${F("x", a)} + ${F("x", b)} = ${num(c)}`, plain: `x/${a} + x/${b} = ${num(c)}`, x, signAns: null, fracAns: c * (a + b),
      steps: [`Multiply every term by ${L} (LCM of ${a} and ${b}): ${L / a}x + ${L / b}x = ${num(c * L)}`, `${L / a + L / b}x = ${num(c * L)}`, `x = ${num(x)}`] };
  } else {                                 // number of solutions
    const a = rand(2, 5), b = sign() * rand(1, 6), kind = pick(["one", "none", "infinite"]);
    let right, steps;
    if (kind === "infinite") { right = `${a}x ${term(a * b)}`; steps = [`Expand the left side: ${a}x ${term(a * b)} = ${right}`, `x cancels, leaving ${num(a * b)} = ${num(a * b)}, which is always true`, `Every value of x works: infinitely many solutions`]; }
    else if (kind === "none") { const e = a * b + pick([-3, -2, -1, 1, 2, 3]); right = `${a}x ${term(e)}`; steps = [`Expand the left side: ${a}x ${term(a * b)} = ${right}`, `x cancels, leaving ${num(a * b)} = ${num(e)}, which is false`, `No value of x works: no solution`]; }
    else { const a2 = a + pick([-1, 1, 2]), e = rand(-6, 6); right = `${coef(a2)} ${term(e)}`; steps = [`Expand the left side: ${a}x ${term(a * b)} = ${right}`, `${a - a2}x = ${num(e - a * b)}, and x does not cancel`, `Exactly one solution: x = ${toFrac((e - a * b) / (a - a2))}`]; }
    q = { plain: `${a}(x ${term(b)}) = ${right}`, x: kind, kind: "count", steps, options: ["one", "none", "infinite"].map((id) => ({ id, text: COUNT_LABELS[id] })) };
  }
  if (q.kind !== "count") {
    if (same(q.signAns, q.x)) q.signAns = null;
    if (same(q.fracAns, q.x)) q.fracAns = null;
  }
  q.level = level;
  q.chapter = chapterForLevel(level).id;
  q.title = "Solve for x";
  q.format = q.kind === "count" ? "count" : CONTENT.formatOrder[qNum % CONTENT.formatOrder.length];
  if (q.kind === "count") { q.title = "How many solutions does this equation have?"; if (CONTENT.formatOrder[qNum % 3] === "explain") q.explain = true; }
  if (q.format === "explain") q.explain = true;
  if (q.format === "mcq") q.options = makeOptions(q);
  q.correctText = q.kind === "count" ? COUNT_LABELS[q.x] : `x = ${toFrac(q.x)}`;
  return q;
}

function makeOptions(q) {
  const vals = [q.x, q.signAns, q.fracAns, q.x + pick([-2, -1, 1, 2, 3])].filter((v) => v !== null);
  const uniq = [];
  vals.forEach((v) => { if (!uniq.some((u) => same(u, v))) uniq.push(v); });
  while (uniq.length < 4) { const v = q.x + rand(-6, 6); if (!uniq.some((u) => same(u, v))) uniq.push(v); }
  return uniq.sort(() => Math.random() - 0.5).map((v) => ({ id: String(v), value: v, text: `x = ${toFrac(v)}` }));
}

function olympiadQuestion(i) {
  const o = CONTENT.olympiad[i];
  return { ...o, chapter: 5, level: null, olympiad: true, html: null, promptHtml: o.prompt, plain: o.title, x: o.answer, steps: o.solution,
    options: o.options || null, correctText: o.format === "mcq" ? o.options.find((p) => p.id === o.answer).text : toFrac(o.answer) };
}

// ---------- 4. Diagnosis + DECISION RULE ----------
function diagnose(q, ans) {
  if (q.olympiad) {
    const hit = (v) => (typeof v === "number" ? same(ans, v) : ans === v);
    if (hit(q.answer)) return "correct";
    const trap = (q.traps || []).find((t) => hit(t.answer));
    return trap ? trap.misconception : "unknown";
  }
  if (q.kind === "count") {
    if (ans === q.x) return "correct";
    return ans === "one" ? "oneSolution" : "unknown";
  }
  if (same(ans, q.x)) return "correct";
  if (same(ans, q.signAns)) return "sign";
  if (same(ans, q.fracAns)) return "fraction";
  return "unknown";
}

// DECISION RULE
//  correct                                   -> harder question (level + 1)
//  wrong, known misconception, first in a row -> targeted explanation, same level
//  wrong twice in a row, or unknown error     -> prerequisite review, level − 1
function decide(diag) {
  const s = state.session;
  if (diag === "correct") { s.wrongStreak = 0; state.level = Math.min(CONTENT.maxLevel, state.level + 1); return "harder"; }
  s.wrongStreak += 1;
  if (s.wrongStreak >= 2 || diag === "unknown") { s.wrongStreak = 0; state.level = Math.max(1, state.level - 1); return "prerequisite"; }
  return "reexplain";
}

// ---------- 5. Navigation, dashboard and chapters ----------
function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  $(id).classList.remove("hidden");
  const tab = { dashboard: "dashboard", chapters: "chapters", chapter: "chapters", question: "chapters", feedback: "chapters", summary: "chapters", "teacher-login": "teacher-login", teacher: "teacher-login", about: "about" }[id];
  document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("active", b.dataset.go === tab));
  window.scrollTo(0, 0);
  if (id === "dashboard") renderDashboard();
  if (id === "chapters") renderChapters();
  if (id === "about") renderAbout();
  if (id === "teacher") renderTeacher();
}

function stats(list = state.attempts) {
  const correct = list.filter((a) => a.diagnosis === "correct").length;
  let streak = 0, best = 0;
  list.forEach((a) => { streak = a.diagnosis === "correct" ? streak + 1 : 0; best = Math.max(best, streak); });
  const time = list.reduce((t, a) => t + (a.timeSec || 0), 0);
  return { total: list.length, correct, acc: pct(correct, list.length), best, hints: list.filter((a) => a.hint).length, avg: list.length ? Math.round(time / list.length) : 0 };
}

function mastery(ch) {
  const list = state.attempts.filter((a) => a.chapter === ch.id && a.diagnosis === "correct");
  if (ch.olympiad) return pct(new Set(list.map((a) => a.title)).size, CONTENT.olympiad.length);
  return Math.min(100, list.length * 20);   // 5 correct answers = 100%
}

const misconceptionCounts = () => Object.keys(CONTENT.misconceptions).map((k) => ({ k, n: state.attempts.filter((a) => a.diagnosis === k).length }));

function barChart(list) {
  const last = list.slice(-14);
  if (!last.length) return `<p class="empty">No attempts yet. Your time per question will appear here.</p>`;
  const max = Math.max(...last.map((a) => a.timeSec || 1), 1);
  return `<div class="bars">${last.map((a) => `<div class="${a.diagnosis === "correct" ? "" : "wrong"}" style="height:${Math.max(6, (100 * (a.timeSec || 1)) / max)}%" title="${esc(a.title)}: ${a.timeSec}s"></div>`).join("")}</div>
    <div class="legend"><span><i style="background:var(--text)"></i>Correct</span><span><i style="background:#c9cddc"></i>Incorrect</span><span>Bar height = seconds taken</span></div>`;
}

function renderDashboard() {
  const s = stats();
  const next = chapterForLevel(state.level);
  const inSession = state.session && state.session.qNum < state.session.total;
  const reviewed = state.attempts.filter((a) => a.review && a.review.status !== "pending" && a.ai).slice(-3).reverse();
  $("dashboard").innerHTML = `
    <div class="page-head"><div><h2>Dashboard</h2><p class="muted">Your progress in Linear Equations in One Variable.</p></div></div>
    <div class="grid">
      <div class="card dark span-4">
        <div class="muted">Current level</div>
        <div class="big">${state.level} <span style="font-size:18px;color:#9aa3c7">/ ${CONTENT.maxLevel}</span></div>
        <div>${esc(next.title)}</div>
        <button class="link-btn" id="dash-go">${inSession ? "Resume practice" : "Start practice"} →</button>
      </div>
      <div class="card span-8">
        <div class="card-title">Time per question <span class="muted">last 14 attempts</span></div>
        ${barChart(state.attempts)}
      </div>
      <div class="span-12 stats">
        <div><div class="stat-label">Questions attempted</div><div class="stat-value">${s.total}</div></div>
        <div><div class="stat-label">Accuracy</div><div class="stat-value">${s.acc}%</div></div>
        <div><div class="stat-label">Best streak</div><div class="stat-value">${s.best}</div></div>
        <div><div class="stat-label">Avg. time per question</div><div class="stat-value">${s.avg}s</div></div>
      </div>
      <div class="card span-4">
        <div class="card-title">Chapter mastery</div>
        ${CONTENT.chapters.map((c) => `<div class="row-item" style="display:block"><div style="display:flex;justify-content:space-between"><span>${esc(c.title)}</span><b>${mastery(c)}%</b></div><div class="hbar"><div style="width:${mastery(c)}%"></div></div></div>`).join("")}
      </div>
      <div class="card span-4">
        <div class="card-title">Misconceptions detected</div>
        ${misconceptionCounts().map((m) => `<div class="row-item" style="display:block"><div style="display:flex;justify-content:space-between"><span>${esc(CONTENT.misconceptions[m.k])}</span><b>${m.n}</b></div><div class="hbar red"><div style="width:${pct(m.n, Math.max(1, s.total - s.correct))}%"></div></div></div>`).join("")}
      </div>
      <div class="card accent span-4">
        <div style="opacity:.85">Recommended next</div>
        <div class="big" style="font-size:24px;margin:6px 0">${esc(next.title)}</div>
        <div style="opacity:.85;font-size:14px">${esc(next.summary)}</div>
        <button class="link-btn" id="dash-rec">Open chapter →</button>
      </div>
      <div class="card span-7">
        <div class="card-title">Recent activity</div>
        ${state.attempts.length ? `<table class="data"><tr><th>Chapter</th><th>Question</th><th>Result</th><th>Time</th></tr>${state.attempts.slice(-6).reverse().map((a) => `<tr><td>${a.chapter}</td><td>${esc(a.title)}</td><td><span class="badge ${a.diagnosis === "correct" ? "ok" : "no"}">${a.diagnosis === "correct" ? "Correct" : "Incorrect"}</span></td><td>${a.timeSec}s</td></tr>`).join("")}</table>` : `<p class="empty">No activity yet. Open a chapter to begin.</p>`}
      </div>
      <div class="card span-5">
        <div class="card-title">Teacher feedback</div>
        ${reviewed.length ? reviewed.map((a) => `<div class="row-item" style="display:block"><b>${esc(a.title)}</b> <span class="badge ${a.review.status}">${a.review.status === "approved" ? "Approved" : "Teacher note"}</span><div class="muted" style="font-size:13px">${esc(a.review.status === "overridden" ? a.review.note : a.ai.feedback)}</div></div>`).join("") : `<p class="empty">No reviewed feedback yet. Your teacher reviews your written justifications.</p>`}
      </div>
    </div>`;
  $("dash-go").onclick = () => (inSession ? nextQuestion() : openChapter(next.id));
  $("dash-rec").onclick = () => openChapter(next.id);
}

function renderChapters() {
  $("chapters").innerHTML = `
    <div class="page-head"><div><h2>Chapters</h2><p class="muted">Linear Equations in One Variable · select a chapter to study and practise.</p></div></div>
    <div class="tiles">${CONTENT.chapters.map((c) => `
      <button class="tile ${c.olympiad ? "dark" : ""}" data-ch="${c.id}">
        <span class="num">Chapter ${String(c.id).padStart(2, "0")}</span>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.summary)}</p>
        <div>${c.level === state.level ? `<span class="tag">Recommended</span>` : ""}</div>
        <div class="hbar" style="margin-top:10px"><div style="width:${mastery(c)}%"></div></div>
        <span class="num" style="margin-top:6px">${mastery(c)}% mastery</span>
      </button>`).join("")}</div>`;
  document.querySelectorAll("[data-ch]").forEach((b) => (b.onclick = () => openChapter(Number(b.dataset.ch))));
}

function openChapter(id) {
  const c = chapterById(id);
  const s = stats(state.attempts.filter((a) => a.chapter === id));
  $("chapter").innerHTML = `
    <div class="page-head"><div><button class="link-btn" style="margin:0 0 6px;color:var(--muted)" id="ch-back">← All chapters</button><h2>Chapter ${String(c.id).padStart(2, "0")} · ${esc(c.title)}</h2><p class="muted">${esc(c.summary)}</p></div></div>
    <div class="grid">
      <div class="card span-8">
        <div class="card-title">Key ideas</div>
        <ol style="margin:0;padding-left:20px">${c.concept.map((t) => `<li style="margin-bottom:8px">${esc(t)}</li>`).join("")}</ol>
        <div class="eq" style="font-size:18px">${esc(c.example)}</div>
      </div>
      <div class="card span-4">
        <div class="card-title">Your record</div>
        <div class="row-item"><span>Attempts</span><b>${s.total}</b></div>
        <div class="row-item"><span>Accuracy</span><b>${s.acc}%</b></div>
        <div class="row-item"><span>Mastery</span><b>${mastery(c)}%</b></div>
        <button class="btn primary" style="width:100%;margin-top:16px" id="ch-start">${c.olympiad ? `Start problem set (${CONTENT.olympiad.length})` : `Start practice (${CONTENT.questionsPerSession} questions)`}</button>
        ${c.olympiad ? "" : `<p class="muted" style="font-size:12px;margin:10px 0 0">Practice is adaptive: difficulty changes after every answer.</p>`}
      </div>
    </div>`;
  $("ch-back").onclick = () => show("chapters");
  $("ch-start").onclick = () => startSession(id);
  show("chapter");
}

// ---------- 6. Practice flow ----------
function startSession(chapterId) {
  const c = chapterById(chapterId);
  if (!c.olympiad) state.level = c.level;
  state.session = { chapterId, olympiad: !!c.olympiad, qNum: 0, total: c.olympiad ? CONTENT.olympiad.length : CONTENT.questionsPerSession, wrongStreak: 0, ids: [] };
  save();
  nextQuestion();
}

function nextQuestion() {
  const s = state.session;
  current = s.olympiad ? olympiadQuestion(s.qNum) : generate(state.level, s.qNum);
  current.start = Date.now();
  current.hintUsed = false;
  chosen = null;
  const ch = chapterById(current.chapter);
  $("q-chapter").textContent = s.olympiad ? `Olympiad problem set` : `Chapter ${ch.id} · ${ch.title}`;
  $("q-count").textContent = `Question ${s.qNum + 1} of ${s.total}`;
  $("q-progress").style.width = `${pct(s.qNum, s.total)}%`;
  $("q-format").textContent = CONTENT.formatLabels[current.format] + (current.explain && current.format !== "explain" ? " + justification" : "");
  $("q-title").textContent = current.olympiad ? `${s.qNum + 1}. ${current.title}` : current.title;
  $("q-prompt").innerHTML = current.olympiad ? current.promptHtml : `<div class="equation">${current.html || esc(current.plain)}</div>`;
  $("q-hint").classList.add("hidden");
  $("q-hint").textContent = current.hint || CONTENT.hint;

  let html = current.options
    ? current.options.map((o) => `<button class="option" data-id="${esc(o.id)}">${esc(o.text)}</button>`).join("")
    : `<label>Your answer${current.olympiad ? " (integer or fraction, e.g. -60/23)" : " (x =)"}<input type="text" id="ans" inputmode="text" autocomplete="off" /></label>`;
  if (current.explain) html += `<label>Justification — explain your method in one or two sentences<textarea id="explain"></textarea></label>`;
  $("q-input").innerHTML = html;
  document.querySelectorAll(".option").forEach((b) => (b.onclick = () => {
    document.querySelectorAll(".option").forEach((o) => o.classList.remove("selected"));
    b.classList.add("selected"); chosen = b.dataset.id;
  }));
  show("question");
}

function readAnswer() {
  if (!current.options) { const v = parseAnswer($("ans").value); return { value: v, text: $("ans").value.trim() }; }
  if (chosen === null) return { value: NaN };
  const opt = current.options.find((o) => o.id === chosen);
  return { value: opt.value !== undefined ? opt.value : opt.id, text: opt.text };
}

function checkAnswer() {
  const { value, text } = readAnswer();
  if (typeof value === "number" && isNaN(value)) { alert(current.options ? "Select an option first." : "Enter a number or a fraction such as -3/4."); return; }
  const explanation = current.explain ? $("explain").value.trim() : "";
  if (current.explain && explanation.length < 3) { alert("Add a short justification first."); return; }

  const s = state.session;
  const diag = diagnose(current, value);
  const outcome = s.olympiad ? "olympiad" : decide(diag);
  const attempt = {
    id: Date.now(), time: new Date().toLocaleString(), chapter: current.chapter, level: current.level, format: current.format,
    title: current.olympiad ? current.title : current.plain, answerText: text, correctText: current.correctText, diagnosis: diag, outcome,
    timeSec: Math.max(1, Math.round((Date.now() - current.start) / 1000)), hint: current.hintUsed, explanation,
    ai: null, review: current.explain ? { status: "pending", note: "" } : null,
  };
  state.attempts.push(attempt);
  s.qNum += 1;
  if (s.qNum >= s.total) state.sessionsDone += 1;
  save();
  renderFeedback(attempt);
  if (current.explain) getAIFeedback(attempt);
}

function renderFeedback(a) {
  const ok = a.diagnosis === "correct";
  $("fb-status").innerHTML = ok
    ? `<div class="status ok"><b>Correct</b><span>${esc(a.correctText)}</span></div>`
    : `<div class="status no"><b>Incorrect</b><span>Your answer: ${esc(a.answerText)} · Correct answer: ${esc(a.correctText)}</span></div>`;

  let remedy = "";
  if (!ok) remedy += `<div class="block"><h4>Diagnosis · ${esc(CONTENT.misconceptions[a.diagnosis])}</h4>${esc(CONTENT.remedies[a.diagnosis])}</div>`;
  if (a.outcome === "prerequisite") {
    const p = CONTENT.prerequisite;
    remedy += `<div class="block"><h4>${esc(p.title)}</h4><table>${p.rows.map((r) => `<tr><td>${esc(r[0])}</td><td>= ${esc(r[1])}</td></tr>`).join("")}</table><p style="margin:8px 0 0">${esc(p.note)}</p></div>`;
  }
  $("fb-remedy").innerHTML = remedy;
  $("fb-ai").innerHTML = "";
  $("fb-solution").innerHTML = `<div class="block"><h4>Solution in brief</h4><ol>${current.steps.map((t) => `<li>${esc(t)}</li>`).join("")}</ol></div>`;

  const s = state.session;
  const done = s.qNum >= s.total;
  const lvl = a.outcome === "olympiad" ? "" : ` · Level ${state.level}: ${chapterForLevel(state.level).title}`;
  $("fb-next").textContent = done ? "Set complete" : CONTENT.decisions[a.outcome] + lvl;
  $("btn-continue").textContent = done ? "View results" : "Next question";
  show("feedback");
}

function continueOn() {
  const s = state.session;
  if (s.qNum >= s.total) renderSummary(); else nextQuestion();
}

function renderSummary() {
  const s = state.session;
  const list = state.attempts.slice(-s.total);
  const st = stats(list);
  $("summary").innerHTML = `
    <div class="page-head"><div><h2>Results</h2><p class="muted">${esc(chapterById(s.chapterId).title)}</p></div></div>
    <div class="grid">
      <div class="span-12 stats">
        <div><div class="stat-label">Score</div><div class="stat-value">${st.correct} / ${st.total}</div></div>
        <div><div class="stat-label">Accuracy</div><div class="stat-value">${st.acc}%</div></div>
        <div><div class="stat-label">Avg. time</div><div class="stat-value">${st.avg}s</div></div>
        <div><div class="stat-label">Level now</div><div class="stat-value">${state.level} / ${CONTENT.maxLevel}</div></div>
      </div>
      <div class="card span-12">
        <div class="card-title">Question by question</div>
        <table class="data"><tr><th>#</th><th>Question</th><th>Result</th><th>Diagnosis</th><th>Tutor decision</th></tr>
        ${list.map((a, i) => `<tr><td>${i + 1}</td><td>${esc(a.title)}</td><td><span class="badge ${a.diagnosis === "correct" ? "ok" : "no"}">${a.diagnosis === "correct" ? "Correct" : "Incorrect"}</span></td><td>${a.diagnosis === "correct" ? "—" : esc(CONTENT.misconceptions[a.diagnosis])}</td><td>${esc(CONTENT.decisions[a.outcome])}</td></tr>`).join("")}</table>
        <div class="actions"><button class="btn ghost" data-go2="dashboard">Back to dashboard</button><button class="btn primary" id="sum-again">Practise again</button></div>
      </div>
    </div>`;
  $("sum-again").onclick = () => startSession(s.olympiad ? 5 : chapterForLevel(state.level).id);
  document.querySelector("[data-go2]").onclick = () => show("dashboard");
  show("summary");
}

// ---------- 7. AI feedback on the justification (Gemini via /api/feedback) ----------
async function getAIFeedback(a) {
  const box = $("fb-ai");
  box.innerHTML = `<div class="block"><h4>Feedback on your justification</h4><span class="muted">Analysing…</span></div>`;
  let result = null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch("/api/feedback", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
      body: JSON.stringify({ equation: a.title, correctX: a.correctText, learnerAnswer: a.answerText, explanation: a.explanation, diagnosis: a.diagnosis }),
    });
    clearTimeout(t);
    if (res.ok) result = checkAIOutput(await res.json(), a);
  } catch (e) { result = null; }
  if (!result) result = fallbackFeedback(a);
  a.ai = result;
  save();
  box.innerHTML = `<div class="block"><h4>Feedback on your justification <span class="badge pending">Pending teacher review</span></h4>${esc(result.feedback)}<div class="muted" style="font-size:12px;margin-top:6px">Source: ${esc(result.source)}</div></div>`;
}

// Check the AI output BEFORE the learner sees it
function checkAIOutput(out, a) {
  const verdicts = ["correct", "sign_error", "one_solution_assumption", "fraction_error", "unclear"];
  if (!out || !verdicts.includes(out.verdict)) return null;
  if (typeof out.feedback !== "string" || out.feedback.length < 5 || out.feedback.length > 350) return null;
  if (a.diagnosis !== "correct" && out.feedback.toLowerCase().includes(a.correctText.toLowerCase())) return null; // must not reveal the answer
  return { verdict: out.verdict, feedback: out.feedback, source: "AI (Gemini), validated by app" };
}

// Rule-based fallback when the AI fails or its output fails the check
function fallbackFeedback(a) {
  const f = CONTENT.explainFallback;
  const map = { sign: ["sign_error", f.sign], oneSolution: ["one_solution_assumption", f.oneSolution], fraction: ["fraction_error", f.fraction] };
  let [verdict, feedback] = map[a.diagnosis] || ["unclear", f.unclear];
  if (a.diagnosis === "correct" && /both side|each side|cancel|lcm|expand|always true|false|subtract|divide|multiply/i.test(a.explanation)) [verdict, feedback] = ["correct", f.good];
  return { verdict, feedback, source: "Pre-written feedback (AI unavailable)" };
}

// ---------- 8. Teacher dashboard (C5) ----------
function renderTeacher() {
  const s = stats();
  const queue = state.attempts.filter((a) => a.review && a.ai).reverse();
  const pending = queue.filter((a) => a.review.status === "pending").length;
  $("teacher").innerHTML = `
    <div class="page-head"><div><h2>Teacher dashboard</h2><p class="muted">Learner: ${esc(CONTENT.learnerName)} · ${esc(CONTENT.learnerClass)}</p></div>
      <button class="btn ghost sm" id="t-clear">Reset learner data</button></div>
    <div class="grid">
      <div class="span-12 stats">
        <div><div class="stat-label">Attempts</div><div class="stat-value">${s.total}</div></div>
        <div><div class="stat-label">Accuracy</div><div class="stat-value">${s.acc}%</div></div>
        <div><div class="stat-label">Pending reviews</div><div class="stat-value">${pending}</div></div>
        <div><div class="stat-label">Current level</div><div class="stat-value">${state.level} / ${CONTENT.maxLevel}</div></div>
      </div>
      <div class="card span-6">
        <div class="card-title">Chapter progress</div>
        <table class="data"><tr><th>Chapter</th><th>Attempts</th><th>Accuracy</th><th>Mastery</th></tr>
        ${CONTENT.chapters.map((c) => { const cs = stats(state.attempts.filter((a) => a.chapter === c.id)); return `<tr><td>${esc(c.title)}</td><td>${cs.total}</td><td>${cs.acc}%</td><td>${mastery(c)}%</td></tr>`; }).join("")}</table>
      </div>
      <div class="card span-6">
        <div class="card-title">Misconceptions and interaction signals</div>
        ${misconceptionCounts().map((m) => `<div class="row-item"><span>${esc(CONTENT.misconceptions[m.k])}</span><b>${m.n}</b></div>`).join("")}
        <div class="row-item"><span>Hints used</span><b>${s.hints}</b></div>
        <div class="row-item"><span>Avg. time per question</span><b>${s.avg}s</b></div>
        <div class="row-item"><span>Sets completed</span><b>${state.sessionsDone}</b></div>
      </div>
      <div class="card span-12">
        <div class="card-title">AI feedback review queue <span class="muted">approve or override before it becomes final</span></div>
        ${queue.length ? queue.map((a) => `
          <div class="review">
            <div><b>${esc(a.title)}</b> <span class="badge ${a.review.status}">${a.review.status}</span> <span class="muted" style="font-size:12px">${esc(a.time)}</span></div>
            <div style="font-size:14px;margin-top:6px">Answer: ${esc(a.answerText)} (correct: ${esc(a.correctText)}) · Diagnosis: ${esc(a.diagnosis === "correct" ? "correct" : CONTENT.misconceptions[a.diagnosis])}</div>
            <div style="font-size:14px"><span class="muted">Learner justification:</span> “${esc(a.explanation)}”</div>
            <div style="font-size:14px"><span class="muted">AI feedback (${esc(a.ai.source)}, verdict ${esc(a.ai.verdict)}):</span> ${esc(a.ai.feedback)}</div>
            ${a.review.note ? `<div style="font-size:14px"><span class="muted">Teacher note:</span> ${esc(a.review.note)}</div>` : ""}
            <textarea id="note-${a.id}" placeholder="Write replacement feedback to override the AI">${esc(a.review.note)}</textarea>
            <div class="actions"><button class="btn primary sm" data-approve="${a.id}">Approve AI feedback</button><button class="btn ghost sm" data-override="${a.id}">Override with my feedback</button></div>
          </div>`).join("") : `<p class="empty">No justifications submitted yet. Every third practice question asks the learner to justify the answer.</p>`}
      </div>
      <div class="card span-12">
        <div class="card-title">Full attempt log</div>
        ${state.attempts.length ? `<table class="data"><tr><th>Time</th><th>Ch.</th><th>Question</th><th>Answer</th><th>Diagnosis</th><th>Decision</th><th>Sec</th><th>Hint</th></tr>
        ${state.attempts.slice().reverse().map((a) => `<tr><td>${esc(a.time)}</td><td>${a.chapter}</td><td>${esc(a.title)}</td><td>${esc(a.answerText)}</td><td>${a.diagnosis === "correct" ? "Correct" : esc(CONTENT.misconceptions[a.diagnosis])}</td><td>${esc(CONTENT.decisions[a.outcome])}</td><td>${a.timeSec}</td><td>${a.hint ? "Yes" : "—"}</td></tr>`).join("")}</table>` : `<p class="empty">No attempts yet.</p>`}
      </div>
    </div>`;
  $("t-clear").onclick = () => { if (confirm("Delete all learner data on this device?")) { state = freshState(); save(); renderTeacher(); } };
  document.querySelectorAll("[data-approve]").forEach((b) => (b.onclick = () => review(b.dataset.approve, "approved")));
  document.querySelectorAll("[data-override]").forEach((b) => (b.onclick = () => review(b.dataset.override, "overridden")));
}

function review(id, status) {
  const a = state.attempts.find((x) => String(x.id) === String(id));
  if (status === "overridden") {
    const note = $(`note-${id}`).value.trim();
    if (!note) { alert("Write your feedback first."); return; }
    a.review.note = note;
  }
  a.review.status = status;
  save();
  renderTeacher();
}

function renderAbout() {
  $("about").innerHTML = `<div class="panel narrow"><h2>About ${esc(CONTENT.appName)}</h2>${CONTENT.about.map((p) => `<p>${esc(p)}</p>`).join("")}
    <div class="row-item"><span>Roll number</span><b>${esc(CONTENT.rollNo)}</b></div></div>`;
}

// ---------- 9. Wiring ----------
document.querySelectorAll(".rollno").forEach((e) => (e.textContent = CONTENT.rollNo));
document.querySelectorAll(".learner-name").forEach((e) => (e.textContent = CONTENT.learnerName));
$("app-name").textContent = CONTENT.appName;
document.title = CONTENT.appName;
document.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => show(b.dataset.go)));
$("btn-hint").onclick = () => { current.hintUsed = true; $("q-hint").classList.remove("hidden"); };
$("btn-check").onclick = checkAnswer;
$("btn-continue").onclick = continueOn;
$("btn-pin").onclick = () => {
  if ($("pin").value === CONTENT.teacherPin) { $("pin").value = ""; $("pin-msg").textContent = ""; show("teacher"); }
  else $("pin-msg").textContent = "Incorrect PIN.";
};
show("dashboard");
