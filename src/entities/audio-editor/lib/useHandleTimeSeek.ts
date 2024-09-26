import { useCallback } from 'react';

import { Player, shiftXTimeline, Timeline } from '../model';

export const useHandleTimeSeek = (player: Player, timeline: Timeline) => {
  return useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
      player.setTime(timeline.globalToTime(e.pageX));
      shiftXTimeline(e.pageX, timeline);
    },
    [player, timeline],
  );
};
