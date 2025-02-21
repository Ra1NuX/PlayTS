import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { addInstructionsToCode } from "./addInstructionsToCode";

let webContainer: WebContainer;
let installProcess: WebContainerProcess;

const runCode = async (code: string) => {
  if (!webContainer) {
    webContainer = await WebContainer.boot();
    await webContainer.mount({
      "package.json": {
        file: {
          contents: JSON.stringify({
            name: "example",
            version: "1.0.0",
            type: "module",
            main: "index.js",
            scripts: {
              start: "node index.js",
            },
            dependencies: {
              ...JSON.parse(localStorage.getItem("dependencies") || "{}"),
            },
          }),
        },
      },
    });
  }

  if (!installProcess) {
    installProcess = await webContainer.spawn("npm", ["install"]);
    await installProcess.exit;
  }

  localStorage.setItem("code", btoa(code));
  const iCode = addInstructionsToCode(code);

  webContainer.fs.writeFile("index.js", iCode);
  let results: { text: string; line: number; time: number }[] = [];
  const runProcess = await webContainer.spawn("npm", ["run", "start"]);
  runProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        try {
          if (!data.includes("{")) {
            results.push({
              text: data.toString().split("\n")[0],
              line: -1,
              time: 0,
            });
            return;
          }
          const r = JSON.parse(data);
          results.push(r);
          return;
        } catch (e) {
          const { message, stack } = e as Error;
          results.push({
            line: -1,
            time: 0,
            text: message || stack || JSON.stringify(e),
          });
        }
      },
    })
  );
  await runProcess.exit;

  return results;
};

export const installPackage = async (
  name: string,
  version: string
): Promise<boolean> => {
  try {
    const install = await webContainer.spawn("npm", [
      "install",
      name + "@" + version,
    ]);

    await install.exit;

    localStorage.setItem(
      "dependencies",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("dependencies") || "{}"),
        [name]: version,
      })
    );

    return true;
  } catch (error) {
    console.error("Error en la instalación:", error);
    return false;
  }
};

export const uninstallPackage = async (name: string): Promise<boolean> => {
  try {
    const uninstaller = await webContainer.spawn("npm", ["uninstall", name]);
    await uninstaller.exit;

    const dependencies = JSON.parse(
      localStorage.getItem("dependencies") || "{}"
    );
    delete dependencies[name];

    localStorage.setItem("dependencies", JSON.stringify(dependencies));

    return true;
  } catch (error) {
    console.error("Error en la desinstalación:", error);
    return false;
  }
};

export default runCode;
