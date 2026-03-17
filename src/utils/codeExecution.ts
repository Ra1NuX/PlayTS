/**
 * Code execution facade - delegates to the appropriate executor
 * based on the detected runtime environment (ICP or WebContainer).
 */

import { getEnvironmentInfo } from './environment';
import { formatError } from './errorUtils';
import { executeCodeViaICP, installPackageViaICP, uninstallPackageViaICP } from './execution/icpExecutor';
import {
  executeCodeViaWebContainer,
  installPackageViaWebContainer,
  uninstallPackageViaWebContainer,
} from './execution/webContainerExecutor';

// ===== PUBLIC INTERFACES =====

export interface ExecutionResult {
  line: number;
  text: string;
  time: number;
}

export interface ExecutionOptions {
  code: string;
  globalBookmarksCode?: string;
  dependencies?: Record<string, string>;
  envVars?: Record<string, string>;
}

export interface PackageOperationResult {
  success: boolean;
  error?: string;
}

// ===== HELPERS =====

export const buildEnvVarsInjection = (envVars: Record<string, string>): string => {
  if (!envVars || Object.keys(envVars).length === 0) return '';
  return (
    Object.entries(envVars)
      .map(([key, value]) => `process.env[${JSON.stringify(key)}] = ${JSON.stringify(value)};`)
      .join('\n') + '\n'
  );
};

export const buildFullCode = (options: ExecutionOptions): string => {
  const envInjection = buildEnvVarsInjection(options.envVars ?? {});
  const bookmarks = options.globalBookmarksCode ?? '';
  const parts = [envInjection, bookmarks, options.code].filter(Boolean);
  return parts.join('\n\n');
};

// ===== FACADE FUNCTIONS =====

/**
 * Executes code using the appropriate method for the current environment
 */
export const executeCode = async (options: ExecutionOptions): Promise<ExecutionResult[]> => {
  const env = getEnvironmentInfo();

  if (env.executionMethod === 'icp') {
    const patchedOptions: ExecutionOptions = {
      ...options,
      code: buildFullCode(options),
      globalBookmarksCode: '',
    };
    return await executeCodeViaICP(
      patchedOptions,
      (opts) => executeCodeViaWebContainer(opts, buildEnvVarsInjection)
    );
  }

  return await executeCodeViaWebContainer(options, buildEnvVarsInjection);
};

/**
 * Installs a package using the appropriate method for the current environment
 */
export const installPackage = async (
  name: string,
  version: string
): Promise<PackageOperationResult> => {
  const env = getEnvironmentInfo();

  if (env.executionMethod === 'icp') {
    return await installPackageViaICP(name, version, installPackageViaWebContainer);
  }

  try {
    const { installPackage: installPkg } = await import('./runCode');
    const success = await installPkg(name, version);
    return { success };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
};

/**
 * Uninstalls a package using the appropriate method for the current environment
 */
export const uninstallPackage = async (name: string): Promise<PackageOperationResult> => {
  const env = getEnvironmentInfo();

  if (env.executionMethod === 'icp') {
    return await uninstallPackageViaICP(name, uninstallPackageViaWebContainer);
  }

  try {
    const { uninstallPackage: uninstallPkg } = await import('./runCode');
    const success = await uninstallPkg(name);
    return { success };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
};
