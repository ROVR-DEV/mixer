import { Side, AudioEditorTrack } from '../model';

export const getLeftGlobalBound = (track: AudioEditorTrack, side: Side) => {
  switch (side) {
    case 'left':
      return 0;
    case 'right':
      return Math.max(
        track.trimStartTime,
        (track.filters?.fadeInNode.endTime ?? 0) +
          track.trimStartTime -
          track.startTrimDuration,
      );
    default:
      return 0;
  }
};

export const getRightGlobalBound = (track: AudioEditorTrack, side: Side) => {
  switch (side) {
    case 'left':
      return Math.min(
        track.trimEndTime,
        (track.filters?.fadeOutNode.startTime ?? 0) +
          track.trimStartTime -
          track.startTrimDuration,
      );
    case 'right':
      return track?.trimEndTime;
    default:
      return Infinity;
  }
};

export const getGlobalBounds = (track: AudioEditorTrack | null, side: Side) => {
  if (!track?.filters) {
    return { leftBound: 0, rightBound: 0 };
  }

  return {
    leftBound: getLeftGlobalBound(track, side),
    rightBound: getRightGlobalBound(track, side),
  };
};

export const getLocalBounds = (track: AudioEditorTrack, side: Side) => {
  if (!track?.filters) {
    return { leftBound: 0, rightBound: 0 };
  }

  const { leftBound, rightBound } = getGlobalBounds(track, side);

  return {
    leftBound: leftBound - track.startTime,
    rightBound: rightBound - track.startTime,
  };
};
