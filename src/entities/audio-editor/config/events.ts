export const AUDIO_EDITOR_EVENTS = [
  'Play/Pause',
  'Undo',
  'Redo',
  'Magnifier',
  'Cut',
  'Cursor',
] as const;

export type AudioEditorEvent = (typeof AUDIO_EDITOR_EVENTS)[number];
