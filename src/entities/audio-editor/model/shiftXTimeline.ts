import { clamp } from '@/shared/lib';
import { Bounds, Rect } from '@/shared/model';

import { Timeline } from './timeline';

const calculatePercent = (currentX: number, startX: number, endX: number) =>
  clamp(((currentX - startX) / (endX - startX)) * 100, 0, 100);

const SCROLL_AREA_HALF_WIDTH = 100;

const getTimelineLeftScrollBounds = (timelineRect: Rect): Bounds => {
  return {
    start: timelineRect.x - SCROLL_AREA_HALF_WIDTH,
    end: timelineRect.x + SCROLL_AREA_HALF_WIDTH,
  };
};

const getTimelineRightScrollBounds = (timelineRect: Rect): Bounds => {
  return {
    start: timelineRect.x + timelineRect.width - SCROLL_AREA_HALF_WIDTH,
    end: timelineRect.x + timelineRect.width + SCROLL_AREA_HALF_WIDTH,
  };
};

export const isMouseInScrollBounds = (
  mouseX: number,
  timeline: Timeline,
): { leftBound: Bounds | undefined; rightBound: Bounds | undefined } => {
  const timelineElement = timeline.container;

  if (!timelineElement) {
    return { leftBound: undefined, rightBound: undefined };
  }

  const leftBound = getTimelineLeftScrollBounds(timeline.boundingClientRect);
  const rightBound = getTimelineRightScrollBounds(timeline.boundingClientRect);

  if (mouseX <= leftBound.end) {
    return { leftBound, rightBound: undefined };
  }

  if (mouseX >= rightBound.start) {
    return { leftBound: undefined, rightBound };
  }

  return { leftBound: undefined, rightBound: undefined };
};

export const shiftXTimeline = (mouseX: number, timeline: Timeline) => {
  const timelineElement = timeline.container;

  if (!timelineElement) {
    return 0;
  }

  const { start: leftStart, end: leftEnd } = getTimelineLeftScrollBounds(
    timeline.boundingClientRect,
  );

  const { start: rightStart, end: rightEnd } = getTimelineRightScrollBounds(
    timeline.boundingClientRect,
  );

  if (mouseX <= leftEnd) {
    const percent = 100 - calculatePercent(mouseX, leftStart, leftEnd);
    timeline.hScrollController.shiftX(-1 * percent);

    return -1;
  } else if (mouseX >= rightStart) {
    const percent = calculatePercent(mouseX, rightStart, rightEnd);
    timeline.hScrollController.shiftX(1 * percent);

    return 1;
  }

  return 0;
};

export const shiftXTimelineFromBounds = (
  mouseX: number,
  timeline: Timeline,
  leftBound: Bounds | undefined,
  rightBound: Bounds | undefined,
) => {
  if (leftBound !== undefined) {
    const percent =
      100 - calculatePercent(mouseX, leftBound.start, leftBound.end);
    timeline.hScrollController.shiftX(-1 * percent);

    return -1;
  } else if (rightBound !== undefined) {
    const percent = calculatePercent(
      mouseX,
      rightBound?.start,
      rightBound?.end,
    );
    timeline.hScrollController.shiftX(1 * percent);

    return 1;
  }

  return 0;
};
