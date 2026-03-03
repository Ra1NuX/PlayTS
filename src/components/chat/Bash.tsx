import DownloadPackageButton from "../DownloadPackageButton";

const installCommandPrefixes = [
  "npm i",
  "npm install",
  "yarn add",
  "yarn install",
  "pnpm add",
  "pnpm install",
  "bun add",
  "bun install",
];

const shellCommandPrefixes = [
  "npm ",
  "npx ",
  "yarn ",
  "pnpm ",
  "bun ",
  "cd ",
  "ls ",
  "git ",
  "node ",
  "echo ",
  "mkdir ",
  "rm ",
  "cp ",
  "mv ",
  "cat ",
  "curl ",
  "wget ",
  "./",
];

function isInstallCommand(code: string): boolean {
  return installCommandPrefixes.some((cmd) => code.startsWith(cmd));
}

function isShellCommand(code: string): boolean {
  const trimmed = code.trim();
  return (
    isInstallCommand(code) ||
    shellCommandPrefixes.some((prefix) => trimmed.startsWith(prefix))
  );
}

function extractPackageName(code: string): string {
  const parts = code.trim().split(/\s+/).filter((p) => !p.startsWith("-"));
  const afterAdd = ["add", "i", "install"].some((verb) => parts.includes(verb));
  const idx = afterAdd ? parts.findIndex((p) => p === "add" || p === "i" || p === "install") + 1 : 1;
  const name = parts[idx] ?? "";
  return name.replace(/--save(-dev)?$/, "");
}

const inlineClasses =
  "bg-main-light font-bold px-0.5 -mb-1.5 border text-xs border-gray-200 dark:border-divider-dark rounded-md break-words overflow-auto inline-block";
const blockClasses =
  "bg-main-light font-bold p-2 border font-mono m-2 border-gray-200 dark:border-divider-dark rounded-md break-words overflow-auto block";

const Bash = ({ code }: { code: string }) => {
  const install = isInstallCommand(code);
  const isCommand = isShellCommand(code);
  const packageName = install ? extractPackageName(code) : "";

  const className = isCommand ? blockClasses : inlineClasses;

  return (
    <pre className={className}>
      {code}
      {install && packageName ? (
        <DownloadPackageButton pckg={packageName} version="latest" />
      ) : null}
    </pre>
  );
};

export default Bash;
