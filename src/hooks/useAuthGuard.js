import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * useAuthGuard Hook
 * 
 * Protects routes from unauthenticated access
 * 
 * Lifecycle:
 * 1. If loading === true → DO NOTHING (wait for auth resolution)
 * 2. If loading === false AND not authenticated → Redirect to /login
 * 3. If authenticated → Allow render
 * 
 * This prevents flickering by waiting for auth state to resolve
 * before making any routing decisions.
 */

export const useAuthGuard = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Wait for auth to resolve
        if (loading) {
            return; // Do nothing while loading
        }

        // Auth resolved - check if authenticated
        if (!isAuthenticated) {
            // Not authenticated - redirect to login
            navigate('/login', { replace: true });
        }
        // If authenticated, do nothing (allow render)
    }, [isAuthenticated, loading, navigate]);

    return { isAuthenticated, loading };
};

export default useAuthGuard;
