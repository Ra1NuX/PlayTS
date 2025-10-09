import { BsCheck, BsX } from "react-icons/bs";
import { Bookmark } from "../../utils/bookmarkUtils";
import { MiniCodeEditor } from "./MiniCodeEditor";

interface BookmarkEditFormProps {
  bookmark: Bookmark;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (updates: Partial<Bookmark>) => void;
  onUpdateTags: (tagsString: string) => void;
  formatTags: (tags: string[]) => string;
}

export const BookmarkEditForm = ({ 
  bookmark, 
  onSave, 
  onCancel, 
  onUpdate, 
  onUpdateTags,
  formatTags 
}: BookmarkEditFormProps) => {
  return (
    <div className="p-3">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold dark:text-white text-main-dark">Editando: {bookmark.name}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={onSave}
              className="flex items-center gap-1 bg-[#d8e548] hover:bg-[#c4d13a] text-main-dark px-2 py-1 rounded text-xs transition-colors font-semibold"
              title="Guardar"
            >
              <BsCheck className="h-3 w-3" />
              <span className="hidden sm:inline">Guardar</span>
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors font-semibold"
              title="Cancelar"
            >
              <BsX className="h-3 w-3" />
              <span className="hidden sm:inline">Cancelar</span>
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium mb-1 dark:text-gray-300 text-main-dark">Nombre</label>
          <input
            type="text"
            value={bookmark.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 dark:border-main-dark rounded-lg dark:bg-main-dark dark:text-white bg-white shadow-md font-normal text-sm"
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
      </div>
    </div>
  );
};
