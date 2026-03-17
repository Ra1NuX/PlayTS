/**
 * Utilities for detecting the execution environment
 * and handling differences between Electron and Web
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
 * Detects if the application is running in Electron
 */
export const isElectron = (): boolean => {
  // Check if Electron API exposed by preload script exists
  if (typeof window !== 'undefined' && window.electron) {
    return true;
  }

  // Check if process.versions.electron exists (more reliable)
  if (typeof window !== 'undefined' && (window as any).process?.versions?.electron) {
    return true;
  }

  // Check Electron-specific userAgent
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')) {
    return true;
  }

  // Check for Electron via other signals
  if (typeof window !== 'undefined' && window.process && window.process.type) {
    return true;
  }

  return false;
};

/**
 * Detects if the application is running in the web browser
 */
export const isWeb = (): boolean => {
  return !isElectron();
};

/**
 * Gets complete environment information
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
      canExecuteNodeCode: true, // Both environments can execute Node.js code
      canInstallPackages: true, // Both environments can install packages
      canAccessFileSystem: electron, // Only Electron has real file system access
      canUseWebContainers: web, // Only in web we use WebContainers
      canUseICP: electron, // Only in Electron we use ICP
    }
  };
};


/**
 * Checks if a feature is available in the current environment
 */
export const isFeatureAvailable = (feature: keyof EnvironmentInfo['capabilities']): boolean => {
  const env = getEnvironmentInfo();
  return env.capabilities[feature];
};


/**
 * Gets detailed information about the current environment
 */
export const getEnvironmentDisplayInfo = () => {
  const env = getEnvironmentInfo();
  const isDevMode = process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && (window as any).isDev) ||
    !process.env.NODE_ENV;

  // Detect the current protocol/URL
  const getProtocol = (): string => {
    if (typeof window === 'undefined') return 'SSR';

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'localhost';
    }
    return 'playts://-';
  };

  return {
    isDev: isDevMode,
    environment: env.platform === 'electron' ? 'Electron' : 'Web',
    execution: env.executionMethod === 'webcontainer' ? 'WebContainer' : 'ICP',
    protocol: getProtocol(),
    platform: env.platform,
    executionMethod: env.executionMethod,
    shouldShow: isDevMode // Only show in development
  };
};

