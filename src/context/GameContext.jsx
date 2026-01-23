import { useRef, useEffect } from 'react';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getTeamProgress, getTotalScore, getUnlockedLetters } from '../services/gameService';
import { LEVELS_CONFIG, FINAL_WORD_CONFIG } from '../data/levelsConfig';
import { useAuth } from './AuthContext';

const LEVELS_ARRAY = Object.values(LEVELS_CONFIG);

/**
 * Game Context - UPDATED FOR NEW STATE MODEL
 * 
 * Key Changes:
 * - Tracks attemptedLevels, clearedLevels, failedLevels separately
 * - Scores are hidden from UI (tracked internally only)
 * - Level access based on attempts, not clears
 * - Letters unlock only on clears
 */

const GameContext = createContext(null);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within GameProvider');
    }
    return context;
};

export const GameProvider = ({ children }) => {
    const { teamId } = useAuth();
    const [currentRound, setCurrentRound] = useState(1);
    const [currentLevel, setCurrentLevel] = useState(null);
    const hasLoadedRef = useRef(false);
    const lastTeamIdRef = useRef(null);

    // NEW STATE MODEL
    const [attemptedLevels, setAttemptedLevels] = useState([]); // Levels that have been attempted
    const [clearedLevels, setClearedLevels] = useState([]); // Levels that passed threshold
    const [failedLevels, setFailedLevels] = useState([]); // Levels that failed threshold

    // HIDDEN SCORES (never exposed to UI)
    const [hiddenScores, setHiddenScores] = useState({});

    const [collectedLetters, setCollectedLetters] = useState([]);
    const [isFinalWordUnlocked, setIsFinalWordUnlocked] = useState(false);
    const [loading, setLoading] = useState(false);

    /**
     * Reset all game state to initial values
     * Called when team changes (login/logout)
     */
    const resetGameState = useCallback(() => {
        setAttemptedLevels([]);
        setClearedLevels([]);
        setFailedLevels([]);
        setHiddenScores({});
        setCollectedLetters([]);
        setIsFinalWordUnlocked(false);
        setCurrentLevel(null);
        hasLoadedRef.current = false;
    }, []);

    // Watch for team changes and reset state
    useEffect(() => {
        // If team changed (login/logout), reset state
        if (lastTeamIdRef.current !== null && lastTeamIdRef.current !== teamId) {
            resetGameState();
        }
        lastTeamIdRef.current = teamId;

        // If team is logged in and state hasn't been loaded, load it
        if (teamId && !hasLoadedRef.current) {
            loadGameState();
        }
    }, [teamId, resetGameState]);

    const loadGameState = useCallback(async () => {
        // HARD GUARD — run ONCE only
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;
        try {
            setLoading(true);

            const [totalScore, letters] = await Promise.all([
                getTotalScore(),
                getUnlockedLetters()
            ]);

            const { data: progressData } = await getTeamProgress();

            if (progressData && progressData.length > 0) {
                const attempted = [];
                const cleared = [];
                const failed = [];
                const scores = {};

                progressData.forEach(record => {
                    attempted.push(record.level);
                    scores[record.level] = record.score || 0;

                    if (record.cleared) {
                        cleared.push(record.level);
                    } else {
                        failed.push(record.level);
                    }
                });

                setAttemptedLevels([...new Set(attempted)]);
                setClearedLevels([...new Set(cleared)]);
                setFailedLevels([...new Set(failed)]);
                setHiddenScores(scores);
            }

            setCollectedLetters(letters);

            // Final Word unlocks when ALL 5 levels are attempted (not necessarily cleared)
            const allLevelsAttempted = progressData && progressData.length >= 5;
            setIsFinalWordUnlocked(allLevelsAttempted);
        } catch (err) {
            console.error('Error loading game state:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const isLevelAccessible = useCallback((levelId) => {
        const levelConfig = LEVELS_ARRAY.find(l => l.id === levelId);
        if (!levelConfig) return false;

        // Level 1 is always accessible
        if (levelConfig.id === 1) return true;

        // Other levels accessible if previous level has been ATTEMPTED
        return attemptedLevels.includes(levelConfig.id - 1);
    }, [attemptedLevels]);

    const getLevelStatus = useCallback((levelId) => {
        if (clearedLevels.includes(levelId)) return 'cleared';
        if (failedLevels.includes(levelId)) return 'failed';
        if (attemptedLevels.includes(levelId)) return 'attempted';
        if (isLevelAccessible(levelId)) return 'unlocked';
        return 'locked';
    }, [attemptedLevels, clearedLevels, failedLevels, isLevelAccessible]);

    /**
     * Record level attempt
     * Called after level is completed (pass or fail)
     */
    const recordLevelAttempt = useCallback((levelId, passed, score) => {
        setAttemptedLevels(prev => [...new Set([...prev, levelId])]);
        setHiddenScores(prev => ({ ...prev, [levelId]: score }));

        if (passed) {
            setClearedLevels(prev => [...new Set([...prev, levelId])]);
            // Remove from failed if previously failed
            setFailedLevels(prev => prev.filter(id => id !== levelId));

            // Unlock letters for this level (now supports multiple letters)
            const levelConfig = LEVELS_ARRAY.find(l => l.id === levelId);
            if (levelConfig && levelConfig.lettersToUnlock) {
                setCollectedLetters(prev => [...new Set([...prev, ...levelConfig.lettersToUnlock])]);
            }
        } else {
            setFailedLevels(prev => [...new Set([...prev, levelId])]);
            // Remove from cleared if somehow was cleared before
            setClearedLevels(prev => prev.filter(id => id !== levelId));
        }

        // Check if all levels cleared
        const allCleared = [1, 2, 3, 4, 5].every(id =>
            clearedLevels.includes(id) || (id === levelId && passed)
        );
        setIsFinalWordUnlocked(allCleared);
    }, [clearedLevels]);

    const levelsConfigValue = useMemo(() =>
        Array.isArray(LEVELS_CONFIG) ? LEVELS_CONFIG : Object.values(LEVELS_CONFIG),
        []
    );

    const value = useMemo(() => ({
        currentRound,
        currentLevel,
        attemptedLevels,
        clearedLevels,
        failedLevels,
        collectedLetters,
        isFinalWordUnlocked,
        loading,
        setCurrentLevel,
        loadGameState,
        resetGameState,
        isLevelAccessible,
        getLevelStatus,
        recordLevelAttempt,
        levelsConfig: levelsConfigValue,
        finalWordConfig: FINAL_WORD_CONFIG
    }), [
        currentRound,
        currentLevel,
        attemptedLevels,
        clearedLevels,
        failedLevels,
        collectedLetters,
        isFinalWordUnlocked,
        loading,
        loadGameState,
        resetGameState,
        isLevelAccessible,
        getLevelStatus,
        recordLevelAttempt,
        levelsConfigValue
    ]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export default GameContext;
