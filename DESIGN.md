# DESIGN.md — "Balance It!" Adaptive tutor for linear equations

**Exam card:** P4 Adaptive tutor · P4-T3 Linear equations in one variable (Class 8) · L5 Anxious repeat learner · C5 Teacher-in-the-loop · ID: see `content.js` (`rollNo`)

## D1 Educational problem
Class 8 students who failed linear equations once often memorise "move it to the other side" without understanding *why* the sign changes. When they fail again they decide "I am bad at maths" and stop trying. Generic practice apps mark answers right/wrong in red and move on, which raises anxiety and never finds out *which* mistake the learner is making. We need a calm tutor that generates fresh equations, diagnoses the exact misconception from the learner's answer and explanation, and adapts the next task — while a teacher checks the AI's feedback before it becomes "final".

**Learning outcomes** — after one session the learner will be able to:
1. **Solve** equations of the form `x + a = b`, `ax + b = c`, `ax + b = cx + d` and `a(x + b) = c`, getting at least 4 of 6 correct.
2. **Explain** in their own words why a term changes sign when it moves across `=` ("do the same thing to both sides").
3. **Identify** the wrong step in a solution that changes sign incorrectly or divides only one side.

**Context of use:** school computer lab or a parent's phone, 15–20 minutes after school, with the class teacher checking the teacher view later the same day.

## D2 Learner persona — Riya Sharma
- **Age / class:** 14, repeating Class 8 at a government school in Pune.
- **Prior knowledge:** can add/subtract integers but makes sign slips with negatives; knows what a variable is; has seen "transposing" but does not know why it works.
- **Misconception M1 (sign):** moves a term across `=` but keeps its sign (`x + 5 = 12 → x = 12 + 5`).
- **Misconception M2 (one side):** applies an operation to only one side / one term (`3x + 4 = 19 → 3x = 15 → x = 15`, i.e. forgets to divide, or `2(x+3)=14 → 2x+3=14`).
- **Device / time:** mother's Android phone or school lab PC, ~20 minutes in the evening.
- **Language:** Marathi at home, English-medium school; prefers short, simple English sentences.
- **Motivation / affect:** wants to pass the re-test so she is not left behind her friends; very anxious, gives up after two red crosses, low self-efficacy ("I'm just bad at maths").

## D3 Content plan
- **Concept explanation:** the balance-scale idea — an equation is a balanced scale; whatever you do to one side you must do to the other. "Moving +5 across" is really "subtract 5 from both sides".
- **Tasks (auto-generated, 6 per session, 4 difficulty levels):** formats rotate
  1. *Type the answer* (numeric),
  2. *Pick the answer* (MCQ — wrong options are generated from M1 and M2),
  3. *Solve and explain your first step* (free text, evaluated by AI, checked by teacher).
- **Feedback:** correct → praise + harder level; M1 → balance-scale re-explanation of sign; M2 → "both sides, every term" re-explanation; repeated or unknown error → prerequisite card (inverse operations / integers) and an easier level.
- **Model answers:** every feedback screen shows the worked solution step by step.

## Decision rule (P4 design challenge)
| Learner response | Next step |
|---|---|
| Correct | **Harder question** (level + 1, max 4) |
| Wrong, matches M1 or M2, first wrong in a row | **Alternative explanation** for that misconception, then a new question at the same level |
| Wrong twice in a row, or wrong answer not matching any known misconception | **Prerequisite instruction** (inverse operations & signs), then level − 1 |

## C5 Teacher-in-the-loop
A Teacher view (PIN) shows: progress (level, stars, accuracy, misconceptions seen) and every attempt. For each AI-evaluated explanation the teacher can **Approve** or **Override** with their own message. Riya sees the status ("waiting for teacher", "teacher approved ✓", or the teacher's note).

## Screens
Home → Learn (balance scale) → Question → Feedback / Re-explain / Prerequisite → Summary · Teacher view · About. Roll number in footer of every screen.
