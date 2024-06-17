import { TrackWithMeta } from '@/entities/track';

export const adjustTracksOnPaste = (track: TrackWithMeta) => {
  track.channel.tracks.forEach((trackOnLine) => {
    if (track.uuid === trackOnLine.uuid) {
      return;
    }

    const trackIntersectsFull =
      track.visibleStartTime <= trackOnLine.visibleStartTime &&
      track.visibleEndTime >= trackOnLine.visibleEndTime;

    if (trackIntersectsFull) {
      track.channel.removeTrack(trackOnLine);
      return;
    }

    const trackIntersectsOnStart =
      track.visibleEndTime > trackOnLine.visibleStartTime &&
      track.visibleEndTime < trackOnLine.visibleEndTime;

    const trackIntersectsOnEnd =
      track.visibleStartTime > trackOnLine.visibleStartTime &&
      track.visibleStartTime < trackOnLine.visibleEndTime;

    if (trackIntersectsOnStart && trackIntersectsOnEnd) {
      const trackOnLineCopy = new TrackWithMeta(
        trackOnLine.originalTrack,
        trackOnLine.channel,
      );

      trackOnLineCopy.setNewStartTime(trackOnLine.visibleStartTime);
      trackOnLineCopy.setStartTime(track.visibleEndTime);
      trackOnLineCopy.setEndTime(trackOnLine.visibleEndTime);

      trackOnLine.setEndTime(track.visibleStartTime);

      track.channel.addTrack(trackOnLineCopy);
    } else if (trackIntersectsOnStart) {
      trackOnLine.setStartTime(track.visibleEndTime);
    } else if (trackIntersectsOnEnd) {
      trackOnLine.setEndTime(track.visibleStartTime);
    }
  });
};
