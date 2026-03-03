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

class CodeExecutor {
  private tempDir: string;
  private packageJsonPath: string;
  private indexJsPath: string;
  private dependencies: Record<string, string> = {};

  constructor() {
    // Crear directorio temporal para ejecución de código
    this.tempDir = path.join(os.tmpdir(), 'runts-execution');
    this.packageJsonPath = path.join(this.tempDir, 'package.json');
    this.indexJsPath = path.join(this.tempDir, 'index.js');
    
    this.ensureTempDir();
    this.loadDependencies();
  }

  private ensureTempDir(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
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
      
      const child = spawn('node', ['index.js'], {
        cwd: this.tempDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

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
        reject(error);
      });
    });
  }

  /**
   * Ejecuta npm install
   */
  private async runNpmInstall(): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('npm', ['install'], {
        cwd: this.tempDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      child.stdout.on('data', (data) => {
        console.log('📦 npm install:', data.toString());
      });

      child.stderr.on('data', (data) => {
        console.log('📦 npm install (stderr):', data.toString());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`npm install terminó con código ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
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
