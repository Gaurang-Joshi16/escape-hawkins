import { useState, useRef, useEffect } from 'react';
import useQuestion from '../hooks/useQuestion';
import Timer from './Timer';
import '../styles/QuestionCard.css';
import '../styles/CipherBox.css';

/**
 * QuestionCard Component - FIXED TIME TRACKING
 * 
 * Key Fixes:
 * - Tracks actual time taken from Timer component
 * - Passes correct timeTaken to submitAnswer
 * - Ensures score calculation includes time bonus
 */

/**
 * RiddleInput Component - FINAL VERSION
 * Single submit button, lifeline-based retry system
 * Wrong answers consume lifelines, correct answers proceed
 */
const RiddleInput = ({ correctAnswer, hint, onComplete, isSubmitted }) => {
    const [letters, setLetters] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lifelines, setLifelines] = useState(2);

    const [showIntro, setShowIntro] = useState(true);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const inputRefs = useRef([]);

    const answerLength = correctAnswer.length;

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0] && !isSubmitted) {
            inputRefs.current[0].focus();
        }
    }, [isSubmitted]);

    // Auto-focus next input when currentIndex changes
    useEffect(() => {
        if (currentIndex < answerLength && !isSubmitted) {
            inputRefs.current[currentIndex]?.focus();
        }
    }, [currentIndex, answerLength, isSubmitted]);

    const handleKeyDown = (e, index) => {
        if (isSubmitted) return;

        // Prevent paste
        if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
            e.preventDefault();
            return;
        }

        // Handle Enter key - submit answer
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
            return;
        }

        // Handle backspace
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (letters[index]) {
                // Delete current box
                const newLetters = [...letters];
                newLetters[index] = '';
                setLetters(newLetters);
            } else if (index > 0) {
                // Move back and delete previous
                const newLetters = [...letters];
                newLetters[index - 1] = '';
                setLetters(newLetters);
                setCurrentIndex(index - 1);
            }
            return;
        }

        // Only allow letters
        if (!/^[a-zA-Z]$/.test(e.key)) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        const inputLetter = e.key.toUpperCase();

        // Accept any letter (no validation)
        const newLetters = [...letters];
        newLetters[index] = inputLetter;
        setLetters(newLetters);

        // Advance to next box
        if (index < answerLength - 1) {
            setCurrentIndex(index + 1);
        }
    }; const showFeedback = (message) => { setFeedbackMessage(message); setTimeout(() => { setFeedbackMessage(''); }, 3000); }; const handleSubmit = () => {
        if (letters.length !== answerLength) return;

        const userAnswer = letters.join('');
        const isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();

        if (isCorrect) {
            // Correct answer - proceed
            onComplete(userAnswer);
        } else {
            // Wrong answer - consume lifeline
            if (lifelines > 0) {
                setLifelines(lifelines - 1);
                showFeedback('Incorrect. You lost one lifeline. ❤️');
            } else {
                showFeedback('Incorrect answer.');
            }
        }
    };

    return (
        <div className="riddle-input-container">
            {/* Intro Modal */}
            {showIntro && (
                <div className="riddle-intro-overlay" onClick={() => setShowIntro(false)}>
                    <div className="riddle-intro-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>🧩 RIDDLE ROUND</h3>
                        <p>You have <strong>2 lifelines ❤️ ❤️</strong></p>
                        <p>Each wrong answer costs one lifeline.</p>
                        <p>Solve the riddle to proceed!</p>
                        <button className="riddle-intro-dismiss" onClick={() => setShowIntro(false)}>
                            Got it!
                        </button>
                    </div>
                </div>
            )}

            {hint && (
                <div className="riddle-hint">
                    {hint}
                </div>
            )}

            {/* Lifeline Counter */}
            <div className="riddle-lifelines">
                <span className="lifeline-label">Lifelines:</span>
                {Array.from({ length: 2 }).map((_, i) => (
                    <span key={i} className="lifeline-heart">
                        {i < lifelines ? '❤️' : '🖤'}
                    </span>
                ))}
            </div>

            {feedbackMessage && (
                <div className="riddle-feedback-message">
                    {feedbackMessage}
                </div>
            )}

            <div className="riddle-boxes">
                {Array.from({ length: answerLength }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        className={`riddle-box ${letters[index] ? 'filled' : ''} ${isSubmitted ? 'disabled' : ''}`}
                        value={letters[index] || ''}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={(e) => e.preventDefault()}
                        onClick={() => {
                            if (!isSubmitted) {
                                setCurrentIndex(index);
                                inputRefs.current[index]?.focus();
                            }
                        }}
                        disabled={isSubmitted}
                    />
                ))}
            </div>

            {/* Single Submit Button */}
            {!isSubmitted && (
                <button
                    className="riddle-submit-button"
                    onClick={handleSubmit}
                    disabled={letters.length !== answerLength}
                >
                    SUBMIT ANSWER
                </button>
            )}
        </div>
    );
};


