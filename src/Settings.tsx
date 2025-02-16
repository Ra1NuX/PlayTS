import SwitchTheme from "./components/settings/SwitchTheme";
import LanguageSelector from "./components/settings/LanguageSelector";
import SocialMedias from "./components/settings/SocialMedias";

interface SettingsProps {
  open?: () => void;
  close?: () => void;
}

const Settings = ({ close = Function }: SettingsProps) => {
  return (
    <main className="flex flex-col font-[roboto] font-medium">
      <nav className="flex place-content-end drag">
        <button
          onClick={() => {
            if(window.electron) {
              window.electron.close();
            } else {
              close();
            }
          }}
          className="hover:bg-[#ff0000dd] w-8 aspect-square hover:text-white"
        >
          <span>&times;</span>
        </button>
      </nav>
      <section className="p-4 space-y-2">
        <SwitchTheme />
        <LanguageSelector />
        <div className="w-full h-0.5 dark:bg-white/5 bg-main-light/10 !my-4 rounded-full shadow-md" />
        <SocialMedias /> 
      </section>
    </main>
  );
};

export default Settings;
