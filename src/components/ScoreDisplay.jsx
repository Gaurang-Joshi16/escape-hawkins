import { useGame } from '../context/GameContext';
import '../styles/Round1Dashboard.css';

/**
 * Score Display Component - UPDATED FOR HIDDEN SCORING
 * 
 * Changes:
 * - Removed total score display
 * - Removed correct count display
 * - Shows only: levels attempted, levels cleared, letters collected
 * - Progress bar based on cleared levels
 */

const ScoreDisplay = () => {
    const {
        attemptedLevels = [],
        clearedLevels = [],
        collectedLetters = [],
        levelsConfig = []
    } = useGame();

    const totalLevels = levelsConfig.length || 5;
    const progressPercentage = totalLevels > 0 ? (clearedLevels.length / totalLevels) * 100 : 0;

    return (
        <div className="score-display">
            <div className="score-display-grid">
                <div className="score-item">
                    <div className="score-label">Levels Attempted</div>
                    <div className="score-value">{attemptedLevels.length}/{totalLevels}</div>
                </div>

                <div className="score-item">
                    <div className="score-label">Levels Cleared</div>
                    <div className="score-value">{clearedLevels.length}/{totalLevels}</div>
                </div>

                <div className="score-item">
                    <div className="score-label">Letters Collected</div>
                    <div className="score-value">{collectedLetters.length}</div>
                </div>
            </div>

            <div className="score-progress-bar">
                <div
                    className="score-progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ScoreDisplay;
