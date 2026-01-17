import { useState, useCallback } from 'react';

/**
 * useQuestion Hook - FIXED SCORING LOGIC
 * 
 * Key Fixes:
 * - Proper answer comparison (case-sensitive for MCQ, case-insensitive for TEXT)
 * - Time bonus calculation: score = points + timeRemaining
 * - Accurate result object with all required fields
 * 
 * @param {object} question - Question object
 * @param {Function} onComplete - Callback when answer is submitted
 * @returns {object} Question state and controls
 */
export const useQuestion = (question, onComplete) => {
    const [answer, setAnswer] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswerChange = useCallback((value) => {
        if (!isSubmitted) {
            setAnswer(value);
        }
    }, [isSubmitted]);

    /**
     * Validate answer based on question type
     */
    const validateAnswer = (userAnswer, correctAnswer, questionType) => {
        const trimmedUser = userAnswer.trim();
        const trimmedCorrect = correctAnswer.trim();

        // MCQ: Case-sensitive exact match
        if (questionType === 'MCQ') {
            return trimmedUser === trimmedCorrect;
        }

        // TEXT/LOGIC: Case-insensitive match
        return trimmedUser.toLowerCase() === trimmedCorrect.toLowerCase();
    };

    /**
     * Submit answer with time tracking
     * @param {number} timeTaken - Seconds taken to answer
     */
    const submitAnswer = useCallback((timeTaken = 0) => {
        if (isSubmitted) return;

        // Validate answer
        const correct = validateAnswer(answer, question.correctAnswer, question.type);

        // Calculate time remaining
        const timeRemaining = Math.max(0, question.timeLimit - timeTaken);

        // Calculate score: points + time bonus (only if correct)
        const earnedScore = correct ? question.points + timeRemaining : 0;

        setIsCorrect(correct);
        setScore(earnedScore);
        setIsSubmitted(true);

        // Construct result object
        const result = {
            questionId: question.id,
            answer,
            isCorrect: correct,
            score: earnedScore,
            timeTaken,
            timeRemaining
        };

        // Call parent callback
        if (onComplete) {
            onComplete(result);
        }

        return result;
    }, [answer, question, isSubmitted, onComplete]);

    const reset = useCallback(() => {
        setAnswer('');
        setIsSubmitted(false);
        setIsCorrect(false);
        setScore(0);
    }, []);

    return {
        answer,
        isSubmitted,
        isCorrect,
        score,
        handleAnswerChange,
        submitAnswer,
        reset
    };
};

export default useQuestion;
