/**
 * Secure Storage Utilities
 * 
 * Wrapper around localStorage with encryption and validation.
 * Used for session persistence and state recovery.
 */

const STORAGE_PREFIX = 'escape_hawkins_';

/**
 * Simple encryption for storage (base64 encoding)
 * For production, use proper encryption library
 * 
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data
 */
const encrypt = (data) => {
    try {
        return btoa(JSON.stringify(data));
    } catch (err) {
        console.error('Encryption error:', err);
        return data;
    }
};

/**
 * Simple decryption for storage (base64 decoding)
 * 
 * @param {string} data - Data to decrypt
 * @returns {any} Decrypted data
 */
const decrypt = (data) => {
    try {
        return JSON.parse(atob(data));
    } catch (err) {
        console.error('Decryption error:', err);
        return null;
    }
};

/**
 * Store data in localStorage
 * 
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export const setItem = (key, value) => {
    try {
        const encryptedValue = encrypt(value);
        localStorage.setItem(STORAGE_PREFIX + key, encryptedValue);
        return true;
    } catch (err) {
        console.error('Storage set error:', err);
        return false;
    }
};

/**
 * Retrieve data from localStorage
 * 
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Retrieved value or default
 */
export const getItem = (key, defaultValue = null) => {
    try {
        const encryptedValue = localStorage.getItem(STORAGE_PREFIX + key);
        if (encryptedValue === null) {
            return defaultValue;
        }
        return decrypt(encryptedValue);
    } catch (err) {
        console.error('Storage get error:', err);
        return defaultValue;
    }
};

/**
 * Remove data from localStorage
 * 
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeItem = (key) => {
    try {
        localStorage.removeItem(STORAGE_PREFIX + key);
        return true;
    } catch (err) {
        console.error('Storage remove error:', err);
        return false;
    }
};

/**
 * Clear all app data from localStorage
 * 
 * @returns {boolean} Success status
 */
export const clearAll = () => {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (err) {
        console.error('Storage clear error:', err);
        return false;
    }
};

/**
 * Check if storage is available
 * 
 * @returns {boolean} True if localStorage is available
 */
export const isStorageAvailable = () => {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (err) {
        return false;
    }
};

// Storage keys used in the app
export const STORAGE_KEYS = {
    TEAM_ID: 'team_id',
    CURRENT_LEVEL: 'current_level',
    GAME_STATE: 'game_state',
    UNLOCKED_LETTERS: 'unlocked_letters',
    AUDIO_ENABLED: 'audio_enabled'
};
