/**
 * Sistema de ejecución de código que detecta automáticamente
 * si usar ICP (Electron) o WebContainers (Web)
 */

import { getEnvironmentInfo } from './environment';
import { addInstructionsToCode } from "./addInstructionsToCode";
import { getWebContainer } from "./runCode";

// Interfaces para los diferentes métodos de ejecución
export interface ExecutionResult {
  line: number;
  text: string;
  time: number;
}

export interface ExecutionOptions {
  code: string;
  globalBookmarksCode?: string;
  dependencies?: Record<string, string>;
}

export interface PackageOperationResult {
  success: boolean;
  error?: string;
}

/**
 * Ejecuta código usando el método apropiado según el entorno
 */
export const executeCode = async (options: ExecutionOptions): Promise<ExecutionResult[]> => {
  const env = getEnvironmentInfo();

  console.log(`🚀 Ejecutando código usando: ${env.executionMethod}`);
  console.log('🔍 Información del entorno:', {
    isElectron: env.isElectron,
    isWeb: env.isWeb,
    platform: env.platform,
    executionMethod: env.executionMethod,
    capabilities: env.capabilities
  });

  if (env.executionMethod === 'icp') {
    console.log('📡 Ejecutando via ICP (Electron)');
    return await executeCodeViaICP(options);
  } else {
    // Usar WebContainers para web
    console.log('🌐 Ejecutando via WebContainers (Web)');
    return await executeCodeViaWebContainer(options);
  }
};

/**
 * Instala un paquete usando el método apropiado según el entorno
 */
