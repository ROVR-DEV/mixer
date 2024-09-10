import { clamp } from '@/shared/lib';
import { Rect } from '@/shared/model';

import { Timeline } from './timeline';

const calculatePercent = (currentX: number, startX: number, endX: number) =>
  clamp(((currentX - startX) / (endX - startX)) * 100, 0, 100);

const SCROLL_AREA_HALF_WIDTH = 100;

export interface Bound {
  start: number;
  end: number;
}

const getTimelineLeftScrollBounds = (timelineRect: Rect): Bound => {
  return {
    start: timelineRect.x - SCROLL_AREA_HALF_WIDTH,
    end: timelineRect.x + SCROLL_AREA_HALF_WIDTH,
  };
};

const getTimelineRightScrollBounds = (timelineRect: Rect): Bound => {
  return {
    start: timelineRect.x + timelineRect.width - SCROLL_AREA_HALF_WIDTH,
    end: timelineRect.x + timelineRect.width + SCROLL_AREA_HALF_WIDTH,
  };
};

export const isMouseInScrollBounds = (
  mouseX: number,
  timeline: Timeline,
): { leftBound: Bound | undefined; rightBound: Bound | undefined } => {
  const timelineElement = timeline.timelineContainer.timelineRef.current;

  if (!timelineElement) {
    return { leftBound: undefined, rightBound: undefined };
  }

  const timelineRect = timelineElement.getBoundingClientRect();

  const leftBound = getTimelineLeftScrollBounds(timelineRect);
  const rightBound = getTimelineRightScrollBounds(timelineRect);

  if (mouseX <= leftBound.end) {
    return { leftBound, rightBound: undefined };
  }

  if (mouseX >= rightBound.start) {
    return { leftBound: undefined, rightBound };
  }

  return { leftBound: undefined, rightBound: undefined };
};

export const shiftXTimeline = (mouseX: number, timeline: Timeline) => {
  const timelineElement = timeline.timelineContainer.timelineRef.current;

  if (!timelineElement) {
    return 0;
  }

  const timelineRect = timelineElement.getBoundingClientRect();

  const { start: leftStart, end: leftEnd } =
    getTimelineLeftScrollBounds(timelineRect);

  const { start: rightStart, end: rightEnd } =
    getTimelineRightScrollBounds(timelineRect);

  if (mouseX <= leftEnd) {
    const percent = 100 - calculatePercent(mouseX, leftStart, leftEnd);
    timeline.scrollController.shiftX(-1 * percent);

    return -1;
  } else if (mouseX >= rightStart) {
    const percent = calculatePercent(mouseX, rightStart, rightEnd);
    timeline.scrollController.shiftX(1 * percent);

    return 1;
  }

  return 0;
};

export const shiftXTimelineFromBounds = (
  mouseX: number,
  timeline: Timeline,
  leftBound: Bound | undefined,
  rightBound: Bound | undefined,
) => {
  if (leftBound !== undefined) {
    const percent =
      100 - calculatePercent(mouseX, leftBound.start, leftBound.end);
    timeline.scrollController.shiftX(-1 * percent);

    return -1;
  } else if (rightBound !== undefined) {
    const percent = calculatePercent(
      mouseX,
      rightBound?.start,
      rightBound?.end,
    );
    timeline.scrollController.shiftX(1 * percent);

    return 1;
  }

  return 0;
};
