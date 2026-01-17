import { useEffect } from 'react';
import '../styles/atmospheric.css';

/**
 * Interactive Grid Component
 * 
 * Features:
 * - Tracks mouse movement for red glow effect
 * - Tracks scroll for white brightness reveal
 * - Desktop only - disabled on mobile for performance
 */

const InteractiveGrid = () => {
    useEffect(() => {
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            return; // Skip on mobile
        }

        let scrollTimeout;
        const baseOpacity = 0.04;
        const scrollOpacity = 0.10;

        // Mouse movement handler for red glow
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;

            document.documentElement.style.setProperty('--mouse-x', `${x}%`);
            document.documentElement.style.setProperty('--mouse-y', `${y}%`);
        };

        // Scroll handler for white brightness reveal
        const handleScroll = () => {
            // Increase grid opacity while scrolling
            document.documentElement.style.setProperty('--grid-opacity', scrollOpacity);

            // Clear existing timeout
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }

            // Return to base opacity after scrolling stops
            scrollTimeout = setTimeout(() => {
                document.documentElement.style.setProperty('--grid-opacity', baseOpacity);
            }, 150);
        };

        // Initialize base opacity
        document.documentElement.style.setProperty('--grid-opacity', baseOpacity);

        // Add event listeners
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        };
    }, []);

    return <div className="grid-interactive-layer"></div>;
};

export default InteractiveGrid;
