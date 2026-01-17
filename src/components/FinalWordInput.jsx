import { useState } from 'react';
import '../styles/FinalWordInput.css';

/**
 * FinalWordInput Component
 * 
 * Final word submission interface
 * Features:
 * - Disabled until all levels cleared
 * - Letter hints display
 * - Validation feedback
 * 
 * @param {boolean} isUnlocked - Whether input is unlocked
 * @param {string[]} availableLetters - Letters available to use
 * @param {Function} onSubmit - Callback when word is submitted
 * @param {boolean} isSubmitting - Whether submission is in progress
 */

const FinalWordInput = ({
    isUnlocked,
    availableLetters = [],
    onSubmit,
    isSubmitting = false
}) => {
    const [word, setWord] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const value = e.target.value.toUpperCase();
        setWord(value);
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!word.trim()) {
            setError('Please enter the final word');
            return;
        }

        if (word.length < 3) {
            setError('Word must be at least 3 characters');
            return;
        }

        if (onSubmit) {
            onSubmit(word.trim());
        }
    };

    return (
        <div className={`final-word-container ${isUnlocked ? 'unlocked' : 'locked'}`}>
            <div className="final-word-card">
                <h2 className="final-word-title">
                    {isUnlocked ? 'ENTER THE FINAL WORD' : 'FINAL WORD LOCKED'}
                </h2>

                {!isUnlocked && (
                    <div className="final-word-locked-message">
                        <div className="lock-icon">🔒</div>
                        <p>Complete all 5 levels to unlock the final word submission</p>
                    </div>
                )}

                {isUnlocked && (
                    <>
                        <div className="final-word-description">
                            Use the letters you've collected to form the final word
                        </div>

                        {/* Available Letters Display */}
                        <div className="available-letters">
                            <div className="available-letters-label">Available Letters:</div>
                            <div className="available-letters-list">
                                {availableLetters.length > 0 ? (
                                    availableLetters.map((letter, index) => (
                                        <span key={index} className="letter-badge">
                                            {letter}
                                        </span>
                                    ))
                                ) : (
                                    <span className="no-letters">No letters collected yet</span>
                                )}
                            </div>
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSubmit} className="final-word-form">
                            <input
                                type="text"
                                className="final-word-input"
                                value={word}
                                onChange={handleChange}
                                placeholder="Enter the final word..."
                                disabled={!isUnlocked || isSubmitting}
                                maxLength={20}
                                autoFocus
                            />

                            {error && (
                                <div className="final-word-error">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="final-word-submit"
                                disabled={!isUnlocked || isSubmitting || !word.trim()}
                            >
                                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT FINAL WORD'}
                            </button>
                        </form>

                        <div className="final-word-hint">
                            💡 Hint: Think about who has the powers
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FinalWordInput;
