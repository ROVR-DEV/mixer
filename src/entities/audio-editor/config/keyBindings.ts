// eslint-disable-next-line boundaries/element-types
import { KeyBindString, keyBindToString } from '@/entities/event';

import { AudioEditorEvent } from './events';

export const KEY_BINDINGS: Record<KeyBindString, AudioEditorEvent> = {
  [keyBindToString({ key: 'Space' })]: 'Play/Pause',

  [keyBindToString({ key: 'KeyZ', ctrl: true })]: 'Undo',
  [keyBindToString({ key: 'KeyZ', ctrl: true, shift: true })]: 'Redo',

  [keyBindToString({ key: 'KeyZ' })]: 'Fit',

  [keyBindToString({ key: 'KeyF' })]: 'Magnifier',

  [keyBindToString({ key: 'KeyT' })]: 'Cut',

  [keyBindToString({ key: 'KeyV' })]: 'Cursor',
  [keyBindToString({ key: 'KeyD' })]: 'Cursor',

  [keyBindToString({ key: 'KeyC' })]: 'Loop',
  [keyBindToString({ key: 'KeyU' })]: 'Loop',
  [keyBindToString({ key: 'KeyL' })]: 'Loop',

  [keyBindToString({ key: 'KeyM' })]: 'Mute',

  [keyBindToString({ key: 'KeyS' })]: 'Solo',
};
