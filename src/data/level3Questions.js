/**
 * Level 3 Questions — RIDDLES
 *
 * Type: RIDDLE
 * Input: Letter-by-letter validation
 * Time: 60 seconds per question
 * Scoring: +10 points + remaining time
 *
 * NOTE:
 * - Hints are intentionally subtle
 * - Answers are NOT revealed anywhere in UI
 * - Case-insensitive matching
 */

export const level3Questions = [
  {
    id: 1,
    type: "RIDDLE",
    prompt: `I promise one thing,
but deliver another.
I look correct,
yet behave incorrectly.
Compilers trust me.
Debuggers hate me.

What am I?`,
    hint: "The rules say it should behave… but the rules never promised how.",
    correctAnswer: "UNDEFINEDBEHAVIOR",
    timeLimit: 60,
    points: 10
  },

  {
    id: 2,
    type: "RIDDLE",
    prompt: `I look like data,
but I am not data.
Change me,
and many things change.
Copy me wrong,
and chaos begins.

What am I?`,
    hint: "It doesn’t hold the value — it knows where the value lives.",
    correctAnswer: "POINTER",
    timeLimit: 60,
    points: 10
  },

  {
    id: 3,
    type: "RIDDLE",
    prompt: `I connect
your code to the outside world.
I look like a function,
but I am not one.
Break me,
and nothing talks.

What am I?`,
    hint: "It defines how two systems agree to speak.",
    correctAnswer: "API",
    timeLimit: 60,
    points: 10
  }
];

export default level3Questions;
