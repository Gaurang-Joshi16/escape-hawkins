import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global Fullscreen Anti-Cheat System
 * 
 * FULLY AUTOMATIC - NO MANUAL CODE CHANGES REQUIRED
 * 
 * Automatically enforces fullscreen on level routes (/level1-5)
 * Tracks violations and dispatches events
 * 
 * ROLLBACK: Delete this file + remove import from App.jsx
 */

const FullscreenAntiCheat = () => {
    const location = useLocation();
    const violationCountRef = useRef(0);
    const isLevelRouteRef = useRef(false);
    const hasAutoSubmittedRef = useRef(false);

    useEffect(() => {
        const currentPath = location.pathname;
        const isLevelRoute = /^\/level[1-5]$/.test(currentPath);

        // Reset state when route changes
        if (!isLevelRoute && isLevelRouteRef.current) {
            // Leaving a level route
            violationCountRef.current = 0;
            hasAutoSubmittedRef.current = false;
            isLevelRouteRef.current = false;

            // Exit fullscreen
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            return;
        }

        if (!isLevelRoute) {
            isLevelRouteRef.current = false;
            return;
        }

        // Entering a level route
        isLevelRouteRef.current = true;
        violationCountRef.current = 0;
        hasAutoSubmittedRef.current = false;

        const requestFullscreen = async () => {
            if (!document.fullscreenElement) {
                try {
                    await document.documentElement.requestFullscreen();
                    console.log('[ANTI-CHEAT] Fullscreen activated');
                } catch (err) {
                    console.warn('[ANTI-CHEAT] Fullscreen request denied:', err);
                }
            }
        };

        const handleFullscreenChange = () => {
            // Only track violations if we're on a level route
            if (!isLevelRouteRef.current) return;

            // If fullscreen was exited
            if (!document.fullscreenElement) {
                // Ignore if already auto-submitted
                if (hasAutoSubmittedRef.current) return;

                violationCountRef.current += 1;
                const count = violationCountRef.current;

                console.log(`[ANTI-CHEAT] Violation ${count}/3`);

                // Dispatch violation event
                const violationEvent = new CustomEvent('ANTICHEAT_VIOLATION', {
                    detail: { count, maxViolations: 3 }
                });
                window.dispatchEvent(violationEvent);

                if (count >= 3) {
                    // Max violations reached
                    hasAutoSubmittedRef.current = true;
                    console.log('[ANTI-CHEAT] Max violations - triggering auto-submit');

                    // Dispatch force submit event
                    const forceSubmitEvent = new CustomEvent('ANTICHEAT_FORCE_SUBMIT');
                    window.dispatchEvent(forceSubmitEvent);
                } else {
                    // Re-request fullscreen
                    setTimeout(() => {
                        requestFullscreen();
                    }, 500);
                }
            }
        };

        // Initial fullscreen request
        requestFullscreen();

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Cleanup
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [location.pathname]);

    // This component doesn't render anything
    return null;
};

export default FullscreenAntiCheat;
