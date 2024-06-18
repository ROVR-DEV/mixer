import { Side, TrackWithMeta } from '../model';

export const getLeftGlobalBound = <T>(track: TrackWithMeta<T>, side: Side) => {
  switch (side) {
    case 'left':
      return 0;
    case 'right':
      return Math.max(
        track.visibleStartTime,
        (track.trackAudioFilters?.fadeInNode.endTime ?? 0) +
          track.visibleStartTime -
          track.startTimeOffset,
      );
    default:
      return 0;
  }
};

export const getRightGlobalBound = <T>(track: TrackWithMeta<T>, side: Side) => {
  switch (side) {
    case 'left':
      return Math.min(
        track.visibleEndTime,
        (track.trackAudioFilters?.fadeOutNode.startTime ?? 0) +
          track.visibleStartTime -
          track.startTimeOffset,
      );
    case 'right':
      return track?.visibleEndTime;
    default:
      return Infinity;
  }
};

export const getGlobalBounds = <T>(
  track: TrackWithMeta<T> | null,
  side: Side,
) => {
  if (!track?.trackAudioFilters) {
    return { leftBound: 0, rightBound: 0 };
  }

  return {
    leftBound: getLeftGlobalBound(track, side),
    rightBound: getRightGlobalBound(track, side),
  };
};

export const getLocalBounds = <T>(track: TrackWithMeta<T>, side: Side) => {
  if (!track?.trackAudioFilters) {
    return { leftBound: 0, rightBound: 0 };
  }

  const { leftBound, rightBound } = getGlobalBounds(track, side);

  return {
    leftBound: leftBound - track.startTime,
    rightBound: rightBound - track.startTime,
  };
};
