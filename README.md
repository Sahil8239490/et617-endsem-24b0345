# Equation Arena — ET 617 End-Sem (P4 · P4-T3 · L6 · C5)

An adaptive tutor for linear equations in one variable (Class 8) for a high-achieving Olympiad learner bored by routine practice, with a teacher view that approves or overrides AI feedback.

Built with plain HTML, CSS and JavaScript (no framework, no template). One Vercel serverless function (`api/feedback.js`) calls Google Gemini.

## Files: what lives where
| File | What it is | Edit it when… |
|---|---|---|
| `content.js` | **All words, questions settings, feedback, roll number, PIN** | almost every viva change |
| `style.css` | Colours, font sizes (top of file: `:root`) | "change the colour / make text bigger" |
| `index.html` | The screens (sections) and buttons | "add a button / new screen" |
| `app.js` | Logic: question generator, diagnosis, decision rule, teacher view | "change the rule / number of levels" |
| `api/feedback.js` | The AI prompt sent to Gemini | "change what the AI is told" |

## How to make a change during the viva (no coding background needed)
1. On GitHub, switch to (or create) the **viva** branch: branch dropdown → type `viva` → "Create branch: viva from main".
2. Open the file (usually `content.js`), click the ✏️ pencil icon.
3. Change the text **between the quotes** or the number. Keep quotes `"` and the comma `,` at the end of the line.
4. Click **Commit changes**. Vercel automatically builds a preview link for the `viva` branch in ~30 s (see the Vercel dashboard → Deployments).

### Ready-made examples
| Examiner asks | Edit |
|---|---|
| Show 8 questions instead of 6 | `content.js` → `questionsPerSession: 8,` |
| Change the encouraging message | `content.js` → `feedback.correct` lines |
| Change the hint | `content.js` → `hint:` |
| Change the teacher PIN | `content.js` → `teacherPin: "4321",` |
| Change the learner's name | `content.js` → `learnerName` and `home.title` |
| Add a step to the lesson | `content.js` → copy one `{ title, text, visual }` block inside `lesson: [...]` |
| Change question order / formats | `content.js` → `formatOrder: ["mcq", "numeric", "explain"]` |
| Make text bigger | `style.css` → `body { font-size: 18px` → `22px` |
| Change main colour | `style.css` → `--primary: #2563eb;` → e.g. `#7c3aed` |
| Two wrong answers → three before refresher | `app.js` → in `decide()`, `state.wrongStreak >= 2` → `>= 3` |
| Go up a level only after 2 correct | `app.js` → `decide()` (ask AI to help, show the rule) |

## Decision rule (in `app.js`, function `decide`)
- Correct → harder question (level + 1)
- Wrong with known misconception (one-solution / sign slip / fraction), first time → alternative explanation
- Wrong twice in a row or unknown error → prerequisite refresher, level − 1

## AI feature
`api/feedback.js` sends the equation, answer and the learner's explanation to Gemini and asks for `{verdict, feedback}` JSON. `app.js → checkAIOutput()` checks the verdict is allowed, the length is short, and that the answer is not given away. If the call fails or the check fails, `fallbackFeedback()` uses pre-written feedback, labelled "Pre-written feedback (AI unavailable)". The teacher view lets the teacher approve or override every AI feedback.

## Setup
Vercel → Project → Settings → Environment Variables → `GEMINI_API_KEY` = your key (from aistudio.google.com). Never put the key in the code.
