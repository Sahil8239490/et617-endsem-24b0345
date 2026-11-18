// =====================================================================
//  content.js  —  ALL the words, chapters, questions and settings.
//  For the viva: most change requests = edit text or a number in this
//  file, then commit. You never need to touch app.js for text changes.
// =====================================================================

// Helper to show a stacked fraction:  F("3x − 2", 5)
const F = (top, bottom) => `<span class="frac"><span>${top}</span><span>${bottom}</span></span>`;

const CONTENT = {
  // ---------- Identity (shown on every screen + About) ----------
  rollNo: "ROLLNO",                    // <-- your roll number, e.g. "23B1234"
  appName: "Equation Arena",
  learnerName: "Kabir Mehta",
  learnerClass: "Class 8 · Olympiad track",
  teacherPin: "1234",                  // PIN for the Teacher dashboard

  // ---------- Practice settings ----------
  questionsPerSession: 6,              // questions in one adaptive practice set
  maxLevel: 4,

  // ---------- Chapters (the tiles on the Chapters page) ----------
  // level = which question type the adaptive engine starts with
  chapters: [
    {
      id: 1, level: 1, title: "Variables on Both Sides",
      summary: "Collect x-terms on one side and constants on the other.",
      concept: [
        "An equation stays true when the same operation is applied to both sides.",
        "Move all x-terms to one side and all constants to the other using inverse operations.",
        "Verify the result by substituting it into the original equation.",
      ],
      example: "3x + 4 = x + 10  →  2x = 6  →  x = 3",
    },
    {
      id: 2, level: 2, title: "Negative Signs and Brackets",
      summary: "Expand a negative factor across every term in the bracket.",
      concept: [
        "A factor outside a bracket multiplies every term inside it, including the sign.",
        "−a(x − b) = −ax + ab, because a negative times a negative is positive.",
        "Common error: changing the sign of only the first term.",
      ],
      example: "−3(x − 2) = 12  →  −3x + 6 = 12  →  x = −2",
    },
    {
      id: 3, level: 3, title: "Equations with Fractions",
      summary: "Clear denominators using the LCM.",
      concept: [
        "Multiply both sides by the LCM of all denominators to clear the fractions.",
        "Multiply every term, including terms without a denominator.",
        "Common error: adding denominators directly (x/2 + x/3 is not x/5).",
      ],
      example: "x/2 + x/3 = 10  →  3x + 2x = 60  →  x = 12",
    },
    {
      id: 4, level: 4, title: "Number of Solutions",
      summary: "Decide if an equation has one, none or infinitely many solutions.",
      concept: [
        "After simplifying, a linear equation reduces to one of three forms.",
        "ax = b with a ≠ 0: exactly one solution.",
        "0 = 0 (always true): infinitely many solutions.  0 = c with c ≠ 0: no solution.",
      ],
      example: "2(x + 3) = 2x + 6  →  6 = 6  →  infinitely many solutions",
    },
    {
      id: 5, olympiad: true, title: "Olympiad Problem Set",
      summary: "Five multi-step problems: fractions, word problems and consistency checks.",
      concept: [
        "Each problem combines two or more ideas from Chapters 1–4.",
        "Answers can be integers or fractions (type −60/23 as -60/23).",
        "A brief worked solution is shown after every answer.",
      ],
      example: "Tip: always check your answer against every condition in the problem.",
    },
  ],

  // ---------- Olympiad problem set (Chapter 5) ----------
  // answer: number, or the option id for multiple choice.
  // traps: wrong answers that reveal a specific misconception.
  olympiad: [
    {
      title: "Fractions and algebraic reasoning",
      prompt: `Find the value of x:<div class="eq">${F("3x − 2", 5)} − ${F("2x + 3", 7)} = ${F("x − 4", 3)} + ${F(11, 105)}</div>`,
      format: "numeric", answer: 21,
      traps: [{ answer: 66, misconception: "sign" }],
      hint: "Multiply every term by 105, the LCM of 5, 7 and 3.",
      solution: [
        "Multiply by 105: 21(3x − 2) − 15(2x + 3) = 35(x − 4) + 11",
        "Expand: 63x − 42 − 30x − 45 = 35x − 140 + 11",
        "Simplify: 33x − 87 = 35x − 129",
        "2x = 42, so x = 21",
      ],
    },
    {
      title: "The deceptive equation",
      prompt: `Solve for x. Be careful with negative signs and denominators.<div class="eq">${F("2x − 3", 4)} − ${F("3x + 5", 6)} = ${F("x − 7", 3)} + ${F(1, 2)}</div>`,
      format: "numeric", answer: 3 / 4,
      traps: [{ answer: 23 / 4, misconception: "sign" }],
      hint: "Multiply every term by 12. The minus sign applies to both terms of 3x + 5.",
      solution: [
        "Multiply by 12: 3(2x − 3) − 2(3x + 5) = 4(x − 7) + 6",
        "Expand: 6x − 9 − 6x − 10 = 4x − 28 + 6",
        "The x-terms on the left cancel: −19 = 4x − 22",
        "4x = 3, so x = 3/4",
      ],
    },
    {
      title: "The age puzzle (consistency check)",
      prompt: "A father is currently 4 times as old as his son. Eight years from now, the father's age will be 3 times the son's age. Eight years ago, the father was 6 times as old as his son. Find their present ages.",
      format: "mcq",
      options: [
        { id: "a", text: "Son 16, Father 64" },
        { id: "b", text: "Son 8, Father 32" },
        { id: "c", text: "Son 12, Father 48" },
        { id: "d", text: "No ages satisfy all three conditions" },
      ],
      answer: "d",
      traps: [{ answer: "a", misconception: "oneSolution" }],
      hint: "Use two conditions to find the ages, then test the third condition.",
      solution: [
        "Let the son be s, so the father is 4s.",
        "In 8 years: 4s + 8 = 3(s + 8), so s = 16 and the father is 64.",
        "Check 8 years ago: father 56, son 8. 56 = 7 × 8, not 6 × 8.",
        "The three conditions cannot all hold, so there is no solution.",
      ],
    },
    {
      title: "The number reversal challenge",
      prompt: "A two-digit number has digits whose sum is 11. When the digits are reversed, the resulting number is 27 less than the original number. Let the tens digit be x. Find the original number.",
      format: "numeric", answer: 74,
      traps: [{ answer: 47, misconception: "sign" }],
      hint: "Original = 10x + (11 − x). Reversed = 10(11 − x) + x.",
      solution: [
        "Original: 10x + (11 − x) = 9x + 11. Reversed: 10(11 − x) + x = 110 − 9x.",
        "Reversed = Original − 27: 110 − 9x = 9x − 16",
        "18x = 126, so x = 7 and the units digit is 4.",
        "Original number = 74 (check: 47 = 74 − 27).",
      ],
    },
    {
      title: "The fraction trap",
      prompt: "A student was asked to divide a number by 5 and then subtract 8. Instead, the student multiplied the number by 5 and then added 8. The incorrect result was 12 more than twice the correct result. Find the original number.",
      format: "numeric", answer: -60 / 23,
      traps: [{ answer: -20 / 23, misconception: "sign" }],
      hint: "Correct result: n/5 − 8. Incorrect result: 5n + 8. Write: incorrect = 2 × correct + 12.",
      solution: [
        "5n + 8 = 2(n/5 − 8) + 12 = 2n/5 − 4",
        "Multiply by 5: 25n + 40 = 2n − 20",
        "23n = −60, so n = −60/23",
      ],
    },
  ],

  // ---------- Question formats ----------
  formatOrder: ["numeric", "mcq", "explain"],
  formatLabels: {
    numeric: "Numeric answer",
    mcq: "Multiple choice",
    explain: "Answer with justification",
    count: "Classify the equation",
  },

  // ---------- Misconceptions (names shown to learner and teacher) ----------
  misconceptions: {
    sign: "Sign error with negatives or brackets",
    oneSolution: "Assumes exactly one solution",
    fraction: "Adds denominators directly",
    unknown: "Unclassified error",
  },

  // Alternative explanation for each misconception (decision rule outcome 2)
  remedies: {
    sign: "Your answer matches what you get when a negative sign is applied to only the first term of a bracket, or a term changes side without changing sign. Expand each bracket term by term, then substitute your answer into the original equation to check.",
    oneSolution: "Not every linear equation has exactly one solution. If x cancels out after simplifying, read the remaining statement: always true means infinitely many solutions; false means no solution. Check every given condition.",
    fraction: "Fractions with different denominators cannot be added by adding the denominators. Multiply every term by the LCM first: x/2 + x/3 = (3x + 2x)/6 = 5x/6.",
    unknown: "Substitute your answer into the original equation and find the first step where the two sides stop being equal.",
  },

  // Prerequisite instruction (decision rule outcome 3)
  prerequisite: {
    title: "Review: distributive law with negatives",
    rows: [["−2(x + 5)", "−2x − 10"], ["−2(x − 5)", "−2x + 10"], ["3(x − 4)", "3x − 12"], ["−(x − 1)", "−x + 1"]],
    note: "A factor outside a bracket multiplies every term inside, sign included.",
  },

  decisions: {
    harder: "Next: harder question",
    reexplain: "Next: targeted explanation, same level",
    prerequisite: "Next: prerequisite review, easier level",
    olympiad: "Next: following problem",
  },

  hint: "Expand brackets term by term, collect x-terms on one side, then verify by substitution.",

  // Feedback on the written justification when the AI is unavailable
  explainFallback: {
    good: "Your justification applies the same operation to both sides. Extend it: when would x cancel out completely?",
    sign: "Re-check the sign when expanding the bracket or moving a term. Does your answer satisfy the original equation?",
    oneSolution: "What remains after x cancels? Decide whether that statement is always true or never true.",
    fraction: "Check how the fractions were combined. What is the LCM of the denominators?",
    unclear: "State each operation you applied to both sides and why the equation remains balanced.",
  },

  // ---------- About ----------
  about: [
    "Equation Arena is an adaptive tutor for linear equations in one variable (Class 8), extended to Olympiad level.",
    "Designed for a high-achieving learner who is not challenged by routine practice.",
    "Questions are generated automatically. Each wrong answer is matched against known misconceptions, and the tutor chooses the next step: a harder question, a targeted explanation, or a prerequisite review.",
    "Teacher-in-the-loop: a teacher reviews progress and approves or overrides AI-generated feedback.",
    "ET 617 End-Semester Exam · Card: P4 · P4-T3 · L6 · C5",
  ],
};
