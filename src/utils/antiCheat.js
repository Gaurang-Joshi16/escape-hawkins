import { logViolation, VIOLATION_TYPES } from '../services/antiCheatService';

/**
 * Anti-Cheat Utilities
 * 
 * Client-side anti-cheat measures to detect and prevent cheating:
 * - Tab switching detection
 * - Page reload prevention
 * - Back navigation blocking
 * - Copy/paste prevention
 * 
 * All violations are logged to Supabase via antiCheatService
 */

/**
 * Setup tab visibility monitoring
 * Detects when user switches away from the tab
 * 
 * @param {Function} onViolation - Callback when violation occurs
 * @returns {Function} Cleanup function to remove listeners
 */
export const setupTabSwitchDetection = (onViolation) => {
    const handleVisibilityChange = () => {
        if (document.hidden) {
            // User switched away from tab
            logViolation(VIOLATION_TYPES.TAB_SWITCH, {
                timestamp: new Date().toISOString(),
                url: window.location.pathname
            });

            if (onViolation) {
                onViolation('TAB_SWITCH');
            }
        }
    };

    const handleBlur = () => {
        // Window lost focus
        logViolation(VIOLATION_TYPES.TAB_SWITCH, {
            timestamp: new Date().toISOString(),
            url: window.location.pathname,
            trigger: 'blur'
        });

        if (onViolation) {
            onViolation('TAB_SWITCH');
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    // Return cleanup function
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
    };
};

/**
 * Setup page reload detection
 * Warns user before they reload the page
 * 
 * @param {Function} onViolation - Callback when violation occurs
 * @returns {Function} Cleanup function to remove listeners
 */
export const setupReloadDetection = (onViolation) => {
    const handleBeforeUnload = (e) => {
        // Log the attempted reload
        logViolation(VIOLATION_TYPES.PAGE_RELOAD, {
            timestamp: new Date().toISOString(),
            url: window.location.pathname
        });

        if (onViolation) {
            onViolation('PAGE_RELOAD');
        }

        // Show browser warning
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your progress may be lost.';
        return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Return cleanup function
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
};

/**
 * Setup back navigation blocking
 * Prevents user from using browser back button
 * 
 * @param {Function} onViolation - Callback when violation occurs
 * @returns {Function} Cleanup function
 */
export const setupBackNavigationBlocking = (onViolation) => {
    // Push a dummy state to history
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e) => {
        // Log the attempted back navigation
        logViolation(VIOLATION_TYPES.BACK_NAVIGATION, {
            timestamp: new Date().toISOString(),
            url: window.location.pathname
        });

        if (onViolation) {
            onViolation('BACK_NAVIGATION');
        }

        // Push state again to prevent going back
        window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    // Return cleanup function
    return () => {
        window.removeEventListener('popstate', handlePopState);
    };
};

/**
 * Setup copy/paste prevention
 * Disables copy and paste operations
 * 
 * @param {Function} onViolation - Callback when violation occurs
 * @returns {Function} Cleanup function to remove listeners
 */
export const setupCopyPastePrevention = (onViolation) => {
    const handleCopy = (e) => {
        e.preventDefault();

        logViolation(VIOLATION_TYPES.COPY_PASTE, {
            timestamp: new Date().toISOString(),
            action: 'copy',
            url: window.location.pathname
        });

        if (onViolation) {
            onViolation('COPY_PASTE', 'copy');
        }

        return false;
    };

    const handlePaste = (e) => {
        e.preventDefault();

        logViolation(VIOLATION_TYPES.COPY_PASTE, {
            timestamp: new Date().toISOString(),
            action: 'paste',
            url: window.location.pathname
        });

        if (onViolation) {
            onViolation('COPY_PASTE', 'paste');
        }

        return false;
    };

    const handleCut = (e) => {
        e.preventDefault();

        logViolation(VIOLATION_TYPES.COPY_PASTE, {
            timestamp: new Date().toISOString(),
            action: 'cut',
            url: window.location.pathname
        });

        if (onViolation) {
            onViolation('COPY_PASTE', 'cut');
        }

        return false;
    };

    // Disable context menu (right-click)
    const handleContextMenu = (e) => {
        e.preventDefault();
        return false;
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);

    // Return cleanup function
    return () => {
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('paste', handlePaste);
        document.removeEventListener('cut', handleCut);
        document.removeEventListener('contextmenu', handleContextMenu);
    };
};

/**
 * Setup all anti-cheat measures at once
 * 
 * @param {Function} onViolation - Callback when any violation occurs
 * @returns {Function} Cleanup function to remove all listeners
 */
export const setupAntiCheat = (onViolation) => {
    const cleanupFunctions = [
        setupTabSwitchDetection(onViolation),
        setupReloadDetection(onViolation),
        setupBackNavigationBlocking(onViolation),
        setupCopyPastePrevention(onViolation)
    ];

    // Return combined cleanup function
    return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
    };
};

/**
 * Detect if developer tools are open
 * Note: This is not 100% reliable and can be bypassed
 * 
 * @returns {boolean}
 */
export const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
        logViolation(VIOLATION_TYPES.DEVTOOLS, {
            timestamp: new Date().toISOString(),
            outerWidth: window.outerWidth,
            innerWidth: window.innerWidth,
            outerHeight: window.outerHeight,
            innerHeight: window.innerHeight
        });
        return true;
    }

    return false;
};
