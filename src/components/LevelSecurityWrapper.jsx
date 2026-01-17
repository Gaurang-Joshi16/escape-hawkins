// components/LevelSecurityWrapper.jsx
import useFullscreenGuard from '../hooks/useFullscreenGuard';

const LevelSecurityWrapper = ({ children, onAutoSubmit, setSystemMessage }) => {
  useFullscreenGuard({
    enabled: true,
    onViolation: (count) => {
      setSystemMessage?.(`⚠️ Fullscreen exited (${count}/3)`);
    },
    onMaxViolation: () => {
      onAutoSubmit();
    }
  });

  return children;
};

export default LevelSecurityWrapper;
