import { createContext, useContext, useState, useEffect } from 'react';
import {
    loginWithCredentials,
    logout as logoutService,
    getCurrentTeam,
    isAuthenticated as checkAuthenticated
} from '../services/authService';
import { removeItem, STORAGE_KEYS } from '../utils/storage';

/**
 * Authentication Context
 * 
 * Single source of truth for authentication state
 * Resolves ONCE on mount, never remounts
 */

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const currentTeam = getCurrentTeam();
        if (currentTeam) {
            setTeam(currentTeam);
        }
        setLoading(false);
    }, []);

    const login = async (teamIdInput, passwordInput) => {
        setError(null);

        try {
            const result = await loginWithCredentials(teamIdInput, passwordInput);

            if (result.success && result.team) {
                setTeam(result.team);
                return { success: true };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMsg = err.message || 'Login failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const logout = () => {
        try {
            logoutService();
            setTeam(null);
            setError(null);
            removeItem(STORAGE_KEYS.GAME_STATE);
            removeItem(STORAGE_KEYS.CURRENT_LEVEL);
            return { success: true };
        } catch (err) {
            console.error('Logout error:', err);
            return { success: false, error: err.message };
        }
    };

    const value = {
        team,
        teamId: team?.team_id || null,
        teamName: team?.team_name || null,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!team
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
