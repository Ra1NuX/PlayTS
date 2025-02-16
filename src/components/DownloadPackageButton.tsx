import { useEffect, useState } from "react";
import { installPackage, uninstallPackage } from "../utils/runCode";
import { useTranslation } from "react-i18next";
import { BiDownload, BiTrash } from "react-icons/bi";
import { FiLoader } from "react-icons/fi";

const DownloadPackageButton = ({
  pckg,
  version,
}: {
  pckg: string;
  version: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (isDownloaded) return;
    const installedDependecies = localStorage.getItem("dependencies");
    if (installedDependecies) {
      const dependencies = JSON.parse(installedDependecies);
      if (dependencies[pckg] === version) {
        setIsDownloaded(true);
      }
    }
  }, [isDownloaded]);

  const downloadPackage = async () => {
    setIsLoading(true);
    const isInstalled = await installPackage(pckg, version);
    setIsDownloaded(isInstalled);
    setIsLoading(false);
  };

  const removePackage = async () => {
    setIsLoading(true);
    const ok = await uninstallPackage(pckg);
    if (ok) setIsDownloaded(false);
    setIsLoading(false);
  };

  if (isLoading)
    return (
      <div className="bg-gray-300 shadow-md px-2 rounded text-main-dark flex items-center justify-center gap-2 p-1 font-normal text-sm leading-none">
        <FiLoader className="animate-spin duration-100" size={16}/> <span className="leading-[0px] mt-0.5">Loading</span>
      </div>
    );

  if (isDownloaded)
    return (
      <button
        className="bg-red-500 hover:bg-red-600 shadow-md px-2 rounded text-white flex items-center justify-center gap-2 p-1 font-normal text-sm leading-none"
        onClick={removePackage}
      >
        <BiTrash size={16} /> <span className="leading-[0px] mt-0.5">{t("UNINSTALL")}</span>
      </button>
    );

  return (
    <button
      className="bg-blue-500 hover:bg-blue-600 px-2 rounded text-white shadow-md flex items-center gap-2 p-1 font-normal text-sm leading-none"
      onClick={downloadPackage}
    >
      <BiDownload size={16} /><span className="leading-[0px] mt-0.5">{t("INSTALL")}</span> 
    </button>
  );
};

export default DownloadPackageButton;
