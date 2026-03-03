import { useTranslation } from "react-i18next";
import { BsDownload, BsTrash, BsCheckCircleFill } from "react-icons/bs";
import { BiPackage } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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
      <div className="p-3 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${
              isInstalled 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-main-dark'
            }`}>
              <BiPackage className={`h-5 w-5 ${
                isInstalled 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold dark:text-white text-main-dark break-words leading-tight">
                  {name}
                </h3>
                {isInstalled && (
                  <BsCheckCircleFill className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  v{version}
                </span>
              </div>
            </div>

            {description && (
              <p className="dark:text-gray-400 text-main-light/70 text-xs leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-main-dark/50">
          {isInstalled ? (
            <button
              onClick={() => onUninstall(name)}
              disabled={isLoading}
              className="flex items-center gap-1.5 dark:bg-main-dark bg-gray-100 hover:bg-gray-200 dark:hover:bg-main-dark/80 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 text-main-dark border border-gray-300 dark:border-main-dark rounded px-3 py-1.5 text-xs transition-all font-normal"
              title={t("UNINSTALL_PACKAGE")}
            >
              {isLoading ? (
                <AiOutlineLoading3Quarters className="h-3 w-3 animate-spin" />
              ) : (
                <BsTrash className="h-3 w-3" />
              )}
              <span>{t("UNINSTALL")}</span>
            </button>
          ) : (
            <button
              onClick={() => onInstall(name, version)}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded px-3 py-1.5 text-xs transition-all font-semibold shadow-sm hover:shadow"
              title={t("INSTALL_PACKAGE")}
            >
              {isLoading ? (
                <AiOutlineLoading3Quarters className="h-3 w-3 animate-spin" />
              ) : (
                <BsDownload className="h-3 w-3" />
              )}
              <span>{isLoading ? t("INSTALLING") : t("INSTALL")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

