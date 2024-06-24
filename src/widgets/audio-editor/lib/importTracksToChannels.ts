import { Player } from '@/entities/audio-editor';
import { Track } from '@/entities/track';

export const importTracksToChannels = (tracks: Track[], player: Player) => {
  player.clearTracks();

  tracks.forEach((track, i) =>
    player.channels
      .get(i % 2 === 0 ? player.channelIds[0] : player.channelIds[1])
      ?.importTrack(track),
  );
};
