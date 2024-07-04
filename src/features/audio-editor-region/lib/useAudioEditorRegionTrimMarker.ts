import { useCallback, useMemo } from 'react';

import { clamp, useGlobalDnD } from '@/shared/lib';
import { DnDData } from '@/shared/model';
import { TrimSide } from '@/shared/ui';

import { Player, TimelineController } from '@/entities/audio-editor';

import { checkAndToggleRegionLoop } from './checkAndToggleRegionLoop';

type AudioAudioEditorRegionTrimMarkerDnDData = DnDData<{ startTime: number }>;

const updateRegionStart = (newTime: number, player: Player) =>
  (player.region.start = clamp(newTime, 0, player.region.end));

const updateRegionEnd = (newTime: number, player: Player) =>
  (player.region.end = clamp(newTime, player.region.start));

export const useAudioEditorRegionTrimMarker = (
  player: Player,
  timelineController: TimelineController,
  trimSide: TrimSide,
) => {
  const updateRegion = useMemo(() => {
    switch (trimSide) {
      case 'left':
        return (newTime: number) => updateRegionStart(newTime, player);
      case 'right':
        return (newTime: number) => updateRegionEnd(newTime, player);
    }
  }, [player, trimSide]);

  const onDragStart = useCallback(
    (
      _: MouseEvent | React.MouseEvent<HTMLElement>,
      dndData: AudioAudioEditorRegionTrimMarkerDnDData,
    ) => {
      dndData.customProperties = {
        startTime:
          trimSide === 'left' ? player.region.start : player.region.end,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trimSide],
  );

  const onDrag = useCallback(
    (
      _: MouseEvent | React.MouseEvent<HTMLElement>,
      dndData: AudioAudioEditorRegionTrimMarkerDnDData,
    ) => {
      if (dndData.customProperties.startTime === undefined) {
        return;
      }

      const timeOffset =
        timelineController.pixelsToTime(dndData.currentPosition.x) -
        timelineController.pixelsToTime(dndData.startPosition.x);

      const newTime = dndData.customProperties.startTime + timeOffset;

      updateRegion(newTime);
      checkAndToggleRegionLoop(player);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trimSide, timelineController],
  );

  return useGlobalDnD({ onDragStart, onDrag });
};
