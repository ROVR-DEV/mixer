import { useCallback } from 'react';

import { CustomDragEventHandler } from '@/shared/model';
import { TrimSide } from '@/shared/ui';

import {
  AudioEditorDragData,
  getTimeAfterDrag,
  isAudioEditorDragDataFilled,
  Player,
  Timeline,
  updateRegion,
} from '@/entities/audio-editor';

export const useRegionTrimMarker = (
  player: Player,
  timeline: Timeline,
  side: TrimSide,
) => {
  const onStart: CustomDragEventHandler<AudioEditorDragData> = useCallback(
    (_, data, customData) => {
      customData.startX = data.x;
      customData.startTime =
        side === 'left' ? player.region.start : player.region.end;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [side],
  );

  const onDrag: CustomDragEventHandler<AudioEditorDragData> = useCallback(
    (_, data, customData) => {
      if (!isAudioEditorDragDataFilled(customData)) {
        return;
      }

      const newTime = getTimeAfterDrag(timeline, data, customData);

      const duration = player.region.duration;

      updateRegion(newTime, player.region, side);

      if (
        duration === 0 &&
        player.region.duration > 0 &&
        !player.region.isEnabled
      ) {
        player.region.toggle();
      }
    },
    [timeline, player, side],
  );

  const onStop: CustomDragEventHandler<AudioEditorDragData> =
    useCallback(() => {}, []);

  return {
    onStart,
    onDrag,
    onStop,
  };
};
