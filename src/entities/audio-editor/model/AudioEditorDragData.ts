import { DraggableData } from 'react-draggable';

import { clamp } from '@/shared/lib';

import { Timeline } from './timeline';

export type AudioEditorDragData = Partial<{
  startX: number;
  startTime: number;
}>;

export const isAudioEditorDragDataFilled = (
  data: AudioEditorDragData,
): data is Required<AudioEditorDragData> => {
  return data.startTime != undefined && data.startX != undefined;
};

export const getTimeAfterDrag = (
  timeline: Timeline,
  data: DraggableData,
  customData: Required<AudioEditorDragData>,
) => {
  const timeOffset =
    timeline.pixelsToTime(data.x) - timeline.pixelsToTime(customData.startX);

  return clamp(customData.startTime + timeOffset, 0);
};
