import { DraggableData } from 'react-draggable';

import { clamp } from '@/shared/lib';

import { Timeline } from './timeline';

export type AudioEditorDragData = Partial<{
  startX: number;
  startTime: number;
}>;

export const isAudioEditorDragDataFilled = <T extends AudioEditorDragData>(
  data: T,
): data is Required<T> =>
  data.startTime != undefined && data.startX != undefined;

export const getTimeAfterDrag = (
  timeline: Timeline,
  data: DraggableData,
  customData: Required<AudioEditorDragData>,
) => {
  const timeOffset =
    timeline.mapGlobalToTime(data.x) -
    timeline.mapGlobalToTime(customData.startX);

  return clamp(customData.startTime + timeOffset, 0);
};
