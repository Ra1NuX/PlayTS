import { useEnvVars, useEnvVarsActions } from '../stores/envVarsStore';
import { EnvVar, NewEnvVar } from '../model/envVar';

export const useEnvVarsWithActions = () => {
  const envVars = useEnvVars();
  const { addEnvVar, updateEnvVar, deleteEnvVar, toggleActive } = useEnvVarsActions();

  const filterBySearch = (searchTerm: string): EnvVar[] => {
    if (!searchTerm.trim()) return envVars;
    const lower = searchTerm.toLowerCase();
    return envVars.filter((ev) => ev.key.toLowerCase().includes(lower));
  };

  const handleSave = (newEnvVar: NewEnvVar) => {
    addEnvVar(newEnvVar);
  };

  const handleUpdate = (id: string, updates: Partial<EnvVar>) => {
    updateEnvVar(id, updates);
  };

  const handleDelete = (id: string) => {
    deleteEnvVar(id);
  };

  const handleToggleActive = (id: string) => {
    toggleActive(id);
  };

  return {
    envVars,
    filterBySearch,
    handleSave,
    handleUpdate,
    handleDelete,
    handleToggleActive,
  };
};
