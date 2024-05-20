import { RefObject, useMemo } from 'react';

import { useSize } from '@/shared/lib';

import { getTimelineMaxScroll } from '@/features/timeline';

const minScroll = 0;

export const useTimelineWidth = (
  timelineRef: RefObject<HTMLDivElement>,
  playlistTotalTime: number,
  pixelsPerSecond: number,
  dpi: number,
) => {
  const timelineSize = useSize(timelineRef);

  const timelineClientWidth = useMemo(() => {
    return timelineSize?.width ?? 1440;
  }, [timelineSize?.width]);

  const timelineScrollWidth = useMemo(
    () =>
      Math.max(timelineClientWidth, playlistTotalTime * pixelsPerSecond * dpi),
    [dpi, pixelsPerSecond, playlistTotalTime, timelineClientWidth],
  );

  const maxScroll =
    getTimelineMaxScroll(timelineClientWidth, timelineScrollWidth) /
    pixelsPerSecond;

  return { timelineClientWidth, timelineScrollWidth, minScroll, maxScroll };
};
