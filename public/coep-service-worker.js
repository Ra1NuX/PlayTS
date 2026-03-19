/*
 * Service Worker that adds Cross-Origin-Resource-Policy headers to
 * third-party responses (like Clerk) so they work under COEP: require-corp.
 *
 * Based on the approach used by StackBlitz for WebContainers compatibility.
 */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept cross-origin requests (Clerk, etc.)
  if (url.origin === self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Opaque responses (status 0) cannot be reconstructed — pass them through as-is.
        if (response.type === 'opaque' || response.status === 0) {
          return response;
        }

        // If the response already has CORP header, let it through
        if (response.headers.get('Cross-Origin-Resource-Policy')) {
          return response;
        }

        // Clone the response and add CORP header so it passes COEP check
        const headers = new Headers(response.headers);
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      })
      .catch((err) => {
        console.error('[COEP SW] Fetch failed for:', request.url, err);
        // Return a proper error response instead of retrying the same failing fetch
        return new Response('Service Worker fetch failed', {
          status: 502,
          statusText: 'Bad Gateway',
        });
      })
  );
});
