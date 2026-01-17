/**
 * Levels Configuration - UPDATED FOR NEW STATE MODEL
 * 
 * Key Changes:
 * - Removed isLocked (now using level states)
 * - Added type field for each level
 * - Added threshold field for clearing
 * - Levels unlock sequentially but failing doesn't block progression
 * 
 * Level States: NOT_ATTEMPTED, ATTEMPTED_FAILED, ATTEMPTED_CLEARED
 */

export const LEVELS_CONFIG = {
    1: {
        id: 1,
        name: 'Level 1: MCQs',
        description: 'Multiple choice questions',
        type: 'MCQ',
        letterToUnlock: 'E', // Exactly one letter
        slotPosition: 0, // Position in final word (ELEVEN)
        threshold: 3, // Min correct to clear
        totalQuestions: 5,
        unlockCondition: null // Always accessible
    },
    2: {
        id: 2,
        name: 'Level 2: Debugging',
        description: 'Fix the code bugs',
        type: 'TEXT_INPUT',
        letterToUnlock: 'L', // Exactly one letter
        slotPosition: 1, // Position in final word
        threshold: 2, // Both must be correct
        totalQuestions: 2,
        unlockCondition: 'Complete Level 1' // Can attempt after L1 (pass or fail)
    },
    3: {
        id: 3,
        name: 'Level 3: Riddle',
        description: 'Solve the riddle character by character',
        type: 'CHARACTER_LOCK',
        letterToUnlock: 'E', // Exactly one letter (second E)
        slotPosition: 2, // Position in final word
        threshold: 2, // Need ≥2 correct for hint unlock
        totalQuestions: 3,
        unlockCondition: 'Complete Level 2'
    },
    4: {
        id: 4,
        name: 'Level 4: Scenarios',
        description: 'Scenario-based questions',
        type: 'SCENARIO_MCQ',
        letterToUnlock: 'V', // Exactly one letter
        slotPosition: 3, // Position in final word
        threshold: 3, // 3 out of 4 questions
        totalQuestions: 4,
        unlockCondition: 'Complete Level 3'
    },
    5: {
        id: 5,
        name: 'Level 5: Cipher',
        description: 'Decode the encrypted message',
        type: 'CIPHER_MCQ',
        letterToUnlock: 'N', // Exactly one letter
        slotPosition: 5, // Position in final word
        threshold: 1, // Must get cipher correct
        totalQuestions: 1,
        unlockCondition: 'Complete Level 4'
    }
};

/**
 * Final Word Configuration
 * Letters revealed progressively as levels are CLEARED (not just attempted)
 */
export const FINAL_WORD_CONFIG = {
    word: 'ELEVEN',
    hint: 'The one with powers',
    description: 'Use the letters you\'ve unlocked to form the final word'
};

/**
 * Get level configuration by ID
 */
export const getLevelConfig = (levelId) => {
    return LEVELS_CONFIG[levelId] || null;
};

/**
 * Check if a level is accessible (can be attempted)
 * NEW LOGIC: Level is accessible if previous level has been ATTEMPTED (not necessarily cleared)
 */
export const isLevelAccessible = (levelId, attemptedLevels = []) => {
    const config = getLevelConfig(levelId);
    if (!config) return false;

    // Level 1 is always accessible
    if (levelId === 1) return true;

    // Other levels require previous level to be ATTEMPTED (not cleared)
    const previousLevel = levelId - 1;
    return attemptedLevels.includes(previousLevel);
};

/**
 * Get all letters that should be unlocked based on CLEARED levels only
 * CRITICAL: Letters unlock only when level is CLEARED, not just attempted
 */
export const getUnlockedLettersFromLevels = (clearedLevels = []) => {
    const letters = [];

    clearedLevels.forEach(levelId => {
        const config = getLevelConfig(levelId);
        if (config && config.lettersToUnlock) {
            letters.push(...config.lettersToUnlock);
        }
    });

    return [...new Set(letters)]; // Remove duplicates
};

/**
 * Check if all levels are cleared
 */
export const areAllLevelsCleared = (clearedLevels = []) => {
    return [1, 2, 3, 4, 5].every(levelId => clearedLevels.includes(levelId));
};

/**
 * Get next level to attempt
 */
export const getNextLevel = (attemptedLevels = []) => {
    for (let i = 1; i <= 5; i++) {
        if (!attemptedLevels.includes(i)) {
            return i;
        }
    }
    return null; // All levels attempted
};

/**
 * Get level status for display
 * @param {number} levelId
 * @param {number[]} attemptedLevels - Levels that have been attempted
 * @param {number[]} clearedLevels - Levels that have been cleared
 * @param {number[]} failedLevels - Levels that have been failed
 * @returns {string} 'not_attempted' | 'cleared' | 'failed' | 'locked'
 */
export const getLevelStatus = (levelId, attemptedLevels = [], clearedLevels = [], failedLevels = []) => {
    if (clearedLevels.includes(levelId)) return 'cleared';
    if (failedLevels.includes(levelId)) return 'failed';
    if (attemptedLevels.includes(levelId)) return 'attempted';
    if (isLevelAccessible(levelId, attemptedLevels)) return 'unlocked';
    return 'locked';
};

export default LEVELS_CONFIG;
