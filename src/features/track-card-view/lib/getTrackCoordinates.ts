import { round } from 'lodash-es';

export const getTrackCoordinates = (
  startTime: number,
  endTime: number,
  pixelsPerSecond: number,
) => {
  const trackStartXGlobal = startTime * pixelsPerSecond;
  const trackEndXGlobal = endTime * pixelsPerSecond;
  const trackWidth = round(trackEndXGlobal - trackStartXGlobal, 3);

  return { trackStartXGlobal, trackEndXGlobal, trackWidth };
};
