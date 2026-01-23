import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import QuestionCard from '../components/QuestionCard';
import { level2Questions } from '../data/level2Questions';
import { submitLevelCompletion } from '../services/gameService';
import { getLevelConfig } from '../data/levelsConfig';
import '../styles/Level.css';

/**
 * Level 2 Component - Debug Questions (Text Input)
 * 
 * Gameplay:
 * - 2 debug questions, one at a time
 * - Text input for code fixes
 * - 2-minute timer per question
 * - Unlock hint if BOTH correct (2/2)
 * - Persist to database
 * - Navigate back to dashboard
 * - Can only be attempted once
 */

const Level2 = () => {
    const navigate = useNavigate();
    const { teamId, isAuthenticated } = useAuth();
    const { recordLevelAttempt, getLevelStatus, loading: gameLoading } = useGame();

    // Auth protection
    useEffect(() => {
        if (!gameLoading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [gameLoading, isAuthenticated, navigate]);

    // Load saved progress from sessionStorage
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
        try {
            const saved = sessionStorage.getItem('level2_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                return progress.currentQuestionIndex || 0;
            }
        } catch (e) {
            console.error('Error loading Level 2 progress:', e);
        }
        return 0;
    });

    const [results, setResults] = useState(() => {
        try {
            const saved = sessionStorage.getItem('level2_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                return progress.results || [];
            }
        } catch (e) {
            console.error('Error loading Level 2 results:', e);
        }
        return [];
    });
    const [isComplete, setIsComplete] = useState(false);
    const [showCompletionMessage, setShowCompletionMessage] = useState(false);
    const [hintUnlocked, setHintUnlocked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasCheckedAccess = useRef(false);

    // Check if level has already been attempted
    useEffect(() => {
        if (hasCheckedAccess.current) return;
        hasCheckedAccess.current = true;

        const status = getLevelStatus(2);

        // If level is already completed, redirect
        if (status === 'cleared' || status === 'failed') {
            alert('You have already attempted this level.');
            navigate('/round1', { replace: true });
            return;
        }

        // If level is unlocked (not started), clear any stale client state
        if (status === 'unlocked') {
            try {
                sessionStorage.removeItem('level2_progress');
                // Also clear any QuestionCard timer state for Level 2
                sessionStorage.removeItem('timer_level2_q0');
                sessionStorage.removeItem('timer_level2_q1');
            } catch (e) {
                console.error('Error clearing Level 2 stale state:', e);
            }
        }
    }, [getLevelStatus, navigate]);

    // Anti-cheat: Listen for force submit
    useEffect(() => {
        const handleForceSubmit = () => {
            console.log('[LEVEL 2] Anti-cheat force submit triggered');
            if (!isComplete && results.length > 0) {
                setIsComplete(true);
                processLevelCompletion(results);
            }
        };

        window.addEventListener('ANTICHEAT_FORCE_SUBMIT', handleForceSubmit);
        return () => window.removeEventListener('ANTICHEAT_FORCE_SUBMIT', handleForceSubmit);
    }, [isComplete, results]);


    // Handle question completion
    const handleQuestionComplete = (result) => {
        // Store the result
        const newResults = [...results, result];
        setResults(newResults);

        // Move to next question or complete level
        if (currentQuestionIndex < level2Questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;

            // Save progress to sessionStorage
            try {
                sessionStorage.setItem('level2_progress', JSON.stringify({
                    currentQuestionIndex: nextIndex,
                    results: newResults
                }));
            } catch (e) {
                console.error('Error saving Level 2 progress:', e);
            }

            // Wait 1.5 seconds before showing next question
            setTimeout(() => {
                setCurrentQuestionIndex(nextIndex);
            }, 1500);
        } else {
            // All questions completed - clear progress
            try {
                sessionStorage.removeItem('level2_progress');
            } catch (e) {
                console.error('Error clearing Level 2 progress:', e);
            }

            setIsComplete(true);
            processLevelCompletion(newResults);
        }
    };

    // Process level completion
    const processLevelCompletion = async (finalResults) => {
        setIsSubmitting(true);

        try {
            // Calculate totals
            const correctCount = finalResults.filter(r => r.isCorrect).length;
            const totalScore = finalResults.reduce((sum, r) => sum + r.score, 0);
            const totalTime = finalResults.reduce((sum, r) => sum + r.timeTaken, 0);

            // Get level config
            const levelConfig = getLevelConfig(2);
            const threshold = levelConfig?.threshold || 2;

            // Determine if hint unlocked (cleared) - must get BOTH correct
            const cleared = correctCount >= threshold;
            setHintUnlocked(cleared);

            // Get letter to unlock
            const lettersUnlocked = cleared && levelConfig?.lettersToUnlock
                ? levelConfig.lettersToUnlock
                : [];

            // Submit to database
            const dbResult = await submitLevelCompletion(
                2, // level
                totalScore,
                totalTime,
                cleared,
                lettersUnlocked
            );

            if (!dbResult.success) {
                console.error('Failed to submit level completion:', dbResult.error);
                // Continue anyway - don't block user
            }

            // Update game context state
            recordLevelAttempt(2, cleared, totalScore);

            // Show completion message
            setShowCompletionMessage(true);

            // Navigate back to dashboard after 3 seconds
            setTimeout(() => {
                navigate('/round1', { replace: true });
            }, 3000);

        } catch (error) {
            console.error('Error processing level completion:', error);
            // Navigate back anyway
            setTimeout(() => {
                navigate('/round1', { replace: true });
            }, 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show completion screen
    if (showCompletionMessage) {
        return (
            <div className="level-container">
                <div className="level-background"></div>
                <div className="level-complete-screen">
                    <div className="level-complete-card">
                        <div className={`level-complete-icon ${hintUnlocked ? 'success' : 'info'}`}>
                            {hintUnlocked ? '🎉' : 'ℹ️'}
                        </div>
                        <h1 className="level-complete-title" style={{ color: hintUnlocked ? '#00ff88' : '#00aaff' }}>
                            {hintUnlocked ? 'CONGRATULATIONS!' : 'LEVEL COMPLETED'}
                        </h1>
                        <p className="level-complete-message">
                            {hintUnlocked
                                ? 'You unlocked the hint from Level 2!'
                                : 'You completed Level 2, but did not unlock the hint.'}
                        </p>
                        <div className="level-complete-info">
                            Returning to dashboard...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading state while submitting
    if (isComplete && isSubmitting) {
        return (
            <div className="level-container">
                <div className="level-background"></div>
                <div className="level-content">
                    <div className="level-header">
                        <h1 className="level-title">LEVEL 2: DEBUGGING</h1>
                    </div>
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#00ff88' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '1rem' }}>Processing results...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Get current question
    const currentQuestion = level2Questions[currentQuestionIndex];

    return (
        <div className="level-container">
            <div className="level-background"></div>

            <div className="level-content">
                {/* Level Header */}
                <div className="level-header">
                    <h1 className="level-title">LEVEL 2: DEBUGGING</h1>
                    <p className="level-subtitle">Fix the code bugs to complete this level</p>
                </div>

                {/* Question Card */}
                <QuestionCard
                    key={currentQuestionIndex}
                    question={currentQuestion}
                    onComplete={handleQuestionComplete}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={level2Questions.length}
                />

                {/* Progress Indicator */}
                <div className="level-progress">
                    <div className="progress-dots">
                        {level2Questions.map((_, index) => (
                            <div
                                key={index}
                                className={`progress-dot ${index < currentQuestionIndex ? 'completed' :
                                    index === currentQuestionIndex ? 'active' : 'pending'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Level2;
