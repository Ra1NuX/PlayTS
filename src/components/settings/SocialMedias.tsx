import { useTranslation } from "react-i18next";
import { Github, Linkedin, Twitter } from "lucide-react";

const SocialMedias = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row gap-5 justify-between items-center dark:text-gray-100 text-gray-900 text-sm">
      { t("SOCIAL_MEDIAS") }
      <article className="flex flex-row gap-3 items-center">
        <a href="https://github.com/Ra1NuX/PlayTS" title="github" target="_blank" rel="noreferrer" className="flex items-center justify-center dark:text-gray-400 text-gray-500 hover:text-accent-dark dark:hover:text-accent-dark transition-colors cursor-pointer">
          <Github className="w-5 h-5" />
        </a>
        <a href="https://www.linkedin.com/in/raimundo-martinez-nunez/" title="linkedin" target="_blank" rel="noreferrer" className="flex items-center justify-center dark:text-gray-400 text-gray-500 hover:text-accent-dark dark:hover:text-accent-dark transition-colors cursor-pointer">
          <Linkedin className="w-5 h-5" />
        </a>
        <a href="https://x.com/Ra1NuX" title="twitter" target="_blank" rel="noreferrer" className="flex items-center justify-center dark:text-gray-400 text-gray-500 hover:text-accent-dark dark:hover:text-accent-dark transition-colors cursor-pointer">
          <Twitter className="w-5 h-5" />
        </a>
      </article>
    </div>
  );
};

export default SocialMedias;
