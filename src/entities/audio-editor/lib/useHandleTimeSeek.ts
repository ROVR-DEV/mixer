import { useCallback } from 'react';

import { AudioEditorManager, TimelineController } from '../model';

export const useHandleTimeSeek = (
  audioEditorManager: AudioEditorManager,
  timelineController: TimelineController,
) => {
  return useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLDivElement>) =>
      audioEditorManager.seekTo(
        timelineController.virtualPixelsToTime(e.pageX),
      ),
    [audioEditorManager, timelineController],
  );
};
