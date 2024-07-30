export const AUDIO_EDITOR_EVENTS = [
  'Play/Pause',
  'Undo',
  'Redo',
  'Magnifier',
  'Cut',
  'Cursor',
  'Fit',
  'Loop',
  'Mute',
  'Solo',
] as const;

export type AudioEditorEvent = (typeof AUDIO_EDITOR_EVENTS)[number];
