/**
 * Utility functions, interfaces, and constants for code execution.
 */

import { EXECUTION } from '../src/constants/execution';

// ── Interfaces ──────────────────────────────────────────────────────────────

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

export interface CommandResult {
  code: number | null;
  stdout: string;
  stderr: string;
  spawnError: NodeJS.ErrnoException | null;
}

export interface NpmExecutionPlan {
  command: string;
  baseArgs: string[];
  runAsNode: boolean;
  source: 'embedded' | 'system';
}

// ── Constants (re-exported from shared constants) ───────────────────────────

export const EXECUTION_TIMEOUT_MS = EXECUTION.TIMEOUT_MS;
export const MAX_OLD_SPACE_SIZE_MB = EXECUTION.MAX_OLD_SPACE_SIZE_MB;

// ── Utility functions ───────────────────────────────────────────────────────

export function stripAnsiCodes(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Extracts a clean error message from Node.js stderr output,
 * removing internal file paths, stack traces, and instrumented code references.
 */
export function extractErrorMessage(stderr: string): string {
  const cleaned = stripAnsiCodes(stderr).trim();
  const lines = cleaned.split('\n');

  // Find the error line index (e.g. "ReferenceError: foo is not defined")
  const errorIdx = lines.findIndex(line => /^[A-Z]\w*Error:/.test(line.trim()));

  if (errorIdx !== -1) {
    const result: string[] = [lines[errorIdx].trim()];

    // Include a few stack trace lines after the error, cleaning internal paths
    const MAX_STACK_LINES = EXECUTION.MAX_STACK_LINES;
    let stackCount = 0;
    for (let i = errorIdx + 1; i < lines.length && stackCount < MAX_STACK_LINES; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) continue;
      if (/^Node\.js v/.test(trimmed)) break;
      if (trimmed.startsWith('at ')) {
        // Skip references to the instrumented file internals
        if (trimmed.includes('node:internal/')) continue;
        // Clean up file paths to be more readable
        const cleanLine = trimmed.replace(/file:\/\/\/tmp\/runts-execution\/\d+\//, '');
        result.push('  ' + cleanLine);
        stackCount++;
      }
    }

    return result.join('\n');
  }

  // Fallback: filter out noise but keep useful lines
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^file:\/\/\//.test(trimmed)) return false;
    if (/^\^+$/.test(trimmed)) return false;
    if (/^Node\.js v/.test(trimmed)) return false;
    if (trimmed.includes('node:internal/')) return false;
    return true;
  });

  return filtered.join('\n').trim() || cleaned;
}

export function createTranspiledToOriginalLineMap(transpiledCode: string): Map<number, number> {
  const mapping = new Map<number, number>();
  const lines = transpiledCode.split('\n');
  let currentOriginalLine = 0;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const markerMatch = line.match(/__RUNTS_LINE_(\d+)__/);
    if (markerMatch && markerMatch[1]) {
      currentOriginalLine = Number(markerMatch[1]);
    }

    if (currentOriginalLine > 0) {
      mapping.set(index + 1, currentOriginalLine);
    }
  }

  return mapping;
}

export function buildSpawnEnv(npmCacheDir: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (
      typeof value === 'string' &&
      key.length > 0 &&
      !key.includes('\u0000') &&
      !key.includes('=') &&
      !value.includes('\u0000')
    ) {
      env[key] = value;
    }
  }
  env.npm_config_cache = npmCacheDir;
  env.npm_config_update_notifier = 'false';
  return env;
}

export function buildSpawnError(
  processName: string,
  error: NodeJS.ErrnoException,
  command: string,
  args: string[],
  tempDir: string
): Error {
  const code = error.code || 'UNKNOWN';
  const syscall = error.syscall || 'spawn';
  const spawnPath = (error as NodeJS.ErrnoException & { path?: string }).path || command;
  const argText = args.join(' ');
  return new Error(
    `Falló ${processName} (${code}) en ${syscall}. command="${command}" args="${argText}" path="${spawnPath}" cwd="${tempDir}".`
  );
}

export function buildInstallError(result: CommandResult, source: 'embedded' | 'system'): Error {
  if (source === 'embedded' && result.spawnError?.code === 'ENOENT') {
    return new Error('No se encontró el runtime npm embebido dentro de la aplicación.');
  }

  if (result.spawnError?.code === 'ENOENT') {
    return new Error('No se encontró npm en el sistema donde corre la app en producción.');
  }

  if (result.spawnError?.code === 'EACCES') {
    return new Error('npm existe pero no tiene permisos de ejecución en este entorno.');
  }

  if (result.spawnError?.code === 'EINVAL') {
    return new Error('El sistema rechazó los argumentos o el entorno al ejecutar npm (spawn EINVAL).');
  }

  const stderrLines = result.stderr.split('\n').slice(-20).join('\n').trim();
  const stdoutLines = result.stdout.split('\n').slice(-20).join('\n').trim();
  const details = stderrLines || stdoutLines || 'Sin salida de npm';
  return new Error(`npm install terminó con código ${result.code}. Detalle: ${details}`);
}
