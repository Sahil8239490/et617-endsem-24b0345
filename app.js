// =====================================================================
//  app.js — the logic of the tutor. Text lives in content.js.
//  Sections: 1 helpers · 2 saved state · 3 question generator ·
//  4 diagnosis + decision rule · 5 screens · 6 AI feedback · 7 teacher view
// =====================================================================

// ---------- 1. Helpers ----------
const $ = (id) => document.getElementById(id);
const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sign = () => (Math.random() < 0.5 ? 1 : -1);
const round2 = (n) => Math.round(n * 100) / 100;
const same = (a, b) => a !== null && b !== null && Math.abs(a - b) < 0.01;
const term = (n) => (n >= 0 ? `+ ${n}` : `− ${-n}`);       // "+ 5" or "− 5"
const coef = (a) => (a === 1 ? "x" : `${a}x`);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ---------- 2. Saved state (kept in the browser's localStorage) ----------
const KEY = "balanceit_state_v1";
const freshState = () => ({ level: 1, qNum: 0, stars: 0, wrongStreak: 0, lessonSeen: false, attempts: [] });
let state = load();
let current = null;     // the question on screen
let chosen = null;      // selected MCQ option
let lessonIdx = 0;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || freshState(); } catch { return freshState(); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

// ---------- 3. Automatic question generator ----------
// Each question stores the correct answer AND the answer a learner would get
// with misconception M1 (sign) or M2 (one side), so wrong answers can be diagnosed.
function generate(level) {
  let q;
  if (level === 1) {                      // x + a = b
    const x = rand(2, 12), a = sign() * rand(2, 9), b = x + a;
    q = { text: `x ${term(a)} = ${b}`, x, signAns: b + a, oneSideAns: null,
      steps: [`x ${term(a)} ${term(-a)} = ${b} ${term(-a)}`, `x = ${x}`] };
  } else if (level === 2) {               // ax + b = c
    const a = rand(2, 5), x = rand(1, 9), b = sign() * rand(1, 9), c = a * x + b;
    q = { text: `${a}x ${term(b)} = ${c}`, x, signAns: (c + b) / a, oneSideAns: c - b,
      steps: [`${a}x = ${c} ${term(-b)}  (${term(-b)} on both sides)`, `${a}x = ${c - b}`, `x = ${c - b} ÷ ${a} = ${x}`] };
  } else if (level === 3) {               // ax + b = cx + d
    let a, b, c, d, x;
    do { c = rand(1, 3); a = c + rand(1, 3); x = rand(1, 6); b = sign() * rand(1, 8); d = a * x + b - c * x; } while (d === 0);
    q = { text: `${coef(a)} ${term(b)} = ${coef(c)} ${term(d)}`, x, signAns: (d - b) / (a + c), oneSideAns: d - b,
      steps: [`${a}x − ${coef(c)} = ${d} ${term(-b)}  (move ${coef(c)} and ${b} using opposite operations)`, `${a - c}x = ${d - b}`, `x = ${x}`] };
  } else {                                // a(x + b) = c
    let a, b, x;
    do { a = rand(2, 5); b = sign() * rand(1, 6); x = rand(1, 8); } while (x + b === 0);
    const c = a * (x + b);
    q = { text: `${a}(x ${term(b)}) = ${c}`, x, signAns: c / a + b, oneSideAns: (c - b) / a,
      steps: [`x ${term(b)} = ${c} ÷ ${a} = ${c / a}  (divide BOTH sides by ${a})`, `x = ${c / a} ${term(-b)} = ${x}`] };
  }
  if (same(q.signAns, q.x)) q.signAns = null;
  if (same(q.oneSideAns, q.x)) q.oneSideAns = null;
  q.level = level;
  q.format = CONTENT.formatOrder[state.qNum % CONTENT.formatOrder.length];
  if (q.format === "mcq") q.options = makeOptions(q);
  return q;
}

function makeOptions(q) {
  const opts = [q.x, q.signAns, q.oneSideAns, q.x + pick([-2, -1, 1, 2, 3])].filter((v) => v !== null).map(round2);
  const unique = [...new Set(opts)];
  while (unique.length < 4) { const v = q.x + rand(-6, 6); if (!unique.includes(v)) unique.push(v); }
  return unique.sort(() => Math.random() - 0.5);
}

// ---------- 4. Diagnosis + DECISION RULE ----------
function diagnose(q, ans) {
  if (same(ans, q.x)) return "correct";
  if (same(ans, q.signAns)) return "sign";          // M1
  if (same(ans, q.oneSideAns)) return "oneSide";    // M2
  return "unknown";
}

// Rule: correct -> harder question.
//       wrong with a known misconception (first time) -> alternative explanation.
//       wrong twice in a row, or unknown error -> prerequisite instruction + easier level.
function decide(diag) {
  if (diag === "correct") {
    state.wrongStreak = 0;
    state.stars += 1;
    state.level = Math.min(CONTENT.maxLevel, state.level + 1);
    return "harder";
  }
  state.wrongStreak += 1;
  if (state.wrongStreak >= 2 || diag === "unknown") {
    state.wrongStreak = 0;
    state.level = Math.max(1, state.level - 1);
    return "prerequisite";
  }
  return "reexplain";
}

// ---------- 5. Screens ----------
function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  $(id).classList.remove("hidden");
  window.scrollTo(0, 0);
  if (id === "home") renderHome();
  if (id === "about") renderAbout();
  if (id === "teacher") renderTeacher();
}

