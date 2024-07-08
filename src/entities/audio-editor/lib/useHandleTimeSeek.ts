import { useCallback } from 'react';

import { Player, TimelineController } from '../model';

export const useHandleTimeSeek = (
  player: Player,
  timelineController: TimelineController,
) => {
  return useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLDivElement>) =>
      player.setTime(timelineController.virtualPixelsToTime(e.pageX)),
    [player, timelineController],
  );
};
