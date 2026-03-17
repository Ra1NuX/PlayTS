/**
 * Node.js process spawning and output parsing for code execution.
 */

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import {
  ExecutionResult,
  EXECUTION_TIMEOUT_MS,
  MAX_OLD_SPACE_SIZE_MB,
  stripAnsiCodes,
  extractErrorMessage,
  buildSpawnEnv,
  buildSpawnError,
} from './executionUtils';

// ── Output parsing helpers ──────────────────────────────────────────────────

/**
 * Parses a single raw output line into an ExecutionResult, applying
 * line-number mapping from transpiled → original source.
 */
export function parseOutputLine(
  rawLine: string,
  userCodeStartLine: number,
  transpiledToOriginalLineMap: Map<number, number>
): ExecutionResult | null {
  const cleanLine = stripAnsiCodes(rawLine).trim();
  if (!cleanLine) return null;

  try {
    const parsed = JSON.parse(cleanLine) as ExecutionResult;
    if (parsed.line !== undefined && parsed.text !== undefined && parsed.time !== undefined) {
      const userTranspiledLine = parsed.line >= userCodeStartLine
        ? parsed.line - userCodeStartLine + 1
        : parsed.line;
      const mappedLine = transpiledToOriginalLineMap.get(userTranspiledLine) ?? userTranspiledLine;
      return {
        ...parsed,
        line: mappedLine > 0 ? mappedLine : 1
      };
    }
  } catch {
    /* non-JSON output, pushed as plain text */
    return {
      line: 1,
      text: cleanLine,
      time: 0
    };
  }
  return null;
}

/**
 * Parses any pending output remaining in the stdout buffer when the
 * process closes.
 */
export function parsePendingOutput(
  buffer: string,
  userCodeStartLine: number,
  transpiledToOriginalLineMap: Map<number, number>
): ExecutionResult | null {
  const pendingOutput = stripAnsiCodes(buffer).trim();
  if (!pendingOutput) return null;
  return parseOutputLine(pendingOutput, userCodeStartLine, transpiledToOriginalLineMap);
}

// ── Process handler setup ───────────────────────────────────────────────────

interface ProcessHandlerContext {
  results: ExecutionResult[];
  stdoutBuffer: string;
  userCodeStartLine: number;
  transpiledToOriginalLineMap: Map<number, number>;
}

/**
 * Attaches stdout/stderr/close/error handlers to a child process.
 * Returns a promise that resolves when the process closes (or rejects on
 * unrecoverable spawn errors).
 */
function setupProcessHandlers(
  child: ChildProcess,
  ctx: ProcessHandlerContext,
  opts: {
    timedOut: () => boolean;
    clearTimeout: () => void;
    onFallback?: (err: NodeJS.ErrnoException) => void;
    tempDir: string;
    command: string;
    args: string[];
    processName: string;
  }
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    child.stdout!.on('data', (data) => {
      const output = data.toString();
      ctx.stdoutBuffer += output;
      const outputLines = ctx.stdoutBuffer.split('\n');
      ctx.stdoutBuffer = outputLines.pop() || '';

      for (const rawLine of outputLines) {
        const result = parseOutputLine(rawLine, ctx.userCodeStartLine, ctx.transpiledToOriginalLineMap);
        if (result) ctx.results.push(result);
      }
    });

    child.stderr!.on('data', (data) => {
      const error = data.toString();
      console.error('📤 Error:', error);
      const cleanError = extractErrorMessage(error);
      ctx.results.push({ line: -1, text: cleanError, time: 0 });
    });

    child.on('close', (code) => {
      opts.clearTimeout();
      if (opts.timedOut()) return; // Already resolved by timeout handler

      // Process any pending stdout
      const pending = parsePendingOutput(ctx.stdoutBuffer, ctx.userCodeStartLine, ctx.transpiledToOriginalLineMap);
      if (pending) ctx.results.push(pending);

      if (code === 0) {
        resolve();
      } else {
        // Resolve with captured stderr/stdout instead of rejecting
        if (ctx.results.length === 0) {
          ctx.results.push({
            line: -1,
            text: `Error: Process exited with code ${code}`,
            time: 0
          });
        }
        resolve();
      }
    });

    child.on('error', (error) => {
      opts.clearTimeout();
      if (opts.timedOut()) return;
      const err = error as NodeJS.ErrnoException;

      if (err.code === 'EINVAL' && opts.onFallback) {
        opts.onFallback(err);
        return;
      }

      if (err.code === 'ENOENT') {
        reject(new Error('Could not start the Node runtime to execute code.'));
        return;
      }

      if (err.code === 'EACCES') {
        reject(new Error('No permissions to start the Node runtime in the temporary directory.'));
        return;
      }

      reject(buildSpawnError(opts.processName, err, opts.command, opts.args, opts.tempDir));
    });
  });
}

