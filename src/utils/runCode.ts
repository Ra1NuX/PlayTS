import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import {inspect} from 'util'
import { addInstructionsToCode } from "./addInstructionsToCode";

let webContainer: WebContainer;
let installProcess: WebContainerProcess;

const runCode = async (code: string) => {
  if (!webContainer) {
    console.log("booting");
    webContainer = await WebContainer.boot();
    console.log("mounted");
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
              "object-inspect": "^1.13.3",
              ...JSON.parse(localStorage.getItem("dependencies") || "{}"),
            },
          }),
        },
      },
      ".npmrc": {
        file: {
          contents: "loglevel=silent",
        },
      },
    });
  }

  if (!installProcess) {
    console.log("installing");
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
              line: 0,
              time: 0,
            });
            return;
          }

          const r = JSON.parse(data);
          results.push(r);

          // const isText = typeof r.text === "string";

          // if (isText) {
          //   let text = r.text as string;

          //   if (!text.includes("'")) {
          //     text = `'${text}'`;
          //   }
          //   results.push({
          //     ...r,
          //     text,
          //   });
          //   return;
          // }

          // if (Array.isArray(r.text)) {
          //   let array = r.text;
          //   if (array.length > 9999) {
          //     array = [
          //       ...array.slice(0, 9999),
          //       `... ${array.length - 9999} more items`,
          //     ];
          //   }
          //   results.push({
          //     ...r,
          //     text: objectInspect(array),
          //   });
          //   return;
          // }

          // results.push({
          //   ...r,
          //   text: objectInspect(r.text, { indent: "\t" }),
          // });
          return;
        } catch (e) {
          const { message, stack } = e as Error;

          results.push({
            line: 0,
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