const QuestionCard = ({ question, onComplete, questionNumber, totalQuestions }) => {
    const [timerKey] = useState(`q${questionNumber}_${question.id}`);
    const timerResultRef = useRef(null);

    const {
        answer,
        isSubmitted,
        handleAnswerChange,
        submitAnswer
    } = useQuestion(question, onComplete);

    // Timer persistence key
    const timerStorageKey = `timer_q${question.id}_remaining`;

    // Load saved timer state on mount
    const getSavedTimeRemaining = () => {
        try {
            const saved = sessionStorage.getItem(timerStorageKey);
            console.log(`[TIMER DIAGNOSTIC] Question ${question.id}:`, {
                timerStorageKey,
                savedValue: saved,
                timeLimit: question.timeLimit
            });
            if (saved) {
                const remaining = parseFloat(saved);
                if (remaining > 0 && remaining <= question.timeLimit) {
                    console.log(`[TIMER DIAGNOSTIC] Restoring saved time: ${remaining}s`);
                    return remaining;
                }
            }
            console.log(`[TIMER DIAGNOSTIC] Using full timeLimit: ${question.timeLimit}s`);
        } catch (e) {
            console.error('Error loading timer state:', e);
        }
        return question.timeLimit;
    };

    const [initialTimeRemaining] = useState(getSavedTimeRemaining);

    console.log(`[TIMER DIAGNOSTIC] QuestionCard mounted - Question ${question.id}, initialTimeRemaining: ${initialTimeRemaining}s`);

    // Save timer state periodically
    const saveTimerState = (timeRemaining) => {
        try {
            if (timeRemaining > 0 && !isSubmitted) {
                sessionStorage.setItem(timerStorageKey, timeRemaining.toString());
            }
        } catch (e) {
            console.error('Error saving timer state:', e);
        }
    };

    // Clear timer state on submission
    useEffect(() => {
        if (isSubmitted) {
            try {
                sessionStorage.removeItem(timerStorageKey);
            } catch (e) {
                console.error('Error clearing timer state:', e);
            }
        }
    }, [isSubmitted, timerStorageKey]);

    // Reset timer result when question changes
    useEffect(() => {
        timerResultRef.current = null;
    }, [question.id]);

    const handleTimeout = async (timerResult) => {
        if (!isSubmitted) {
            timerResultRef.current = timerResult;
            submitAnswer(timerResult.timeTaken);
        }
    }; const showFeedback = (message) => { setFeedbackMessage(message); setTimeout(() => { setFeedbackMessage(''); }, 3000); }; const handleSubmit = () => {
        if (!isSubmitted && answer.trim()) {
            // Get current time from timer if available
            const timeTaken = timerResultRef.current?.timeTaken || 0;
            submitAnswer(timeTaken);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isSubmitted && answer.trim()) {
            handleSubmit();
        }
    };

    return (
        <div className="question-card">
            <div className="question-card-inner">
                {/* Question Header */}
                <div className="question-header">
                    <div className="question-number">
                        Question {questionNumber} of {totalQuestions}
                    </div>
                    <Timer
                        key={timerKey}
                        timeLimit={question.timeLimit}
                        initialTimeRemaining={initialTimeRemaining}
                        onTimeout={handleTimeout}
                        onTick={(result) => {
                            // Update timer result on every tick
                            timerResultRef.current = result;
                            // Save timer state to sessionStorage
                            saveTimerState(result.timeRemaining);
                        }}
                        autoStart={true}
                    />
                </div>

                {/* Question Content */}
                <div className="question-content">
                    <h2 className="question-text">{question.prompt || question.text}</h2>

                    {/* Code Block for questions with code snippets */}
                    {question.code && (
                        <div className="code-block-container">
                            <pre className="code-block">
                                <code>{question.code}</code>
                            </pre>
                        </div>
                    )}

                    {/* Cipher Block for encrypted messages */}
                    {question.cipher && (
                        <div className="cipher-box">
                            <div className="cipher-header">Encrypted Message:</div>
                            <pre className="cipher-content">{question.cipher}</pre>
                        </div>
                    )}

                    {/* Hint for Level 5 questions */}
                    {question.hint && (
                        <div className="hint-box">
                            <div className="hint-icon">ℹ️</div>
                            <div className="hint-content">{question.hint}</div>
                        </div>
                    )}


                    {/* MCQ Options */}
                    {question.type === 'MCQ' && (
                        <div className="question-options">
                            {question.options.map((option, index) => {
                                // Support both string and object formats
                                const optionText = typeof option === 'string' ? option : option.text;
                                const optionId = typeof option === 'object' ? option.id : null;

                                // Check if option contains code (has newlines or indentation)
                                const isCodeOption = optionText.includes('\n') || optionText.match(/^\s{2,}/m);

                                return (
                                    <button
                                        key={optionId ?? index}
                                        className={`option-button ${answer === optionText ? 'selected' : ''} ${isSubmitted ? 'disabled' : ''} ${isCodeOption ? 'code-option' : ''}`}
                                        onClick={() => handleAnswerChange(optionText)}
                                        disabled={isSubmitted}
                                    >
                                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                        {isCodeOption ? (
                                            <pre className="option-code">
                                                <code>{optionText}</code>
                                            </pre>
                                        ) : (
                                            <span className="option-text">{optionText}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Text/Debug Input */}
                    {(question.type === 'TEXT' || question.type === 'LOGIC' || question.type === 'DEBUG' || question.type === 'TEXT_INPUT') && (
                        <div className="question-input-container">
                            <textarea
                                className="question-input question-textarea"
                                value={answer}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                                disabled={isSubmitted}
                                placeholder="Type your answer here..."
                                autoFocus
                                rows={3}
                            />
                        </div>
                    )}

                    {/* Riddle Letter-by-Letter Input */}
                    {question.type === 'RIDDLE' && (
                        <RiddleInput
                            correctAnswer={question.correctAnswer}
                            hint={question.hint}
                            onComplete={(userAnswer) => {
                                handleAnswerChange(userAnswer);
                                // Auto-submit when complete
                                setTimeout(() => handleSubmit(), 300);
                            }}
                            isSubmitted={isSubmitted}
                        />
                    )}

                    {/* Submit Button */}
                    {!isSubmitted && (
                        <button
                            className="submit-button"
                            onClick={handleSubmit}
                            disabled={!answer.trim()}
                        >
                            SUBMIT ANSWER
                        </button>
                    )}

                    {/* Submitted State */}
                    {isSubmitted && (
                        <div className="submitted-message">
                            ✓ Answer submitted. Proceeding to next question...
                        </div>
                    )}
                </div>

                {/* Question Footer */}
                <div className="question-footer">
                    <div className="question-points">
                        {question.points} points
                    </div>
                    <div className="question-type-badge">
                        {question.type}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;

