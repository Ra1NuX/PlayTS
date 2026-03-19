/**
 * ICP (Electron) implementations for code execution and package management
 */

import { formatError } from '../errorUtils';
import type { ExecutionOptions, ExecutionResult, PackageOperationResult } from '../codeExecution';

/**
 * Executes code via ICP in Electron
 */
export const executeCodeViaICP = async (
  options: ExecutionOptions,
  fallback: (options: ExecutionOptions) => Promise<ExecutionResult[]>
): Promise<ExecutionResult[]> => {
  console.log('Ejecutando codigo via ICP (Electron)');

  if (typeof window !== 'undefined' && window.electron) {
    try {
      return await window.electron.executeCode(options);
    } catch (error) {
      console.error('Error en API de Electron:', error);
      throw new Error(`Error en API de Electron: ${formatError(error)}`);
    }
  } else {
    console.warn('API de Electron no disponible, usando WebContainers como fallback');
    return await fallback(options);
  }
};

/**
 * Installs a package via ICP in Electron
 */
export const installPackageViaICP = async (
  name: string,
  version: string,
  fallback: (name: string, version: string) => Promise<PackageOperationResult>
): Promise<PackageOperationResult> => {
  console.log('Instalando paquete via ICP (Electron)');

  if (typeof window !== 'undefined' && window.electron) {
    try {
      return await window.electron.installPackage(name, version);
    } catch (error) {
      console.error('Error en API de Electron:', error);
      return { success: false, error: `Error en API de Electron: ${formatError(error)}` };
    }
  } else {
    console.warn('API de Electron no disponible, usando WebContainers como fallback');
    return await fallback(name, version);
  }
};

/**
 * Uninstalls a package via ICP in Electron
 */
export const uninstallPackageViaICP = async (
  name: string,
  fallback: (name: string) => Promise<PackageOperationResult>
): Promise<PackageOperationResult> => {
  console.log('Desinstalando paquete via ICP (Electron)');

  if (typeof window !== 'undefined' && window.electron) {
    try {
      return await window.electron.uninstallPackage(name);
    } catch (error) {
      console.error('Error en API de Electron:', error);
      return { success: false, error: `Error en API de Electron: ${formatError(error)}` };
    }
  } else {
    console.warn('API de Electron no disponible, usando WebContainers como fallback');
    return await fallback(name);
  }
};
