// Vercel serverless function: POST /api/feedback
// Sends the learner's explanation to Google Gemini and returns
// { verdict, feedback }. The key is read from the Vercel environment
// variable GEMINI_API_KEY (never stored in the code).

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function buildPrompt(b) {
  return `You are a kind, patient maths tutor for Riya, a 14-year-old repeating Class 8 linear equations. She is anxious and gives up easily.

Equation: ${b.equation}
Correct solution: x = ${b.correctX}
Riya's answer: x = ${b.learnerAnswer}
The app's diagnosis from her answer: ${b.diagnosis} (sign = kept the sign when moving a term across "="; oneSide = did an operation to only one side or one term; unknown = other error)
Riya's explanation of her first step: "${b.explanation}"

Judge ONLY her explanation of the first step. Known misconceptions:
- sign_error: she moves a term across "=" without changing its sign.
- one_side_error: she applies an operation to only one side or only one term.

Reply with ONLY this JSON, nothing else:
{"verdict": "correct" | "sign_error" | "one_side_error" | "unclear", "feedback": "<max 2 short, simple, warm sentences. Never use the words wrong or incorrect. Do not tell her the final value of x. Point to the balance idea: do the same to both sides.>"}`;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "No API key configured" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(body) }] }],
        generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
      }),
    });
    if (!r.ok) return res.status(502).json({ error: "AI call failed", status: r.status });
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const out = JSON.parse(text);
    return res.status(200).json({ verdict: out.verdict, feedback: out.feedback });
  } catch (e) {
    return res.status(500).json({ error: "AI error" });
  }
};
