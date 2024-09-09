import { useCallback, useMemo } from 'react';

import { useSelection } from '@/shared/lib/useSelection';
import { Rect } from '@/shared/model';

import { Player, Timeline, updateRegionRect } from '@/entities/audio-editor';

export const useAudioEditorRegion = (player: Player, timeline: Timeline) => {
  const onChange = useCallback(
    (rect: Rect) =>
      requestAnimationFrame(() =>
        updateRegionRect(timeline, player.region, rect),
      ),
    [player, timeline],
  );

  const offsetRect = useMemo(
    () => new Rect(timeline.scroll, 0, 0, 0),
    [timeline.scroll],
  );

  return useSelection({
    offsetRect,
    onChange,
  });
};
