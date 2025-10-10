import { useEffect, useRef } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { Bookmark } from '../utils/bookmarkUtils';
import { generateBookmarkTypes } from '../utils/typeGeneration';
import { InstalledPackages } from '../model/npm';

interface UseMonacoTypesProps {
  bookmarks: Bookmark[];
  installedPackages?: InstalledPackages;
}

const fetchAllPackageFiles = async (packageName: string, version: string): Promise<{ path: string; content: string }[]> => {
  try {
    
    const apiUrl = `https://unpkg.com/${packageName}@${version}/?meta`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const typesApiUrl = `https://unpkg.com/@types/${packageName}@latest/?meta`;
      const typesResponse = await fetch(typesApiUrl);
      
      if (!typesResponse.ok) {
        return [];
      }
      
      const typesData = await typesResponse.json();
      const dtsFiles = typesData.files.filter((file: any) => 
        file.path && (file.path.endsWith('.d.ts') || file.path.endsWith('.d.cts') || file.path.endsWith('.d.mts'))
      );
      
      const filesContent = await Promise.all(
        dtsFiles.map(async (file: any) => {
          const fileUrl = `https://unpkg.com/@types/${packageName}@latest${file.path}`;
          try {
            const fileResponse = await fetch(fileUrl);
            if (fileResponse.ok) {
              const content = await fileResponse.text();
              return { path: file.path, content };
            }
          } catch (e) {
          }
          return null;
        })
      );
      
      return filesContent.filter((f): f is { path: string; content: string } => f !== null);
    }
    
    const data = await response.json();
    const dtsFiles = data.files.filter((file: any) => 
      file.path && (file.path.endsWith('.d.ts') || file.path.endsWith('.d.cts') || file.path.endsWith('.d.mts'))
    );
    
    const filesContent = await Promise.all(
      dtsFiles.map(async (file: any) => {
        const fileUrl = `https://unpkg.com/${packageName}@${version}${file.path}`;
        try {
          const fileResponse = await fetch(fileUrl);
          if (fileResponse.ok) {
            const content = await fileResponse.text();
            return { path: file.path, content };
          }
        } catch (e) {
        }
        return null;
      })
    );
    
    return filesContent.filter((f): f is { path: string; content: string } => f !== null);
  } catch (error) {
    return [];
  }
};

export const useMonacoTypes = ({ bookmarks, installedPackages = {} }: UseMonacoTypesProps) => {
  const monaco = useMonaco();
  const disposablesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!monaco) return;

    disposablesRef.current.forEach(disposable => disposable?.dispose());
    disposablesRef.current = [];

    const activeBookmarks = bookmarks.filter(b => b.isGloballyActive);
    
    if (activeBookmarks.length > 0) {
      const bookmarkTypes = generateBookmarkTypes(activeBookmarks);
      
      if (bookmarkTypes) {
        const disposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(
          bookmarkTypes,
          'ts:bookmarks.d.ts'
        );
        
        disposablesRef.current.push(disposable);
      }
    }

    return () => {
      disposablesRef.current.forEach(disposable => disposable?.dispose());
      disposablesRef.current = [];
    };
  }, [monaco, bookmarks]);

  useEffect(() => {
    if (!monaco || !installedPackages) return;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });

    const loadPackageTypes = async () => {
      const packageEntries = Object.entries(installedPackages);
      
      for (const [packageName, version] of packageEntries) {
        const files = await fetchAllPackageFiles(packageName, version);
        
        if (files.length > 0) {
          const mainFile = files.find(f => f.path === '/index.d.ts') || files[0];
          
          if (mainFile) {
            const moduleDeclaration = `declare module '${packageName}' {
  ${mainFile.content.replace(/^export /gm, '  export ')}
}`;
            
            const filePath = `file:///node_modules/@types/${packageName}/index.d.ts`;
            
            const disposable1 = monaco.languages.typescript.typescriptDefaults.addExtraLib(
              moduleDeclaration,
              filePath
            );
            
            const disposable2 = monaco.languages.typescript.javascriptDefaults.addExtraLib(
              moduleDeclaration,
              filePath
            );
            
            disposablesRef.current.push(disposable1, disposable2);
          }
        }
      }
    };

    loadPackageTypes();
  }, [monaco, installedPackages]);

  const addNpmPackageTypes = async (packageName: string, types: string) => {
    if (!monaco) return;

    const disposable = monaco.languages.typescript.typescriptDefaults.addExtraLib(
      types,
      `ts:node_modules/@types/${packageName}/index.d.ts`
    );
    
    disposablesRef.current.push(disposable);
  };

  return {
    addNpmPackageTypes,
  };
};
