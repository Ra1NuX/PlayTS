/**
 * Clerk authentication token management and network interceptors.
 */

import { app, session, safeStorage } from 'electron';
import path from 'path';
import fs from 'fs';
import { getWin } from './windowManager';
import { IPC_CHANNELS } from '../src/constants/ipcChannels';

// ── Token persistence ───────────────────────────────────────────────────────

const TOKEN_FILE = path.join(app.getPath('userData'), '.clerk-token');

export function saveTokenToDisk(token: string | null): void {
  try {
    if (!token) {
      if (fs.existsSync(TOKEN_FILE)) fs.unlinkSync(TOKEN_FILE);
      return;
    }
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(token);
      fs.writeFileSync(TOKEN_FILE, encrypted);
    } else {
      fs.writeFileSync(TOKEN_FILE, token, 'utf-8');
    }
  } catch (err) {
    console.error('Failed to save token to disk:', err);
  }
}

export function loadTokenFromDisk(): string | null {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    const data = fs.readFileSync(TOKEN_FILE);
    let token: string;
    if (safeStorage.isEncryptionAvailable()) {
      token = safeStorage.decryptString(data);
    } else {
      token = data.toString('utf-8');
    }
    // A valid JWT is only ASCII (base64url + dots). If decryption produced
    // characters outside ISO-8859-1 (code > 255), the token is corrupted
    // (e.g. encryption keys changed after an app update). Discard it.
    if (/[^\x00-\xFF]/.test(token)) {
      console.warn('⚠️ Clerk token on disk contains non-ISO-8859-1 characters, discarding');
      fs.unlinkSync(TOKEN_FILE);
      return null;
    }
    return token;
  } catch (err) {
    console.error('Failed to load token from disk:', err);
    // Clean up corrupted file
    try { fs.unlinkSync(TOKEN_FILE); } catch {}
    return null;
  }
}

// ── In-memory token state ───────────────────────────────────────────────────

let _clerkToken: string | null = loadTokenFromDisk();
if (_clerkToken) {
  console.log('✅ Clerk token restored from disk');
}

export function getClerkToken(): string | null {
  return _clerkToken;
}

export function setClerkToken(token: string | null): void {
  _clerkToken = token;
}

// ── Network interceptors ────────────────────────────────────────────────────

export function registerClerkInterceptors(): void {
  const clerkFilter = {
    urls: ['https://clerk.playts.net/*', 'https://*.clerk.accounts.dev/*'],
  };

  // Rewrite Origin on outgoing Clerk requests
  session.defaultSession.webRequest.onBeforeSendHeaders(
    clerkFilter,
    (details, callback) => {
      const headers = { ...details.requestHeaders };

      // If there's an Authorization header, remove Origin entirely to bypass
      // CORS — the server will treat it as a non-browser request.
      if (headers['Authorization'] || headers['authorization']) {
        delete headers['Origin'];
        delete headers['origin'];
      } else if (headers['Origin'] === 'playts://-') {
        // Rewrite Origin from playts:// to web domain so Clerk treats it as
        // a normal web request and sets cookies with compatible attributes.
        headers['Origin'] = 'https://playts.net';
      }

      console.log(
        `🔒 Clerk request: ${details.method} ${details.url} | Origin=${headers['Origin'] || 'NONE'}`
      );
      callback({ requestHeaders: headers });
    }
  );

  // Add CORP header to cross-origin responses so they pass COEP: require-corp.
  // Also rewrite Clerk response CORS headers to allow the playts:// origin.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };

    const isClerk =
      details.url.includes('clerk.playts.net') ||
      details.url.includes('clerk.accounts.dev');

    if (isClerk) {
      // Rewrite CORS origin back to playts://-  so the browser's CORS check passes.
      responseHeaders['access-control-allow-origin'] = ['playts://-'];
      responseHeaders['access-control-allow-credentials'] = ['true'];

      // For OPTIONS preflight: ensure 204 + required CORS headers.
      if (details.method === 'OPTIONS') {
        responseHeaders['access-control-allow-methods'] = ['GET, POST, PUT, DELETE, PATCH, OPTIONS'];
        responseHeaders['access-control-allow-headers'] = ['authorization, content-type, x-requested-with, accept, origin, cache-control, x-clerk-api-version'];
        responseHeaders['access-control-max-age'] = ['86400'];

        console.log(`🔒 Clerk preflight fixed: ${details.url}`);
        callback({ responseHeaders, statusLine: 'HTTP/1.1 204 No Content' });
        return;
      }

      // Log whether Clerk sends Authorization in the response
      const authHeader = responseHeaders['authorization'] || responseHeaders['Authorization'];
      console.log(
        `🔒 Clerk response: ${details.statusLine} | ${details.url} | Auth header: ${authHeader ? 'YES' : 'NONE'}`
      );
    }

    // Only add CORP to cross-origin requests that don't already have it
    const hasCorpHeader = Object.keys(responseHeaders).some(
      (key) => key.toLowerCase() === 'cross-origin-resource-policy'
    );

    if (!hasCorpHeader && details.url.startsWith('https://')) {
      responseHeaders['Cross-Origin-Resource-Policy'] = ['cross-origin'];
    }

    callback({ responseHeaders });
  });

  // Notify renderer when Clerk completes a token refresh
  const clerkTokenFilter = {
    urls: [
      'https://clerk.playts.net/v1/client/sessions/*',
      'https://*.clerk.accounts.dev/v1/client/sessions/*',
    ],
  };
  session.defaultSession.webRequest.onCompleted(clerkTokenFilter, () => {
    const win = getWin();
    if (win) {
      win.webContents.send(IPC_CHANNELS.AUTH_TOKEN_REFRESHED);
    }
  });
}
