import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

/**
 * Login Page
 * 
 * - No auto-redirect based on auth state
 * - Redirects immediately after successful login
 * - Shows loading screen while auth resolves
 */

const Login = () => {
    const [teamId, setTeamId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/round1', { replace: true });
        }
    }, [loading, isAuthenticated, navigate]);

    // Block back button from Login page - redirect to Home
    useEffect(() => {
        const handlePopState = () => {
            if (!isAuthenticated) {
                // Prevent going back to protected pages after logout
                navigate('/', { replace: true });
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isAuthenticated, navigate]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!teamId.trim()) {
            setError('Please enter your Team ID');
            return;
        }

        if (!password.trim()) {
            setError('Please enter your Password');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(teamId.trim(), password.trim());

            if (result.success) {
                navigate('/round1', { replace: true });
            } else {
                setError(result.error || 'Authentication failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-background"></div>
            <div className="login-scanlines"></div>

            <div className="login-content">
                <div className="login-card">
                    <div className="login-header">
                        <h1 className="login-title glitch" data-text="ESCAPE HAWKINS">
                            ESCAPE HAWKINS
                        </h1>
                        <div className="login-subtitle">ROUND 1: THE BEGINNING</div>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-field">
                            <label htmlFor="teamId" className="login-label">
                                TEAM ID
                            </label>
                            <input
                                type="text"
                                id="teamId"
                                className="login-input"
                                value={teamId}
                                onChange={(e) => setTeamId(e.target.value)}
                                placeholder="Enter your Team ID..."
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password" className="login-label">
                                PASSWORD
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your Password..."
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="login-error">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading || !teamId.trim() || !password.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner-small"></span>
                                    AUTHENTICATING...
                                </>
                            ) : (
                                'ENTER HAWKINS'
                            )}
                        </button>
                    </form>

                    <div className="login-info">
                        <div className="login-info-item">
                            <span className="info-icon">🔒</span>
                            <span>Secure credential-based authentication</span>
                        </div>
                        <div className="login-info-item">
                            <span className="info-icon">⏱️</span>
                            <span>Time-bound competitive gameplay</span>
                        </div>
                        <div className="login-info-item">
                            <span className="info-icon">🎯</span>
                            <span>5 levels, multiple challenges</span>
                        </div>
                    </div>
                </div>

                <div className="login-vhs-timestamp">
                    REC ● {new Date().toLocaleString()}
                </div>
            </div>
        </div>
    );
};

export default Login;
