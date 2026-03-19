import { useTranslation } from "react-i18next";
import { Trash2, CheckCircle, Package, Loader2 } from "lucide-react";

interface InstalledPackageCardProps {
  name: string;
  version: string;
  isLoading: boolean;
  onUninstall: (name: string) => void;
}

export const InstalledPackageCard = ({
  name,
  version,
  isLoading,
  onUninstall
}: InstalledPackageCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="group relative">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center">
              <Package className="h-5 w-5 text-emerald-500" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold dark:text-gray-100 text-gray-900 truncate leading-tight">
                {name}
              </h3>
              <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium font-mono bg-accent-dark/10 text-accent-dark">
                v{version}
              </span>

              <button
                onClick={() => onUninstall(name)}
                disabled={isLoading}
                className="flex items-center gap-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-2 py-1 text-xs transition-colors cursor-pointer font-medium opacity-0 group-hover:opacity-100"
                title={t("UNINSTALL_PACKAGE")}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">{t("UNINSTALL")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
