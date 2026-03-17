import { useTranslation } from "react-i18next";
import { Download, Trash2, CheckCircle, Package, Loader2 } from "lucide-react";

interface PackageCardProps {
  name: string;
  version: string;
  description?: string;
  isInstalled: boolean;
  isLoading: boolean;
  onInstall: (name: string, version: string) => void;
  onUninstall: (name: string) => void;
}

export const PackageCard = ({
  name,
  version,
  description,
  isInstalled,
  isLoading,
  onInstall,
  onUninstall
}: PackageCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="group relative">
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isInstalled
                ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                : 'bg-gray-50 dark:bg-[#111]'
            }`}>
              <Package className={`h-5 w-5 ${
                isInstalled
                  ? 'text-emerald-500'
                  : 'dark:text-gray-400 text-gray-500'
              }`} />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold dark:text-gray-100 text-gray-900 break-words leading-tight">
                  {name}
                </h3>
                {isInstalled && (
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium font-mono bg-accent-dark/10 text-accent-dark">
                  v{version}
                </span>
              </div>
            </div>

            {description && (
              <p className="dark:text-gray-400 text-gray-500 text-xs leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t dark:border-[#2a2a2a] border-gray-200">
          {isInstalled ? (
            <button
              onClick={() => onUninstall(name)}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-xs transition-colors cursor-pointer font-medium"
              title={t("UNINSTALL_PACKAGE")}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              <span>{t("UNINSTALL")}</span>
            </button>
          ) : (
            <button
              onClick={() => onInstall(name, version)}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 py-1.5 text-xs transition-colors cursor-pointer font-medium"
              title={t("INSTALL_PACKAGE")}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Download className="h-3 w-3" />
              )}
              <span>{isLoading ? t("INSTALLING") : t("INSTALL")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
