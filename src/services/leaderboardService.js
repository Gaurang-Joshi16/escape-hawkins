import { supabase } from './supabaseClient';

/**
 * Leaderboard Service
 * Fetches and ranks teams for Round 1 final leaderboard
 */

/**
 * Get Round 1 leaderboard - Top 7 teams who submitted final word
 * 
 * @returns {Promise<Array>} Array of top 7 teams with rank, team_id, and total_score
 */
export const getRound1Leaderboard = async () => {
    try {
        // Fetch only teams who CORRECTLY guessed and submitted the final word
        const { data: finalWordTeams, error: finalWordError } = await supabase
            .from('round1_final_word')
            .select('team_id, submitted_at')
            .eq('final_word_correct', true);

        if (finalWordError) {
            console.error('Error fetching final word submissions:', finalWordError);
            return [];
        }

        if (!finalWordTeams || finalWordTeams.length === 0) {
            return [];
        }

        // Get team IDs who submitted
        const submittedTeamIds = finalWordTeams.map(t => t.team_id);

        // Fetch scores for these teams
        const { data: scores, error: scoresError } = await supabase
            .from('round1_scores')
            .select('team_id, score')
            .in('team_id', submittedTeamIds);

        if (scoresError) {
            console.error('Error fetching scores:', scoresError);
            return [];
        }

        // Calculate total scores per team
        const teamScores = {};
        scores.forEach(row => {
            if (!teamScores[row.team_id]) {
                teamScores[row.team_id] = 0;
            }
            teamScores[row.team_id] += row.score || 0;
        });

        // Create leaderboard array
        const leaderboard = Object.entries(teamScores).map(([team_id, total_score]) => {
            const submission = finalWordTeams.find(t => t.team_id === team_id);
            return {
                team_id,
                total_score,
                submitted_at: submission?.submitted_at
            };
        });

        // Sort by total score (descending), then by submission time (ascending for tie-break)
        leaderboard.sort((a, b) => {
            if (b.total_score !== a.total_score) {
                return b.total_score - a.total_score;
            }
            // Tie-break: earlier submission wins
            return new Date(a.submitted_at) - new Date(b.submitted_at);
        });

        // Take top 7 and add rank
        const top7 = leaderboard.slice(0, 7).map((team, index) => ({
            rank: index + 1,
            team_id: team.team_id,
            total_score: team.total_score
        }));

        return top7;
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        return [];
    }
};
