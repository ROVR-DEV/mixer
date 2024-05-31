import { AudioEditorManager } from '@/entities/audio-editor';
import { Track } from '@/entities/track';

export const importTracksToChannels = (
  tracks: Track[],
  audioEditorManager: AudioEditorManager,
) => {
  audioEditorManager.clearTracks();

  tracks.forEach((track, i) =>
    audioEditorManager.channels
      .get(
        i % 2 === 0
          ? audioEditorManager.channelIds[0]
          : audioEditorManager.channelIds[1],
      )
      ?.importTrack(track),
  );
};
