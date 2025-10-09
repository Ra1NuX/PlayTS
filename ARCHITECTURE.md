# RunTS - Arquitectura del Sistema de Bookmarks

## 📋 Resumen

Sistema completo de gestión de bookmarks (snippets de código) con:
- ✅ Persistencia local con Zustand
- ✅ Inyección automática de código en WebContainer
- ✅ Generación dinámica de tipos TypeScript para Monaco Editor
- ✅ Transpilación automática de TypeScript a JavaScript
- ✅ UI responsive y profesional

## 🏗️ Arquitectura

### 1. **Estado Global (Zustand)**

**Archivo**: `src/stores/bookmarksStore.ts`

```typescript
interface BookmarksStore {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: NewBookmark) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
  toggleGlobal: (id: string) => void;
}
```

**Características**:
- Persistencia automática en `localStorage`
- Deserialización de fechas al cargar
- Hooks optimizados para evitar re-renders innecesarios

### 2. **Inyección de Código Global**

**Flujo**:
```
App.tsx (mount)
  ↓
useGlobalBookmarks
  ↓
generateGlobalBookmarkCode (transpila TS → JS)
  ↓
setGlobalBookmarksCode
  ↓
updateAndRunCode
  ↓
runCode (WebContainer con bookmarks inyectados)
```

**Archivos clave**:
- `src/hooks/useGlobalBookmarks.ts` - Hook principal
- `src/utils/bookmarkInjection.ts` - Generación de código
- `src/hooks/useCompiler.ts` - Compilación y ejecución

### 3. **Generación de Tipos para Monaco**

**Flujo**:
```
EditorComponent
  ↓
useMonacoTypes
  ↓
generateBookmarkTypes (parsea código con Acorn)
  ↓
monaco.languages.typescript.typescriptDefaults.addExtraLib
  ↓
Autocompletado en editor ✨
```

**Proceso**:
1. **Elimina anotaciones TypeScript** del código (Acorn solo entiende JS)
2. **Parsea AST** para extraer funciones, variables, clases
3. **Extrae tipos originales** del código TypeScript
4. **Genera declaraciones** `.d.ts` para Monaco

**Archivos clave**:
- `src/utils/typeGeneration.ts` - Parser y generador
- `src/hooks/useMonacoTypes.ts` - Integración con Monaco

### 4. **Componentes UI**

**Estructura modular**:
```
src/components/
├── Bookmarks.tsx (contenedor principal)
└── bookmarks/
    ├── BookmarksHeader.tsx
    ├── BookmarkCard.tsx
    ├── BookmarkEditForm.tsx
    ├── NewBookmarkForm.tsx
    └── EmptyState.tsx
```

**Hooks personalizados**:
- `useBookmarksWithInjection` - Integra store con lógica de UI
- `useElectronBookmarksSync` - Preparado para sincronización Electron

## 🔄 Flujo Completo de un Bookmark

### Creación:
```
Usuario crea bookmark con código TypeScript
  ↓
NewBookmarkForm → handleSaveBookmark
  ↓
bookmarksStore.addBookmark
  ↓
localStorage (persistencia automática)
  ↓
useGlobalBookmarks detecta cambio
  ↓
Transpila TS → JS
  ↓
Inyecta en WebContainer
  ↓
useMonacoTypes detecta cambio
  ↓
Genera tipos .d.ts
  ↓
Inyecta en Monaco Editor
```

### Ejecución:
```
Usuario activa bookmark (toggle global)
  ↓
bookmarksStore.toggleGlobal
  ↓
useGlobalBookmarks detecta cambio
  ↓
generateGlobalBookmarkCode (transpila)
  ↓
setGlobalBookmarksCode
  ↓
Re-ejecuta código actual con bookmarks
  ↓
runCode(userCode, globalBookmarksCode)
  ↓
WebContainer ejecuta: globalBookmarks + userCode
```

## 🛠️ Tecnologías Clave

- **Zustand**: Estado global con persistencia
- **Acorn**: Parser de JavaScript para AST
- **TypeScript Compiler API**: Transpilación TS → JS
- **Monaco Editor**: Editor con IntelliSense
- **WebContainer**: Entorno Node.js en el navegador
- **Tailwind CSS**: Estilos responsive

## 📝 Tipos de Datos

### Bookmark
```typescript
interface Bookmark {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isGloballyActive: boolean;
  createdAt: Date;
}
```

### NewBookmark
```typescript
interface NewBookmark {
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
}
```

## 🔧 Utilidades Principales

### `bookmarkUtils.ts`
- `createBookmark` - Genera ID y fecha
- `updateBookmark` - Actualiza bookmark inmutable
- `filterBookmarks` - Búsqueda por nombre/descripción/tags
- `formatTags` / `parseTags` - Manejo de tags

### `bookmarkInjection.ts`
- `generateGlobalBookmarkCode` - Genera código JS para WebContainer
- `getActiveBookmarks` - Filtra bookmarks activos
- `injectBookmarkIntoCode` - Inyecta bookmark en código del editor

### `typeGeneration.ts`
- `generateBookmarkTypes` - Genera declaraciones `.d.ts`
- `extractParameterTypes` - Extrae tipos de parámetros
- `extractReturnType` - Extrae tipo de retorno

## 🎯 Puntos Clave de Implementación

### 1. Evitar Re-renders Infinitos
```typescript
// ❌ MAL: Crea nueva referencia en cada render
const actions = {
  addBookmark: () => {},
  updateBookmark: () => {}
};

// ✅ BIEN: Usa getState() para referencias estables
export const useBookmarksActions = () => {
  return {
    addBookmark: useBookmarksStore.getState().addBookmark,
    updateBookmark: useBookmarksStore.getState().updateBookmark,
  };
};
```

### 2. Transpilación de Bookmarks
```typescript
// El código del usuario puede ser TypeScript
const code = "const test = (x: string): string => x";

// Pero WebContainer solo entiende JavaScript
const jsCode = transpileTypeScript(code);
// → "const test = (x) => x;"
```

### 3. Preservación de Tipos
```typescript
// Aunque transpilamos a JS para WebContainer...
const jsCode = "const test = (x) => x";

// ...mantenemos los tipos originales para Monaco
const types = "declare const test: (x: string) => string;";
```

## 🚀 Futuras Mejoras

- [ ] Sincronización con Electron (estructura ya preparada)
- [ ] Importar/exportar bookmarks (JSON)
- [ ] Categorías/carpetas de bookmarks
- [ ] Búsqueda avanzada con regex
- [ ] Compartir bookmarks (URL/QR)
- [ ] Tipos automáticos de paquetes npm instalados

## 📦 Dependencias Principales

```json
{
  "zustand": "^4.x.x",           // Estado global
  "acorn": "^8.x.x",             // Parser JS
  "@monaco-editor/react": "^4.x.x", // Editor
  "@webcontainer/api": "^1.x.x", // Runtime Node.js
  "typescript": "^5.x.x"         // Transpilación
}
```

---

**Última actualización**: 2025-10-09
**Versión**: 1.0.0

