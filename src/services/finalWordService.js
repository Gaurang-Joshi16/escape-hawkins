import { supabase } from './supabaseClient';

/**
 * Final Word Service
 * Handles final word submission and status for Round 1
 */

/**
 * Submit final word attempt
 * Uses UPSERT to handle both insert and update
 * 
 * @param {string} teamId - Team ID from AuthContext
 * @param {string} submittedWord - The word submitted by the team
 * @param {boolean} isCorrect - Whether the word is correct
 * @param {number} attemptsUsed - Number of attempts used (1 or 2)
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const submitFinalWord = async (teamId, submittedWord, isCorrect, attemptsUsed) => {
    try {
        if (!teamId) {
            return { success: false, error: 'No team ID found. Please login again.' };
        }

        // Use upsert to handle both insert and update
        const { data, error } = await supabase
            .from('round1_final_word')
            .upsert(
                {
                    team_id: teamId,
                    final_word_submitted: true,
                    final_word_correct: isCorrect,
                    attempts_used: attemptsUsed,
                    submitted_at: new Date().toISOString()
                },
                {
                    onConflict: 'team_id'
                }
            )
            .select();

        if (error) {
            console.error('Error submitting final word:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null, data };
    } catch (err) {
        console.error('Final word submission error:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Get final word status for a team
 * 
 * @param {string} teamId - Team ID from AuthContext
 * @returns {Promise<{attemptsUsed: number, isCorrect: boolean, isLocked: boolean, isSubmitted: boolean}>}
 */
export const getFinalWordStatus = async (teamId) => {
    try {
        if (!teamId) {
            return { attemptsUsed: 0, isCorrect: false, isLocked: false, isSubmitted: false };
        }

        const { data, error } = await supabase
            .from('round1_final_word')
            .select('*')
            .eq('team_id', teamId)
            .single();

        if (error) {
            // No record found - return defaults
            if (error.code === 'PGRST116') {
                return { attemptsUsed: 0, isCorrect: false, isLocked: false, isSubmitted: false };
            }
            console.error('Error fetching final word status:', error);
            return { attemptsUsed: 0, isCorrect: false, isLocked: false, isSubmitted: false };
        }

        if (!data) {
            return { attemptsUsed: 0, isCorrect: false, isLocked: false, isSubmitted: false };
        }

        const isSubmitted = data.final_word_submitted || false;

        // Check if correct
        if (data.final_word_correct) {
            return {
                attemptsUsed: data.attempts_used || 0,
                isCorrect: true,
                isLocked: true,
                isSubmitted: true
            };
        }

        // Check if 2 attempts used
        if (data.attempts_used >= 2) {
            return {
                attemptsUsed: 2,
                isCorrect: false,
                isLocked: true,
                isSubmitted
            };
        }

        return {
            attemptsUsed: data.attempts_used || 0,
            isCorrect: false,
            isLocked: false,
            isSubmitted
        };
    } catch (err) {
        console.error('Error fetching final word status:', err);
        return { attemptsUsed: 0, isCorrect: false, isLocked: false, isSubmitted: false };
    }
};

/**
 * Get total score from round1_scores table
 * 
 * @param {string} teamId - Team ID from AuthContext
 * @returns {Promise<number>}
 */
export const getTotalScore = async (teamId) => {
    try {
        if (!teamId) {
            return 0;
        }

        const { data, error } = await supabase
            .from('round1_scores')
            .select('score')
            .eq('team_id', teamId);

        if (error) {
            console.error('Error fetching total score:', error);
            return 0;
        }

        if (!data || data.length === 0) {
            return 0;
        }

        // Sum all scores
        const totalScore = data.reduce((sum, row) => sum + (row.score || 0), 0);
        return totalScore;
    } catch (err) {
        console.error('Error calculating total score:', err);
        return 0;
    }
};
