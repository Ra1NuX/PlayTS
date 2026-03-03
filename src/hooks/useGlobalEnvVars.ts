import { useEffect, useRef } from 'react';
import { EnvVar } from '../model/envVar';
import { setGlobalEnvVars } from './useCompiler';

interface UseGlobalEnvVarsProps {
  envVars: EnvVar[];
}

export const useGlobalEnvVars = ({ envVars }: UseGlobalEnvVarsProps) => {
  const lastKeyRef = useRef<string>('');

  useEffect(() => {
    const activeEnvVars = envVars.filter((ev) => ev.isActive);

    const key = JSON.stringify(activeEnvVars.map((ev) => ({ id: ev.id, key: ev.key, value: ev.value })));

    if (key === lastKeyRef.current) return;

    lastKeyRef.current = key;

    const record: Record<string, string> = {};
    activeEnvVars.forEach((ev) => {
      record[ev.key] = ev.value;
    });

    setGlobalEnvVars(record, true);
  }, [envVars]);
};
