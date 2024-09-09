// eslint-disable-next-line boundaries/element-types
import { KeyBind, KeyBindString } from '@/entities/event';

import { AudioEditorEvent } from './events';

export const KEY_BINDINGS: Record<KeyBindString, AudioEditorEvent> = {
  [new KeyBind({ key: 'Space' }).toString()]: 'Play/Pause',

  [new KeyBind({ key: 'KeyZ', ctrl: true }).toString()]: 'Undo',
  [new KeyBind({ key: 'KeyZ', ctrl: true, shift: true }).toString()]: 'Redo',

  [new KeyBind({ key: 'KeyZ' }).toString()]: 'Fit',

  [new KeyBind({ key: 'KeyF' }).toString()]: 'Magnifier',

  [new KeyBind({ key: 'KeyT' }).toString()]: 'Cut',

  [new KeyBind({ key: 'KeyV' }).toString()]: 'Cursor',
  [new KeyBind({ key: 'KeyD' }).toString()]: 'Cursor',

  [new KeyBind({ key: 'KeyC' }).toString()]: 'Loop',
  [new KeyBind({ key: 'KeyU' }).toString()]: 'Loop',
  [new KeyBind({ key: 'KeyL' }).toString()]: 'Loop',

  [new KeyBind({ key: 'KeyM' }).toString()]: 'Mute',

  [new KeyBind({ key: 'KeyS' }).toString()]: 'Solo',
};

export const KEY_BINDING_REVERSE: Record<AudioEditorEvent, KeyBindString> =
  Object.fromEntries(
    Object.entries(KEY_BINDINGS).map(([key, value]) => [value, key]),
  );

export const KEY_BINDING_REVERSE_TO_OBJECT: Record<AudioEditorEvent, KeyBind> =
  Object.fromEntries(
    Object.entries(KEY_BINDINGS).map(([key, value]) => [
      value,
      KeyBind.fromString(key),
    ]),
  );
