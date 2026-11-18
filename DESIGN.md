# DESIGN.md — "Equation Arena" Adaptive tutor for linear equations

**Exam card:** P4 Adaptive tutor · P4-T3 Linear equations in one variable (Class 8) · L6 High-achieving Olympiad learner, bored by routine practice · C5 Teacher-in-the-loop · ID: see `content.js` (`rollNo`)

> Change log: learner context switched from L5 to L6 early in the exam; persona, content and levels were rewritten to match.

## D1 Educational problem
High-achieving Class 8 students solve textbook linear equations quickly, so routine practice bores them and they stop paying attention. Because they work fast, they still make careless sign slips with negative brackets, and they have never met equations with *no* solution or *infinitely many* — exactly the kind of case Olympiad questions test. Textbook drills give them the same easy questions again and again. We need a tutor that generates fresh questions, quickly moves a strong learner to harder ones, diagnoses the exact misconception from the wrong answer, and lets a teacher check the AI's feedback.

**Learning outcomes** — after one session the learner will be able to:
1. **Solve** equations with x on both sides, a negative outside a bracket, and fractions (`x/a + x/b = c`), with at least 4 of 6 correct.
2. **Classify** a linear equation as having exactly one solution, no solution or infinitely many, and **justify** the choice by simplifying it.
3. **Explain** why `−k(x − b) = −kx + kb`, and find a sign slip by substituting the answer back.

**Context of use:** at home on a laptop or tablet, 20–30 minutes in the evening as extra Olympiad practice; the maths teacher checks the teacher view during the week.

## D2 Learner persona — Kabir Mehta
- **Age / class:** 13, Class 8, CBSE school in Bengaluru; top of his class, preparing for the IOQM / junior maths Olympiad.
- **Prior knowledge:** fluent with integers, brackets and solving `ax + b = c` in his head; knows LCM; has never formally met equations with no solution or infinitely many.
- **Misconception M1 (one solution):** believes every linear equation has exactly one solution, so when x cancels out he thinks he made a mistake or writes "x = 0".
- **Misconception M2 (sign slip):** when working fast, applies a negative outside a bracket to only the first term: `−3(x − 2) → −3x − 6`.
- **Device / time:** own laptop and family tablet, 20–30 minutes after dinner.
- **Language:** English (English-medium school), comfortable with maths notation.
- **Motivation / affect:** wants to do well in the Olympiad; enjoys puzzles and speed; switches off when questions are repetitive, skips explanations he thinks he knows.

## D3 Content plan
- **Concept explanation (skippable):** 4 short cards — the balance rule, the negative-bracket trap, the "how many solutions?" puzzle, the Olympiad habit of reading what is left when x cancels.
- **Tasks (auto-generated, 6 per session, 4 levels):**
  1. x on both sides `ax + b = cx + d`
  2. negative outside a bracket `−k(x + b) = c`
  3. fractions `x/a + x/b = c`
  4. Olympiad: "how many solutions?" for `a(x + b) = …` (one / none / infinitely many)
- **Formats (rotate):** type the answer (numeric) · pick the answer (MCQ; wrong options generated from misconceptions) · solve and justify (free text, evaluated by AI, checked by teacher). Level 4 is always the classify format.
- **Feedback:** correct → short praise + level up; M1 → "x can cancel" explanation; M2 → sign-slip explanation with substitution check; fraction error → LCM explanation; repeated/unknown error → prerequisite refresher on the distributive law with negatives.
- **Model answers:** every feedback screen shows the worked solution.
- **For a bored learner:** "⚡ Challenge me" skips a level (logged for the teacher); the lesson can be skipped.

## Decision rule (P4 design challenge)
| Learner response | Next step |
|---|---|
| Correct | **Harder question** (level + 1, max 4) |
| Wrong, matches a known misconception, first wrong in a row | **Alternative explanation** for that misconception, then a new question at the same level |
| Wrong twice in a row, or wrong answer not matching any known misconception | **Prerequisite instruction** (distributive law with negatives), then level − 1 |

## C5 Teacher-in-the-loop
A teacher view (PIN) shows progress (level, accuracy, count of each misconception, number of "Challenge me" skips) and every attempt. For each AI-evaluated justification the teacher can **Approve** it or **Override** it with their own message. The learner sees the status ("waiting for teacher", "teacher approved ✓", or the teacher's note).

## Screens
Home → Learn (skippable) → Question → Feedback / Alternative explanation / Prerequisite → Summary · Teacher login · Teacher view · About. Roll number in the footer of every screen.
