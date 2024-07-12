'use client';

import { useEffect } from 'react';

// eslint-disable-next-line boundaries/element-types
import { isTrackCachingEnabled, toggleTrackCaching } from '@/entities/track';

import { GlobalControlsEvent } from '../model';

export const useGlobalControls = (
  handler: (event: GlobalControlsEvent) => void,
) => {
  useEffect(() => {
    const processKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === 'KeyC') {
        toggleTrackCaching();

        // eslint-disable-next-line no-console
        console.info(
          `Track caching is ${isTrackCachingEnabled() ? 'enabled' : 'disabled'}`,
        );
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        handler({ type: 'Play/Pause' });
        return;
      }

      if (e.ctrlKey && !e.shiftKey && e.code === 'KeyZ') {
        handler({ type: 'Undo' });
        return;
      }

      if (e.ctrlKey && e.shiftKey && e.code === 'KeyZ') {
        handler({ type: 'Redo' });
        return;
      }

      if (e.code == 'KeyM') {
        handler({ type: 'Magnifier' });
      }
    };

    document.addEventListener('keydown', processKeyDown);
    return () => document.removeEventListener('keydown', processKeyDown);
  }, [handler]);
};
