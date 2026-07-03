import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

import { ThemeProvider } from './contexts/ThemeContext';

/* ─── Backend warm-up ping ───────────────────────────────────────
   Render's free tier spins down after 15 min of inactivity.
   We fire a silent health check immediately on app load so the
   server is awake before the user submits their first request.
   ────────────────────────────────────────────────────────────── */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
fetch(`${API_URL}/health`, { method: 'GET' }).catch(() => {
  // Silently ignore — this is best-effort only
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

