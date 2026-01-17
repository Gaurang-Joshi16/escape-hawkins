import { useState, useEffect } from 'react';
import '../styles/Loader.css';

/**
 * Loader Component
 * 
 * Fullscreen loader with "ENTERING HAWKINS" animation
 * Features:
 * - VHS glitch effects
 * - Stranger Things aesthetic
 * - Optional synth background audio
 * - Audio toggle control
 */

const Loader = ({ onComplete, duration = 3000 }) => {
    const [progress, setProgress] = useState(0);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [glitchText, setGlitchText] = useState('ENTERING HAWKINS');

    useEffect(() => {
        // Progress animation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    if (onComplete) {
                        setTimeout(onComplete, 500);
                    }
                    return 100;
                }
                return prev + (100 / (duration / 100));
            });
        }, 100);

        // Glitch effect
        const glitchInterval = setInterval(() => {
            const glitchChars = '!@#$%^&*()_+{}|:<>?';
            const original = 'ENTERING HAWKINS';

            if (Math.random() > 0.7) {
                const glitched = original.split('').map(char => {
                    return Math.random() > 0.8 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char;
                }).join('');
                setGlitchText(glitched);

                setTimeout(() => setGlitchText(original), 100);
            }
        }, 200);

        return () => {
            clearInterval(interval);
            clearInterval(glitchInterval);
        };
    }, [duration, onComplete]);

    const toggleAudio = () => {
        setAudioEnabled(!audioEnabled);
        // TODO: Implement audio playback when audio file is available
        // const audio = new Audio('/path/to/synth-audio.mp3');
        // if (!audioEnabled) {
        //   audio.play();
        // } else {
        //   audio.pause();
        // }
    };

    return (
        <div className="loader-container">
            <div className="loader-scanlines"></div>
            <div className="loader-vhs-effect"></div>

            <div className="loader-content">
                <div className="loader-logo">
                    <h1 className="loader-title glitch" data-text={glitchText}>
                        {glitchText}
                    </h1>
                    <div className="loader-subtitle">ESCAPE HAWKINS PROTOCOL</div>
                </div>

                <div className="loader-progress-container">
                    <div className="loader-progress-bar">
                        <div
                            className="loader-progress-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="loader-progress-text">{Math.floor(progress)}%</div>
                </div>

                <div className="loader-status">
                    <span className="loader-status-text">
                        {progress < 30 && '> INITIALIZING UPSIDE DOWN PROTOCOL...'}
                        {progress >= 30 && progress < 60 && '> ESTABLISHING SECURE CONNECTION...'}
                        {progress >= 60 && progress < 90 && '> LOADING HAWKINS DATA...'}
                        {progress >= 90 && '> READY TO ESCAPE...'}
                    </span>
                    <span className="loader-cursor">_</span>
                </div>
            </div>

            {/* Audio Toggle */}
            <button
                className="loader-audio-toggle"
                onClick={toggleAudio}
                aria-label="Toggle audio"
            >
                {audioEnabled ? '🔊' : '🔇'}
            </button>

            {/* VHS Timestamp */}
            <div className="loader-vhs-timestamp">
                REC ● {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
};

export default Loader;
