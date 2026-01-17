/// src/data/level1Questions.js
// LEVEL 1 — MCQs (5 Questions)
// NOTE: Logic is frozen. Only edit question content here.

export const level1Questions = [
  {
    id: 1,
    type: 'MCQ',
    text: 'Which of the following is a version control system?',
    options: [
      { id: 'A', text: 'Docker' },
      { id: 'B', text: 'Git' },
      { id: 'C', text: 'JVM' },
      { id: 'D', text: 'MySQL' }
    ],
    correctAnswer: 'Git',
    points: 10,
    timeLimit: 30
  },
  {
    id: 2,
    type: 'MCQ',
    text: 'Which protocol is used to send emails?',
    options: [
      { id: 'A', text: 'FTP' },
      { id: 'B', text: 'SMTP' },
      { id: 'C', text: 'HTTP' },
      { id: 'D', text: 'TCP' }
    ],
    correctAnswer: 'SMTP',
    points: 10,
    timeLimit: 30
  },
  {
    id: 3,
    type: 'MCQ',
    text: 'Which data structure is best for BFS traversal?',
    options: [
      { id: 'A', text: 'Stack' },
      { id: 'B', text: 'Queue' },
      { id: 'C', text: 'Tree' },
      { id: 'D', text: 'Graph' }
    ],
    correctAnswer: 'Queue',
    points: 10,
    timeLimit: 30
  },
  {
    id: 4,
    type: 'MCQ',
    text: 'What will be printed?\nprint(bool("False"))',
    options: [
      { id: 'A', text: 'False' },
      { id: 'B', text: 'True' },
      { id: 'C', text: 'Error' },
      { id: 'D', text: 'None' }
    ],
    correctAnswer: 'True',
    points: 10,
    timeLimit: 30
  },
  {
    id: 5,
    type: 'MCQ',
    text: 'What is the output of the following code?\n\nint i = 0;\nprintf("%d %d", i++, ++i);',
    options: [
      { id: 'A', text: '0 1' },
      { id: 'B', text: '0 2' },
      { id: 'C', text: '1 2' },
      { id: 'D', text: 'Undefined behavior' }
    ],
    correctAnswer: 'Undefined behavior',
    points: 10,
    timeLimit: 30
  }
];


/**
 * Validate answer for a question
 */
export const validateAnswer = (questionId, answer) => {
    const question = level1Questions.find(q => q.id === questionId);
    if (!question) return false;

    return answer.trim().toUpperCase() === question.correctAnswer.toUpperCase();
};

export default level1Questions;