function renderHome() {
  $("home-title").textContent = CONTENT.home.title;
  $("home-lines").innerHTML = CONTENT.home.lines.map((l) => `<li>${esc(l)}</li>`).join("");
  const n = CONTENT.questionsPerSession;
  $("progress-box").innerHTML =
    `<strong>Your progress</strong><br>${CONTENT.levelNames[state.level]}<br>` +
    `Stars: ${"⭐".repeat(state.stars) || "none yet"}<br>Question ${Math.min(state.qNum, n)} of ${n}`;
  $("btn-start").textContent = state.qNum > 0 && state.qNum < n ? "Continue where I stopped" : CONTENT.home.startButton;
  $("teacher-notes").innerHTML = reviewList(true);
}

function startSession() {
  if (state.qNum >= CONTENT.questionsPerSession) newSession();
  if (!state.lessonSeen) { lessonIdx = 0; renderLesson(); show("learn"); }
  else nextQuestion();
}

function newSession() {
  state.qNum = 0; state.stars = 0; state.wrongStreak = 0; state.lessonSeen = false; save();
}

function renderLesson() {
  const s = CONTENT.lesson[lessonIdx];
  $("lesson-card").innerHTML = `<h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><div class="lesson-visual">${esc(s.visual)}</div>`;
  $("btn-lesson-next").textContent = lessonIdx === CONTENT.lesson.length - 1 ? "I'm ready — start questions" : "Next";
}

function nextQuestion() {
  current = generate(state.level);
  chosen = null;
  $("q-count").textContent = `Question ${state.qNum + 1} of ${CONTENT.questionsPerSession}`;
  $("q-level").textContent = CONTENT.levelNames[current.level];
  $("q-format").textContent = CONTENT.formatLabels[current.format];
  $("q-equation").textContent = current.text;
  $("q-hint").classList.add("hidden");
  $("q-hint").textContent = CONTENT.hint;
  let html = "";
  if (current.format === "mcq") {
    html = current.options.map((o) => `<button class="option" data-val="${o}">x = ${o}</button>`).join("");
  } else {
    html = `<label>x = <input type="number" id="ans" step="any" /></label>`;
    if (current.format === "explain")
      html += `<label>What was your first step, and why?<textarea id="explain" placeholder="e.g. I subtracted ... from both sides because ..."></textarea></label>`;
  }
  $("q-input").innerHTML = html;
  document.querySelectorAll(".option").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".option").forEach((o) => o.classList.remove("selected"));
    b.classList.add("selected"); chosen = parseFloat(b.dataset.val);
  }));
  show("question");
}

function checkAnswer() {
  const ans = current.format === "mcq" ? chosen : parseFloat($("ans").value);
  if (ans === null || isNaN(ans)) { alert("Please give an answer first. Any try is okay!"); return; }
  const explanation = current.format === "explain" ? $("explain").value.trim() : "";
  if (current.format === "explain" && explanation.length < 3) { alert("Please write one short sentence about your first step."); return; }

  const diag = diagnose(current, ans);
  const levelBefore = current.level;
  const outcome = decide(diag);
  const attempt = {
    id: Date.now(), time: new Date().toLocaleString(), level: levelBefore, format: current.format,
    equation: current.text, correct: current.x, answer: ans, diagnosis: diag, outcome, explanation,
    ai: null, review: current.format === "explain" ? { status: "pending", note: "" } : null,
  };
  state.attempts.push(attempt);
  state.qNum += 1;
  save();
  renderFeedback(attempt);
  if (current.format === "explain") getAIFeedback(attempt);
}

