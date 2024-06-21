import { AudioEditorTool } from '../model';

export const AUDIO_EDITOR_TOOLS: AudioEditorTool[] = [
  'cursor',
  'scissors',
  'magnifier',
  'repeat',
  'fit',
  'magnet',
  'undo',
  'redo',
];

export const AUDIO_EDITOR_TOOL_GROUPS: AudioEditorTool[][] = [
  ['cursor', 'scissors', 'magnifier'],
  ['repeat', 'fit', 'magnet'],
  ['undo', 'redo'],
];
