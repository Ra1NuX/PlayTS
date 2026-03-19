import { getEnvironmentInfo, isFeatureAvailable, type EnvironmentInfo } from '../utils/environment';

export const useEnvironment = () => {
  const envInfo = getEnvironmentInfo();
  return {
    ...envInfo,
    isFeatureAvailable: (feature: keyof EnvironmentInfo['capabilities']) =>
      isFeatureAvailable(feature),
  };
};
