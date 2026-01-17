import { useEffect, useState } from 'react';
import '../styles/LetterReveal.css';

/**
 * LetterReveal Component
 * 
 * Animated letter reveal on level completion
 * Features:
 * - Stranger Things neon aesthetic
 * - Glitch animation
 * - Letter accumulation display
 * 
 * @param {string[]} letters - Letters to reveal
 * @param {Function} onComplete - Callback when animation completes
 */

const LetterReveal = ({ letters, onComplete }) => {
    const [revealedLetters, setRevealedLetters] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < letters.length) {
            const timer = setTimeout(() => {
                setRevealedLetters(prev => [...prev, letters[currentIndex]]);
                setCurrentIndex(prev => prev + 1);
            }, 500);

            return () => clearTimeout(timer);
        } else if (currentIndex === letters.length && letters.length > 0) {
            // All letters revealed
            const completeTimer = setTimeout(() => {
                if (onComplete) {
                    onComplete();
                }
            }, 2000);

            return () => clearTimeout(completeTimer);
        }
    }, [currentIndex, letters, onComplete]);

    if (letters.length === 0) {
        return null;
    }

    return (
        <div className="letter-reveal-container">
            <div className="letter-reveal-overlay"></div>

            <div className="letter-reveal-content">
                <h2 className="letter-reveal-title">LETTERS UNLOCKED</h2>

                <div className="letter-reveal-letters">
                    {revealedLetters.map((letter, index) => (
                        <div
                            key={index}
                            className="letter-reveal-item"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="letter-glow">{letter}</div>
                            <div className="letter-text">{letter}</div>
                        </div>
                    ))}
                </div>

                <div className="letter-reveal-hint">
                    Collect all letters to unlock the final word
                </div>

                {currentIndex === letters.length && (
                    <div className="letter-reveal-progress">
                        {revealedLetters.length} letter{revealedLetters.length !== 1 ? 's' : ''} revealed
                    </div>
                )}
            </div>
        </div>
    );
};

export default LetterReveal;
