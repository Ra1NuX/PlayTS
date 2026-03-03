import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { KBarProvider } from "kbar";
import App from './App.tsx'
import './index.css'
import '../i18n.config.ts';



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KBarProvider actions={[]} options={{ disableScrollbarManagement: true }}>
      <App />
    </KBarProvider>
  </StrictMode>,
)
