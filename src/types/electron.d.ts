declare global {
  interface Window {
    electron?: {
      bookmarks: {
        load: () => Promise<any[]>;
        save: (bookmarks: any[]) => Promise<void>;
      };
    };
  }
}

export {};
