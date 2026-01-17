import { useEffect } from 'react';
import useTimer from '../hooks/useTimer';
import '../styles/Timer.css';

/**
 * Timer Component - UPDATED TO EXPOSE TIME TRACKING
 * 
 * Key Changes:
 * - Added onTick callback to expose current timer state
 * - Allows QuestionCard to track time taken for scoring
 * - Accepts initialTimeRemaining for timer persistence
 */

const Timer = ({ timeLimit, onTimeout, onTick, autoStart = true, initialTimeRemaining = null }) => {
    const {
        displayTime,
        formattedTime,
        isRunning,
        hasExpired,
        start,
        progress,
        timerState
    } = useTimer(timeLimit, onTimeout, initialTimeRemaining);

    useEffect(() => {
        if (autoStart) {
            start();
        }
    }, [autoStart, start]);

    // Call onTick callback with current timer state
    useEffect(() => {
        if (onTick && timerState && isRunning) {
            const timeTaken = timeLimit - displayTime;
            onTick({
                timeTaken: Math.max(0, timeTaken),
                timeRemaining: Math.max(0, displayTime)
            });
        }
    }, [displayTime, isRunning, onTick, timerState, timeLimit]);

    const isWarning = displayTime <= 10 && displayTime > 0;
    const isCritical = displayTime <= 5 && displayTime > 0;

    return (
        <div className={`timer-container ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''} ${hasExpired ? 'expired' : ''}`}>
            <div className="timer-circle">
                <svg className="timer-svg" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        className="timer-circle-bg"
                        cx="50"
                        cy="50"
                        r="45"
                    />

                    {/* Progress circle */}
                    <circle
                        className="timer-circle-progress"
                        cx="50"
                        cy="50"
                        r="45"
                        style={{
                            strokeDasharray: `${2 * Math.PI * 45}`,
                            strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`
                        }}
                    />
                </svg>

                <div className="timer-text">
                    <div className="timer-time">{formattedTime}</div>
                    <div className="timer-label">
                        {hasExpired ? 'TIME UP' : isRunning ? 'REMAINING' : 'READY'}
                    </div>
                </div>
            </div>

            {isWarning && !hasExpired && (
                <div className="timer-warning-text">
                    ⚠️ TIME RUNNING OUT
                </div>
            )}

            {hasExpired && (
                <div className="timer-expired-text">
                    ⏰ AUTO-SUBMITTING...
                </div>
            )}
        </div>
    );
};

export default Timer;
