import { Rect, clamp } from '@/shared/lib';
import { useSelection } from '@/shared/lib/useSelection';

import { Player, Timeline } from '@/entities/audio-editor';

import { checkAndToggleRegionLoop } from './checkAndToggleRegionLoop';

export const useAudioEditorRegion = (player: Player, timeline: Timeline) => {
  const handleChange = (rect: Rect) => {
    if (!player.region.isEnabled) {
      player.region.toggle();
    }

    requestAnimationFrame(() => {
      player.region.start = clamp(timeline.pixelsToTime(rect.left), 0);

      player.region.end = clamp(
        timeline.pixelsToTime(rect.right),
        player.region.start,
      );

      checkAndToggleRegionLoop(player);
    });
  };

  return useSelection({
    offsetRect: new Rect(
      timeline.realToVirtualPixels(timeline.scroll),
      0,
      0,
      0,
    ),
    boundsRect: new Rect(
      timeline.boundingClientRect.x,
      timeline.boundingClientRect.y,
      timeline.timelineScrollWidth,
      timeline.timelineClientHeight,
    ),
    onChange: handleChange,
  });
};