function renderFeedback(a) {
  const ok = a.diagnosis === "correct";
  $("fb-main").innerHTML = ok
    ? `<p class="good">${esc(pick(CONTENT.feedback.correct))}</p>`
    : `<p class="notyet">${esc(CONTENT.feedback.notYet)}</p><p>You answered x = ${a.answer}.</p>`;

  const r = $("fb-remedy");
  r.classList.add("hidden");
  if (a.outcome === "reexplain") {
    const m = CONTENT.remedies[a.diagnosis];
    r.innerHTML = `<h3>${esc(m.title)}</h3><p>${esc(m.text)}</p>${m.example ? `<div class="lesson-visual">${esc(m.example)}</div>` : ""}`;
    r.classList.remove("hidden");
  } else if (a.outcome === "prerequisite") {
    const p = CONTENT.prerequisite;
    r.innerHTML = `<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p><table>${p.table.map((t) => `<tr><td><strong>${esc(t[0])}</strong></td><td>${esc(t[1])}</td></tr>`).join("")}</table><p>${esc(p.tip)}</p>`;
    r.classList.remove("hidden");
  }

  $("fb-model").innerHTML = `<strong>Worked solution: ${esc(a.equation)}</strong><ol>${current.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`;

  const decisionText = {
    harder: `Tutor decision: harder question → ${CONTENT.levelNames[state.level]}. ${CONTENT.feedback.harderNext}`,
    reexplain: `Tutor decision: alternative explanation (above), then another question at the same level.`,
    prerequisite: `Tutor decision: refresher on the basics (above), then an easier question → ${CONTENT.levelNames[state.level]}.`,
  };
  $("fb-next").textContent = decisionText[a.outcome];
  $("btn-continue").textContent = state.qNum >= CONTENT.questionsPerSession ? "See my summary" : "Next question";
  $("fb-ai").classList.add("hidden");
  show("feedback");
}

function continueOn() {
  if (state.qNum >= CONTENT.questionsPerSession) renderSummary();
  else nextQuestion();
}

function renderSummary() {
  $("sum-title").textContent = CONTENT.summary.title;
  $("sum-stars").textContent = "⭐".repeat(state.stars) || "🌱";
  $("sum-msg").textContent = `You solved ${state.stars} of ${CONTENT.questionsPerSession}. ${CONTENT.summary.message}`;
  $("sum-list").innerHTML = reviewList(false);
  show("summary");
}

// Learner-facing list of explanation feedback and its teacher-check status
function reviewList(onlyChecked) {
  const items = state.attempts.filter((a) => a.review && a.ai && (!onlyChecked || a.review.status !== "pending"));
  if (!items.length) return "";
  return `<div class="card"><strong>Feedback on your explanations</strong>` + items.slice(-5).reverse().map((a) => {
    const st = a.review.status;
    const badge = st === "pending" ? `<span class="badge pending">waiting for teacher</span>`
      : st === "approved" ? `<span class="badge approved">teacher approved ✓</span>`
      : `<span class="badge overridden">note from your teacher</span>`;
    const text = st === "overridden" ? a.review.note : a.ai.feedback;
    return `<p><strong>${esc(a.equation)}</strong> ${badge}<br>${esc(text)}</p>`;
  }).join("") + `</div>`;
}

// ---------- 6. AI feedback on the explanation (Gemini via /api/feedback) ----------
async function getAIFeedback(a) {
  const box = $("fb-ai");
  box.classList.remove("hidden");
  box.innerHTML = `<p>Reading your explanation…</p>`;
  let result = null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch("/api/feedback", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl.signal,
      body: JSON.stringify({ equation: a.equation, correctX: a.correct, learnerAnswer: a.answer, explanation: a.explanation, diagnosis: a.diagnosis }),
    });
    clearTimeout(t);
    if (res.ok) result = checkAIOutput(await res.json(), a);
  } catch (e) { result = null; }
  if (!result) result = fallbackFeedback(a);
  a.ai = result;
  save();
  box.innerHTML = `<p><strong>Feedback on your explanation</strong> <span class="badge pending">your teacher will check this</span></p>
    <p>${esc(result.feedback)}</p><p class="meta">Source: ${esc(result.source)}</p>`;
}

// Check the AI output BEFORE the learner sees it
function checkAIOutput(out, a) {
  const verdicts = ["correct", "sign_error", "one_side_error", "unclear"];
  if (!out || !verdicts.includes(out.verdict)) return null;
  if (typeof out.feedback !== "string" || out.feedback.length < 5 || out.feedback.length > 350) return null;
  if (a.diagnosis !== "correct" && new RegExp(`x\\s*=\\s*${a.correct}(?!\\d)`).test(out.feedback)) return null; // must not give away the answer
  return { verdict: out.verdict, feedback: out.feedback, source: "AI (Gemini), checked by app" };
}

