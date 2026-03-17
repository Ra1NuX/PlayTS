export interface ParsedEnvVar {
  key: string;
  value: string;
  isActive: boolean;
}

export function parseEnvFileContent(content: string): ParsedEnvVar[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const eqIndex = line.indexOf('=');
      const key = line.slice(0, eqIndex).trim();
      const value = line.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      return { key, value, isActive: true };
    })
    .filter((ev) => ev.key.length > 0);
}
