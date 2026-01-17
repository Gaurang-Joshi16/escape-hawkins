import { supabase } from './supabaseClient';

/**
 * UPDATED: Authentication Service - Team ID + Password Validation
 * 
 * Changes from previous version:
 * - Replaced anonymous auth with teams table validation
 * - Added password verification
 * - Added is_active check
 * - No database writes - read-only authentication
 * - Session stored in sessionStorage
 */

/**
 * Authenticate a team using Team ID + Password
 * Validates against Supabase teams table
 * 
 * @param {string} teamId - The team's unique identifier
 * @param {string} password - The team's password
 * @returns {Promise<{success: boolean, team: object|null, error: string|null}>}
 */
export const loginWithCredentials = async (teamId, password) => {
    try {
        // Validate inputs
        if (!teamId || teamId.trim().length === 0) {
            return {
                success: false,
                team: null,
                error: 'Team ID is required'
            };
        }

        if (!password || password.trim().length === 0) {
            return {
                success: false,
                team: null,
                error: 'Password is required'
            };
        }

        // Query teams table for matching credentials
        const { data, error } = await supabase
            .from('teams')
            .select('team_id, team_name, is_active')
            .eq('team_id', teamId.trim())
            .eq('password', password.trim())
            .eq('is_active', true)
            .limit(1)
            .single();

        if (error) {
            // No match found or database error
            if (error.code === 'PGRST116') {
                // No rows returned - invalid credentials
                return {
                    success: false,
                    team: null,
                    error: 'Invalid Team ID or Password'
                };
            }

            console.error('Database error during login:', error);
            return {
                success: false,
                team: null,
                error: 'Authentication failed. Please try again.'
            };
        }

        if (!data) {
            return {
                success: false,
                team: null,
                error: 'Invalid Team ID or Password'
            };
        }

        // Check if team is active (redundant but safe)
        if (!data.is_active) {
            return {
                success: false,
                team: null,
                error: 'Team account is inactive. Contact administrator.'
            };
        }

        // Successful authentication
        const team = {
            team_id: data.team_id,
            team_name: data.team_name,
            login_timestamp: new Date().toISOString()
        };

        // Store in sessionStorage
        sessionStorage.setItem('authenticated_team', JSON.stringify(team));

        return {
            success: true,
            team: team,
            error: null
        };
    } catch (err) {
        console.error('Authentication error:', err);
        return {
            success: false,
            team: null,
            error: err.message || 'Authentication failed'
        };
    }
};

/**
 * Get the current authenticated team from sessionStorage
 * @returns {object|null} Team object or null if not authenticated
 */
export const getCurrentTeam = () => {
    try {
        const teamData = sessionStorage.getItem('authenticated_team');
        if (!teamData) {
            return null;
        }
        return JSON.parse(teamData);
    } catch (err) {
        console.error('Error retrieving team from session:', err);
        return null;
    }
};

/**
 * Get the team ID from the current session
 * @returns {string|null}
 */
export const getTeamId = () => {
    const team = getCurrentTeam();
    return team?.team_id || null;
};

/**
 * Get the team name from the current session
 * @returns {string|null}
 */
export const getTeamName = () => {
    const team = getCurrentTeam();
    return team?.team_name || null;
};

/**
 * Logout the current team
 * Clears sessionStorage
 */
export const logout = () => {
    try {
        sessionStorage.removeItem('authenticated_team');
        return { success: true, error: null };
    } catch (err) {
        console.error('Logout error:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return getCurrentTeam() !== null;
};

/**
 * Validate current session is still valid
 * Can be extended to check session expiry, etc.
 * @returns {boolean}
 */
export const validateSession = () => {
    const team = getCurrentTeam();
    if (!team) {
        return false;
    }

    // Optional: Add session expiry check
    // const loginTime = new Date(team.login_timestamp);
    // const now = new Date();
    // const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
    // if (hoursSinceLogin > 24) {
    //   logout();
    //   return false;
    // }

    return true;
};
