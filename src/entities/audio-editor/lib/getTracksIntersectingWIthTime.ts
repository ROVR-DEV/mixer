import { ObservableSet } from 'mobx';

// eslint-disable-next-line boundaries/element-types
import { TrackWithMeta } from '@/entities/track';

export const getTracksIntersectingWithTime = (
  tracks: ObservableSet<TrackWithMeta>,
  time: number,
) => {
  return [...tracks].filter(
    (track) => time >= track.currentStartTime && time <= track.currentEndTime,
  );
};

export const getTracksNotIntersectingWithTime = (
  tracks: ObservableSet<TrackWithMeta>,
  time: number,
) => {
  return [...tracks].filter(
    (track) => time < track.currentStartTime && time > track.currentEndTime,
  );
};
