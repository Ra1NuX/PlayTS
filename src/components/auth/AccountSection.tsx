import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useEntitlementStore } from '../../stores/entitlementStore';
import { useClerk } from '@clerk/clerk-react';
import { User, LogOut, ExternalLink, Mail, Calendar, Shield, Link } from 'lucide-react';
import { isElectron } from '../../utils/environment';
import { clearElectronClerkToken } from './clerkElectronInstance';
import { STORAGE_KEYS } from '../../constants/localStorage';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'https://playts.net';

export default function AccountSection() {
  if (!CLERK_KEY) return null;

  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <SignedOutView />;
  }

  return <SignedInView />;
}

function SignedOutView() {
  const { t } = useTranslation();
  const clerk = useClerkSafe();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <User className="w-3.5 h-3.5 dark:text-gray-400 text-gray-500" />
        <h2 className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
          {t('ACCOUNT') || 'Account'}
        </h2>
      </div>
      <div className="flex flex-col gap-3 px-1">
        <p className="text-xs dark:text-gray-500 text-gray-400 leading-relaxed">
          {t('SIGN_IN_DESCRIPTION') || 'Sign in to sync your bookmarks, environment variables and settings across devices.'}
        </p>
        <button
          onClick={() => {
            if (isElectron() && clerk && window.electron?.openSignInExternal) {
              const url = clerk.buildSignInUrl({ redirectUrl: `${LANDING_URL}/oauth-callback` });
              if (url) window.electron.openSignInExternal(url);
            } else {
              clerk?.openSignIn();
            }
          }}
          className="w-full h-9 px-4 rounded-lg bg-accent-dark hover:bg-accent-dark/90 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          {t('SIGN_IN') || 'Sign in'}
        </button>
      </div>
    </div>
  );
}

function SignedInView() {
  const { t, i18n } = useTranslation();
  const {
    fullName,
    firstName,
    email,
    imageUrl,
    username,
    createdAt,
    lastSignInAt,
    twoFactorEnabled,
    emailVerified,
    externalAccounts,
  } = useAuthStore();
  const { plan, features } = useEntitlementStore();
  const clerk = useClerkSafe();

  const isPro = plan === 'pro' || plan === 'team';

  const formatDate = (ts: number | null) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <User className="w-3.5 h-3.5 dark:text-gray-400 text-gray-500" />
        <h2 className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500">
          {t('ACCOUNT') || 'Account'}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {/* Profile card */}
        <div className="rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#1a1a1a] bg-white p-4 hover:border-gray-300 dark:hover:border-[#333] transition-colors">
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={fullName || ''}
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-accent-dark/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent-dark text-white flex items-center justify-center text-sm font-semibold shrink-0 ring-2 ring-accent-dark/20">
                {(firstName || email || '?')[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium dark:text-gray-100 text-gray-900 truncate">
                  {fullName || username || email}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    isPro
                      ? 'bg-gradient-to-r from-accent-dark to-accent-dark/80 text-white shadow-sm shadow-accent-dark/25'
                      : 'dark:bg-[#2a2a2a] bg-gray-200 dark:text-gray-400 text-gray-500'
                  }`}
                >
                  {plan}
                </span>
              </div>
              {username && (
                <p className="text-xs dark:text-gray-500 text-gray-400 truncate">@{username}</p>
              )}
            </div>
          </div>

          {!isPro && (
            <a
              href={`${LANDING_URL}/${i18n.language}/pricing`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-1.5 w-full h-9 px-4 rounded-lg bg-accent-dark hover:bg-accent-dark/90 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {t('UPGRADE_TO_PRO') || 'Upgrade to Pro'}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Details */}
        <div className="rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#1a1a1a] bg-white p-4 flex flex-col gap-2.5 hover:border-gray-300 dark:hover:border-[#333] transition-colors">
          {email && (
            <InfoRow icon={<Mail className="w-3 h-3" />} label="Email" value={email} badge={emailVerified ? t('VERIFIED') || 'Verified' : undefined} />
          )}

          {createdAt && (
            <InfoRow icon={<Calendar className="w-3 h-3" />} label={t('MEMBER_SINCE') || 'Member since'} value={formatDate(createdAt)} />
          )}

          {lastSignInAt && (
            <InfoRow icon={<Calendar className="w-3 h-3" />} label={t('LAST_SIGN_IN') || 'Last sign in'} value={formatDate(lastSignInAt)} />
          )}

          <InfoRow
            icon={<Shield className="w-3 h-3" />}
            label="2FA"
            value={twoFactorEnabled ? (t('ENABLED') || 'Enabled') : (t('DISABLED') || 'Disabled')}
          />

          {externalAccounts.length > 0 && (
            <div className="flex items-start gap-2 text-xs">
              <Link className="w-3 h-3 mt-0.5 shrink-0 dark:text-gray-500 text-gray-400" />
              <div className="min-w-0">
                <span className="dark:text-gray-500 text-gray-400">{t('CONNECTED_ACCOUNTS') || 'Connected'}: </span>
                <span className="dark:text-gray-100 text-gray-900">
                  {externalAccounts.map((a) => a.provider).join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Plan features (if pro) */}
        {isPro && (
          <div className="rounded-lg border dark:border-[#2a2a2a] border-gray-200 dark:bg-[#1a1a1a] bg-white p-4 hover:border-gray-300 dark:hover:border-[#333] transition-colors relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-dark/5 to-transparent pointer-events-none" />
            <p className="text-[11px] font-semibold uppercase tracking-wider dark:text-gray-400 text-gray-500 mb-2.5 relative">
              {t('PLAN_FEATURES') || 'Plan features'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs dark:text-gray-100 text-gray-900 relative">
              <div>{t('BOOKMARKS') || 'Bookmarks'}: <span className="font-semibold text-accent-dark">{features.max_bookmarks === -1 ? '\u221e' : features.max_bookmarks}</span></div>
              <div>{t('ENV_VARS') || 'Env vars'}: <span className="font-semibold text-accent-dark">{features.max_envvars === -1 ? '\u221e' : features.max_envvars}</span></div>
              <div>{t('CLOUD_SYNC') || 'Cloud sync'}: <span className="font-semibold text-accent-dark">{features.cloud_sync ? '\u2713' : '\u2717'}</span></div>
              <div>{t('AI_PROXY') || 'AI proxy'}: <span className="font-semibold text-accent-dark">{features.ai_proxy ? '\u2713' : '\u2717'}</span></div>
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEYS.AUTH_UID);
            if (isElectron()) clearElectronClerkToken();
            clerk?.signOut(() => { /* no-op: prevents Clerk from redirecting/reloading. AuthSync handles state cleanup via listener. */ });
          }}
          className="flex items-center gap-1.5 text-xs dark:text-gray-500 text-gray-400 hover:text-red-500 dark:hover:text-red-400 px-1 py-1 transition-colors cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          {t('SIGN_OUT') || 'Sign out'}
        </button>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="shrink-0 dark:text-gray-500 text-gray-400">{icon}</span>
      <span className="dark:text-gray-500 text-gray-400">{label}:</span>
      <span className="dark:text-gray-100 text-gray-900 truncate">{value}</span>
      {badge && (
        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 shrink-0">
          {badge}
        </span>
      )}
    </div>
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
