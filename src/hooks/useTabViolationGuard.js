import { useEffect, useRef, useState } from 'react';

/**
 * Tab Violation Guard Hook
 * 
 * FULLY REVERSIBLE: Deleting this file restores original behavior
 * 
 * Monitors tab switches and auto-submits after 3 violations
 * 
 * Usage:
 *   const showWarning = useTabViolationGuard(handleAutoSubmit);
 *   
 *   {showWarning && (
 *     <div className="tab-warning">
 *       {showWarning.message}
 *     </div>
 *   )}
 */

const useTabViolationGuard = (onAutoSubmit) => {
    const [warningState, setWarningState] = useState(null);
    const violationCountRef = useRef(0);
    const warningTimerRef = useRef(null);
    const hasAutoSubmittedRef = useRef(false);

    useEffect(() => {
        // Handler for visibility change and blur
        const handleViolation = () => {
            // Ignore if already auto-submitted
            if (hasAutoSubmittedRef.current) return;

            // Increment violation count
            violationCountRef.current += 1;
            const count = violationCountRef.current;

            console.log(`[TAB VIOLATION] Count: ${count}/3`);

            // Clear any existing warning timer
            if (warningTimerRef.current) {
                clearTimeout(warningTimerRef.current);
            }

            if (count >= 3) {
                // 3rd violation - auto-submit
                hasAutoSubmittedRef.current = true;

                setWarningState({
                    message: '⚠️ Maximum violations reached. Auto-submitting...',
                    type: 'critical'
                });

                // Call auto-submit callback
                if (onAutoSubmit && typeof onAutoSubmit === 'function') {
                    setTimeout(() => {
                        onAutoSubmit();
                    }, 1000);
                }

                // Remove listeners immediately
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('blur', handleBlur);
            } else {
                // Show warning with remaining attempts
                const remaining = 3 - count;
                setWarningState({
                    message: `⚠️ Tab switch detected! ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.`,
                    type: 'warning'
                });

                // Auto-dismiss warning after 4 seconds
                warningTimerRef.current = setTimeout(() => {
                    setWarningState(null);
                }, 4000);
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleViolation();
            }
        };

        const handleBlur = () => {
            handleViolation();
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        // Cleanup on unmount
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);

            if (warningTimerRef.current) {
                clearTimeout(warningTimerRef.current);
            }
        };
    }, [onAutoSubmit]);

    return warningState;
};

export default useTabViolationGuard;
