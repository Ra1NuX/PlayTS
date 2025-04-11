import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { addInstructionsToCode } from "./addInstructionsToCode";
import z from 'zod';

let webContainer: WebContainer | null = null;
let webContainerPromise: Promise<WebContainer> | null = null;
let installProcess: WebContainerProcess | null = null;

const cleanAnsiAndSpecialChars = (str: string): string => {
  const withoutAnsi = str.replace(/\x1B\[\d+m/g, '');
  return withoutAnsi.replace(/\r\n/g, '').trim()
    .replace(/''\s*''/g, "''")
    .replace(/''\s*([^']+)\s*''/g, "'$1'");
};

const getWebContainer = (): Promise<WebContainer> => {
  if (webContainer) {
    return Promise.resolve(webContainer);
  }

  if (!webContainerPromise) {
    webContainerPromise = WebContainer.boot().then(async (container) => {
      await container.mount({
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
              dependencies: JSON.parse(localStorage.getItem("dependencies") || "{}"),
            }),
          },
        },
        "example.txt": {
          file: { contents: '1\n2\n3\n4\n5' },
        },
      });

      webContainer = container;
      return container;
    });
  }

  return webContainerPromise;
};

const ensureDependenciesInstalled = async (container: WebContainer) => {
  if (!installProcess) {
    installProcess = await container.spawn("npm", ["install"]);
    await installProcess.exit;
  }
};

const runCode = async (code: string) => {
  const container = await getWebContainer();

  await ensureDependenciesInstalled(container);

  const iCode = addInstructionsToCode(code);

  const dataScheme = z.object({
    line: z.number(),
    text: z.string(),
    time: z.number(),
  });

  await container.fs.writeFile("index.js", iCode);

  const results: z.infer<typeof dataScheme>[] = [];

  const runProcess = await container.spawn("npm", ["run", "start"]);

  runProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        try {
          if (!data.includes("{")) {
            if (data.includes("Error")) {
              const error = data.split("Error: ")[1];
              results.push({
                line: -1,
                time: 0,
                text: error.split("\n")[0],
              });
            }
            return;
          }
          const cleanData = cleanAnsiAndSpecialChars(data);
          const parsedResult = JSON.parse(cleanData);
          results.push(parsedResult);
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
  console.log(results);

  return results;
};

export const installPackage = async (name: string, version: string): Promise<boolean> => {
  try {
    const container = await getWebContainer();
    const install = await container.spawn("npm", ["install", `${name}@${version}`]);
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
    const container = await getWebContainer();
    const uninstall = await container.spawn("npm", ["uninstall", name]);
    await uninstall.exit;

    const dependencies = JSON.parse(localStorage.getItem("dependencies") || "{}");
    delete dependencies[name];

    localStorage.setItem("dependencies", JSON.stringify(dependencies));

    return true;
  } catch (error) {
    console.error("Error en la desinstalación:", error);
    return false;
  }
};

export default runCode;