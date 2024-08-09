import { useCallback, useState } from 'react';

import { CustomDragEventHandler } from '@/shared/model';
import { CustomDraggableProps } from '@/shared/ui';

import {
  AudioEditorDragData,
  getTimeAfterDrag,
  isAudioEditorDragDataFilled,
  Player,
  Timeline,
} from '@/entities/audio-editor';

export const useAudioEditorRegionDnD = (
  player: Player,
  timeline: Timeline,
): { isDragging: boolean } & Pick<
  CustomDraggableProps,
  'onDrag' | 'onStart' | 'onStop'
> => {
  const [isDragging, setIsDragging] = useState(false);

  const onStart: CustomDragEventHandler<AudioEditorDragData> = useCallback(
    (_, data, customData) => {
      customData.startX = data.x;
      customData.startTime = player.region.start;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onDrag: CustomDragEventHandler<AudioEditorDragData> = useCallback(
    (_, data, customData) => {
      if (!isDragging) {
        setIsDragging(true);
      }

      if (!isAudioEditorDragDataFilled(customData)) {
        return;
      }

      const newTime = getTimeAfterDrag(timeline, data, customData);

      requestAnimationFrame(() =>
        player.region.setBounds(newTime, newTime + player.region.duration),
      );
    },
    [isDragging, player, timeline],
  );

  const onStop: CustomDragEventHandler<AudioEditorDragData> =
    useCallback(() => {
      setIsDragging(false);
    }, []);

  return {
    isDragging,
    onStart,
    onDrag,
    onStop,
  };
};
