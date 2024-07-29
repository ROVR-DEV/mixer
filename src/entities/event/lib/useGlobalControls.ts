'use client';

import { useEffect } from 'react';

// eslint-disable-next-line boundaries/element-types
import { KEY_BINDINGS } from '@/entities/audio-editor';
// eslint-disable-next-line boundaries/element-types
import { isTrackCachingEnabled, toggleTrackCaching } from '@/entities/track';

import { GlobalControlsEvent, KeyBind, keyBindToString } from '../model';

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

      const keyBind: KeyBind = {
        key: e.code,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
      };

      const keyBindString = keyBindToString(keyBind);

      if (keyBindString in KEY_BINDINGS) {
        handler({ type: KEY_BINDINGS[keyBindString] });
      }
    };

    document.addEventListener('keydown', processKeyDown);
    return () => document.removeEventListener('keydown', processKeyDown);
  }, [handler]);
};
