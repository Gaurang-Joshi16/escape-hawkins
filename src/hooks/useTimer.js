import { useState, useEffect, useRef, useCallback } from 'react';
import {
    createTimerState,
    updateTimerState,
    completeTimer,
    formatTime
} from '../utils/timerValidation';

/**
 * useTimer Hook - UPDATED TO EXPOSE TIMER STATE
 * 
 * Key Changes:
 * - Exposes timerState for external time tracking
 * - Accepts initialTimeRemaining for timer persistence
 */
export const useTimer = (timeLimit, onTimeout, initialTimeRemaining = null) => {
    const effectiveTimeLimit = initialTimeRemaining !== null && initialTimeRemaining > 0 && initialTimeRemaining <= timeLimit
        ? initialTimeRemaining
        : timeLimit;

    const [timerState, setTimerState] = useState(null);
    const [displayTime, setDisplayTime] = useState(effectiveTimeLimit);
    const [isRunning, setIsRunning] = useState(false);
    const [hasExpired, setHasExpired] = useState(false);

    const intervalRef = useRef(null);
    const onTimeoutRef = useRef(onTimeout);

    // Keep callback ref updated
    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    // Initialize timer
    useEffect(() => {
        const initTimer = async () => {
            const state = await createTimerState(effectiveTimeLimit);
            setTimerState(state);
            setDisplayTime(effectiveTimeLimit);
        };

        initTimer();
    }, [effectiveTimeLimit]);

    // Start timer
    const start = useCallback(() => {
        if (!timerState || isRunning) return;

        setIsRunning(true);
        setHasExpired(false);

        intervalRef.current = setInterval(async () => {
            const currentTime = Date.now();
            const updated = updateTimerState(timerState, currentTime);

            setDisplayTime(updated.remainingTime);

            if (updated.remainingTime <= 0) {
                // Timer expired
                stop();
                setHasExpired(true);

                // Call timeout callback
                if (onTimeoutRef.current) {
                    const result = await completeTimer(timerState);
                    onTimeoutRef.current(result);
                }
            }
        }, 100); // Update every 100ms for smooth countdown
    }, [timerState, isRunning]);

    // Stop timer
    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRunning(false);
    }, []);

    // Reset timer
    const reset = useCallback(async () => {
        stop();
        const state = await createTimerState(timeLimit);
        setTimerState(state);
        setDisplayTime(timeLimit);
        setHasExpired(false);
    }, [timeLimit, stop]);

    // Get completion result
    const complete = useCallback(async () => {
        stop();
        if (!timerState) {
            return { valid: false, timeTaken: 0 };
        }
        return await completeTimer(timerState);
    }, [timerState, stop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        displayTime,
        formattedTime: formatTime(Math.ceil(displayTime)),
        isRunning,
        hasExpired,
        start,
        stop,
        reset,
        complete,
        progress: timeLimit > 0 ? (displayTime / timeLimit) * 100 : 0,
        timerState // Expose timer state for external tracking
    };
};

export default useTimer;
