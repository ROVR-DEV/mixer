import { clamp } from '@/shared/lib';
import { Rect } from '@/shared/model';

import { Timeline } from './timeline';

const calculatePercent = (currentX: number, startX: number, endX: number) =>
  clamp(((currentX - startX) / (endX - startX)) * 100, 0, 100);

const SCROLL_AREA_HALF_WIDTH = 100;

const getTimelineLeftScrollBounds = (timelineRect: Rect) => {
  return {
    start: timelineRect.x - SCROLL_AREA_HALF_WIDTH,
    end: timelineRect.x + SCROLL_AREA_HALF_WIDTH,
  };
};

const getTimelineRightScrollBounds = (timelineRect: Rect) => {
  return {
    start: timelineRect.x + timelineRect.width - SCROLL_AREA_HALF_WIDTH,
    end: timelineRect.x + timelineRect.width + SCROLL_AREA_HALF_WIDTH,
  };
};

export const shiftXTimeline = (e: MouseEvent, timeline: Timeline) => {
  const timelineElement = timeline.timelineContainer.timelineRef.current;

  if (!timelineElement) {
    return 0;
  }

  const { x: mouseX } = e;

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
