import { AudioEditorTrack, Side } from '@/entities/track';

const snapToLeftFilterFun = (
  track: AudioEditorTrack,
  channelTrack: AudioEditorTrack,
) =>
  channelTrack.uuid !== track.uuid &&
  channelTrack.trimEndTime <= track.trimStartTime;

const snapToLeftSortFun = (a: AudioEditorTrack, b: AudioEditorTrack) =>
  a.trimEndTime - b.trimEndTime;

const snapToRightFilterFun = (
  track: AudioEditorTrack,
  channelTrack: AudioEditorTrack,
) =>
  channelTrack.uuid !== track.uuid &&
  channelTrack.trimStartTime >= track.trimEndTime;

const snapToRightSortFun = (a: AudioEditorTrack, b: AudioEditorTrack) =>
  a.trimStartTime - b.trimStartTime;

export const snapTo = (
  track: AudioEditorTrack,
  side: Side,
  tracks: AudioEditorTrack[],
) => {
  const filteredSortedTracks = tracks
    .filter((channelTrack) =>
      (side === 'left' ? snapToLeftFilterFun : snapToRightFilterFun)(
        track,
        channelTrack,
      ),
    )
    .sort(side === 'left' ? snapToLeftSortFun : snapToRightSortFun);

  switch (side) {
    case 'left':
      track.setStartTime(filteredSortedTracks.at(-1)?.trimEndTime ?? 0);
      return;
    case 'right': {
      const foundTrack = filteredSortedTracks[0];
      if (!foundTrack) {
        return;
      }

      track.setStartTime(foundTrack.trimStartTime - track.trimDuration);
      return;
    }
    default:
      return;
  }
};
