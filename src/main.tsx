import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { captureTracking } from './lib/utm';
import './index.css';

// Captura as UTMs antes de qualquer navegação interna.
captureTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
