/**
 * Módulo para ejecución de código Node.js en el proceso principal de Electron
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { addInstructionsToCode } from '../src/utils/addInstructionsToCode';

// Interfaces
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

interface CommandResult {
  code: number | null;
  stdout: string;
  stderr: string;
  spawnError: NodeJS.ErrnoException | null;
}

interface NpmExecutionPlan {
  command: string;
  baseArgs: string[];
  runAsNode: boolean;
  source: 'embedded' | 'system';
}

class CodeExecutor {
  private tempDir: string;
  private packageJsonPath: string;
  private indexJsPath: string;
  private dependencies: Record<string, string> = {};

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'runts-execution', this.getExecutionUserSegment());
    this.packageJsonPath = path.join(this.tempDir, 'package.json');
    this.indexJsPath = path.join(this.tempDir, 'index.js');
    
    this.ensureTempDir();
    this.loadDependencies();
  }

  private getExecutionUserSegment(): string {
    if (typeof process.getuid === 'function') {
      return String(process.getuid());
    }

    if (process.env.USERNAME) {
      return process.env.USERNAME;
    }

    if (process.env.USER) {
      return process.env.USER;
    }

    return 'default';
  }

  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    const writeProbePath = path.join(this.tempDir, '.write-probe');
    fs.writeFileSync(writeProbePath, 'ok');
    fs.unlinkSync(writeProbePath);
  }

  private loadDependencies(): void {
    try {
      if (fs.existsSync(this.packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf-8'));
        this.dependencies = packageJson.dependencies || {};
      }
    } catch (error) {
      console.error('Error cargando dependencias:', error);
      this.dependencies = {};
    }
  }

  private saveDependencies(): void {
    const packageJson = {
      name: "runts-execution",
      version: "1.0.0",
      type: "module",
      main: "index.js",
      scripts: {
        start: "node index.js",
      },
      dependencies: this.dependencies,
    };

    fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  /**
   * Ejecuta código JavaScript/TypeScript
   */
  async executeCode(options: ExecutionOptions): Promise<ExecutionResult[]> {
    try {
      console.log('🚀 Ejecutando código via ICP...');
      
      // Instalar dependencias si se proporcionan
      if (options.dependencies) {
        console.log('📦 Instalando dependencias automáticamente...');
        for (const [name, version] of Object.entries(options.dependencies)) {
          this.dependencies[name] = version;
        }
        this.saveDependencies();
        await this.runNpmInstall();
      }
      
      // Combinar código de bookmarks con código del usuario
      const fullCode = options.globalBookmarksCode 
        ? `${options.globalBookmarksCode}\n\n${options.code}`
        : options.code;

      const userCodeStartLine = options.globalBookmarksCode
        ? options.globalBookmarksCode.split('\n').length + 2
        : 1;
      const transpiledToOriginalLineMap = this.createTranspiledToOriginalLineMap(options.code);

      // Aplicar instrumentación como en WebContainers
      const instrumentedCode = addInstructionsToCode(fullCode);
      
      // Escribir código instrumentado a archivo temporal
      fs.writeFileSync(this.indexJsPath, instrumentedCode);

      // Ejecutar código
      const results = await this.runNodeProcess(userCodeStartLine, transpiledToOriginalLineMap);
      
      console.log('✅ Código ejecutado exitosamente');
      return results;
    } catch (error) {
      console.error('❌ Error ejecutando código:', error);
      return [{
        line: -1,
        text: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        time: 0
      }];
    }
  }

  /**
   * Instala un paquete npm
   */
  async installPackage(name: string, version: string): Promise<PackageOperationResult> {
    try {
      console.log(`📦 Instalando ${name}@${version} via ICP...`);
      
      // Actualizar dependencias
      this.dependencies[name] = version;
      this.saveDependencies();

      // Ejecutar npm install
      await this.runNpmInstall();
      
      console.log(`✅ Paquete ${name}@${version} instalado exitosamente`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Error instalando ${name}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  /**
   * Desinstala un paquete npm
   */
  async uninstallPackage(name: string): Promise<PackageOperationResult> {
    try {
      console.log(`🗑️ Desinstalando ${name} via ICP...`);
      
      // Remover de dependencias
      delete this.dependencies[name];
      this.saveDependencies();

      // Ejecutar npm install para actualizar
      await this.runNpmInstall();
      
      console.log(`✅ Paquete ${name} desinstalado exitosamente`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Error desinstalando ${name}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      };
    }
  }

  /**
   * Limpia códigos ANSI de color de la salida
   */
  private stripAnsiCodes(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  private createTranspiledToOriginalLineMap(transpiledCode: string): Map<number, number> {
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

  /**
   * Ejecuta el proceso Node.js
   */
  private async runNodeProcess(
    userCodeStartLine: number,
    transpiledToOriginalLineMap: Map<number, number>
  ): Promise<ExecutionResult[]> {
    return new Promise((resolve, reject) => {
      const results: ExecutionResult[] = [];
      let stdoutBuffer = '';
      const primaryCommand = process.versions.electron ? process.execPath : 'node';
      const primaryArgs = process.versions.electron ? [this.indexJsPath] : ['index.js'];
      const fallbackCommand = process.platform === 'win32' ? 'node.exe' : 'node';
      const fallbackArgs = ['index.js'];
      let child = this.spawnNodeProcess(primaryCommand, primaryArgs, false);
      let attemptedFallback = false;

      child.stdout.on('data', (data) => {
        const output = data.toString();

        stdoutBuffer += output;
        const outputLines = stdoutBuffer.split('\n');
        stdoutBuffer = outputLines.pop() || '';

        for (const rawLine of outputLines) {
          const cleanLine = this.stripAnsiCodes(rawLine).trim();

          if (!cleanLine) {
            continue;
          }

          try {
            const parsed = JSON.parse(cleanLine) as ExecutionResult;
            if (parsed.line !== undefined && parsed.text !== undefined && parsed.time !== undefined) {
              const userTranspiledLine = parsed.line >= userCodeStartLine
                ? parsed.line - userCodeStartLine + 1
                : parsed.line;
              const mappedLine = transpiledToOriginalLineMap.get(userTranspiledLine) ?? userTranspiledLine;

              results.push({
                ...parsed,
                line: mappedLine > 0 ? mappedLine : 1
              });
            }
          } catch {
            results.push({
              line: 1,
              text: cleanLine,
              time: 0
            });
          }
        }
      });

      child.stderr.on('data', (data) => {
        const error = data.toString();
        console.error('📤 Error:', error);
        results.push({
          line: -1,
          text: this.stripAnsiCodes(error).trim(),
          time: 0
        });
      });

      child.on('close', (code) => {
        if (code === 0) {
          const pendingOutput = this.stripAnsiCodes(stdoutBuffer).trim();
          if (pendingOutput) {
            try {
              const parsed = JSON.parse(pendingOutput) as ExecutionResult;
              if (parsed.line !== undefined && parsed.text !== undefined && parsed.time !== undefined) {
                const userTranspiledLine = parsed.line >= userCodeStartLine
                  ? parsed.line - userCodeStartLine + 1
                  : parsed.line;
                const mappedLine = transpiledToOriginalLineMap.get(userTranspiledLine) ?? userTranspiledLine;

                results.push({
                  ...parsed,
                  line: mappedLine > 0 ? mappedLine : 1
                });
              }
            } catch {
              results.push({
                line: 1,
                text: pendingOutput,
                time: 0
              });
            }
          }
          resolve(results);
        } else {
          reject(new Error(`Proceso terminó con código ${code}`));
        }
      });

      child.on('error', (error) => {
        const err = error as NodeJS.ErrnoException;
        if (err.code === 'EINVAL' && !attemptedFallback) {
          attemptedFallback = true;
          child = this.spawnNodeProcess(fallbackCommand, fallbackArgs, true);
          child.stdout.on('data', (data) => {
            const output = data.toString();
            stdoutBuffer += output;
            const outputLines = stdoutBuffer.split('\n');
            stdoutBuffer = outputLines.pop() || '';

            for (const rawLine of outputLines) {
              const cleanLine = this.stripAnsiCodes(rawLine).trim();
              if (!cleanLine) {
                continue;
              }
              try {
                const parsed = JSON.parse(cleanLine) as ExecutionResult;
                if (parsed.line !== undefined && parsed.text !== undefined && parsed.time !== undefined) {
                  const userTranspiledLine = parsed.line >= userCodeStartLine
                    ? parsed.line - userCodeStartLine + 1
                    : parsed.line;
                  const mappedLine = transpiledToOriginalLineMap.get(userTranspiledLine) ?? userTranspiledLine;
                  results.push({
                    ...parsed,
                    line: mappedLine > 0 ? mappedLine : 1
                  });
                }
              } catch {
                results.push({
                  line: 1,
                  text: cleanLine,
                  time: 0
                });
              }
            }
          });

          child.stderr.on('data', (data) => {
            const errorText = data.toString();
            console.error('📤 Error:', errorText);
            results.push({
              line: -1,
              text: this.stripAnsiCodes(errorText).trim(),
              time: 0
            });
          });

          child.on('close', (fallbackCode) => {
            if (fallbackCode === 0) {
              const pendingOutput = this.stripAnsiCodes(stdoutBuffer).trim();
              if (pendingOutput) {
                try {
                  const parsed = JSON.parse(pendingOutput) as ExecutionResult;
                  if (parsed.line !== undefined && parsed.text !== undefined && parsed.time !== undefined) {
                    const userTranspiledLine = parsed.line >= userCodeStartLine
                      ? parsed.line - userCodeStartLine + 1
                      : parsed.line;
                    const mappedLine = transpiledToOriginalLineMap.get(userTranspiledLine) ?? userTranspiledLine;
                    results.push({
                      ...parsed,
                      line: mappedLine > 0 ? mappedLine : 1
                    });
                  }
                } catch {
                  results.push({
                    line: 1,
                    text: pendingOutput,
                    time: 0
                  });
                }
              }
              resolve(results);
              return;
            }

            reject(new Error(`Proceso terminó con código ${fallbackCode} (fallback node).`));
          });

          child.on('error', (fallbackError) => {
            reject(this.buildSpawnError(
              'node',
              fallbackError as NodeJS.ErrnoException,
              fallbackCommand,
              fallbackArgs
            ));
          });
          return;
        }

        if (err.code === 'ENOENT') {
          reject(new Error('No fue posible iniciar el runtime de Node para ejecutar el código.'));
          return;
        }

        if (err.code === 'EACCES') {
          reject(new Error('Sin permisos para iniciar el runtime de Node en el directorio temporal.'));
          return;
        }

        reject(this.buildSpawnError('node', err, primaryCommand, primaryArgs));
      });
    });
  }

  private getNpmCommand(): string {
    return process.platform === 'win32' ? 'npm.cmd' : 'npm';
  }

  private getEmbeddedNpmCliPath(): string | null {
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

  private getNpmExecutionPlans(): NpmExecutionPlan[] {
    const plans: NpmExecutionPlan[] = [];
    const embeddedCliPath = this.getEmbeddedNpmCliPath();
    if (embeddedCliPath) {
      plans.push({
        command: process.execPath,
        baseArgs: [embeddedCliPath],
        runAsNode: true,
        source: 'embedded'
      });
    }
    plans.push({
      command: this.getNpmCommand(),
      baseArgs: [],
      runAsNode: false,
      source: 'system'
    });
    return plans;
  }

  private async runNpmInstall(): Promise<void> {
    this.ensureTempDir();
    const npmCacheDir = path.join(this.tempDir, '.npm-cache');
    fs.mkdirSync(npmCacheDir, { recursive: true });
    const installArgs = ['install', '--no-audit', '--no-fund'];
    const attempts = this.getNpmExecutionPlans();

    for (const plan of attempts) {
      const args = [...plan.baseArgs, ...installArgs];
      const result = await this.executeCommand(plan.command, args, false, npmCacheDir, plan.runAsNode);
      if (result.code === 0) {
        return;
      }
      if (result.spawnError && result.spawnError.code === 'EINVAL') {
        const retryResult = await this.executeCommand(plan.command, args, true, npmCacheDir, plan.runAsNode);
        if (retryResult.code === 0) {
          return;
        }
        if (plan.source === 'system') {
          throw this.buildInstallError(retryResult, plan.source);
        }
        continue;
      }
      if (plan.source === 'system') {
        throw this.buildInstallError(result, plan.source);
      }
    }

    throw new Error('No se pudo ejecutar npm con runtime embebido ni con npm del sistema.');
  }

  private executeCommand(
    command: string,
    args: string[],
    shell: boolean,
    npmCacheDir: string,
    runAsNode: boolean
  ): Promise<CommandResult> {
    return new Promise((resolve) => {
      const stdoutChunks: string[] = [];
      const stderrChunks: string[] = [];
      let spawnError: NodeJS.ErrnoException | null = null;
      const env = this.buildSpawnEnv(npmCacheDir);
      if (runAsNode) {
        env.ELECTRON_RUN_AS_NODE = '1';
      }

      const child = spawn(command, args, {
        cwd: this.tempDir,
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

  private buildSpawnEnv(npmCacheDir: string): NodeJS.ProcessEnv {
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

  private buildInstallError(result: CommandResult, source: 'embedded' | 'system'): Error {
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

  private buildSpawnError(
    processName: string,
    error: NodeJS.ErrnoException,
    command: string,
    args: string[]
  ): Error {
    const code = error.code || 'UNKNOWN';
    const syscall = error.syscall || 'spawn';
    const spawnPath = (error as NodeJS.ErrnoException & { path?: string }).path || command;
    const argText = args.join(' ');
    return new Error(
      `Falló ${processName} (${code}) en ${syscall}. command="${command}" args="${argText}" path="${spawnPath}" cwd="${this.tempDir}".`
    );
  }

  private spawnNodeProcess(command: string, args: string[], shell: boolean) {
    const npmCacheDir = path.join(this.tempDir, '.npm-cache');
    const env = this.buildSpawnEnv(npmCacheDir);
    if (process.versions.electron) {
      env.ELECTRON_RUN_AS_NODE = '1';
    }
    return spawn(command, args, {
      cwd: this.tempDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell,
      env
    });
  }

  /**
   * Obtiene información del entorno
   */
  getEnvironmentInfo() {
    return {
      platform: 'electron',
      executionMethod: 'icp',
      nodeVersion: process.version,
      tempDir: this.tempDir,
      dependencies: this.dependencies
    };
  }
}

// Instancia singleton
export const codeExecutor = new CodeExecutor();
