import { useTranslation } from "react-i18next";
import { Package, Search } from "lucide-react";

interface EmptyStateProps {
  hasSearch: boolean;
}

export const EmptyState = ({ hasSearch }: EmptyStateProps) => {
  const { t } = useTranslation();
  return (
    <div className="border-2 border-dashed rounded-lg p-8 dark:border-[#2a2a2a] border-gray-200 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-[#111] flex items-center justify-center">
          {hasSearch ? (
            <Search className="h-8 w-8 dark:text-gray-500 text-gray-400" />
          ) : (
            <Package className="h-8 w-8 dark:text-gray-500 text-gray-400" />
          )}
        </div>
      </div>

      <h3 className="text-base font-semibold dark:text-gray-100 text-gray-900 mb-2">
        {hasSearch ? t("DEPS_NO_PACKAGES_FOUND") : t("NO_DEPENDENCIES_INSTALLED")}
      </h3>

      <p className="dark:text-gray-500 text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
        {hasSearch
          ? t("DEPS_TRY_DIFFERENT_SEARCH")
          : t("DEPS_INSTALL_TO_START")
        }
      </p>
    </div>
  );
};
