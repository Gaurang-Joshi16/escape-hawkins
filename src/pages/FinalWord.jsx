import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { submitFinalWord, getFinalWordStatus, getTotalScore } from '../services/finalWordService';
import FinalWordInput from '../components/FinalWordInput';
import '../styles/FinalWord.css';

/**
 * Final Word Page
 * 
 * Final word submission interface
 * Features:
 * - Unlocks only after all 5 levels cleared
 * - 2 attempts maximum
 * - Validates final word (ELEVEN)
 * - Persists state in Supabase
 * - Shows in-page feedback
 * - ALWAYS renders (never returns null)
 */

const CORRECT_WORD = 'ELEVEN';

const FinalWord = () => {
    const navigate = useNavigate();
    const { teamId } = useAuth();
    const {
        isFinalWordUnlocked = false,
        unlockedLetters = [],
        FINAL_WORD_CONFIG = { hint: 'Use the letters you collected to form the final word.' }
    } = useGame() || {};

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [attemptsUsed, setAttemptsUsed] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [totalScore, setTotalScore] = useState(0);

    // Load final word status and total score on mount
    useEffect(() => {
        const loadStatus = async () => {
            if (!teamId) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch final word status
                const status = await getFinalWordStatus(teamId);
                setAttemptsUsed(status.attemptsUsed || 0);
                setIsLocked(status.isLocked || false);
                setIsCorrect(status.isCorrect || false);
                setIsSubmitted(status.isSubmitted || false);

                // Fetch total score from database
                const score = await getTotalScore(teamId);
                setTotalScore(score);

                // Show appropriate message if already attempted
                if (status.isCorrect) {
                    setMessage({
                        type: 'success',
                        text: '🎉 You unlocked it. You were sharp and time-bounded. Let\'s meet in Round 2.'
                    });
                } else if (status.isLocked) {
                    setMessage({
                        type: 'error',
                        text: 'No attempts remaining. Final word locked.'
                    });
                }
            } catch (err) {
                console.error('Error loading final word status:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadStatus();
    }, [teamId]);

    const handleSubmit = async (word) => {
        if (isLocked || isCorrect || !teamId) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const submittedWord = word.toUpperCase().trim();
            const correct = submittedWord === CORRECT_WORD;
            const newAttemptsUsed = attemptsUsed + 1;

            // Submit to Supabase
            const result = await submitFinalWord(teamId, submittedWord, correct, newAttemptsUsed);

            if (!result.success) {
                setMessage({
                    type: 'error',
                    text: result.error || 'Submission failed. Please try again.'
                });
                setIsSubmitting(false);
                return;
            }

            // Update local state
            setAttemptsUsed(newAttemptsUsed);
            setIsSubmitted(true);

            if (correct) {
                setIsCorrect(true);
                setIsLocked(true);
                setMessage({
                    type: 'success',
                    text: '🎉 You unlocked it. You were sharp and time-bounded. Let\'s meet in Round 2.'
                });
            } else {
                // Incorrect guess
                if (newAttemptsUsed >= 2) {
                    // No attempts left
                    setIsLocked(true);
                    setMessage({
                        type: 'error',
                        text: 'No attempts remaining. Final word locked.'
                    });
                } else {
                    // 1 attempt left
                    setMessage({
                        type: 'warning',
                        text: `Incorrect guess. You have ${2 - newAttemptsUsed} attempt left.`
                    });
                }
            }
        } catch (err) {
            console.error('Final word submission error:', err);
            setMessage({
                type: 'error',
                text: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ALWAYS render the page - never return null
    return (
        <div className="final-word-page">
            <div className="final-word-background"></div>

            <header className="final-word-header">
                <h1 className="final-word-page-title">FINAL WORD SUBMISSION</h1>
                <button
                    className="final-word-back"
                    onClick={() => navigate('/round1')}
                    disabled={isSubmitting}
                >
                    BACK TO DASHBOARD
                </button>
            </header>

            <div className="final-word-content">
                {/* Loading State */}
                {isLoading && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#00ff88' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '1rem' }}>Loading...</p>
                    </div>
                )}

                {/* Main Content - Only show when not loading */}
                {!isLoading && (
                    <>
                        {/* Score Summary - Total Score from Database */}
                        <div className="final-word-summary">
                            <h2>Your Progress</h2>
                            <div className="summary-stats">
                                <div className="summary-stat">
                                    <div className="summary-stat-label">Total Score</div>
                                    <div className="summary-stat-value">{totalScore}</div>
                                </div>
                                <div className="summary-stat">
                                    <div className="summary-stat-label">Attempts Used</div>
                                    <div className="summary-stat-value">{attemptsUsed} / 2</div>
                                </div>
                            </div>
                        </div>

                        {/* Access Locked Message - Only show if NOT unlocked and no attempts yet */}
                        {!isFinalWordUnlocked && attemptsUsed === 0 && (
                            <div className="final-word-locked-message">
                                <p>🔒 Complete all 5 levels to unlock the final word submission.</p>
                            </div>
                        )}

                        {/* Final Word Input - Show if unlocked AND (not correct AND attempts < 2) */}
                        {isFinalWordUnlocked && !isCorrect && attemptsUsed < 2 && (
                            <FinalWordInput
                                isUnlocked={true}
                                availableLetters={unlockedLetters}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                            />
                        )}

                        {/* Message Display */}
                        {message && (
                            <div className={`final-word-message ${message.type}`}>
                                <div className="message-icon">
                                    {message.type === 'success' && '🎉'}
                                    {message.type === 'error' && '❌'}
                                    {message.type === 'warning' && '⚠️'}
                                </div>
                                <div className="message-text">{message.text}</div>
                            </div>
                        )}

                        {/* Hint - Only show if NOT submitted */}
                        {!message && isFinalWordUnlocked && !isLocked && !isSubmitted && (
                            <div className="final-word-page-hint">
                                <h3>Hint</h3>
                                <p>{FINAL_WORD_CONFIG.hint}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FinalWord;
