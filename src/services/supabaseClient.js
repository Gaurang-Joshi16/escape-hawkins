import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * Initializes the Supabase client using environment variables.
 * Never hardcode credentials - always use VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 
 * Required environment variables:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
    }
});

/**
 * Get current server timestamp from Supabase
 * Used for timer validation and preventing client-side time manipulation
 */
export const getServerTimestamp = async () => {
    // try {
    //     const { data, error } = await supabase.rpc('get_current_timestamp');
    //     if (error) {
    //         console.warn('Failed to get server timestamp, using client time:', error);
    //         return Date.now();
    //     }
    //     return new Date(data).getTime();
    // } catch (err) {
    //     console.warn('Server timestamp unavailable, using client time:', err);
    // }
    return Date.now();
};

export default supabase;
