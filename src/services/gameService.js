import { supabase } from './supabaseClient';
import { getTeamId } from './authService';

/**
 * Game Service
 * 
 * Handles all game-related database operations:
 * - Score tracking and submission
 * - Level completion status
 * - Letter unlocking
 * - Final word validation
 * - Round 2 qualification
 */

/**
 * Submit level completion data to Supabase
 * 
 * @param {number} level - Level number (1-5)
 * @param {number} score - Score achieved in this level
 * @param {number} timeTaken - Time taken in seconds
 * @param {boolean} cleared - Whether the level was cleared (min 3/5 correct)
 * @param {string[]} lettersUnlocked - Letters revealed for this level
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const submitLevelCompletion = async (level, score, timeTaken, cleared, lettersUnlocked = []) => {
    try {
        const teamId = getTeamId();

        if (!teamId) {
            return { success: false, error: 'No team ID found. Please login again.' };
        }

        const { data, error } = await supabase
            .from('round1_scores')
            .insert([
                {
                    team_id: teamId,
                    level: level,
                    score: score,
                    time_taken: timeTaken,
                    cleared: cleared,
                    letters_unlocked: lettersUnlocked,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('Error submitting level completion:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null, data };
    } catch (err) {
        console.error('Level submission error:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Get all level completion data for the current team
 * @returns {Promise<{success: boolean, data: array|null, error: string|null}>}
 */
export const getTeamProgress = async () => {
    try {
        const teamId = getTeamId();

        if (!teamId) {
            return { success: false, data: null, error: 'No team ID found' };
        }

        const { data, error } = await supabase
            .from('round1_scores')
            .select('*')
            .eq('team_id', teamId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching team progress:', error);
            return { success: false, data: null, error: error.message };
        }

        return { success: true, data, error: null };
    } catch (err) {
        console.error('Progress fetch error:', err);
        return { success: false, data: null, error: err.message };
    }
};

/**
 * Get all unlocked letters for the current team
 * @returns {Promise<string[]>}
 */
export const getUnlockedLetters = async () => {
    try {
        const { success, data } = await getTeamProgress();

        if (!success || !data) {
            return [];
        }

        // Collect all letters from cleared levels
        const letters = data
            .filter(record => record.cleared)
            .flatMap(record => record.letters_unlocked || []);

        return [...new Set(letters)]; // Remove duplicates
    } catch (err) {
        console.error('Error getting unlocked letters:', err);
        return [];
    }
};

/**
 * Calculate total score across all cleared levels
 * @returns {Promise<number>}
 */
export const getTotalScore = async () => {
    try {
        const { success, data } = await getTeamProgress();

        if (!success || !data) {
            return 0;
        }

        return data
            .filter(record => record.cleared)
            .reduce((total, record) => total + (record.score || 0), 0);
    } catch (err) {
        console.error('Error calculating total score:', err);
        return 0;
    }
};

/**
 * Check if a specific level has been cleared
 * @param {number} level - Level number to check
 * @returns {Promise<boolean>}
 */
export const isLevelCleared = async (level) => {
    try {
        const { success, data } = await getTeamProgress();

        if (!success || !data) {
            return false;
        }

        return data.some(record => record.level === level && record.cleared);
    } catch (err) {
        console.error('Error checking level status:', err);
        return false;
    }
};

/**
 * Check if all levels (1-5) have been cleared
 * @returns {Promise<boolean>}
 */
export const areAllLevelsCleared = async () => {
    try {
        const clearedLevels = await Promise.all([
            isLevelCleared(1),
            isLevelCleared(2),
            isLevelCleared(3),
            isLevelCleared(4),
            isLevelCleared(5)
        ]);

        return clearedLevels.every(cleared => cleared);
    } catch (err) {
        console.error('Error checking all levels:', err);
        return false;
    }
};

/**
 * Submit final word and qualify for Round 2
 * 
 * @param {string} finalWord - The final word submitted by the team
 * @param {string} correctWord - The correct final word
 * @returns {Promise<{success: boolean, qualified: boolean, error: string|null}>}
 */
export const submitFinalWord = async (finalWord, correctWord) => {
    try {
        const teamId = getTeamId();

        if (!teamId) {
            return { success: false, qualified: false, error: 'No team ID found' };
        }

        // Check if all levels are cleared
        const allCleared = await areAllLevelsCleared();
        if (!allCleared) {
            return {
                success: false,
                qualified: false,
                error: 'All levels must be cleared before submitting final word'
            };
        }

        // Validate final word (case-insensitive)
        const isCorrect = finalWord.trim().toLowerCase() === correctWord.toLowerCase();

        // Get total score
        const totalScore = await getTotalScore();

        // Insert qualification record
        const { data, error } = await supabase
            .from('round2_qualification')
            .insert([
                {
                    team_id: teamId,
                    final_word: finalWord.trim(),
                    total_score: totalScore,
                    qualified: isCorrect,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('Error submitting final word:', error);
            return { success: false, qualified: false, error: error.message };
        }

        return {
            success: true,
            qualified: isCorrect,
            error: null,
            data
        };
    } catch (err) {
        console.error('Final word submission error:', err);
        return { success: false, qualified: false, error: err.message };
    }
};

/**
 * PLACEHOLDER: Round 2 qualification logic
 * 
 * This function is a placeholder for future Round 2 implementation.
 * When Round 2 is ready, implement the following:
 * 1. Check if team has qualified (correct final word)
 * 2. Retrieve Round 2 configuration
 * 3. Initialize Round 2 state
 * 4. Return Round 2 access token or status
 */
export const checkRound2Qualification = async () => {
    try {
        const teamId = getTeamId();

        if (!teamId) {
            return { qualified: false, error: 'No team ID found' };
        }

        const { data, error } = await supabase
            .from('round2_qualification')
            .select('*')
            .eq('team_id', teamId)
            .eq('qualified', true)
            .single();

        if (error) {
            // No qualification record found
            return { qualified: false, error: null };
        }

        // TODO: Implement Round 2 initialization logic here
        return {
            qualified: true,
            error: null,
            totalScore: data.total_score,
            qualificationTime: data.created_at
        };
    } catch (err) {
        console.error('Round 2 qualification check error:', err);
        return { qualified: false, error: err.message };
    }
};
