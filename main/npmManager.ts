/**
 * npm package management functions extracted from CodeExecutor.
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {
  CommandResult,
  NpmExecutionPlan,
  buildSpawnEnv,
  buildInstallError,
} from './executionUtils';

export function getNpmCommand(): string {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

export function getEmbeddedNpmCliPath(): string | null {
  const candidates = [
    path.join(process.resourcesPath, 'runtime', 'npm', 'bin', 'npm-cli.js'),
    path.join(process.cwd(), 'node_modules', 'npm', 'bin', 'npm-cli.js')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function getNpmExecutionPlans(): NpmExecutionPlan[] {
  const plans: NpmExecutionPlan[] = [];
  const embeddedCliPath = getEmbeddedNpmCliPath();
  if (embeddedCliPath) {
    plans.push({
      command: process.execPath,
      baseArgs: [embeddedCliPath],
      runAsNode: true,
      source: 'embedded'
    });
  }
  plans.push({
    command: getNpmCommand(),
    baseArgs: [],
    runAsNode: false,
    source: 'system'
  });
  return plans;
}

export function executeNpmCommand(
  command: string,
  args: string[],
  shell: boolean,
  npmCacheDir: string,
  runAsNode: boolean,
  tempDir: string
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];
    let spawnError: NodeJS.ErrnoException | null = null;
    const env = buildSpawnEnv(npmCacheDir);
    if (runAsNode) {
      env.ELECTRON_RUN_AS_NODE = '1';
    }

    const child = spawn(command, args, {
      cwd: tempDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell,
      env
    });

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdoutChunks.push(output);
      console.log('📦 npm install:', output);
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderrChunks.push(output);
      console.log('📦 npm install (stderr):', output);
    });

    child.on('error', (error) => {
      spawnError = error as NodeJS.ErrnoException;
    });

    child.on('close', (code) => {
      resolve({
        code,
        stdout: stdoutChunks.join('').trim(),
        stderr: stderrChunks.join('').trim(),
        spawnError
      });
    });
  });
}

export async function runNpmInstall(tempDir: string, ensureTempDir: () => void): Promise<void> {
  ensureTempDir();
  const npmCacheDir = path.join(tempDir, '.npm-cache');
  fs.mkdirSync(npmCacheDir, { recursive: true });
  const installArgs = ['install', '--no-audit', '--no-fund'];
  const attempts = getNpmExecutionPlans();

  for (const plan of attempts) {
    const args = [...plan.baseArgs, ...installArgs];
    const result = await executeNpmCommand(plan.command, args, false, npmCacheDir, plan.runAsNode, tempDir);
    if (result.code === 0) {
      return;
    }
    if (result.spawnError && result.spawnError.code === 'EINVAL') {
      const retryResult = await executeNpmCommand(plan.command, args, true, npmCacheDir, plan.runAsNode, tempDir);
      if (retryResult.code === 0) {
        return;
      }
      if (plan.source === 'system') {
        throw buildInstallError(retryResult, plan.source);
      }
      continue;
    }
    if (plan.source === 'system') {
      throw buildInstallError(result, plan.source);
    }
  }

  throw new Error('No se pudo ejecutar npm con runtime embebido ni con npm del sistema.');
}
