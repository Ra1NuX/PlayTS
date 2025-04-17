import { useTranslation } from "react-i18next";
import { BiDownload, BiTrash } from "react-icons/bi";
import { FiLoader } from "react-icons/fi";
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

  if (download.loading)
    return (
      <div className="bg-gray-300 shadow-md px-2 rounded text-main-dark flex items-center justify-center gap-2 p-1 font-normal text-sm leading-none">
        <FiLoader className="animate-spin duration-100" size={16} />{" "}
        <span className="leading-[0px] mt-0.5">Loading</span>
      </div>
    );

  if (packages && Object.keys(packages).includes(pckg)) {
    return (
      <button
        className="bg-red-500 hover:bg-red-600 shadow-md px-2 rounded text-white flex items-center justify-center gap-2 p-1 font-normal text-sm leading-none"
        onClick={() => download.removePackage(pckg)}
      >
        <BiTrash size={16} />{" "}
        <span className="leading-[0px] mt-0.5">{t("UNINSTALL")}</span>
      </button>
    );
  }
  return (
    <button
      className="bg-blue-500 hover:bg-blue-600 px-2 rounded text-white shadow-md flex items-center gap-2 p-1 font-normal text-sm leading-none"
      onClick={() => download.addPackage(pckg, version)}
    >
      <BiDownload size={16} />
      <span className="leading-[0px] mt-0.5">{t("INSTALL")}</span>
    </button>
  );
};

export default DownloadPackageButton;
