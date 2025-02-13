import { useEffect, useState } from "react";
import { installPackage, uninstallPackage } from "../utils/runCode";
import { useTranslation } from "react-i18next";
import { BiDownload, BiTrash } from "react-icons/bi";
import { GrInstall } from "react-icons/gr";

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
      <button className="bg-blue-500 px-2 rounded text-white">
        Loading...
      </button>
    );

  if (isDownloaded)
    return (
      <button
        className="bg-red-500 px-2 rounded text-white flex items-center gap-2"
        onClick={removePackage}
      >
        <BiTrash /><span>{t("UNINSTALL")}</span>
      </button>
    );

  return (
    <button
      className="bg-blue-500 px-2 rounded text-white shadow-md flex items-center gap-2"
      onClick={downloadPackage}
    >
      <BiDownload /><span>{t("INSTALL")}</span> 
    </button>
  );
};

export default DownloadPackageButton;
