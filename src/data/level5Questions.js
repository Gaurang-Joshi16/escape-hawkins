/**
 * Level 5 Questions - Decryption MCQs
 * 
 * Type: MCQ with cipher/encrypted text
 * Count: 2 questions
 * Threshold: Both correct to unlock hint
 * Time limit: 45 seconds total for both questions
 */

export const level5Questions = [
    {
        id: 1,
        type: 'MCQ',
        text: 'The following message was encrypted using a Caesar cipher. What is the decrypted message?',
        cipher: `WKH JDPH LV RSHQ`,
        hint: 'Treat the characters as elements in a sequence. A fixed rule altered every element before output.',
        options: [
            { id: 'A', text: 'THE GATE IS OPEN' },
            { id: 'B', text: 'YOU WIN NOW' },
            { id: 'C', text: 'ESCAPE NOW' },
            { id: 'D', text: 'THE GAME IS OPEN' },
        ],
        correctAnswer: 'THE GAME IS OPEN',
        points: 10,
        timeLimit: 45
    },
    {
        id: 2,
        type: 'MCQ',
        text: 'The following message was encrypted using a Caesar cipher. What is the decrypted message?',
        cipher: `GSRH RH Z HVXIVG`,
        hint: 'The alphabet has been flipped on itself. What begins the line now ends it.',
        options: [
            { id: 'A', text: 'THE FINAL GATE' },
            { id: 'B', text: 'THIS IS A SECRET' },
            { id: 'C', text: 'ESCAPE NOW' },
            { id: 'D', text: 'LAB UNLOCKED' }
        ],
        correctAnswer: 'THIS IS A SECRET',
        points: 10,
        timeLimit: 45
    }
];

export default level5Questions;
