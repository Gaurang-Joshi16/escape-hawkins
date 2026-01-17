import { useEffect, useRef } from 'react';

/**
 * Fullscreen Guard Hook
 * 
 * FULLY REVERSIBLE: Deleting this file restores original behavior
 * 
 * Forces fullscreen mode and monitors exits as violations
 * Auto-submits after max violations reached
 * 
 * Usage:
 *   useFullscreenGuard({
 *     enabled: true,
 *     maxViolations: 3,
 *     onViolation: (count) => console.log(`Violation ${count}`),
 *     onMaxViolation: () => handleAutoSubmit()
 *   });
 */

export default function useFullscreenGuard({
    enabled = false,
    maxViolations = 3,
    onViolation,
    onMaxViolation
}) {
    const violationCount = useRef(0);
    const hasMaxedOutRef = useRef(false);

    useEffect(() => {
        if (!enabled) return;

        const requestFullscreen = async () => {
            if (!document.fullscreenElement) {
                try {
                    await document.documentElement.requestFullscreen();
                    console.log('[FULLSCREEN GUARD] Fullscreen requested');
                } catch (err) {
                    console.warn('[FULLSCREEN GUARD] Fullscreen request denied:', err);
                }
            }
        };

        const handleFullscreenChange = () => {
            // If fullscreen was exited
            if (!document.fullscreenElement) {
                // Ignore if already maxed out
                if (hasMaxedOutRef.current) return;

                violationCount.current += 1;
                const count = violationCount.current;

                console.log(`[FULLSCREEN GUARD] Violation ${count}/${maxViolations}`);

                // Call violation callback
                if (onViolation && typeof onViolation === 'function') {
                    onViolation(count);
                }

                if (count >= maxViolations) {
                    // Max violations reached
                    hasMaxedOutRef.current = true;
                    console.log('[FULLSCREEN GUARD] Max violations reached - auto-submitting');

                    // Call max violation callback
                    if (onMaxViolation && typeof onMaxViolation === 'function') {
                        onMaxViolation();
                    }
                } else {
                    // Re-request fullscreen
                    requestFullscreen();
                }
            }
        };

        // Initial fullscreen request
        requestFullscreen();

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Cleanup on unmount
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);

            // Exit fullscreen if still active
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }, [enabled, maxViolations, onViolation, onMaxViolation]);
}
