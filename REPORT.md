# ET 617 End-Semester Report — Equilibria

## Identity card
| Field | Value |
|---|---|
| Roll no. | 24B0345 |
| P | P4 Adaptive tutor with automatic question generation |
| T | P4-T3 Linear equations in one variable (Class 8) |
| L | L6 High-achieving learner preparing for an Olympiad, bored by routine practice |
| C | C5 Teacher-in-the-loop |
| App | https://et617-24b0345.vercel.app |
| Repo | https://github.com/Sahil8239490/et617-endsem-24b0345 |

## D1 Educational problem
High-achieving Class 8 students solve textbook linear equations quickly, so routine practice bores them. Working fast, they still make sign slips with negative brackets, and they have rarely met equations with no solution or infinitely many solutions — the cases Olympiad problems test. Textbook drills repeat easy items and never diagnose which error a learner makes. Equilibria generates fresh questions, moves a strong learner up quickly, diagnoses the misconception from the exact wrong answer, and lets a teacher check AI feedback.

**Learning outcomes**
1. **Solve** equations with x on both sides, a negative factor outside a bracket, and fractions, with at least 4 of 6 correct in one practice set.
2. **Classify** a linear equation as having exactly one, no, or infinitely many solutions, and **justify** the classification by simplifying.
3. **Explain** why −k(x − b) = −kx + kb and **detect** a sign error by substituting the answer back.

**Context of use:** at home on a laptop or tablet, 20–30 minutes in the evening as Olympiad practice; the maths teacher reviews the teacher dashboard during the week.

## D2 Learner persona — Kabir Mehta
- **Age / class:** 13, Class 8, CBSE school, Bengaluru; preparing for IOQM / junior Olympiad.
- **Prior knowledge:** fluent with integers, brackets, LCM and ax + b = c; has not formally met equations with no or infinitely many solutions.
- **Misconception M1 — assumes exactly one solution:** when x cancels out, he thinks he made a mistake or writes x = 0.
- **Misconception M2 — sign slip with negatives:** −3(x − 2) → −3x − 6.
- **Device / time:** own laptop or family tablet, 20–30 minutes after dinner.
- **Language:** English (English-medium school), comfortable with notation.
- **Motivation:** wants to do well in the Olympiad, enjoys puzzles; switches off with repetitive questions.

## D3 Educational content
**Concept explanation** (shown on each chapter page): e.g. Chapter 4 — "After simplifying, a linear equation reduces to one of three forms: ax = b with a ≠ 0 (one solution); 0 = 0 (infinitely many); 0 = c, c ≠ 0 (no solution). Example: 2(x + 3) = 2x + 6 → 6 = 6 → infinitely many."

**Chapters:** 1 Variables on both sides · 2 Negative signs and brackets · 3 Equations with fractions · 4 Number of solutions · 5 Olympiad problem set.

**Formats:** numeric answer, multiple choice (distractors generated from misconceptions), classify the equation, answer with written justification (AI-evaluated).

**Olympiad problem set (5 tasks, with model answers)**
| # | Task | Format | Model answer |
|---|---|---|---|
| 1 | (3x−2)/5 − (2x+3)/7 = (x−4)/3 + 11/105 | Numeric | ×105 → 33x − 87 = 35x − 129 → **x = 21** |
| 2 | (2x−3)/4 − (3x+5)/6 = (x−7)/3 + 1/2 | Numeric | ×12 → −19 = 4x − 22 → **x = 3/4** |
| 3 | Father 4× son; in 8 years 3×; 8 years ago 6×. Ages? | MCQ | s = 16, f = 64 from first two; 8 years ago 56 = 7×8 ≠ 6×8 → **no solution** |
| 4 | Two-digit number, digit sum 11, reversed is 27 less | Numeric | 110 − 9x = 9x − 16 → x = 7 → **74** |
| 5 | n×5+8 is 12 more than twice (n/5 − 8) | Numeric | 5n + 8 = 2n/5 − 4 → **n = −60/23** |

**Feedback**
- **Correct:** "Correct — x = 21" + brief worked solution; next question is harder.
- **M2 (sign), e.g. answer 66 on Task 1:** "Diagnosis · Sign error with negatives or brackets. Your answer matches what you get when a negative sign is applied to only the first term of a bracket… Expand each bracket term by term, then substitute your answer to check."
- **M1 (one solution), e.g. choosing "Son 16, Father 64" on Task 3:** "Diagnosis · Assumes exactly one solution. Not every linear equation has exactly one solution… Check every given condition."

## D4 Working application
URL: https://et617-24b0345.vercel.app — plain HTML/CSS/JS (no template or UI library) + one Vercel serverless function. Font: Inter (Google Fonts).

