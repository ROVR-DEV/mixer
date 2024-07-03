import { Rect, clamp } from '@/shared/lib';
import { useSelection } from '@/shared/lib/useSelection';

import { Player, TimelineController } from '@/entities/audio-editor';

import { checkAndToggleRegionLoop } from './checkAndToggleRegionLoop';

export const useAudioEditorRegion = (
  player: Player,
  timelineController: TimelineController,
) => {
  const handleChange = (rect: Rect) => {
    if (!player.isRegionLoopEnabled) {
      player.toggleRegionLoop();
    }

    requestAnimationFrame(() => {
      player.region.start = clamp(
        timelineController.pixelsToTime(rect.left),
        0,
      );

      player.region.end = clamp(
        timelineController.pixelsToTime(rect.right),
        player.region.start,
      );

      checkAndToggleRegionLoop(player);
    });
  };

  return useSelection({
    offsetRect: new Rect(
      timelineController.realToVirtualPixels(timelineController.scroll),
      0,
      0,
      0,
    ),
    boundsRect: new Rect(
      timelineController.boundingClientRect.x,
      timelineController.boundingClientRect.y,
      timelineController.timelineScrollWidth,
      timelineController.timelineClientHeight,
    ),
    onChange: handleChange,
  });
};
