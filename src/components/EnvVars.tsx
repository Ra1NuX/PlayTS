import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EnvVar, NewEnvVar } from '../model/envVar';
import { useEnvVarsWithActions } from '../hooks/useEnvVars';
import { SidebarSection } from './SidebarSection';
import { EnvVarCard } from './envVars/EnvVarCard';
import { NewEnvVarForm } from './envVars/NewEnvVarForm';
import { EditEnvVarForm } from './envVars/EditEnvVarForm';
import { EmptyState } from './envVars/EmptyState';

const EnvVars = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { envVars, filterBySearch, handleSave, handleUpdate, handleDelete, handleToggleActive } =
    useEnvVarsWithActions();

  const filtered = filterBySearch(searchTerm);

  const handleSaveNew = (newEnvVar: NewEnvVar) => {
    handleSave(newEnvVar);
    setShowAddForm(false);
  };

  const handleSaveMultiple = (newEnvVars: NewEnvVar[]) => {
    newEnvVars.forEach((ev) => handleSave(ev));
    setShowAddForm(false);
  };

  const handleEdit = (envVar: EnvVar) => {
    setEditingId(envVar.id);
  };

  const handleSaveEdit = (id: string, updates: Partial<EnvVar>) => {
    handleUpdate(id, updates);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <SidebarSection
      title={t('ENV_VARS')}
      count={envVars.length}
      searchPlaceholder={t('SEARCH')}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      headerAction={
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-9 px-4 rounded-lg bg-accent-dark hover:bg-accent-dark/90 text-white text-sm font-medium transition-colors cursor-pointer flex-shrink-0"
        >
          <span className="hidden sm:inline">{t('NEW')}</span>
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {showAddForm && (
          <NewEnvVarForm
            onSave={handleSaveNew}
            onSaveMultiple={handleSaveMultiple}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((envVar) => (
            <div
              key={envVar.id}
              className="dark:bg-[#1a1a1a] bg-white rounded-lg border dark:border-[#2a2a2a] border-gray-200 overflow-hidden hover:border-gray-300 dark:hover:border-[#333] transition-colors"
            >
              {editingId === envVar.id ? (
                <EditEnvVarForm
                  envVar={envVar}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <EnvVarCard
                  envVar={envVar}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                />
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <EmptyState searchTerm={searchTerm} onAddClick={() => setShowAddForm(true)} />
        )}
      </div>
    </SidebarSection>
  );
};

export default EnvVars;
