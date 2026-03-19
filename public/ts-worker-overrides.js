// Custom TypeScript worker that enables auto-import completions.
// Monaco's default worker passes `void 0` / `{}` as preferences, disabling auto-imports.
self.customTSWorkerFactory = function (TypeScriptWorker, ts, libFileMap) {
  const autoImportPreferences = {
    includeCompletionsForModuleExports: true,
    includeCompletionsForImportStatements: true,
    includeCompletionsWithInsertText: true,
    includeAutomaticOptionalChainCompletions: true,
    allowIncompleteCompletions: true,
  };

  return class extends TypeScriptWorker {
    async getCompletionsAtPosition(fileName, position) {
      const ls = this._languageService;
      if (!ls) return undefined;
      return ls.getCompletionsAtPosition(fileName, position, autoImportPreferences);
    }

    async getCompletionEntryDetails(fileName, position, entry, formatOptions, source, preferences, data) {
      const ls = this._languageService;
      if (!ls) return undefined;
      return ls.getCompletionEntryDetails(
        fileName,
        position,
        entry,
        formatOptions || {},
        source,
        autoImportPreferences,
        data
      );
    }

    async getCodeFixesAtPosition(fileName, start, end, errorCodes, formatOptions) {
      const ls = this._languageService;
      if (!ls) return [];
      try {
        return ls.getCodeFixesAtPosition(
          fileName, start, end, errorCodes, formatOptions, autoImportPreferences
        );
      } catch {
        return [];
      }
    }
  };
};
