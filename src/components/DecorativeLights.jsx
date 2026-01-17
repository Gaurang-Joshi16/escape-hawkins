import InteractiveGrid from './InteractiveGrid';
import '../styles/atmospheric.css';

/**
 * Decorative Lights Component (ENHANCED)
 * 
 * Combines:
 * - Atmospheric light string at top
 * - Interactive grid with mouse hover glow
 * 
 * Stranger Things / Escape Room theme
 */

const DecorativeLights = () => {
    return (
        <>
            <InteractiveGrid />
            <div className="decorative-lights">
                <div className="light-bulb"></div>
                <div className="light-bulb"></div>
                <div className="light-bulb"></div>
                <div className="light-bulb"></div>
                <div className="light-bulb"></div>
                <div className="light-bulb"></div>
                <div className="light-bulb"></div>
                <div className="light-bulb"></div>
                <div className="light-bulb"></div>
                <div className="light-bulb"></div>
            </div>
        </>
    );
};

export default DecorativeLights;
