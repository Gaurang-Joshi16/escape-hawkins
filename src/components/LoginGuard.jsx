import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LoginGuard Component
 * 
 * Prevents authenticated users from accessing the login page
 * - If user is authenticated, redirect to /round1
 * - If user is not authenticated, allow access to login
 * - Uses replace: true to prevent back navigation
 */

const LoginGuard = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/round1" replace />;
    }

    // Allow access to login page
    return children;
};

export default LoginGuard;
