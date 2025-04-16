import DownloadPackageButton from "../DownloadPackageButton";
import Kbd from "./Kbd";

const installCommands = [
  "npm i",
  "npm install",
  "yarn add",
  "yarn install",
  "pnpm add",
  "pnpm install",
  "bun add",
  "bun install",
];

const Bash = ({ code }: { code: string }) => {
  const isInstallCommand = installCommands.some((cmd) => code.startsWith(cmd));
  console.log({ isInstallCommand });
  let packageName = "";
  if (isInstallCommand) {
    // Quiero que cojas el paquete que se vaya a instalar en el comando y lo pongas en una variable
    // Y si se le pone un --save-dev o --save lo ignores

    const commandParts = code.split(" ");
    packageName = commandParts[commandParts.length - 1].replace(
      /--save(-dev)?$/,
      ""
    );
    // Si el packageName es un string y no es un string vacío
    const isPackageName = packageName && packageName.length > 0;
    console.log({ isPackageName, packageName });
  }

  return (
    <pre className="bg-gray-100/10 p-2 rounded my-2 break-words overflow-auto ">
      {code} 
      {isInstallCommand && <DownloadPackageButton pckg={packageName} version='latest' />}
    </pre>
  );
};

export default Bash;
