'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib';

import {
  ObservableAudioEditor,
  AudioEditorContext,
  PlayerContext,
} from '@/entities/audio-editor';
import {
  calculatePeaks,
  TrackData,
  TracksManager,
  TracksManagerContext,
} from '@/entities/track';

import { useAudioEditorGlobalControls } from '../../lib';
import { AudioEditorContent } from '../AudioEditorContent';
import { AudioEditorHeaderMemoized } from '../AudioEditorHeader';

import { AudioEditorViewProps } from './interfaces';

export const AudioEditorView = observer(function AudioEditorView({
  playlist,
  trackEditor: TrackEditor,
  className,
  ...props
}: AudioEditorViewProps) {
  const [audioEditor] = useState(() => new ObservableAudioEditor());
  const [tracksManager] = useState(() => new TracksManager(playlist.tracks));

  const playlistKey = JSON.stringify(
    playlist.tracks.map((track) => track.uuid),
  );

  useEffect(() => {
    audioEditor.player.importPlaylist(playlist);

    const onTrackLoad = (trackData: TrackData) => {
      if (!trackData.objectUrl) {
        return;
      }

      const track = audioEditor.player.tracksByAudioUuid.get(trackData.uuid);
      if (!track) {
        return;
      }

      if (trackData.blob) {
        const loadAndSetPeaks = async () => {
          const buffer = await trackData.blob?.arrayBuffer();

          if (!buffer) {
            return;
          }

          const peaks = await calculatePeaks(buffer);

          track.setPeaks(peaks);
        };

        loadAndSetPeaks();
      }

      track.load(trackData.objectUrl);
    };

    tracksManager.downloadTracks(onTrackLoad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEditor.player, tracksManager, playlistKey]);

  useAudioEditorGlobalControls(audioEditor);

  return (
    <AudioEditorContext.Provider value={audioEditor}>
      <PlayerContext.Provider value={audioEditor.player}>
        <TracksManagerContext.Provider value={tracksManager}>
          <div className={cn('flex flex-col relative', className)} {...props}>
            <AudioEditorHeaderMemoized />
            <AudioEditorContent playlist={playlist} />
            {!audioEditor.editableTrack ? null : (
              <TrackEditor className='absolute bottom-[100px] z-50 h-[43%] max-h-[466px] min-h-[161px] w-full' />
            )}
          </div>
        </TracksManagerContext.Provider>
      </PlayerContext.Provider>
    </AudioEditorContext.Provider>
  );
});
