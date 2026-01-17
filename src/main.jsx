import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

/**
 * Main Entry Point
 * 
 * Renders the App component with React StrictMode
 * Global styles are imported in App.jsx
 */

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
