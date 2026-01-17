import { getServerTimestamp } from '../services/supabaseClient';

/**
 * Timer Validation Utilities
 * 
 * Prevents client-side timer manipulation by validating against server time.
 * All time calculations should use server timestamps, not client time.
 */

/**
 * Get validated current time
 * Uses server timestamp to prevent client-side manipulation
 * Falls back to client time if server unavailable
 * 
 * @returns {Promise<number>} Current timestamp in milliseconds
 */
export const getValidatedTime = async () => {
    try {
        const serverTime = await getServerTimestamp();
        return serverTime;
    } catch (err) {
        console.warn('Using client time as fallback:', err);
        return Date.now();
    }
};

/**
 * Calculate time elapsed between two timestamps
 * 
 * @param {number} startTime - Start timestamp in milliseconds
 * @param {number} endTime - End timestamp in milliseconds
 * @returns {number} Elapsed time in seconds
 */
export const calculateElapsedTime = (startTime, endTime) => {
    const elapsed = endTime - startTime;
    return Math.floor(elapsed / 1000); // Convert to seconds
};

/**
 * Validate that a timer hasn't been manipulated
 * Checks if elapsed time is reasonable given the time limit
 * 
 * @param {number} startTime - When timer started (server timestamp)
 * @param {number} endTime - When timer ended (server timestamp)
 * @param {number} timeLimit - Expected time limit in seconds
 * @returns {boolean} True if timing is valid
 */
export const validateTiming = (startTime, endTime, timeLimit) => {
    const elapsed = calculateElapsedTime(startTime, endTime);

    // Allow 2 second buffer for network latency
    const buffer = 2;

    // Time should not be negative or exceed limit + buffer
    if (elapsed < 0 || elapsed > timeLimit + buffer) {
        console.warn('Suspicious timing detected:', {
            elapsed,
            timeLimit,
            startTime,
            endTime
        });
        return false;
    }

    return true;
};

/**
 * Format time for display (MM:SS)
 * 
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Create a timer state object
 * 
 * @param {number} timeLimit - Time limit in seconds
 * @param {number} serverStartTime - Server timestamp when timer started
 * @returns {object} Timer state
 */
export const createTimerState = async (timeLimit) => {
    const serverStartTime = await getValidatedTime();

    return {
        timeLimit,
        startTime: serverStartTime,
        endTime: null,
        isActive: true,
        remainingTime: timeLimit
    };
};

/**
 * Update timer state
 * 
 * @param {object} timerState - Current timer state
 * @param {number} currentServerTime - Current server timestamp
 * @returns {object} Updated timer state
 */
export const updateTimerState = (timerState, currentServerTime) => {
    if (!timerState.isActive) {
        return timerState;
    }

    const elapsed = calculateElapsedTime(timerState.startTime, currentServerTime);
    const remaining = Math.max(0, timerState.timeLimit - elapsed);

    return {
        ...timerState,
        remainingTime: remaining,
        isActive: remaining > 0
    };
};

/**
 * Complete timer and validate
 * 
 * @param {object} timerState - Current timer state
 * @returns {Promise<{valid: boolean, timeTaken: number}>}
 */
export const completeTimer = async (timerState) => {
    const endTime = await getValidatedTime();
    const timeTaken = calculateElapsedTime(timerState.startTime, endTime);
    const valid = validateTiming(timerState.startTime, endTime, timerState.timeLimit);

    return {
        valid,
        timeTaken,
        startTime: timerState.startTime,
        endTime
    };
};
