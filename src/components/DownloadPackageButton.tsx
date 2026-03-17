import { useTranslation } from "react-i18next";
import { Download, Trash2, Loader2 } from "lucide-react";
import useDependencies from "../hooks/useDependencies";

const DownloadPackageButton = ({
  pckg,
  version,
}: {
  pckg: string;
  version: string;
}) => {
  const { download, packages } = useDependencies();
  const { t } = useTranslation();

  // Check if this specific package is being installed
  const isInstalling = download.loadingPackages.has(pckg);

  if (isInstalling)
    return (
      <div className="bg-gray-300 shadow-md px-2 rounded text-main-dark flex items-center justify-center gap-2 p-1 font-normal text-sm leading-none">
        <Loader2 className="animate-spin duration-100 w-4 h-4" />{" "}
        <span className="leading-[0px] mt-0.5">Loading</span>
      </div>
    );

  if (packages && Object.keys(packages).includes(pckg)) {
    return (
      <button
        className="bg-red-500 hover:bg-red-600 shadow-md px-2 rounded text-white flex items-center justify-center gap-2 p-1 font-normal text-sm leading-none"
        onClick={() => download.removePackage(pckg)}
      >
        <Trash2 className="w-4 h-4" />{" "}
        <span className="leading-[0px] mt-0.5">{t("UNINSTALL")}</span>
      </button>
    );
  }
  return (
    <button
      className="bg-blue-500 hover:bg-blue-600 px-2 rounded text-white shadow-md flex items-center gap-2 p-1 font-normal text-sm leading-none"
      onClick={() => download.addPackage(pckg, version)}
    >
      <Download className="w-4 h-4" />
      <span className="leading-[0px] mt-0.5">{t("INSTALL")}</span>
    </button>
  );
};

export default DownloadPackageButton;
