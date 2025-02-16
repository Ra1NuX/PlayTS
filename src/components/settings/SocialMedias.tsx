import { useTranslation } from "react-i18next";
import { FaGithub, FaLinkedin  } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const SocialMedias = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row gap-5 justify-between">
      { t("SOCIAL_MEDIAS") }
      <article className="flex flex-row gap-2 justify-between dark:text-white text-main-light">
        <a href="https://github.com/Ra1NuX/OpenTS" title="github" target="_blank" rel="noreferrer" className="flex items-center justify-center drop-shadow-md transition-transform hover:scale-[120%] hover:text-[#171515]">
          <FaGithub size={25} />
        </a>
        <a href="https://www.linkedin.com/in/raimundo-martinez-nunez/" title="linkedin" target="_blank" rel="noreferrer" className="flex items-center justify-center drop-shadow-md transition-transform hover:scale-[120%] hover:text-[#0077B5]">
          <FaLinkedin size={25} />
        </a>
        <a href="https://x.com/Ra1NuX" title="twitter" target="_blank" rel="noreferrer" className="flex items-center justify-center drop-shadow-md transition-transform hover:scale-[120%] hover:text-[#000000]">
          <FaXTwitter size={25} />
        </a>
      </article>
    </div>
  );
};

export default SocialMedias;
