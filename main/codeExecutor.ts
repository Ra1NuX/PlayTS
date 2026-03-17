/**
 * Módulo para ejecución de código Node.js en el proceso principal de Electron
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { addInstructionsToCode } from '../src/utils/addInstructionsToCode';
import { runNodeProcess } from './processRunner';
import { runNpmInstall } from './npmManager';
import { createTranspiledToOriginalLineMap } from './executionUtils';
import type { ExecutionResult, ExecutionOptions, PackageOperationResult } from './executionUtils';
import { EXECUTION, PACKAGE_JSON_TEMPLATE } from '../src/constants/execution';

// Re-export types so existing consumers don't break
export type { ExecutionResult, ExecutionOptions, PackageOperationResult };

class CodeExecutor {
  private tempDir: string;
  private packageJsonPath: string;
  private indexJsPath: string;
  private dependencies: Record<string, string> = {};

  constructor() {
    this.tempDir = path.join(os.tmpdir(), EXECUTION.TEMP_DIR_NAME, this.getExecutionUserSegment());
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
      ...PACKAGE_JSON_TEMPLATE,
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
        await runNpmInstall(this.tempDir, () => this.ensureTempDir());
      }

      // Combine bookmark code with user code
      const fullCode = options.globalBookmarksCode
        ? `${options.globalBookmarksCode}\n\n${options.code}`
        : options.code;

      const userCodeStartLine = options.globalBookmarksCode
        ? options.globalBookmarksCode.split('\n').length + 2
        : 1;
      const transpiledToOriginalLineMap = createTranspiledToOriginalLineMap(options.code);

      // Apply instrumentation as in WebContainers
      const instrumentedCode = addInstructionsToCode(fullCode);

      // Write instrumented code to temporary file
      fs.writeFileSync(this.indexJsPath, instrumentedCode);

      // Execute code
      const results = await runNodeProcess(
        this.tempDir,
        this.indexJsPath,
        userCodeStartLine,
        transpiledToOriginalLineMap
      );

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
      this.dependencies[name] = version;
      this.saveDependencies();
      await runNpmInstall(this.tempDir, () => this.ensureTempDir());
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
      delete this.dependencies[name];
      this.saveDependencies();
      await runNpmInstall(this.tempDir, () => this.ensureTempDir());
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
