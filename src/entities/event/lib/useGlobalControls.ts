'use client';

import { useCallback } from 'react';

// eslint-disable-next-line boundaries/element-types
import { useWindowEvent } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { AudioEditorEvent, KEY_BINDINGS } from '@/entities/audio-editor';

import { GlobalControlsEvent, KeyBind } from '../model';

const processHotKey = <T extends Record<string, AudioEditorEvent>>(
  e: KeyboardEvent,
  keyBindings: T,
  handler: (event: GlobalControlsEvent) => void,
) => {
  const keyBind = KeyBind.fromKeyboardEvent(e);
  const keyBindString = keyBind.toString();

  if (keyBindString in keyBindings) {
    handler({ type: keyBindings[keyBindString] });
  }
};

export const useGlobalControls = (
  handler: (event: GlobalControlsEvent) => void,
) => {
  const handleHotKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
      }

      processHotKey(e, KEY_BINDINGS, handler);
    },
    [handler],
  );

  useWindowEvent('keydown', handleHotKey);
};
