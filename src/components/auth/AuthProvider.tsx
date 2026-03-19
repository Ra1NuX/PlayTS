import { ClerkProvider, useClerk } from '@clerk/clerk-react';
import { Clerk } from '@clerk/clerk-js';
import { ui } from '@clerk/ui';
import { useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useEntitlementStore } from '../../stores/entitlementStore';
import { isElectron } from '../../utils/environment';
import { getElectronClerkInstance, clearElectronClerkToken } from './clerkElectronInstance';
import { STORAGE_KEYS } from '../../constants/localStorage';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'https://playts.net';
const AUTH_UID_KEY = STORAGE_KEYS.AUTH_UID;

/**
 * In Electron, handles:
 * 1. Deep-link OAuth callback (playts://oauth-callback?ticket=...)
 * 2. Session restoration on reload (from saved userId in localStorage)
 * 3. Session keep-alive (refresh before Clerk's ~60s token expiry)
 */
function ElectronOAuthListener() {
  const clerk = useClerk();
  const refreshingRef = useRef(false);

  const refreshSession = useCallback(async () => {
    if (refreshingRef.current) return;
    const userId = localStorage.getItem(AUTH_UID_KEY);
    if (!userId || !isElectron()) return;

    // Don't refresh if there's already an active session
    if (clerk.session) {
      console.log('ℹ️ Active Clerk session exists, skipping refresh');
      return;
    }

    const electron = window.electron;
    if (!electron?.requestSignInToken) return;

    refreshingRef.current = true;
    console.log('🔄 No active session found, requesting sign-in token...');
    try {
      const ticket = await electron.requestSignInToken(
        userId,
        `${LANDING_URL}/api/auth/sign-in-token`
      );
      if (!ticket) {
        console.warn('⚠️ No ticket received from main process');
        return;
      }

      const signIn = await clerk.client.signIn.create({ strategy: 'ticket', ticket });
      if (signIn.status === 'complete' && signIn.createdSessionId) {
        await clerk.setActive({ session: signIn.createdSessionId });
        console.log('✅ Session restored via sign-in token');
      }
    } catch (err) {
      console.error('❌ Session refresh failed:', err);
    } finally {
      refreshingRef.current = false;
    }
  }, [clerk]);

  // Handle deep link callback (with race condition guard)
  useEffect(() => {
    if (!isElectron() || !window.electron?.onOAuthComplete) return;

    const electron = window.electron;
    electron.onOAuthComplete(async (url: string) => {
      console.log('🔗 OAuth callback received in renderer:', url);

      // Guard against concurrent session creation with mount handler
      if (refreshingRef.current) {
        console.log('⏳ Session refresh already in progress, queuing OAuth callback...');
        // Wait for current refresh to finish before proceeding
        await new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (!refreshingRef.current) {
              clearInterval(check);
              resolve();
            }
          }, 100);
        });
      }

      refreshingRef.current = true;
      try {
        const parsed = new URL(url);
        const ticket = parsed.searchParams.get('ticket');

        if (ticket) {
          const signIn = await clerk.client.signIn.create({ strategy: 'ticket', ticket });
          if (signIn.status === 'complete' && signIn.createdSessionId) {
            await clerk.setActive({ session: signIn.createdSessionId });
            console.log('✅ Session created via sign-in token');
            return;
          }
        }
      } catch (err) {
        console.error('Failed to create session from ticket:', err);
      } finally {
        refreshingRef.current = false;
      }
    });

    return () => {
      electron.removeOAuthCompleteListener();
    };
  }, [clerk]);

  // Restore session on mount + check periodically if session was lost
  useEffect(() => {
    if (!isElectron() || !clerk.loaded) return;

    // Restore on mount if we have a saved userId but no active session
    if (!clerk.user && localStorage.getItem(AUTH_UID_KEY)) {
      console.log('🔄 No active user on mount, attempting session restore...');
      refreshSession();
    }

    // Check every 5 minutes if session was lost (don't aggressively refresh
    // — Clerk handles its own token refresh internally. We only need to
    // re-create the session if it was completely lost.)
    const interval = setInterval(() => {
      if (!clerk.session && localStorage.getItem(AUTH_UID_KEY)) {
        console.log('🔄 Session lost, attempting restore...');
        refreshSession();
      }
    }, 5 * 60_000);

    return () => clearInterval(interval);
  }, [clerk, clerk.loaded, refreshSession]);

  return null;
}

function AuthSync() {
  const clerk = useClerk();

  const syncUser = useCallback(() => {
    const user = clerk.user;
    const isSignedIn = !!user;

    if (isSignedIn && user) {
      // Persist userId for Electron session restoration
      if (isElectron()) {
        localStorage.setItem(AUTH_UID_KEY, user.id);
      }
      useAuthStore.getState().setAuth({
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        username: user.username,
        createdAt: user.createdAt ? new Date(user.createdAt).getTime() : null,
        lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt).getTime() : null,
        twoFactorEnabled: user.twoFactorEnabled,
        emailVerified: user.primaryEmailAddress?.verification?.status === 'verified',
        externalAccounts: user.externalAccounts.map((a) => ({
          provider: a.provider ?? 'unknown',
          email: a.emailAddress ?? null,
        })),
      });
      useEntitlementStore.getState().fetchEntitlements();
    } else {
      // Don't clear the Clerk token here — a 401 on touch/tokens destroys the
      // session and triggers this branch, but we still need the cached JWT for
      // session recovery. The token is cleared explicitly on sign-out in
      // AccountSection.tsx.
      useAuthStore.getState().clearAuth();
      useEntitlementStore.getState().reset();
    }
  }, [clerk]);

  useEffect(() => {
    if (clerk.loaded) {
      syncUser();
    }

    const unsubscribe = clerk.addListener(() => {
      syncUser();
    });

    return () => { unsubscribe(); };
  }, [clerk, syncUser]);

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!CLERK_KEY) {
    return <>{children}</>;
  }

  // In Electron, use a custom Clerk instance with GameGlass pattern hooks
  // (_is_native=1, credentials: omit, IPC token cache) so tokens work under
  // the playts:// protocol. In web mode, let ClerkProvider load clerk-js from CDN.
  return (
    <ClerkProvider
      publishableKey={CLERK_KEY}
      {...(isElectron() ? { Clerk: getElectronClerkInstance(CLERK_KEY), ui } : {})}
      routerPush={(to) => window.history.pushState({}, '', to)}
      routerReplace={(to) => window.history.replaceState({}, '', to)}
    >
      <ElectronOAuthListener />
      <AuthSync />
      {children}
    </ClerkProvider>
  );
}
