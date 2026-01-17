import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { AntiCheatProvider } from './context/AntiCheatContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Round1Dashboard from './pages/Round1Dashboard';
import Level1 from './pages/Level1';
import Level2 from './pages/Level2';
import Level3 from './pages/Level3';
import Level4 from './pages/Level4';
import Level5 from './pages/Level5';
import FinalWord from './pages/FinalWord';
import Leaderboard from './pages/Leaderboard';
import FullscreenAntiCheat from './system/FullscreenAntiCheat';
import './styles/index.css';

/**
 * Main App Component
 * 
 * ARCHITECTURE:
 * - No app-level loader (auth resolves in AuthContext)
 * - Providers wrap entire app (never remount)
 * - Routes are declarative
 * - Only Login, Round1Dashboard, and FinalWord are active
 * - Level pages will be re-added incrementally
 */

function App() {
  return (
    <Router>
      <FullscreenAntiCheat />
      <AuthProvider>
        <GameProvider>
          <AntiCheatProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/round1" element={<Round1Dashboard />} />
              <Route path="/level1" element={<Level1 />} />
              <Route path="/level2" element={<Level2 />} />
              <Route path="/level3" element={<Level3 />} />
              <Route path="/level4" element={<Level4 />} />
              <Route path="/level5" element={<Level5 />} />
              <Route path="/final-word" element={<FinalWord />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AntiCheatProvider>
        </GameProvider>
      </AuthProvider>
    </Router>
  );
}

function Round2Qualified() {
  return (
    <div className="level-container">
      <div className="level-background"></div>
      <div className="level-complete-screen">
        <div className="level-complete-card">
          <div className="level-complete-icon success">🎉</div>
          <h1 className="level-complete-title" style={{ color: '#00ff88' }}>
            CONGRATULATIONS!
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#cccccc' }}>
            You have successfully qualified for Round 2!
          </p>
          <div style={{
            background: 'rgba(0, 255, 136, 0.1)',
            border: '2px solid #00ff88',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>What's Next?</h3>
            <p style={{ color: '#cccccc' }}>
              Round 2 details will be announced soon. Keep an eye on your email
              and the event dashboard for updates.
            </p>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#888888' }}>
            Thank you for participating in Escape Hawkins Round 1!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
