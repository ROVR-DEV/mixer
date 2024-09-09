import { AudioEditorTrack } from '@/entities/track';

export const adjustTracksOnPaste = (currentTrack: AudioEditorTrack) => {
  const tracksToDelete: AudioEditorTrack[] = [];
  currentTrack.channel.tracks.forEach((track) => {
    if (currentTrack.id === track.id) {
      return;
    }

    const trackIntersectsFull =
      currentTrack.trimStartTime <= track.trimStartTime &&
      currentTrack.trimEndTime >= track.trimEndTime;

    if (trackIntersectsFull) {
      tracksToDelete.push(track);
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

  tracksToDelete.forEach((track) => currentTrack.channel.removeTrack(track));
};
