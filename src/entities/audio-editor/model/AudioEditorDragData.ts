import { DraggableData } from 'react-draggable';

import { clamp } from '@/shared/lib';
import { RequireBy } from '@/shared/model';

import { Timeline } from './timeline';

export type AudioEditorDragData = Partial<{
  startX: number;
  startTime: number;
}>;

export const isAudioEditorDragDataFilled = <T extends AudioEditorDragData>(
  data: T,
): data is RequireBy<T, 'startTime' | 'startX'> =>
  data.startTime != undefined && data.startX != undefined;

export const getTimeAfterDrag = (
  timeline: Timeline,
  data: DraggableData,
  customData: Required<AudioEditorDragData>,
) => {
  const timeOffset =
    timeline.globalToTime(data.x) - timeline.globalToTime(customData.startX);

  return clamp(customData.startTime + timeOffset, 0);
};
