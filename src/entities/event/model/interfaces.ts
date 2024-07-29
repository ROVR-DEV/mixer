// eslint-disable-next-line boundaries/element-types
import { AudioEditorEvent } from '@/entities/audio-editor';

export interface KeyBind {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export type KeyBindString = string;

export const keyBindToString = (keyBind: KeyBind): KeyBindString => {
  const { key, ctrl, shift, alt, meta } = keyBind;

  const modifiers = {
    Ctrl: ctrl,
    Shift: shift,
    Alt: alt,
    Meta: meta,
  };

  const keys = Object.entries(modifiers)
    .filter(([_, value]) => Boolean(value))
    .map(([key, _]) => key)
    .join('+');

  return `${keys.length ? keys + ' + ' : ''}${key}`;
};

export interface GlobalControlsEvent {
  type: AudioEditorEvent;
}
