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
  // Verificar si estamos en Electron
  if (typeof window !== 'undefined' && window.process && window.process.type) {
    return true;
  }
  
  // Verificar userAgent específico de Electron
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')) {
    return true;
  }
  
  // Verificar si existe la API de Electron
  if (typeof window !== 'undefined' && (window as any).electron) {
    return true;
  }
  
  // Verificar si existe window.electron (otra forma común)
  if (typeof window !== 'undefined' && (window as any).electron) {
    return true;
  }
  
  // Verificar si existe process.versions.electron
  if (typeof window !== 'undefined' && (window as any).process?.versions?.electron) {
    return true;
  }
  
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
