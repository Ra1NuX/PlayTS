/**
 * WebContainer implementations for code execution and package management
 */

import { getWebContainer } from '../runCode';
import { addInstructionsToCode } from '../addInstructionsToCode';
import { formatError } from '../errorUtils';
import { STORAGE_KEYS } from '../../constants/localStorage';
import { WEB_PACKAGE_JSON_TEMPLATE } from '../../constants/execution';
import type { ExecutionOptions, ExecutionResult, PackageOperationResult } from '../codeExecution';

/**
 * Parses WebContainer process output into execution results.
 * Shared between runCode.ts and this executor.
 */
export const parseProcessOutput = (
  data: string,
  results: ExecutionResult[]
): void => {
  if (!data || !data.trim()) return;

  if (data.includes('Error') && !data.includes('{')) {
    const errorText = data.replace(/\x1B\[\d+m/g, '').trim();
    if (errorText && !errorText.includes('npm') && !errorText.startsWith('Node.js v')) {
      results.push({
        line: -1,
        time: 0,
        text: errorText.split('\n').slice(0, 2).join('\n'),
      });
    }
    return;
  }

  if (!data.includes('{')) return;

  const cleanData = data.replace(/\x1B\[\d+m/g, '').trim();
  const parsedResult = JSON.parse(cleanData);

  if (parsedResult && parsedResult.text !== undefined) {
    results.push(parsedResult);
  }
};

/**
 * Executes code via WebContainers in the browser
 */
export const executeCodeViaWebContainer = async (
  options: ExecutionOptions,
  buildEnvVarsInjection: (envVars: Record<string, string>) => string
): Promise<ExecutionResult[]> => {
  const container = await getWebContainer();

  const codeToProcess = options.globalBookmarksCode
    ? `${options.globalBookmarksCode}\n\n${options.code}`
    : options.code;

  const iCode = addInstructionsToCode(codeToProcess);

  const envInjection = buildEnvVarsInjection(options.envVars ?? {});
  const finalCode = envInjection ? `${envInjection}\n${iCode}` : iCode;

  await container.fs.writeFile('index.js', finalCode);

  const results: ExecutionResult[] = [];

  const runProcess = await container.spawn('npm', ['run', 'start']);

  runProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        try {
          parseProcessOutput(data, results);
        } catch (e) {
          const errorData = data.replace(/\x1B\[\d+m/g, '').trim();
          if (errorData && !errorData.includes('npm') && !errorData.startsWith('Node.js v')) {
            results.push({
              line: -1,
              time: 0,
              text: errorData.split('\n').slice(0, 2).join('\n'),
            });
          }
        }
      },
    })
  );

  await runProcess.exit;
  return results;
};

/**
 * Updates the WebContainer package.json and runs npm install
 */
const updateAndInstall = async (
  deps: Record<string, string>
): Promise<void> => {
  const container = await getWebContainer();

  const newPackageJson = JSON.stringify(
    { ...WEB_PACKAGE_JSON_TEMPLATE, dependencies: deps },
    null,
    2
  );

  await container.fs.writeFile('package.json', newPackageJson);

  const install = await container.spawn('npm', ['install']);

  install.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log('npm install output:', data);
      },
    })
  );

  await install.exit;
};

/**
 * Installs a package via WebContainers in the browser
 */
export const installPackageViaWebContainer = async (
  name: string,
  version: string
): Promise<PackageOperationResult> => {
  console.log('Instalando paquete via WebContainers (Web)');

  try {
    const currentDeps = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPENDENCIES) || '{}');
    currentDeps[name] = version;

    await updateAndInstall(currentDeps);

    localStorage.setItem(STORAGE_KEYS.DEPENDENCIES, JSON.stringify(currentDeps));
    return { success: true };
  } catch (error) {
    console.error('Error en instalacion:', error);
    return { success: false, error: formatError(error) };
  }
};

/**
 * Uninstalls a package via WebContainers in the browser
 */
export const uninstallPackageViaWebContainer = async (
  name: string
): Promise<PackageOperationResult> => {
  console.log('Desinstalando paquete via WebContainers (Web)');

  try {
    const currentDeps = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPENDENCIES) || '{}');
    delete currentDeps[name];

    await updateAndInstall(currentDeps);

    localStorage.setItem(STORAGE_KEYS.DEPENDENCIES, JSON.stringify(currentDeps));
    return { success: true };
  } catch (error) {
    console.error('Error en desinstalacion:', error);
    return { success: false, error: formatError(error) };
  }
};
