'use client';

import { useEffect } from 'react';

import { GlobalControlsEvent } from '../model';

export const useGlobalControls = (
  handler: (event: GlobalControlsEvent) => void,
) => {
  useEffect(() => {
    const processKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handler({ type: 'Play/Pause' });
      }
    };

    document.addEventListener('keydown', processKeyDown);
    return () => document.removeEventListener('keydown', processKeyDown);
  }, [handler]);
};
