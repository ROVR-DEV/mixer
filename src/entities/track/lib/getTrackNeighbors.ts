import { AudioEditorTrack } from '../model';

export const getTrackNeighbors = (track: AudioEditorTrack) => {
  const leftNeighbor = track.channel.tracks.findLast(
    (channelTrack) => channelTrack.trimEndTime <= track.trimStartTime,
  );

  const rightNeighbor = track.channel.tracks.find(
    (channelTrack) => channelTrack.trimStartTime >= track.trimEndTime,
  );

  return {
    leftNeighbor,
    rightNeighbor,
  };
};

// TODO: optimize version (not working now)
// export const getTrackNeighbors = (track: AudioEditorTrack) => {
//   const trackIndex = track.channel.tracks.findIndex(
//     (channelTrack) => channelTrack.id === track.id,
//   );

//   const leftNeighborIndex = trackIndex - 1;
//   const rightNeighborIndex = trackIndex - 1;

//   const leftNeighbor =
//     leftNeighborIndex >= 0
//       ? track.channel.tracks[leftNeighborIndex]
//       : undefined;
//   const rightNeighbor =
//     rightNeighborIndex < track.channel.tracks.length
//       ? track.channel.tracks[rightNeighborIndex]
//       : undefined;

//   return {
//     leftNeighbor,
//     rightNeighbor,
//   };
// };
