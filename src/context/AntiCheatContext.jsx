import { createContext, useContext } from 'react';

/**
 * Anti-Cheat Context - DISABLED (NO-OP)
 * 
 * All functions are NO-OPs for Round 1 stabilization
 * No side effects, no state, no listeners, no network calls
 */

const AntiCheatContext = createContext(null);

export const useAntiCheat = () => {
    const context = useContext(AntiCheatContext);
    if (!context) {
        throw new Error('useAntiCheat must be used within AntiCheatProvider');
    }
    return context;
};

export const AntiCheatProvider = ({ children }) => {
    const value = {
        violations: [],
        isActive: false,
        warningMessage: null,
        activate: () => { },
        deactivate: () => { },
        clearViolations: () => { },
        getViolationCount: () => 0,
        getViolationsByType: () => ({})
    };

    return (
        <AntiCheatContext.Provider value={value}>
            {children}
        </AntiCheatContext.Provider>
    );
};

export default AntiCheatContext;
