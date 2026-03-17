import { useAuthStore } from '../../stores/authStore';
import { useEntitlementStore } from '../../stores/entitlementStore';
import { useSidebarStore } from '../../stores/sidebarStore';
import { useTranslation } from 'react-i18next';
import { useClerk } from '@clerk/clerk-react';
import { LogIn } from 'lucide-react';
import Tooltip from '../Tooltip';
import { isElectron } from '../../utils/environment';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function UserButton() {
  const { isAuthenticated, fullName, imageUrl, email } = useAuthStore();
  const plan = useEntitlementStore((s) => s.plan);

  if (!CLERK_KEY) return null;

  if (!isAuthenticated) {
    return <SignInButton />;
  }

  return (
    <div className="flex items-center gap-1.5 no-drag">
      {plan !== 'free' && (
        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-accent-dark text-white">
          {plan}
        </span>
      )}
      <Tooltip content={fullName || email || 'Account'} placement="bottom">
        <UserAvatar imageUrl={imageUrl} fullName={fullName} />
      </Tooltip>
    </div>
  );
}

function SignInButton() {
  const { t } = useTranslation();
  const clerk = useClerkSafe();

  return (
    <Tooltip content={t('SIGN_IN') || 'Sign in'} placement="bottom">
      <button
        onClick={() => {
          if (isElectron() && clerk && window.electron?.openSignInExternal) {
            const landingUrl = import.meta.env.VITE_LANDING_URL || 'https://playts.net';
            const url = clerk.buildSignInUrl({ redirectUrl: `${landingUrl}/oauth-callback` });
            if (url) window.electron.openSignInExternal(url);
          } else {
            clerk?.openSignIn();
          }
        }}
        className="no-drag flex items-center gap-1.5 text-xs px-2 py-1 rounded-md dark:text-gray-300 text-gray-600 dark:hover:bg-divider-dark hover:bg-gray-200 transition-colors cursor-pointer"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('SIGN_IN') || 'Sign in'}</span>
      </button>
    </Tooltip>
  );
}

function UserAvatar({ imageUrl, fullName }: { imageUrl: string | null; fullName: string | null }) {
  const { requestPanel } = useSidebarStore();
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <button
      onClick={() => requestPanel('settings')}
      className="no-drag w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-accent-dark text-white text-xs font-semibold hover:ring-2 hover:ring-accent-dark/50 transition-all cursor-pointer"
    >
      {imageUrl ? (
        <img src={imageUrl} alt={fullName || ''} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </button>
  );
}

function useClerkSafe() {
  try {
    return useClerk();
  } catch {
    /* Clerk provider not available, return null to gracefully degrade */
    return null;
  }
}
