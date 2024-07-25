import { useMemo } from 'react';

import { AudioEditorTool } from '@/entities/audio-editor';

import { AUDIO_EDITOR_CURSORS } from '../config';

export const useCurrentCursorIcon = (tool: AudioEditorTool) => {
  return useMemo(() => AUDIO_EDITOR_CURSORS[tool], [tool]);
};
