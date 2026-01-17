import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import QuestionCard from '../components/QuestionCard';
import { level4Questions, level4Scenario } from '../data/level4Questions';
import { submitLevelCompletion } from '../services/gameService';
import { getLevelConfig } from '../data/levelsConfig';
import '../styles/Level.css';

/**
 * Level 4 Component - Scenario MCQs
 * 
 * Gameplay:
 * - 4 MCQ questions, one at a time
 * - Track score and time internally
 * - Unlock hint if ≥3 correct answers
 * - Persist to database
 * - Navigate back to dashboard
 * - Can only be attempted once
 */

const Level4 = () => {
    const navigate = useNavigate();
    const { teamId } = useAuth();
    const { recordLevelAttempt, getLevelStatus } = useGame();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
        // Load saved progress from sessionStorage
        try {
            const saved = sessionStorage.getItem('level4_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                return progress.currentQuestionIndex || 0;
            }
        } catch (e) {
            console.error('Error loading Level 4 progress:', e);
        }
        return 0;
    });
    const [results, setResults] = useState(() => {
        try {
            const saved = sessionStorage.getItem('level4_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                return progress.results || [];
            }
        } catch (e) {
            console.error('Error loading Level 4 results:', e);
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

        const status = getLevelStatus(4);

        if (status === 'cleared' || status === 'failed') {
            alert('You have already attempted this level.');
            navigate('/round1', { replace: true });
        }
    }, [getLevelStatus, navigate]);

    // Anti-cheat: Listen for force submit
    useEffect(() => {
        const handleForceSubmit = () => {
            console.log('[LEVEL 4] Anti-cheat force submit triggered');
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
        if (currentQuestionIndex < level4Questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;

            // Save progress to sessionStorage
            try {
                sessionStorage.setItem('level4_progress', JSON.stringify({
                    currentQuestionIndex: nextIndex,
                    results: newResults
                }));
            } catch (e) {
                console.error('Error saving Level 4 progress:', e);
            }

            // Wait 1.5 seconds before showing next question
            setTimeout(() => {
                setCurrentQuestionIndex(nextIndex);
            }, 1500);
        } else {
            // All questions completed - clear progress
            try {
                sessionStorage.removeItem('level4_progress');
            } catch (e) {
                console.error('Error clearing Level 4 progress:', e);
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
            const levelConfig = getLevelConfig(4);
            const threshold = levelConfig?.threshold || 3;

            // Determine if hint unlocked (cleared)
            const cleared = correctCount >= threshold;
            setHintUnlocked(cleared);

            // Get letter to unlock
            const lettersUnlocked = cleared && levelConfig?.letterToUnlock
                ? [levelConfig.letterToUnlock]
                : [];

            // Submit to database
            const dbResult = await submitLevelCompletion(
                4, // level
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
            recordLevelAttempt(4, cleared, totalScore);

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
                                ? 'You unlocked a hint!'
                                : 'You could not unlock the hint, but you may continue.'}
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
                        <h1 className="level-title">LEVEL 4: SCENARIOS</h1>
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
    const currentQuestion = level4Questions[currentQuestionIndex];

    return (
        <div className="level-container">
            <div className="level-background"></div>

            <div className="level-content">
                {/* Level Header */}
                <div className="level-header">
                    <h1 className="level-title">LEVEL 4: SCENARIOS</h1>
                    <p className="level-subtitle">Answer all questions to complete this level</p>
                </div>

                {/* Scenario Box */}
                <div className="question-card" style={{ marginBottom: '1.5rem' }}>
                    <div className="question-header">
                        <h2 className="question-title">{level4Scenario.title}</h2>
                    </div>
                    <p className="question-prompt" style={{ whiteSpace: 'pre-line' }}>
                        {level4Scenario.description}
                    </p>
                </div>

                {/* Question Card */}
                <QuestionCard
                    key={currentQuestion.id}
                    question={currentQuestion}
                    onComplete={handleQuestionComplete}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={level4Questions.length}
                />

                {/* Progress Indicator */}
                <div className="level-progress">
                    <div className="progress-dots">
                        {level4Questions.map((_, index) => (
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

export default Level4;
