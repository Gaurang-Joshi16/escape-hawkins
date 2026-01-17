/**
 * Anti-Cheat Service - DISABLED (NO-OP)
 * 
 * All functions are NO-OPs for Round 1 stabilization
 * No Supabase writes, no retries, no console output
 */

export const VIOLATION_TYPES = {
    TAB_SWITCH: 'TAB_SWITCH',
    PAGE_RELOAD: 'PAGE_RELOAD',
    BACK_NAVIGATION: 'BACK_NAVIGATION',
    COPY_PASTE: 'COPY_PASTE',
    DEVTOOLS: 'DEVTOOLS',
    SUSPICIOUS_TIMING: 'SUSPICIOUS_TIMING'
};

export const logViolation = async () => {
    return { success: true, error: null };
};

export const getTeamViolations = async () => {
    return { success: true, data: [], error: null };
};

export const getViolationCounts = async () => {
    return {};
};