// Rule-based fallback if the AI fails or its output fails the check
function fallbackFeedback(a) {
  const f = CONTENT.explainFallback;
  const t = a.explanation.toLowerCase();
  let verdict = "unclear", feedback = f.unclear;
  if (a.diagnosis === "sign") { verdict = "sign_error"; feedback = f.sign; }
  else if (a.diagnosis === "oneSide") { verdict = "one_side_error"; feedback = f.oneSide; }
  else if (/both side|each side|both the side/.test(t)) { verdict = "correct"; feedback = f.good; }
  return { verdict, feedback, source: "Pre-written feedback (AI unavailable)" };
}

// ---------- 7. Teacher view (C5: progress + approve/override AI feedback) ----------
function renderTeacher() {
  document.querySelectorAll(".learner-name").forEach((e) => (e.textContent = CONTENT.learnerName));
  const at = state.attempts;
  const correct = at.filter((a) => a.diagnosis === "correct").length;
  const count = (d) => at.filter((a) => a.diagnosis === d).length;
  $("t-progress").innerHTML =
    `Current: ${CONTENT.levelNames[state.level]}<br>Attempts: ${at.length} · Correct: ${correct}` +
    (at.length ? ` (${Math.round((100 * correct) / at.length)}%)` : "") +
    `<br>Misconception M1 (sign kept when moving): ${count("sign")}<br>Misconception M2 (one side only): ${count("oneSide")}<br>Other errors: ${count("unknown")}` +
    `<br><button class="secondary small" id="btn-clear">Clear all data</button>`;
  $("btn-clear").onclick = () => { if (confirm("Delete all learner data on this device?")) { state = freshState(); save(); renderTeacher(); } };

  $("t-attempts").innerHTML = at.slice().reverse().map((a) => {
    let html = `<div class="card"><strong>${esc(a.equation)}</strong> · ${esc(CONTENT.formatLabels[a.format])}<br>
      Answer: x = ${a.answer} (correct: ${a.correct}) · Diagnosis: <strong>${a.diagnosis}</strong> · Tutor decision: <strong>${a.outcome}</strong><br><span class="meta">${esc(a.time)}</span>`;
    if (a.review) {
      html += `<p><em>Explanation:</em> "${esc(a.explanation)}"</p>`;
      if (a.ai) {
        html += `<p><em>AI feedback (${esc(a.ai.source)}, verdict: ${a.ai.verdict}):</em> ${esc(a.ai.feedback)}</p>
          <p>Status: <span class="badge ${a.review.status}">${a.review.status}</span> ${a.review.note ? "— " + esc(a.review.note) : ""}</p>
          <button class="small primary" data-approve="${a.id}">Approve</button>
          <textarea id="note-${a.id}" placeholder="Write your own feedback to replace the AI's">${esc(a.review.note)}</textarea>
          <button class="small secondary" data-override="${a.id}">Override with my feedback</button>`;
      }
    }
    return html + `</div>`;
  }).join("") || "<p>No attempts yet.</p>";

  document.querySelectorAll("[data-approve]").forEach((b) => (b.onclick = () => review(b.dataset.approve, "approved")));
  document.querySelectorAll("[data-override]").forEach((b) => (b.onclick = () => review(b.dataset.override, "overridden")));
}

function review(id, status) {
  const a = state.attempts.find((x) => String(x.id) === String(id));
  if (status === "overridden") {
    const note = $(`note-${id}`).value.trim();
    if (!note) { alert("Please write your feedback first."); return; }
    a.review.note = note;
  }
  a.review.status = status;
  save();
  renderTeacher();
}

function renderAbout() {
  $("about-text").innerHTML = CONTENT.about.map((p) => `<p>${esc(p)}</p>`).join("");
}

// ---------- Wire up buttons ----------
document.querySelectorAll(".rollno").forEach((e) => (e.textContent = CONTENT.rollNo));
$("app-name").textContent = CONTENT.appName;
document.title = CONTENT.appName;
document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => show(b.dataset.go)));
$("btn-start").onclick = startSession;
$("btn-reset").onclick = () => { newSession(); renderHome(); };
$("btn-lesson-back").onclick = () => { if (lessonIdx > 0) { lessonIdx--; renderLesson(); } else show("home"); };
$("btn-lesson-next").onclick = () => {
  if (lessonIdx < CONTENT.lesson.length - 1) { lessonIdx++; renderLesson(); }
  else { state.lessonSeen = true; save(); nextQuestion(); }
};
$("btn-hint").onclick = () => $("q-hint").classList.remove("hidden");
$("btn-check").onclick = checkAnswer;
$("btn-continue").onclick = continueOn;
$("btn-pin").onclick = () => {
  if ($("pin").value === CONTENT.teacherPin) { $("pin").value = ""; $("pin-msg").textContent = ""; show("teacher"); }
  else $("pin-msg").textContent = "Wrong PIN. (Demo PIN is in content.js)";
};
show("home");
