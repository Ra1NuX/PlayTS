import SwitchTheme from "./components/settings/SwitchTheme";
import LanguageSelector from "./components/settings/LanguageSelector";

interface SettingsProps {
  open?: () => void;
  close?: () => void;
}

const Settings = ({ close = Function }: SettingsProps) => {
  return (
    <main className="flex flex-col">
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
      </section>
    </main>
  );
};

export default Settings;
