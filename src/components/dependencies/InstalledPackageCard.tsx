import { useTranslation } from "react-i18next";
import { BsTrash, BsCheckCircleFill } from "react-icons/bs";
import { BiPackage } from "react-icons/bi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

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
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <BiPackage className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold dark:text-white text-main-dark truncate leading-tight">
                {name}
              </h3>
              <BsCheckCircleFill className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                v{version}
              </span>
              
              <button
                onClick={() => onUninstall(name)}
                disabled={isLoading}
                className="flex items-center gap-1 dark:bg-main-dark bg-gray-100 hover:bg-gray-200 dark:hover:bg-main-dark/80 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 text-main-dark border border-gray-300 dark:border-main-dark rounded px-2 py-1 text-xs transition-all font-normal opacity-0 group-hover:opacity-100"
                title={t("UNINSTALL_PACKAGE")}
              >
                {isLoading ? (
                  <AiOutlineLoading3Quarters className="h-3 w-3 animate-spin" />
                ) : (
                  <BsTrash className="h-3 w-3" />
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

