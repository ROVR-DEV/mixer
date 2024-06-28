import { AudioEditorTrack } from '@/entities/track';

export const adjustTracksOnPaste = (currentTrack: AudioEditorTrack) => {
  currentTrack.channel.tracks.forEach((track) => {
    if (currentTrack.uuid === track.uuid) {
      return;
    }

    const trackIntersectsFull =
      currentTrack.trimStartTime <= track.trimStartTime &&
      currentTrack.trimEndTime >= track.trimEndTime;

    if (trackIntersectsFull) {
      currentTrack.channel.removeTrack(track);
      return;
    }

    const startOverlapTime = currentTrack.trimEndTime - track.startTime;
    const endOverlapTime = track.endTime - currentTrack.trimStartTime;

    const trackIntersectsOnStart =
      currentTrack.trimEndTime > track.trimStartTime &&
      currentTrack.trimEndTime < track.trimEndTime;

    const trackIntersectsOnEnd =
      currentTrack.trimStartTime > track.trimStartTime &&
      currentTrack.trimStartTime < track.trimEndTime;

    if (trackIntersectsOnStart && trackIntersectsOnEnd) {
      const trackCopy = track.clone();
      trackCopy.setStartTrimDuration(startOverlapTime);
      trackCopy.setStartTime(currentTrack.trimEndTime);

      track.setEndTrimDuration(endOverlapTime);

      currentTrack.channel.addTrack(trackCopy);
    } else if (trackIntersectsOnStart) {
      track.setStartTrimDuration(startOverlapTime);
    } else if (trackIntersectsOnEnd) {
      track.setEndTrimDuration(endOverlapTime);
    }
  });
};
