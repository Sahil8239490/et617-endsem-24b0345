// Vercel serverless function: POST /api/feedback
// Sends the learner's justification to Google Gemini and returns
// { verdict, feedback }. The key is read from the Vercel environment
// variable GEMINI_API_KEY (never stored in the code).

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function buildPrompt(b) {
  return `You are a sharp, encouraging maths coach for Kabir, a 13-year-old Class 8 student preparing for a maths Olympiad. He finds routine practice boring and likes to be challenged.

Equation: ${b.equation}
Correct answer: ${b.correctX}
Kabir's answer: ${b.learnerAnswer}
The app's diagnosis from his answer: ${b.diagnosis}
(sign = sign slip when expanding a negative bracket or moving a term; oneSolution = assumed exactly one solution when there is none or infinitely many; fraction = added denominators; unknown = other error; correct = right answer)
Kabir's justification: "${b.explanation}"

Judge ONLY the reasoning in his justification. Known misconceptions:
- sign_error: applies a negative to only the first term in a bracket, or moves a term across "=" without changing its sign.
- one_solution_assumption: believes every linear equation has exactly one solution.
- fraction_error: adds fractions by adding denominators.

Reply with ONLY this JSON, nothing else:
{"verdict": "correct" | "sign_error" | "one_solution_assumption" | "fraction_error" | "unclear", "feedback": "<max 2 short sentences. Do not reveal the correct answer. If his reasoning is right, end with one harder follow-up question (Olympiad style). If not, ask one probing question that makes him find the flaw himself.>"}`;
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
