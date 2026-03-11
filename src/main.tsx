// Vertel de browser als allereerste: wij regelen scroll zelf
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);