import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { useEffect, useState } from 'react';

/**
 * ProtectedRoute Component
 * 
 * Declarative route protection
 * - Waits for auth to resolve
 * - Redirects if not authenticated
 * - Checks level access if required
 * - Blocks attempted levels (prevents back navigation)
 */

const ProtectedRoute = ({
    children,
    requiredLevel = null,
    requireAuth = true
}) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { isLevelAccessible, getLevelStatus, loading: gameLoading } = useGame();
    const [showAttemptedMessage, setShowAttemptedMessage] = useState(false);

    useEffect(() => {
        // Show message if trying to access attempted level
        if (requiredLevel !== null && !gameLoading) {
            const status = getLevelStatus(requiredLevel);
            if (status === 'cleared' || status === 'failed') {
                setShowAttemptedMessage(true);
                // Auto-hide message after showing
                const timer = setTimeout(() => {
                    setShowAttemptedMessage(false);
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [requiredLevel, getLevelStatus, gameLoading]);

    if (authLoading || gameLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredLevel !== null) {
        const status = getLevelStatus(requiredLevel);

        // Block attempted levels (cleared or failed)
        if (status === 'cleared' || status === 'failed') {
            if (showAttemptedMessage) {
                alert('You have already attempted this level.');
            }
            return <Navigate to="/round1" replace />;
        }

        // Block locked levels (previous level not attempted)
        if (!isLevelAccessible(requiredLevel)) {
            return <Navigate to="/round1" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;

