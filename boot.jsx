import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './aura.css'
import App from './AuraApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
