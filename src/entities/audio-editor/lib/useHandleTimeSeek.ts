import { useCallback } from 'react';

import { AudioEditorManager, TimelineController } from '../model';

import { pageXToTime } from './pageXToTime';

export const useHandleTimeSeek = (
  audioEditorManager: AudioEditorManager,
  timelineController: TimelineController,
) => {
  return useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLDivElement>) =>
      audioEditorManager.seekTo(pageXToTime(e.pageX, timelineController)),
    [audioEditorManager, timelineController],
  );
};
