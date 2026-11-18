// =====================================================================
//  content.js  —  ALL the words and settings of the app live here.
//  For the viva: most change requests = edit text or a number in this file,
//  save, commit, push. You never need to touch app.js for text changes.
// =====================================================================

const CONTENT = {
  // ---------- Identity (shown in the footer of every screen + About) ----------
  rollNo: "ROLLNO",                 // <-- put your roll number here, e.g. "23B1234"
  appName: "Balance It!",
  learnerName: "Riya",

  // ---------- Session settings ----------
  questionsPerSession: 6,           // how many questions in one session
  maxLevel: 4,                      // levels 1..4 (see levelNames)
  teacherPin: "1234",               // PIN to open the Teacher view

  levelNames: {
    1: "Level 1 — one step (x + a = b)",
    2: "Level 2 — two steps (ax + b = c)",
    3: "Level 3 — x on both sides (ax + b = cx + d)",
    4: "Level 4 — brackets (a(x + b) = c)",
  },

  // Question formats, used in this order and repeated
  formatOrder: ["numeric", "mcq", "explain"],
  formatLabels: {
    numeric: "Type the answer",
    mcq: "Pick the answer",
    explain: "Solve and explain your first step",
  },

  // ---------- Home screen ----------
  home: {
    title: "Hi Riya! Let's balance some equations.",
    lines: [
      "There is no timer here. Take your time.",
      "Mistakes are fine — they show us what to practise next.",
      "You can ask for a hint any time.",
    ],
    startButton: "Start learning",
  },

  // ---------- Concept explanation (Learn screen) ----------
  lesson: [
    {
      title: "1. An equation is a balance",
      text: "Think of = as the middle of a weighing scale. The left side and the right side weigh the same.",
      visual: "x + 5  ⚖  12",
    },
    {
      title: "2. Keep it balanced",
      text: "Whatever we do to one side, we do to the other side too. Then the scale stays balanced.",
      visual: "x + 5 − 5  ⚖  12 − 5",
    },
    {
      title: "3. So x is…",
      text: "x = 7. That is why +5 'becomes' −5 when it moves. It does not jump — we subtracted 5 from BOTH sides.",
      visual: "x  ⚖  7",
    },
    {
      title: "4. Check your answer",
      text: "Put 7 back in: 7 + 5 = 12. ✓ Both sides match, so we are right!",
      visual: "7 + 5 = 12 ✓",
    },
  ],

  // ---------- Feedback messages ----------
  feedback: {
    correct: [
      "Yes! You kept the scale balanced. ⭐",
      "Well done, Riya! That's exactly right. ⭐",
      "Correct! You are getting stronger at this. ⭐",
    ],
    harderNext: "You're ready for a slightly harder one.",
    notYet: "Not yet — let's look at this step together.",
  },

  // Alternative explanations for each misconception (decision rule outcome 2)
  remedies: {
    sign: {
      title: "Let's look at the sign",
      text: "It looks like the number moved across = but kept its sign. Remember the balance: to remove +5 from the left, we SUBTRACT 5 from both sides. So +5 on the left becomes −5 on the right.",
      example: "x + 5 = 12  →  x + 5 − 5 = 12 − 5  →  x = 7  (not 12 + 5)",
    },
    oneSide: {
      title: "Both sides, every term",
      text: "It looks like a step was done to only one side (or one term). The scale tips over! Whatever we divide or multiply on the left, we do to the WHOLE right side too.",
      example: "3x + 4 = 19  →  3x = 15  →  3x ÷ 3 = 15 ÷ 3  →  x = 5",
    },
    unknown: {
      title: "Let's slow down",
      text: "Let's try the next one step by step. Write one small step at a time and check it.",
      example: "",
    },
  },

  // Prerequisite instruction (decision rule outcome 3)
  prerequisite: {
    title: "A quick refresher: opposite operations",
    text: "Every operation has an opposite that undoes it. Adding is undone by subtracting. Multiplying is undone by dividing. We use the opposite operation on BOTH sides to get x alone.",
    table: [
      ["+ 4", "undo with − 4"],
      ["− 3", "undo with + 3"],
      ["× 2", "undo with ÷ 2"],
      ["÷ 5", "undo with × 5"],
    ],
    tip: "Signs with negatives: −3 + 3 = 0, and 5 − (−2) = 7.",
  },

  hint: "Hint: what is being done to x? Do the opposite to BOTH sides, one step at a time.",

  // Fallback feedback for the explanation question when the AI is not available
  explainFallback: {
    good: "Nice explanation — you did the same thing to both sides. That's the key idea!",
    sign: "Check the sign: when you remove a number from one side, you do the opposite operation (+ becomes −) on both sides.",
    oneSide: "Remember to do each step to BOTH sides, and to every term.",
    unclear: "Try saying what you did to both sides, for example: 'I subtracted 4 from both sides'.",
  },

  // ---------- Summary screen ----------
  summary: {
    title: "Session complete! 🎉",
    message: "Every question you tried made you stronger. Come back tomorrow for the next set.",
  },

  // ---------- About screen ----------
  about: [
    "Balance It! is an adaptive tutor for linear equations in one variable (Class 8).",
    "It was designed for learners repeating the topic who feel anxious about maths.",
    "Questions are generated automatically. The tutor diagnoses two common misconceptions and chooses the next step: a harder question, a new explanation, or a refresher.",
    "A teacher checks and can approve or change the AI's feedback.",
    "ET 617 End-Semester Exam · Card: P4 · P4-T3 · L5 · C5",
  ],
};
