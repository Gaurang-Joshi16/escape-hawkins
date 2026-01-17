import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import QuestionCard from '../components/QuestionCard';
import { level3Questions } from '../data/level3Questions';
import { submitLevelCompletion } from '../services/gameService';
import { getLevelConfig } from '../data/levelsConfig';
import '../styles/Level.css';

/**
 * Level 3 Component - Riddle Questions (Letter-by-Letter Input)
 * 
 * Gameplay:
 * - 3 riddle questions, one at a time
 * - Letter-by-letter input validation
 * - 60-second timer per question
 * - Unlock hint if ≥2 correct answers
 * - Persist to database
 * - Navigate back to dashboard
 * - Can only be attempted once
 */

const Level3 = () => {
    const navigate = useNavigate();
    const { teamId, isAuthenticated } = useAuth();
    const { recordLevelAttempt, getLevelStatus, loading: gameLoading } = useGame();

    // Auth protection
    useEffect(() => {
        if (!gameLoading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [gameLoading, isAuthenticated, navigate]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
        // Load saved progress from sessionStorage
        try {
            const saved = sessionStorage.getItem('level3_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                return progress.currentQuestionIndex || 0;
            }
        } catch (e) {
            console.error('Error loading Level 3 progress:', e);
        }
        return 0;
    });
    const [results, setResults] = useState(() => {
        try {
            const saved = sessionStorage.getItem('level3_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                return progress.results || [];
            }
        } catch (e) {
            console.error('Error loading Level 3 results:', e);
        }
        return [];
    });
    useEffect(() => {
        // FORCE reset when Level 3 is entered
        setCurrentQuestionIndex(0);
        setResults([]);
    }, []);

    const [isComplete, setIsComplete] = useState(false);
    const [showCompletionMessage, setShowCompletionMessage] = useState(false);
    const [hintUnlocked, setHintUnlocked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasCheckedAccess = useRef(false);

    // Check if level has already been attempted
    useEffect(() => {
        if (hasCheckedAccess.current) return;
        hasCheckedAccess.current = true;

        const status = getLevelStatus(3);

        if (status === 'cleared' || status === 'failed') {
            alert('You have already attempted this level.');
            navigate('/round1', { replace: true });
        }
    }, [getLevelStatus, navigate]);

    // Anti-cheat: Listen for force submit
    useEffect(() => {
        const handleForceSubmit = () => {
            console.log('[LEVEL 3] Anti-cheat force submit triggered');
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
        if (currentQuestionIndex < level3Questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;

            // Save progress to sessionStorage
            try {
                sessionStorage.setItem('level3_progress', JSON.stringify({
                    currentQuestionIndex: nextIndex,
                    results: newResults
                }));
            } catch (e) {
                console.error('Error saving Level 3 progress:', e);
            }

            // Wait 1.5 seconds before showing next question
            setTimeout(() => {
                setCurrentQuestionIndex(nextIndex);
            }, 1500);
        } else {
            // All questions completed - clear progress
            try {
                sessionStorage.removeItem('level3_progress');
            } catch (e) {
                console.error('Error clearing Level 3 progress:', e);
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
            const levelConfig = getLevelConfig(3);
            const threshold = levelConfig?.threshold || 2;

            // Determine if hint unlocked (cleared) - need ≥2 correct
            const cleared = correctCount >= threshold;
            setHintUnlocked(cleared);

            // Get letter to unlock
            const lettersUnlocked = cleared && levelConfig?.letterToUnlock
                ? [levelConfig.letterToUnlock]
                : [];

            // Submit to database
            const dbResult = await submitLevelCompletion(
                3, // level
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
            recordLevelAttempt(3, cleared, totalScore);

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
                                ? 'You unlocked the hint from Level 3!'
                                : 'You completed Level 3, but did not unlock the hint.'}
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
                        <h1 className="level-title">LEVEL 3: RIDDLES</h1>
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
    const currentQuestion = level3Questions[currentQuestionIndex];

    return (
        <div className="level-container">
            <div className="level-background"></div>

            <div className="level-content">
                {/* Level Header */}
                <div className="level-header">
                    <h1 className="level-title">LEVEL 3: RIDDLES</h1>
                    <p className="level-subtitle">Solve the riddles to complete this level</p>
                </div>

                {/* Question Card */}
                <QuestionCard
                    key={currentQuestion.id}
                    question={currentQuestion}
                    onComplete={handleQuestionComplete}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={level3Questions.length}
                />

                {/* Progress Indicator */}
                <div className="level-progress">
                    <div className="progress-dots">
                        {level3Questions.map((_, index) => (
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

export default Level3;
