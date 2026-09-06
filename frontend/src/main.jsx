import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from './context/ThemeContext.jsx'

// ── Prevent flash of wrong theme on first load ──
const saved = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", saved);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <ToastContainer />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
