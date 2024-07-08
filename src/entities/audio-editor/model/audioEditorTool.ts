export const ALL_AUDIO_EDITOR_TOOLS = [
  'cursor',
  'scissors',
  'magnifier',
] as const;

export type AudioEditorTool = (typeof ALL_AUDIO_EDITOR_TOOLS)[number];