export const installPackage = async (name: string, version: string): Promise<PackageOperationResult> => {
  const env = getEnvironmentInfo();
  
  console.log(`📦 Instalando ${name}@${version} usando: ${env.executionMethod}`);
  
  if (env.executionMethod === 'icp') {
    // TODO: Implementar instalación via ICP
    console.log('📡 Instalando via ICP (Electron)');
    return await installPackageViaICP(name, version);
  } else {
    // Usar WebContainers para web
    console.log('🌐 Instalando via WebContainers (Web)');
    try {
      const { installPackage } = await import('./runCode');
      const success = await installPackage(name, version);
      return { success };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }
};

/**
 * Desinstala un paquete usando el método apropiado según el entorno
 */
export const uninstallPackage = async (name: string): Promise<PackageOperationResult> => {
  const env = getEnvironmentInfo();
  
  console.log(`🗑️ Desinstalando ${name} usando: ${env.executionMethod}`);
  
  if (env.executionMethod === 'icp') {
    // TODO: Implementar desinstalación via ICP
    console.log('📡 Desinstalando via ICP (Electron)');
    return await uninstallPackageViaICP(name);
  } else {
    // Usar WebContainers para web
    console.log('🌐 Desinstalando via WebContainers (Web)');
    try {
      const { uninstallPackage } = await import('./runCode');
      const success = await uninstallPackage(name);
      return { success };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }
};

// ===== IMPLEMENTACIONES ICP (REAL) =====

/**
 * Ejecuta código via ICP en Electron
 */
const executeCodeViaICP = async (options: ExecutionOptions): Promise<ExecutionResult[]> => {
  console.log('📡 Ejecutando código via ICP (Electron)');
  
  // Verificar si estamos en Electron y tenemos la API disponible
  if (typeof window !== 'undefined' && (window as any).electron) {
    try {
      return await (window as any).electron.executeCode(options);
    } catch (error) {
      console.error('❌ Error en API de Electron:', error);
      throw new Error(`Error en API de Electron: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  } else {
    console.warn('⚠️ API de Electron no disponible, usando WebContainers como fallback');
    // Fallback a WebContainers si la API de Electron no está disponible
    return await executeCodeViaWebContainer(options);
  }
};

/**
 * Instala paquete via ICP en Electron
 */
const installPackageViaICP = async (name: string, version: string): Promise<PackageOperationResult> => {
  console.log('📡 Instalando paquete via ICP (Electron)');
  
  // Verificar si estamos en Electron y tenemos la API disponible
  if (typeof window !== 'undefined' && (window as any).electron) {
    try {
      return await (window as any).electron.installPackage(name, version);
    } catch (error) {
      console.error('❌ Error en API de Electron:', error);
      return { success: false, error: `Error en API de Electron: ${error instanceof Error ? error.message : 'Error desconocido'}` };
    }
  } else {
    console.warn('⚠️ API de Electron no disponible, usando WebContainers como fallback');
    // Fallback a WebContainers si la API de Electron no está disponible
    return await installPackageViaWebContainer(name, version);
  }
};

/**
 * Desinstala paquete via ICP en Electron
 */
const uninstallPackageViaICP = async (name: string): Promise<PackageOperationResult> => {
  console.log('📡 Desinstalando paquete via ICP (Electron)');
  
  // Verificar si estamos en Electron y tenemos la API disponible
  if (typeof window !== 'undefined' && (window as any).electron) {
    try {
      return await (window as any).electron.uninstallPackage(name);
    } catch (error) {
      console.error('❌ Error en API de Electron:', error);
      return { success: false, error: `Error en API de Electron: ${error instanceof Error ? error.message : 'Error desconocido'}` };
    }
  } else {
    console.warn('⚠️ API de Electron no disponible, usando WebContainers como fallback');
    // Fallback a WebContainers si la API de Electron no está disponible
    return await uninstallPackageViaWebContainer(name);
  }
};

// ===== IMPLEMENTACIONES WEBCONTAINER =====

/**
 * Ejecuta código via WebContainers en Web
 */
const executeCodeViaWebContainer = async (options: ExecutionOptions): Promise<ExecutionResult[]> => {
  console.log('🌐 Ejecutando código via WebContainers (Web)');
  
  const container = await getWebContainer();
  
  // Combinar código de bookmarks con código del usuario
  const fullCode = options.globalBookmarksCode 
    ? `${options.globalBookmarksCode}\n\n${options.code}`
    : options.code;

  const iCode = addInstructionsToCode(fullCode);
  
  await container.fs.writeFile("index.js", iCode);
  
  const results: ExecutionResult[] = [];
  
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

          const cleanData = data.replace(/\x1B\[\d+m/g, '').trim();
          const parsedResult = JSON.parse(cleanData);
          
          if (parsedResult && parsedResult.text !== undefined) {
            results.push(parsedResult);
          }
        } catch (e) {
          const errorData = data.replace(/\x1B\[\d+m/g, '').trim();
          if (errorData && !errorData.includes("npm") && !errorData.startsWith("Node.js v")) {
            results.push({
              line: -1,
              time: 0,
              text: errorData.split("\n").slice(0, 2).join("\n"),
            });
          }
        }
      }
    })
  );

  await runProcess.exit;
  return results;
};

/**
 * Instala paquete via WebContainers en Web
 */
const installPackageViaWebContainer = async (name: string, version: string): Promise<PackageOperationResult> => {
  console.log('🌐 Instalando paquete via WebContainers (Web)');
  
  try {
    const container = await getWebContainer();
    
    const currentDeps = JSON.parse(localStorage.getItem("dependencies") || "{}");
    currentDeps[name] = version;
    
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
    
    await container.fs.writeFile("package.json", newPackageJson);
    
    const install = await container.spawn("npm", ["install"]);
    
    install.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log("📦 npm install output:", data);
        },
      })
    );
    
    await install.exit;
    
    // Actualizar localStorage
    localStorage.setItem("dependencies", JSON.stringify(currentDeps));
    
    return { success: true };
  } catch (error) {
    console.error("❌ Error en instalación:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

/**
 * Desinstala paquete via WebContainers en Web
 */
const uninstallPackageViaWebContainer = async (name: string): Promise<PackageOperationResult> => {
  console.log('🌐 Desinstalando paquete via WebContainers (Web)');
  
  try {
    const container = await getWebContainer();
    
    const currentDeps = JSON.parse(localStorage.getItem("dependencies") || "{}");
    delete currentDeps[name];
    
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
    
    await container.fs.writeFile("package.json", newPackageJson);
    
    const install = await container.spawn("npm", ["install"]);
    
    install.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log("📦 npm install output:", data);
        },
      })
    );
    
    await install.exit;
    
    // Actualizar localStorage
    localStorage.setItem("dependencies", JSON.stringify(currentDeps));
    
    return { success: true };
  } catch (error) {
    console.error("❌ Error en desinstalación:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};
