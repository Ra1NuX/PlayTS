import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { KBarProvider } from "kbar";
import App from './App.tsx'
import './index.css'
import '../i18n.config.ts';
import { AuthProvider } from './components/auth/AuthProvider.tsx';
import { isElectron } from './utils/environment';
import { STORAGE_KEYS } from './constants/localStorage';

// Register Service Worker that adds CORP headers to cross-origin responses.
// Only needed in Web mode — in Electron, the main process handles CORP headers
// via session.webRequest.onHeadersReceived, and service workers don't reliably
// intercept cross-origin requests under the playts:// protocol.
async function registerCoepServiceWorker() {
  if (isElectron()) {
    // In Electron, COEP is handled by the main process (credentialless mode +
    // webRequest header injection). Unregister any cached SW from previous
    // sessions to prevent it from intercepting and breaking cross-origin fetches.
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
        console.log('[SW] Unregistered stale COEP Service Worker in Electron');
      }
    }
    return;
  }

  if (!('serviceWorker' in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register('/coep-service-worker.js');
    console.log('[SW] COEP Service Worker registered:', reg.scope);

    // If the SW is installing/waiting, wait for it to activate before proceeding
    if (reg.installing || reg.waiting) {
      const sw = reg.installing || reg.waiting;
      await new Promise<void>((resolve) => {
        sw!.addEventListener('statechange', () => {
          if (sw!.state === 'activated') resolve();
        });
        // If already activated, resolve immediately
        if (sw!.state === 'activated') resolve();
      });
    }

    // Critical: ensure the SW is actually controlling this page before continuing.
    // After a page reload (e.g. post sign-out), the SW may be active but not yet
    // controlling — cross-origin requests (Clerk CDN) would lack CORP headers
    // and be blocked by COEP, causing Clerk to timeout.
    if (!navigator.serviceWorker.controller) {
      const reloadKey = STORAGE_KEYS.SW_RELOAD;
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        console.log('[SW] SW active but not controlling this page — reloading...');
        window.location.reload();
        // Block rendering until the reload happens
        await new Promise<void>(() => {});
      } else {
        // Already reloaded once — proceed without SW to avoid infinite loop
        sessionStorage.removeItem(reloadKey);
        console.warn('[SW] SW still not controlling after reload — proceeding without SW');
      }
    } else {
      // SW is controlling — clear any previous reload flag
      sessionStorage.removeItem(STORAGE_KEYS.SW_RELOAD);
    }
  } catch (err) {
    console.warn('[SW] Failed to register COEP Service Worker:', err);
  }
}

async function main() {
  await registerCoepServiceWorker();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <KBarProvider actions={[]} options={{ disableScrollbarManagement: true }}>
          <App />
        </KBarProvider>
      </AuthProvider>
    </StrictMode>,
  );
}

main();
