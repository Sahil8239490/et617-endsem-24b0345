// =====================================================================
//  content.js  —  ALL the words and settings of the app live here.
//  For the viva: most change requests = edit text or a number in this file,
//  save, commit, push. You never need to touch app.js for text changes.
// =====================================================================

const CONTENT = {
  // ---------- Identity (shown in the footer of every screen + About) ----------
  rollNo: "ROLLNO",                 // <-- put your roll number here, e.g. "23B1234"
  appName: "Equation Arena",
  learnerName: "Kabir",

  // ---------- Session settings ----------
  questionsPerSession: 6,           // how many questions in one session
  maxLevel: 4,                      // levels 1..4 (see levelNames)
  teacherPin: "1234",               // PIN to open the Teacher view

  levelNames: {
    1: "Level 1 — Warm-up: x on both sides",
    2: "Level 2 — Trap: negative outside a bracket",
    3: "Level 3 — Fractions: x/a + x/b = c",
    4: "Level 4 — Olympiad: how many solutions?",
  },

  // Question formats, used in this order and repeated
  formatOrder: ["numeric", "mcq", "explain"],
  formatLabels: {
    numeric: "Type the answer",
    mcq: "Pick the answer",
    explain: "Solve and justify",
    count: "How many solutions?",
  },

  // ---------- Home screen ----------
  home: {
    title: "Kabir, ready for something harder than the textbook?",
    lines: [
      "No routine drills — every correct answer unlocks a harder level.",
      "Bored? Press ⚡ Challenge me to skip ahead.",
      "Final boss: equations with no solution or infinitely many.",
    ],
    startButton: "Enter the arena",
  },

  // ---------- Concept explanation (Learn screen) ----------
  lesson: [
    {
      title: "1. You already know the moves",
      text: "Do the same operation to both sides and the equation stays true. Let's test that idea on harder cases.",
      visual: "3x + 4 = x + 10  →  2x = 6  →  x = 3",
    },
    {
      title: "2. Trap: a minus outside a bracket",
      text: "The minus multiplies EVERY term inside. Fast solvers often flip only the first one.",
      visual: "−2(x − 3) = −2x + 6   (not −2x − 6)",
    },
    {
      title: "3. Puzzle: does every equation have one answer?",
      text: "Try 2(x + 3) = 2x + 6. Expand: 2x + 6 = 2x + 6. Every x works! Now try 2(x + 3) = 2x + 5: we get 6 = 5. No x works!",
      visual: "one solution · no solution · infinitely many",
    },
    {
      title: "4. Olympiad habit",
      text: "When x disappears, don't panic: read what is left. True statement → infinitely many. False statement → no solution.",
      visual: "0 = 0 → ∞     0 = 1 → none",
    },
  ],
  skipLessonLabel: "I know this — skip to questions",

  // ---------- Feedback messages ----------
  feedback: {
    correct: [
      "Correct. Level up! 🔥",
      "Clean solve, Kabir. Next one is tougher. 🔥",
      "Right — and you avoided the trap. 🔥",
    ],
    harderNext: "Unlocking a harder level.",
    notYet: "Not quite — there's a trap in this one. Let's find it.",
  },

  // Alternative explanations for each misconception (decision rule outcome 2)
  remedies: {
    sign: {
      title: "Spot the sign slip",
      text: "Your answer is exactly what we get if a negative sign is applied to only the first term in the bracket (or a term moves across = without changing sign). Check: substitute your answer back into the ORIGINAL equation — do both sides match?",
      example: "−3(x − 2) = −3x + 6   because (−3)×(−2) = +6",
    },
    oneSolution: {
      title: "Not every equation has exactly one answer",
      text: "When you simplify, x can cancel out completely. Then look at what's left: if it's always true (like 6 = 6), EVERY x works. If it's false (like 6 = 5), NO x works.",
      example: "4(x + 1) = 4x + 4  →  4 = 4  → infinitely many",
    },
    fraction: {
      title: "Fractions don't add like that",
      text: "x/2 + x/3 is not x/5. Use the LCM: x/2 + x/3 = 3x/6 + 2x/6 = 5x/6.",
      example: "x/2 + x/3 = 10  →  5x/6 = 10  →  x = 12",
    },
    unknown: {
      title: "Check by substituting",
      text: "Olympiad trick: put your answer back into the original equation. If both sides don't match, find the first step where they stopped being equal.",
      example: "",
    },
  },

  // Prerequisite instruction (decision rule outcome 3)
  prerequisite: {
    title: "Quick reset: the distributive law with negatives",
    text: "A number outside a bracket multiplies every term inside, sign included. Two negatives make a positive.",
    table: [
      ["−2(x + 5)", "= −2x − 10"],
      ["−2(x − 5)", "= −2x + 10"],
      ["3(x − 4)", "= 3x − 12"],
      ["−(x − 1)", "= −x + 1"],
    ],
    tip: "Always check: substitute your answer into the original equation.",
  },

  hint: "Hint: expand brackets carefully (watch the signs), collect x on one side, then check by substituting.",

  // Fallback feedback for the explanation question when the AI is not available
  explainFallback: {
    good: "Good justification — you kept both sides equal. Can you find a different equation where x cancels out?",
    sign: "Look at the sign when you expanded or moved a term. Substitute your answer back — does it really work?",
    oneSolution: "What happened to x after simplifying? If it cancelled, read the statement that is left.",
    fraction: "Check how you added the fractions. What is the LCM of the denominators?",
    unclear: "Justify each step: what did you do to both sides, and why does the equation stay true?",
  },

  // ---------- Summary screen ----------
  summary: {
    title: "Session complete! 🏆",
    message: "Next session starts at your new level. Try to beat your score.",
  },

  // ---------- About screen ----------
  about: [
    "Equation Arena is an adaptive tutor for linear equations in one variable (Class 8), stretched to Olympiad level.",
    "It was designed for a high-achieving learner who is bored by routine practice.",
    "Questions are generated automatically. The tutor diagnoses misconceptions from the exact wrong answer and chooses the next step: a harder question, an alternative explanation, or a prerequisite refresher.",
    "A teacher checks and can approve or override the AI's feedback.",
    "ET 617 End-Semester Exam · Card: P4 · P4-T3 · L6 · C5",
  ],
};
