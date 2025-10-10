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
    console.log("🔧 Instalando dependencias...");
    const pkgContent = await container.fs.readFile("package.json", "utf-8");
    console.log("📦 package.json actual:", pkgContent);
    installProcess = await container.spawn("npm", ["install"]);
    await installProcess.exit;
    console.log("✅ Dependencias instaladas");
  }
};

const runCode = async (code: string, globalBookmarksCode: string = '') => {
  const container = await getWebContainer();

  await ensureDependenciesInstalled(container);

  const codeWithBookmarks = globalBookmarksCode 
    ? `${globalBookmarksCode}\n\n${code}`
    : code;

  const iCode = addInstructionsToCode(codeWithBookmarks);

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
          if (!data || !data.trim()) {
            return;
          }

          if (data.includes("Error") && !data.includes("{")) {
            const errorText = data.replace(/\x1B\[\d+m/g, '').trim();
            if (errorText && !errorText.includes("npm") && !errorText.startsWith("Node.js v")) {
              results.push({
                line: -1,
                time: 0,
                text: errorText.split("\n").slice(0, 2).join("\n"),
              });
            }
            return;
          }

          if (!data.includes("{")) {
            return;
          }

          const cleanData = cleanAnsiAndSpecialChars(data);
          const parsedResult = JSON.parse(cleanData);
          
          if (parsedResult && parsedResult.text !== undefined) {
            results.push(parsedResult);
          }
        } catch (e) {
          const errorData = data.replace(/\x1B\[\d+m/g, '').trim();
          
          if (errorData && !errorData.includes("npm") && !errorData.startsWith("Node.js v") && !errorData.includes("[0K") && !errorData.includes("[1G")) {
            const errorLines = errorData.split("\n").filter(line => 
              line.trim() && 
              !line.includes("at ") && 
              !line.includes("node:") && 
              !line.includes("file:///")
            );
            
            if (errorLines.length > 0) {
              results.push({
                line: -1,
                time: 0,
                text: errorLines[0],
              });
            }
          }
        }
      },
    })
  );

  await runProcess.exit;
  return results;
};

export const installPackage = async (name: string, version: string): Promise<boolean> => {
  try {
    console.log(`📥 Instalando ${name}@${version}...`);
    const container = await getWebContainer();
    
    const currentDeps = JSON.parse(localStorage.getItem("dependencies") || "{}");
    console.log("📦 Dependencias antes:", currentDeps);
    currentDeps[name] = version;
    console.log("📦 Dependencias después:", currentDeps);
    
    const newPackageJson = JSON.stringify({
      name: "example",
      version: "1.0.0",
      type: "module",
      main: "index.js",
      scripts: {
        start: "node index.js",
      },
      dependencies: currentDeps,
    }, null, 2);
    
    console.log("📝 Escribiendo package.json:", newPackageJson);
    await container.fs.writeFile("package.json", newPackageJson);
    
    console.log("🔄 Reseteando installProcess...");
    installProcess = null;
    
    console.log("⚙️ Ejecutando npm install...");
    const install = await container.spawn("npm", ["install"]);
    
    install.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log("📦 npm install output:", data);
        },
      })
    );
    
    await install.exit;
    console.log("✅ Instalación completada");
    installProcess = install;
    
    return true;
  } catch (error) {
    console.error("❌ Error en la instalación:", error);
    return false;
  }
};

export const uninstallPackage = async (name: string): Promise<boolean> => {
  try {
    const container = await getWebContainer();
    
    const currentDeps = JSON.parse(localStorage.getItem("dependencies") || "{}");
    delete currentDeps[name];
    
    await container.fs.writeFile(
      "package.json",
      JSON.stringify({
        name: "example",
        version: "1.0.0",
        type: "module",
        main: "index.js",
        scripts: {
          start: "node index.js",
        },
        dependencies: currentDeps,
      }, null, 2)
    );
    
    installProcess = null;
    const uninstall = await container.spawn("npm", ["install"]);
    await uninstall.exit;
    installProcess = uninstall;
    
    return true;
  } catch (error) {
    console.error("Error en la desinstalación:", error);
    return false;
  }
};

export default runCode;