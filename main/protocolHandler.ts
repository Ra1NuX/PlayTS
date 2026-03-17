/**
 * Deep-link protocol handling for playts:// URLs.
 */

import { app, net, protocol } from 'electron';
import path from 'path';
import url from 'url';
import { getWin } from './windowManager';
import isDev from './tools/isDev';
import { IPC_CHANNELS } from '../src/constants/ipcChannels';

/** Forward a playts:// deep-link URL to the renderer */
export function handleDeepLink(deepLinkUrl: string): void {
  console.log('🔗 Deep link received:', deepLinkUrl);
  if (!deepLinkUrl.startsWith('playts://')) return;

  // Focus the existing window
  const win = getWin();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
    win.webContents.send(IPC_CHANNELS.AUTH_OAUTH_COMPLETE, deepLinkUrl);
  }
}

/**
 * Register playts:// as the default protocol client for deep-link OAuth.
 * Must be called before app.whenReady().
 */
export function registerProtocolClient(): void {
  if (process.defaultApp) {
    // In dev, register with the path to electron + script
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('playts', process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient('playts');
  }

  if (!isDev) {
    protocol.registerSchemesAsPrivileged([
      {
        scheme: 'playts',
        privileges: {
          standard: true,
          secure: true,
          allowServiceWorkers: true,
          supportFetchAPI: true,
          corsEnabled: true
        }
      }
    ]);
  }
}

/**
 * Register the playts:// protocol handler that serves renderer files.
 * Must be called inside app.whenReady().
 */
export async function registerProtocolHandler(): Promise<void> {
  if (isDev) return;

  const rendererRoot = path.join(__dirname, "renderer");

  protocol.handle('playts', async (request) => {
    const parsed = new URL(request.url);
    let pathname = decodeURI(parsed.pathname);

    // Normalize: playts://-/ → /
    if (pathname.startsWith('/-/')) pathname = pathname.substring(2);
    if (pathname === '/' || pathname === '') pathname = '/index.html';

    const filePath = path.join(rendererRoot, pathname);

    try {
      // GameGlass pattern: use net.fetch with file:// URL
      const fileUrl = url.pathToFileURL(filePath).toString();
      const response = await net.fetch(fileUrl);

      // Clone response with COOP/COEP headers for SharedArrayBuffer
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'credentialless',
        },
      });
    } catch {
      /* 404 is returned instead */
      return new Response('Not Found', { status: 404 });
    }
  });

  console.log('Protocol playts:// registered successfully with protocol.handle');
}
