# Balance It! â€” ET 617 End-Sem (P4 Â· P4-T3 Â· L5 Â· C5)

An adaptive tutor for linear equations in one variable (Class 8) for a high-achieving Olympiad learner bored by routine practice, with a teacher view that approves or overrides AI feedback.

Built with plain HTML, CSS and JavaScript (no framework, no template). One Vercel serverless function (`api/feedback.js`) calls Google Gemini.

## Files: what lives where
| File | What it is | Edit it whenâ€¦ |
|---|---|---|
| `content.js` | **All words, questions settings, feedback, roll number, PIN** | almost every viva change |
| `style.css` | Colours, font sizes (top of file: `:root`) | "change the colour / make text bigger" |
| `index.html` | The screens (sections) and buttons | "add a button / new screen" |
| `app.js` | Logic: question generator, diagnosis, decision rule, teacher view | "change the rule / number of levels" |
| `api/feedback.js` | The AI prompt sent to Gemini | "change what the AI is told" |

## How to make a change during the viva (no coding background needed)
1. On GitHub, switch to (or create) the **viva** branch: branch dropdown â†’ type `viva` â†’ "Create branch: viva from main".
2. Open the file (usually `content.js`), click the âœï¸ pencil icon.
3. Change the text **between the quotes** or the number. Keep quotes `"` and the comma `,` at the end of the line.
4. Click **Commit changes**. Vercel automatically builds a preview link for the `viva` branch in ~30 s (see the Vercel dashboard â†’ Deployments).

### Ready-made examples
| Examiner asks | Edit |
|---|---|
| Show 8 questions instead of 6 | `content.js` â†’ `questionsPerSession: 8,` |
| Change the encouraging message | `content.js` â†’ `feedback.correct` lines |
| Change the hint | `content.js` â†’ `hint:` |
| Change the teacher PIN | `content.js` â†’ `teacherPin: "4321",` |
| Change the learner's name | `content.js` â†’ `learnerName` and `home.title` |
| Add a step to the lesson | `content.js` â†’ copy one `{ title, text, visual }` block inside `lesson: [...]` |
| Change question order / formats | `content.js` â†’ `formatOrder: ["mcq", "numeric", "explain"]` |
| Make text bigger | `style.css` â†’ `body { font-size: 18px` â†’ `22px` |
| Change main colour | `style.css` â†’ `--primary: #2563eb;` â†’ e.g. `#7c3aed` |
| Two wrong answers â†’ three before refresher | `app.js` â†’ in `decide()`, `state.wrongStreak >= 2` â†’ `>= 3` |
| Go up a level only after 2 correct | `app.js` â†’ `decide()` (ask AI to help, show the rule) |

## Decision rule (in `app.js`, function `decide`)
- Correct â†’ harder question (level + 1)
- Wrong with known misconception (one-solution / sign slip / fraction), first time â†’ alternative explanation
- Wrong twice in a row or unknown error â†’ prerequisite refresher, level âˆ’ 1

## AI feature
`api/feedback.js` sends the equation, answer and the learner's explanation to Gemini and asks for `{verdict, feedback}` JSON. `app.js â†’ checkAIOutput()` checks the verdict is allowed, the length is short, and that the answer is not given away. If the call fails or the check fails, `fallbackFeedback()` uses pre-written feedback, labelled "Pre-written feedback (AI unavailable)". The teacher view lets the teacher approve or override every AI feedback.

## Setup
Vercel â†’ Project â†’ Settings â†’ Environment Variables â†’ `GEMINI_API_KEY` = your key (from aistudio.google.com). Never put the key in the code.
