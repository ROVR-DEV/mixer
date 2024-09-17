// eslint-disable-next-line boundaries/element-types
import { AudioEditorEvent } from '@/entities/audio-editor';

export interface GlobalControlsEvent {
  type: AudioEditorEvent;
}

export interface KeyBindProps {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export class KeyBind {
  private key: string;
  private ctrl: boolean;
  private shift: boolean;
  private alt: boolean;
  private meta: boolean;

  constructor({
    key,
    ctrl = false,
    shift = false,
    alt = false,
    meta = false,
  }: KeyBindProps) {
    this.key = key;
    this.ctrl = ctrl;
    this.shift = shift;
    this.alt = alt;
    this.meta = meta;
  }

  toString = (): string => {
    return KeyBind.getStringView(this);
  };

  toHumanString = (): string => {
    return KeyBind.getStringView(this).replace('Key', '');
  };

  static fromKeyboardEvent = (e: KeyboardEvent): KeyBind => {
    return new KeyBind({
      key: e.code,
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey,
    });
  };

  static fromString = (str: string): KeyBind => {
    const parts = str.split('+').map((s) => s.trim());

    let ctrl: boolean | undefined = undefined;
    let shift: boolean | undefined = undefined;
    let alt: boolean | undefined = undefined;
    let meta: boolean | undefined = undefined;

    let key: string = 'unknown';

    for (const part of parts) {
      switch (part) {
        case 'Ctrl':
          ctrl = true;
          break;
        case 'Shift':
          shift = true;
          break;
        case 'Alt':
          alt = true;
          break;
        case 'Meta':
          meta = true;
          break;
        default:
          key = part;
          break;
      }
    }

    return new KeyBind({
      ctrl,
      shift,
      alt,
      meta,
      key,
    });
  };

  static getStringView = (keyBind: KeyBind): KeyBindString => {
    const modifiers = {
      Ctrl: keyBind.ctrl,
      Shift: keyBind.shift,
      Alt: keyBind.alt,
      Meta: keyBind.meta,
    };

    const keys = Object.entries(modifiers)
      .filter(([_, value]) => Boolean(value))
      .map(([key, _]) => key)
      .join(' + ');

    return `${keys.length ? keys + ' + ' : ''}${keyBind.key}`;
  };
}

export type KeyBindString = string;
