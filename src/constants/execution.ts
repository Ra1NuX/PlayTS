export const EXECUTION = {
  TIMEOUT_MS: 30_000,
  MAX_OLD_SPACE_SIZE_MB: 512,
  MAX_STACK_LINES: 3,
  LINE_MARKER_PREFIX: '__RUNTS_LINE_',
  LINE_MARKER_SUFFIX: '__',
  TEMP_DIR_NAME: 'runts-execution',
} as const;

export const PACKAGE_JSON_TEMPLATE = {
  name: 'runts-execution',
  version: '1.0.0',
  type: 'module' as const,
  main: 'index.js',
  scripts: {
    start: 'node index.js',
  },
};

export const WEB_PACKAGE_JSON_TEMPLATE = {
  name: 'example',
  version: '1.0.0',
  type: 'module' as const,
  main: 'index.js',
  scripts: {
    start: 'node index.js',
  },
};
