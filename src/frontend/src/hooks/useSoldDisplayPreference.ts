import { useState, useEffect } from 'react';

export type SoldDisplayMode = 'badge' | 'watermark';

const STORAGE_KEY = 'zart-sold-display-mode';

export function useSoldDisplayPreference() {
  const [mode, setMode] = useState<SoldDisplayMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored === 'watermark' ? 'watermark' : 'badge') as SoldDisplayMode;
    } catch {
      return 'badge';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
  }, [mode]);

  return { mode, setMode };
}
