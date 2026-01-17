import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRound1Leaderboard } from '../services/leaderboardService';
import '../styles/Leaderboard.css';

/**
 * Round 1 Leaderboard Component
 * 
 * Displays top 7 teams who submitted the final word
 * Ranked by total score (sum of all 5 levels)
 */

const Leaderboard = () => {
    const navigate = useNavigate();
    const { teamId } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setIsLoading(true);
            const data = await getRound1Leaderboard();
            setLeaderboard(data);
            setIsLoading(false);
        };

        loadLeaderboard();
    }, []);

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-background"></div>

            <div className="leaderboard-content">
                <header className="leaderboard-header">
                    <h1 className="leaderboard-title">ROUND 1 LEADERBOARD</h1>
                    <p className="leaderboard-subtitle">Top 7 Teams</p>
                </header>

                {isLoading ? (
                    <div className="leaderboard-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading leaderboard...</p>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="leaderboard-empty">
                        <p>No teams have completed Round 1 yet.</p>
                    </div>
                ) : (
                    <div className="leaderboard-table-container">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Team Name</th>
                                    <th>Total Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((team) => (
                                    <tr
                                        key={team.team_id}
                                        className={team.team_id === teamId ? 'current-team' : ''}
                                    >
                                        <td className="rank-cell">
                                            <span className="rank-number">{team.rank}</span>
                                        </td>
                                        <td className="team-cell">{team.team_id}</td>
                                        <td className="score-cell">{team.total_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="leaderboard-actions">
                    <button
                        className="leaderboard-back-button"
                        onClick={() => navigate('/round1')}
                    >
                        BACK TO DASHBOARD
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