// ── Spawn helper ────────────────────────────────────────────────────────────

function spawnNodeProcess(command: string, args: string[], shell: boolean, tempDir: string) {
  const npmCacheDir = path.join(tempDir, '.npm-cache');
  const env = buildSpawnEnv(npmCacheDir);
  if (process.versions.electron) {
    env.ELECTRON_RUN_AS_NODE = '1';
  }
  return spawn(command, args, {
    cwd: tempDir,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell,
    env
  });
}

// ── Main entry point ────────────────────────────────────────────────────────

export function runNodeProcess(
  tempDir: string,
  indexJsPath: string,
  userCodeStartLine: number,
  transpiledToOriginalLineMap: Map<number, number>
): Promise<ExecutionResult[]> {
  return new Promise((resolve, reject) => {
    const results: ExecutionResult[] = [];
    let timedOut = false;

    const primaryCommand = process.versions.electron ? process.execPath : 'node';
    const memFlag = `--max-old-space-size=${MAX_OLD_SPACE_SIZE_MB}`;
    const primaryArgs = process.versions.electron
      ? [memFlag, indexJsPath]
      : [memFlag, 'index.js'];
    const fallbackCommand = process.platform === 'win32' ? 'node.exe' : 'node';
    const fallbackArgs = [memFlag, 'index.js'];

    const child = spawnNodeProcess(primaryCommand, primaryArgs, false, tempDir);

    let timeoutHandle: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGKILL'); } catch { /* ignore */ }
      results.push({
        line: -1,
        text: `Execution timed out after ${EXECUTION_TIMEOUT_MS / 1000} seconds`,
        time: 0
      });
      resolve(results);
    }, EXECUTION_TIMEOUT_MS);

    const clearTimeoutIfNeeded = () => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
    };

    const ctx: ProcessHandlerContext = {
      results,
      stdoutBuffer: '',
      userCodeStartLine,
      transpiledToOriginalLineMap,
    };

    setupProcessHandlers(child, ctx, {
      timedOut: () => timedOut,
      clearTimeout: clearTimeoutIfNeeded,
      tempDir,
      command: primaryCommand,
      args: primaryArgs,
      processName: 'node',
      onFallback: () => {
        // Attempt fallback with system node
        const fallbackChild = spawnNodeProcess(fallbackCommand, fallbackArgs, true, tempDir);

        // Reset stdout buffer for fallback
        ctx.stdoutBuffer = '';

        // Reset timeout for the fallback process
        clearTimeoutIfNeeded();
        timeoutHandle = setTimeout(() => {
          timedOut = true;
          try { fallbackChild.kill('SIGKILL'); } catch { /* ignore */ }
          results.push({
            line: -1,
            text: `Execution timed out after ${EXECUTION_TIMEOUT_MS / 1000} seconds`,
            time: 0
          });
          resolve(results);
        }, EXECUTION_TIMEOUT_MS);

        setupProcessHandlers(fallbackChild, ctx, {
          timedOut: () => timedOut,
          clearTimeout: clearTimeoutIfNeeded,
          tempDir,
          command: fallbackCommand,
          args: fallbackArgs,
          processName: 'node',
        }).then(() => resolve(results)).catch(reject);
      },
    }).then(() => resolve(results)).catch(reject);
  });
}
