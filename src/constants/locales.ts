export interface Locale {
  key: string;
  name: string;
  flag: string;
}

export const LOCALES: Locale[] = [
  { key: "es", name: "Español", flag: "es.png" },
  { key: "en", name: "English", flag: "en.png" },
  { key: "zh", name: "中文", flag: "cn.svg" },
];
