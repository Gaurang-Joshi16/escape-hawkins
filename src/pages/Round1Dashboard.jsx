import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { getFinalWordStatus } from '../services/finalWordService';
import ScoreDisplay from '../components/ScoreDisplay';
import DecorativeLights from '../components/DecorativeLights';
import '../styles/Round1Dashboard.css';

/**
 * Round 1 Dashboard - UPDATED FOR NO PASS/FAIL
 * 
 * Key Changes:
 * - Removed "FAILED" status
 * - Hide final word everywhere
 * - Show letter boxes with progressive reveal
 * - Levels unlock on attempt (not clear)
 * - Check final word submission status
 */

const Round1Dashboard = () => {
    const hasLoadedRef = useRef(false);
    const { teamId, logout, isAuthenticated } = useAuth();
    const {
        levelsConfig,
        finalWordConfig,
        getLevelStatus,
        loadGameState,
        isFinalWordUnlocked,
        collectedLetters,
        clearedLevels,
        loading
    } = useGame();
    const navigate = useNavigate();

    const [finalWordSubmissionStatus, setFinalWordSubmissionStatus] = useState({
        isSubmitted: false,
        isCorrect: false,
        attemptsUsed: 0
    });

    // Auth protection - redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [loading, isAuthenticated, navigate]);

    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        requestAnimationFrame(() => {
            setTimeout(() => {
                loadGameState();
            }, 0);
        });
    }, []);

    // Load final word submission status
    useEffect(() => {
        const loadFinalWordStatus = async () => {
            if (!teamId) return;

            const status = await getFinalWordStatus(teamId);
            setFinalWordSubmissionStatus({
                isSubmitted: status.isSubmitted || false,
                isCorrect: status.isCorrect || false,
                attemptsUsed: status.attemptsUsed || 0
            });
        };

        loadFinalWordStatus();
    }, [teamId]);

    const handleLevelClick = (levelId) => {
        // CRITICAL: Prevent clicks before game state is loaded
        // Fixes race condition where locked levels can be accessed on refresh
        if (loading) {
            return;
        }

        const status = getLevelStatus(levelId);

        // Block if locked (previous level not attempted yet)
        if (status === 'locked') {
            return;
        }

        // Block if already attempted (cleared or failed)
        if (status === 'cleared' || status === 'failed') {
            alert('You have already attempted this level.');
            return;
        }

        // Levels 1, 2, 3, 4, and 5 are now available
        if (levelId === 1 || levelId === 2 || levelId === 3 || levelId === 4 || levelId === 5) {
            navigate(`/level${levelId}`);
            return;
        }

        // All levels available
        alert('Level not found.');
    };

    const handleFinalWordClick = () => {
        // Always allow navigation to final word page to view status
        navigate('/final-word');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'cleared':
                return '✓ HINT UNLOCKED';
            case 'failed':
                return '○ COMPLETED';
            case 'unlocked':
                return '▶ AVAILABLE';
            case 'locked':
                return '🔒 LOCKED';
            default:
                return '○ NOT ATTEMPTED';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'cleared':
                return 'status-cleared';
            case 'failed':
                return 'status-completed';
            case 'unlocked':
                return 'status-unlocked';
            case 'locked':
                return 'status-locked';
            default:
                return 'status-not-attempted';
        }
    };

    // Render letter boxes for final word using slot-based mapping
    const renderLetterBoxes = (showFullWord = false) => {
        const wordLetters = finalWordConfig.word.split('');

        // Build a map of which positions are unlocked based on cleared levels
        const unlockedPositions = new Set();

        // For each cleared level, mark its slot position as unlocked
        clearedLevels.forEach(levelId => {
            const levelConfig = levelsConfig.find(l => l.id === levelId);
            if (levelConfig && levelConfig.slotPosition !== undefined) {
                unlockedPositions.add(levelConfig.slotPosition);
            }
        });

        return (
            <div className="letter-boxes-container">
                {wordLetters.map((letter, index) => {
                    const isUnlocked = showFullWord || unlockedPositions.has(index);

                    return (
                        <div
                            key={index}
                            className={`letter-box ${isUnlocked ? 'unlocked' : 'locked'}`}
                        >
                            {isUnlocked ? letter : ''}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render final word card based on submission status
    const renderFinalWordCard = () => {
        const { isSubmitted, isCorrect, attemptsUsed } = finalWordSubmissionStatus;

        // STATE 3: Successfully submitted
        if (isSubmitted && isCorrect) {
            return (
                <div className="final-word-card unlocked submitted">
                    <div className="final-word-icon">✅</div>
                    {renderLetterBoxes(true)}
                    <h3 className="final-word-title">Final Word Submitted!</h3>
                    <p className="final-word-description">
                        You have successfully cleared all levels and submitted the final word.
                    </p>
                    <button className="final-word-button" onClick={handleFinalWordClick}>
                        VIEW SCORE
                    </button>
                </div>
            );
        }

        // STATE 2: Attempted but wrong
        if (isSubmitted && !isCorrect && attemptsUsed >= 2) {
            return (
                <div className="final-word-card locked submitted">
                    <div className="final-word-icon">❌</div>
                    {renderLetterBoxes(false)}
                    <h3 className="final-word-title">Final Word Locked</h3>
                    <p className="final-word-description">
                        Oops! You weren't able to guess the final word.
                    </p>
                    <button className="final-word-button" onClick={handleFinalWordClick}>
                        VIEW SCORE
                    </button>
                </div>
            );
        }

        // STATE 1: Not attempted or still has attempts
        return (
            <div
                className={`final-word-card ${isFinalWordUnlocked ? 'unlocked' : ''}`}
                onClick={handleFinalWordClick}
            >
                <div className="final-word-icon">
                    {isFinalWordUnlocked ? '🔓' : '🔒'}
                </div>

                {/* Letter Boxes */}
                {renderLetterBoxes(false)}

                <h3 className="final-word-title">Submit Your Answer</h3>
                <p className="final-word-description">
                    {isFinalWordUnlocked
                        ? 'All levels completed! Use the letters you\'ve collected to guess the final word and qualify for Round 2.'
                        : 'Complete all 5 levels to unlock the final word challenge.'}
                </p>
                {isFinalWordUnlocked && (
                    <button className="final-word-button">
                        SUBMIT FINAL WORD
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="dashboard-container atmospheric-container">
            <DecorativeLights />
            <div className="dashboard-background"></div>

            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">ROUND 1: ESCAPE HAWKINS</h1>
                    <div className="dashboard-team-id">Team: {teamId}</div>
                </div>
                <button onClick={handleLogout} className="dashboard-logout">
                    LOGOUT
                </button>
            </div>

            <div className="dashboard-score-section">
                <h2 className="dashboard-section-title">Your Progress</h2>
                <ScoreDisplay />
            </div>

            {/* View Leaderboard button - visible after Level 1 completion */}
            {(getLevelStatus(1) === 'cleared' || getLevelStatus(1) === 'failed') && (
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <button
                        className="dashboard-logout"
                        onClick={() => navigate('/leaderboard')}
                        style={{
                            background: 'linear-gradient(135deg, #ff0033, #cc0029)',
                            border: 'none'
                        }}
                    >
                        VIEW LEADERBOARD
                    </button>
                </div>
            )}

            <div>
                <h2 className="dashboard-section-title">Levels</h2>
                <div className="levels-grid">
                    {levelsConfig.map((level) => {
                        const status = getLevelStatus(level.id);
                        return (
                            <div
                                key={level.id}
                                className={`level-card ${getStatusClass(status)}`}
                                onClick={() => handleLevelClick(level.id)}
                            >
                                <div className="level-number">LEVEL {level.id}</div>
                                <h3 className="level-name">{level.name}</h3>
                                <p className="level-description">{level.description}</p>
                                <div className={`level-status-badge ${getStatusClass(status)}`}>
                                    {getStatusBadge(status)}
                                </div>
                                {status === 'locked' && level.unlockCondition && (
                                    <p className="level-unlock-condition">{level.unlockCondition}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="dashboard-final-word">
                <h2 className="dashboard-section-title">Final Challenge</h2>
                {renderFinalWordCard()}
            </div>

            <div className="dashboard-instructions">
                <h3>How to Play</h3>
                <ul>
                    <li>Complete each level by answering all questions</li>
                    <li>Levels unlock sequentially - you can attempt any unlocked level</li>
                    <li>Unlock hints by getting enough correct answers (threshold varies by level)</li>
                    <li>Collect letters from unlocked hints to solve the final word</li>
                    <li>Submit the correct final word to qualify for Round 2</li>
                </ul>
            </div>
        </div>
    );
};

export default Round1Dashboard;
