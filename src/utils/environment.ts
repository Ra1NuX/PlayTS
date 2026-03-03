/**
 * Utilidades para detectar el entorno de ejecución
 * y manejar diferencias entre Electron y Web
 */

export interface EnvironmentInfo {
  isElectron: boolean;
  isWeb: boolean;
  platform: 'electron' | 'web';
  executionMethod: 'icp' | 'webcontainer';
  capabilities: {
    canExecuteNodeCode: boolean;
    canInstallPackages: boolean;
    canAccessFileSystem: boolean;
    canUseWebContainers: boolean;
    canUseICP: boolean;
  };
}

/**
 * Detecta si la aplicación está ejecutándose en Electron
 */
export const isElectron = (): boolean => {
  // Verificar si existe la API de Electron expuesta por el preload script
  if (typeof window !== 'undefined' && (window as any).electron) {
    console.log('✅ Detectado entorno Electron via window.electron');
    return true;
  }

  // Verificar si existe process.versions.electron (más confiable)
  if (typeof window !== 'undefined' && (window as any).process?.versions?.electron) {
    console.log('✅ Detectado entorno Electron via process.versions.electron');
    return true;
  }

  // Verificar userAgent específico de Electron
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')) {
    console.log('✅ Detectado entorno Electron via userAgent');
    return true;
  }

  // Verificar si estamos en Electron mediante otras señales
  if (typeof window !== 'undefined' && window.process && window.process.type) {
    console.log('✅ Detectado entorno Electron via window.process.type');
    return true;
  }

  console.log('❌ No se detectó entorno Electron, usando Web');
  return false;
};

/**
 * Detecta si la aplicación está ejecutándose en el navegador web
 */
export const isWeb = (): boolean => {
  return !isElectron();
};

/**
 * Obtiene información completa del entorno
 */
export const getEnvironmentInfo = (): EnvironmentInfo => {
  const electron = isElectron();
  const web = isWeb();

  return {
    isElectron: electron,
    isWeb: web,
    platform: electron ? 'electron' : 'web',
    executionMethod: electron ? 'icp' : 'webcontainer',
    capabilities: {
      canExecuteNodeCode: true, // Ambos entornos pueden ejecutar código Node.js
      canInstallPackages: true, // Ambos entornos pueden instalar paquetes
      canAccessFileSystem: electron, // Solo Electron tiene acceso real al sistema de archivos
      canUseWebContainers: web, // Solo en web usamos WebContainers
      canUseICP: electron, // Solo en Electron usamos ICP
    }
  };
};


/**
 * Verifica si una funcionalidad está disponible en el entorno actual
 */
export const isFeatureAvailable = (feature: keyof EnvironmentInfo['capabilities']): boolean => {
  const env = getEnvironmentInfo();
  return env.capabilities[feature];
};


/**
 * Obtiene información detallada del entorno actual
 */
export const getEnvironmentDisplayInfo = () => {
  const env = getEnvironmentInfo();
  const isDevMode = process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && (window as any).isDev) ||
    !process.env.NODE_ENV;

  // Detectar el protocolo/URL actual
  const getProtocol = (): string => {
    if (typeof window === 'undefined') return 'SSR';

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'localhost'; 
    } else { return 'app://-'; }

    return window.location.hostname || 'unknown';
  };

  return {
    isDev: isDevMode,
    environment: env.platform === 'electron' ? 'Electron' : 'Web',
    execution: env.executionMethod === 'webcontainer' ? 'WebContainer' : 'ICP',
    protocol: getProtocol(),
    platform: env.platform,
    executionMethod: env.executionMethod,
    shouldShow: isDevMode // Solo mostrar en desarrollo
  };
};

/**
 * Hook para usar información del entorno en componentes React
 */
export const useEnvironment = () => {
  const envInfo = getEnvironmentInfo();

  return {
    ...envInfo,
    isFeatureAvailable: (feature: keyof EnvironmentInfo['capabilities']) =>
      isFeatureAvailable(feature),
  };
};
