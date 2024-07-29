// eslint-disable-next-line boundaries/element-types
import { KeyBindString, keyBindToString } from '@/entities/event';

import { AudioEditorEvent } from './events';

export const KEY_BINDINGS: Record<KeyBindString, AudioEditorEvent> = {
  [keyBindToString({ key: 'Space' })]: 'Play/Pause',
  [keyBindToString({ key: 'KeyZ', ctrl: true })]: 'Undo',
  [keyBindToString({ key: 'KeyZ', ctrl: true, shift: true })]: 'Redo',
  [keyBindToString({ key: 'KeyM' })]: 'Magnifier',
  [keyBindToString({ key: 'KeyC' })]: 'Cut',
  [keyBindToString({ key: 'KeyV' })]: 'Cursor',
};
