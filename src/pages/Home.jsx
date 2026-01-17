import { useNavigate } from 'react-router-dom';
import DecorativeLights from '../components/DecorativeLights';
import '../styles/Home.css';

/**
 * Home / Landing Page - REFINED CINEMATIC INTRO
 * 
 * Entry point to the application
 * Centered hero with scattered background elements
 */

const Home = () => {
    const navigate = useNavigate();

    const handleEscape = () => {
        navigate('/login');
    };

    return (
        <div className="home-container atmospheric-container">
            <DecorativeLights />

            {/* Scattered Background Characters */}
            <div className="scattered-chars">
                <span className="char char-1">A</span>
                <span className="char char-2">E</span>
                <span className="char char-3">X</span>
                <span className="char char-4">0</span>
                <span className="char char-5">1</span>
                <span className="char char-6">H</span>
                <span className="char char-7">K</span>
                <span className="char char-8">R</span>
                <span className="char char-9">01</span>
                <span className="char char-10">W</span>
                <span className="char char-11">N</span>
                <span className="char char-12">S</span>
                <span className="char char-13">10</span>
                <span className="char char-14">C</span>
                <span className="char char-15">P</span>
            </div>

            {/* Centered Hero Block */}
            <div className="home-hero">
                {/* Top-down Lighting Effect */}
                <div className="title-spotlight"></div>

                {/* Secondary Visual Above Title */}
                <div className="hero-visual">
                    <div className="portal-symbol"></div>
                </div>

                {/* Main Title */}
                <h1 className="home-title">ESCAPE HAWKINS</h1>

                {/* Dialogue */}
                <div className="home-dialogue">
                    <p className="dialogue-line">The gate is open.</p>
                    <p className="dialogue-line">The rules are broken.</p>
                    <p className="dialogue-line">Every second matters.</p>
                    <p className="dialogue-line">Only the sharpest escape.</p>
                </div>

                {/* CTA Button */}
                <button className="escape-button" onClick={handleEscape}>
                    ESCAPE
                </button>
            </div>
        </div>
    );
};

export default Home;