**Screen map:** Login (Student / Teacher) → Student: Dashboard → Chapters → Chapter page → Question → Feedback (+ diagnosis, brief solution) → Results. Teacher (PIN): Overview with charts + AI feedback review queue. Roll number in the sidebar of every screen.

**C5 visible:** Teacher Overview shows accuracy, level, misconception pie chart, accuracy-by-chapter chart, and every AI feedback with **Approve** / **Override**; the student dashboard shows the teacher's decision.

## D5 Two contrasting learner scenarios
*(Insert screenshots from the live app.)*
- **(a) Correct path:** Chapter 2, answer correctly → "Correct", worked solution, "Next: harder question · Level 3".
- **(b) Misconception path:** Olympiad Task 1, answer 66 → "Incorrect", Diagnosis "Sign error with negatives or brackets", targeted explanation, worked solution. In adaptive practice the next step becomes "targeted explanation, same level", and after two wrong answers "prerequisite review, easier level".

## D6 AI functionality specification
**Feature: evaluating the student's written justification** (every third practice question).
- **Input:** POST /api/feedback with equation, correct answer, learner answer, rule-based diagnosis, and the justification text.
- **Model call:** Google Gemini (`gemini-2.5-flash`, temperature 0.3, JSON output). Prompt (from `api/feedback.js`):
  > You are a sharp, encouraging maths coach for Kabir, a 13-year-old Class 8 student preparing for a maths Olympiad… Judge ONLY the reasoning in his justification. Known misconceptions: sign_error…, one_solution_assumption…, fraction_error… Reply with ONLY this JSON: {"verdict": "correct" | "sign_error" | "one_solution_assumption" | "fraction_error" | "unclear", "feedback": "<max 2 short sentences. Do not reveal the correct answer. If right, end with one harder follow-up question. If not, ask one probing question…>"}
- **Output:** `{verdict, feedback}`.
- **Checks before the learner sees it (`checkAIOutput`):** verdict must be one of the 5 allowed values; feedback 5–350 characters; if the learner was wrong, feedback must not contain the correct answer.
- **Fallback:** on timeout (10 s), error, or failed check → pre-written feedback chosen by the rule-based diagnosis, labelled "Pre-written feedback (AI unavailable)".
- **Teacher-in-the-loop:** every AI feedback is "Pending teacher review" until the teacher approves or overrides it.

**Non-AI adaptive engine:** questions are generated from templates with random coefficients; each stores the answer a misconception would produce, so diagnosis is deterministic.

## D7 Pedagogical rationale
- **Decision rule (design challenge):** correct → harder question (level +1); wrong answer matching a known misconception, first in a row → targeted alternative explanation at the same level; two wrong in a row or an unrecognised error → prerequisite review (distributive law with negatives) and level −1. The rule is shown to the learner as the "Next:" line.
- **Feedback & scaffolding:** every answer gets a diagnosis plus a brief worked solution; hints are optional; written justifications get AI feedback that asks a probing question instead of giving the answer.
- **L6 shaped the design:** fast level-ups, concise professional language, Olympiad-style consistency-check problems (Task 3), and a "Number of solutions" chapter that targets M1 — routine drills were removed.
- **C5 shaped the design:** separate teacher login; AI feedback is never final until reviewed; the teacher sees misconception patterns as a chart rather than raw logs.

## D8 Evaluation plan
| Outcome | Assessment | Success |
|---|---|---|
| 1 Solve | 6-question adaptive set; accuracy per chapter | ≥ 4/6 correct at Level 3+ |
| 2 Classify + justify | Chapter 4 items + justification rubric (0 no reason / 1 simplifies / 2 simplifies and interprets 0 = 0 or 0 = c) | ≥ 80% correct and rubric ≥ 1.5 |
| 3 Explain sign rule / detect error | Chapter 2 items; count of M2 diagnoses over sessions | M2 frequency falls by half between session 1 and 3 |

**Log data:** answer, diagnosis, tutor decision, time per question, hint use, teacher approve/override rate (stored per attempt).

## AI-use log and reflection
1. Claude (Claude Code desktop) — planning, persona, content, code, report draft. *(Add the share link / export.)*
2. Google Gemini — runtime feedback inside the app.

**Reflection:** AI produced the first app version quickly, but its suggestions needed checking: the Olympiad answer key I was given had errors in four of five answers (Q1 −41/2 → 21, Q2 −1/2 → 3/4, Q3 was consistent so the condition was changed to "6 times" to make it a true no-solution item, Q5 −100/23 → −60/23); every answer was verified by substitution. I switched the learner context from L5 to L6 early and rewrote the persona and content to match.
