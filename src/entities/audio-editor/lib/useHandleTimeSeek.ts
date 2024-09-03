import { useCallback } from 'react';

import { Player, Timeline } from '../model';

export const useHandleTimeSeek = (player: Player, timeline: Timeline) => {
  return useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLDivElement>) =>
      player.setTime(timeline.mapGlobalToTime(e.pageX)),
    [player, timeline],
  );
};
