import { NewBookmark } from "../../utils/bookmarkUtils";
import { MiniCodeEditor } from "./MiniCodeEditor";

interface NewBookmarkFormProps {
  bookmark: NewBookmark;
  onUpdate: (updates: Partial<NewBookmark>) => void;
  onUpdateTags: (tagsString: string) => void;
  onSave: () => void;
  onCancel: () => void;
  formatTags: (tags: string[]) => string;
}

export const NewBookmarkForm = ({ 
  bookmark, 
  onUpdate, 
  onUpdateTags, 
  onSave, 
  onCancel,
  formatTags 
}: NewBookmarkFormProps) => {
  return (
    <div className="dark:bg-main-light bg-white rounded-lg p-3 border border-gray-200 dark:border-main-dark shadow-md">
      <h3 className="text-base font-semibold mb-3 dark:text-white text-main-dark">Nuevo Bookmark</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">Nombre</label>
          <input
            type="text"
            value={bookmark.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-main-dark rounded-lg dark:bg-main-dark dark:text-white bg-white shadow-md font-normal text-sm"
            placeholder="Nombre de la función"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">Lenguaje</label>
            <select
              value={bookmark.language}
              onChange={(e) => onUpdate({ language: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-main-dark rounded-lg dark:bg-main-dark dark:text-white bg-white shadow-md font-normal text-sm"
            >
              <option value="javascript">JS</option>
              <option value="typescript">TS</option>
            </select>
          </div>
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={bookmark.isGloballyActive}
                onChange={(e) => onUpdate({ isGloballyActive: e.target.checked })}
                className="rounded text-xs"
              />
              <span className="text-xs dark:text-gray-300 text-main-dark">Global</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">Descripción</label>
          <input
            type="text"
            value={bookmark.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-main-dark rounded-lg dark:bg-main-dark dark:text-white bg-white shadow-md font-normal text-sm"
            placeholder="Descripción"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">Código</label>
          <MiniCodeEditor
            value={bookmark.code}
            onChange={(code) => onUpdate({ code })}
            language={bookmark.language}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">Tags</label>
          <input
            type="text"
            value={formatTags(bookmark.tags)}
            onChange={(e) => onUpdateTags(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-main-dark rounded-lg dark:bg-main-dark dark:text-white bg-white shadow-md font-normal text-sm"
            placeholder="react, hooks"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="bg-[#d8e548] hover:bg-[#c4d13a] text-main-dark px-3 py-1.5 rounded-lg transition-colors font-semibold text-sm flex-1"
          >
            Guardar
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors font-semibold text-sm flex-1"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
