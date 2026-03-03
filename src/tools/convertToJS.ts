import ts from "typescript";

function transpileTypeScript(tsCode: string): string {
  const codeWithLineMarkers = tsCode
    .split("\n")
    .map((line, index) => `/*__RUNTS_LINE_${index + 1}__*/${line}`)
    .join("\n");

  const result = ts.transpileModule(codeWithLineMarkers, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2024,
      jsx: ts.JsxEmit.React,
      allowUmdGlobalAccess: true,
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
    },
  });

  if (result.diagnostics && result.diagnostics.length > 0) {
    result.diagnostics.forEach((diagnostic) => {
      if (diagnostic.file && diagnostic.start !== undefined) {
        const { line, character } =
          diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          "\n"
        );
        console.error(
          `Error en línea ${line + 1}, carácter ${character + 1}: ${message}`
        );
      } else {
        console.error(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
        );
      }
    });
  }
  return result.outputText;
}

export default transpileTypeScript;
