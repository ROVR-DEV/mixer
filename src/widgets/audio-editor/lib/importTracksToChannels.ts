import { Player } from '@/entities/audio-editor';
import { Track } from '@/entities/track';

export const importTracksToChannels = (tracks: Track[], player: Player) => {
  player.clear();
  player.clearState();

  player.addChannel();
  player.addChannel();

  tracks.forEach((track, i) => player.channels[i % 2]?.importTrack(track));

  player.saveState();
};
