import { AudioEditorTool } from '@/entities/audio-editor';

export const AUDIO_EDITOR_CURSORS: Record<AudioEditorTool, string> = {
  cursor: '',
  scissors:
    'url(icons/scissors-up.svg) 16 16, url(icons/scissors-up.png) 16 16, auto',
  magnifier:
    'url(icons/magnifier.svg) 14 14, url(icons/magnifier.png) 14 14, auto',
};
