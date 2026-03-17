import { useEffect } from 'react';
import { useUpdateStore } from '../stores/updateStore';

export function useUpdateListener() {
  const setUpdateDownloaded = useUpdateStore((s) => s.setUpdateDownloaded);

  useEffect(() => {
    if (!window.electron?.onUpdateDownloaded) return;

    window.electron.onUpdateDownloaded((info) => {
      setUpdateDownloaded(info.version);
    });

    return () => {
      window.electron?.removeUpdateListeners();
    };
  }, [setUpdateDownloaded]);
}
