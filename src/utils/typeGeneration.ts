import { Bookmark } from './bookmarkUtils';
import * as acorn from 'acorn';

const extractParameterTypes = (code: string, paramNames: string[]): string[] => {
  const paramTypes: string[] = [];
  
  paramNames.forEach(paramName => {
    const typeRegex = new RegExp(`${paramName}\\s*:\\s*([\\w\\[\\]<>,\\s|&]+)(?=[,\\)])`);
    const match = code.match(typeRegex);
    
    if (match && match[1]) {
      paramTypes.push(match[1].trim());
    } else {
      paramTypes.push('any');
    }
  });
  
  return paramTypes;
};

const extractReturnType = (code: string): string => {
  const returnTypeRegex = /\)\s*:\s*([\w\[\]<>,\s|&]+)(?:\s*=>|\s*\{)/;
  const match = code.match(returnTypeRegex);
  
  return match && match[1] ? match[1].trim() : 'any';
};

export const generateBookmarkTypes = (bookmarks: Bookmark[]): string => {
  const types: string[] = [];

  bookmarks.forEach(bookmark => {
    try {
      const originalCode = bookmark.code;
      
      const jsCode = originalCode
        .replace(/:\s*[\w\[\]<>,\s|&]+(?=\s*[=,\)])/g, '')
        .replace(/\)\s*:\s*[\w\[\]<>,\s|&]+(?=\s*=>)/g, ')')
        .replace(/\)\s*:\s*[\w\[\]<>,\s|&]+(?=\s*\{)/g, ')');
      
      const ast = acorn.parse(jsCode, {
        ecmaVersion: 2025,
        sourceType: 'module',
      });

      ast.body.forEach((node: any) => {
        if (node.type === 'VariableDeclaration') {
          node.declarations.forEach((decl: any) => {
            if (decl.id?.name) {
              const name = decl.id.name;
              
              if (decl.init?.type === 'ArrowFunctionExpression' || 
                  decl.init?.type === 'FunctionExpression') {
                const params = decl.init.params || [];
                const paramNames = params.map((p: any) => p.name || 'arg');
                
                const paramTypes = extractParameterTypes(originalCode, paramNames);
                const returnType = extractReturnType(originalCode);
                
                const paramsList = paramNames.map((paramName: string, i: number) => 
                  `${paramName}: ${paramTypes[i]}`
                ).join(', ');
                
                types.push(`declare const ${name}: (${paramsList}) => ${returnType};`);
              } else {
                types.push(`declare const ${name}: any;`);
              }
            }
          });
        }
        
        else if (node.type === 'FunctionDeclaration' && node.id?.name) {
          const name = node.id.name;
          const params = node.params || [];
          const paramNames = params.map((p: any) => p.name || 'arg');
          
          const paramTypes = extractParameterTypes(originalCode, paramNames);
          const returnType = extractReturnType(originalCode);
          
          const paramsList = paramNames.map((paramName: string, i: number) => 
            `${paramName}: ${paramTypes[i]}`
          ).join(', ');
          
          types.push(`declare function ${name}(${paramsList}): ${returnType};`);
        }
        
        else if (node.type === 'ClassDeclaration' && node.id?.name) {
          const name = node.id.name;
          types.push(`declare class ${name} { constructor(...args: any[]); }`);
        }
      });
      
      if (types.length === 0) {
        const matches = bookmark.code.match(/(?:const|let|var|function)\s+(\w+)/g);
        if (matches) {
          matches.forEach(match => {
            const name = match.split(/\s+/)[1];
            if (name) {
              types.push(`declare const ${name}: any;`);
            }
          });
        }
      }
    } catch (err) {
      console.warn('[typeGeneration] Failed to parse bookmark:', err);
      const varName = bookmark.name.replace(/[^a-zA-Z0-9_]/g, '_');
      types.push(`declare const ${varName}: any;`);
    }
  });

  return types.join('\n');
};

export const generateNpmPackageTypes = async (packageName: string): Promise<string | null> => {
  try {
    const typesUrl = `https://unpkg.com/@types/${packageName}/index.d.ts`;
    const response = await fetch(typesUrl);
    
    if (response.ok) return await response.text();
    
    const packageUrl = `https://unpkg.com/${packageName}/index.d.ts`;
    const packageResponse = await fetch(packageUrl);
    
    if (packageResponse.ok) return await packageResponse.text();
    
    return null;
  } catch (err) {
    console.warn('[typeGeneration] Failed to fetch types for package:', packageName, err);
    return null;
  }
};
