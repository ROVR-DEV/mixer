'use client';

import { observer } from 'mobx-react-lite';

import { FadeOverlay, TrackWaveform, TrimMarker } from '@/entities/track';

import { AudioEditorTrackView } from '@/features/track-card-view';
import { TrackEditMenu } from '@/features/track-edit-menu';

import { AudioEditorTracksViewProps } from './interfaces';

export const AudioEditorTracksView = observer(function AudioEditorTracksView({
  channel,
  player,
}: AudioEditorTracksViewProps) {
  return channel.tracks.map((track) => {
    return !track ? null : (
      <AudioEditorTrackView
        className='h-[calc(100%-14px)]'
        key={`track-${track.uuid}`}
        track={track}
        player={player}
        waveformComponent={<TrackWaveform player={player} track={track} />}
        editMenu={TrackEditMenu}
      >
        <TrimMarker
          className='absolute bottom-0 left-0 z-20'
          side='left'
          track={track}
        />
        <TrimMarker
          className='absolute bottom-0 right-0 z-20'
          side='right'
          track={track}
        />
        <FadeOverlay
          className='absolute top-0 z-10'
          side='left'
          track={track}
        />
        <FadeOverlay
          className='absolute top-0 z-10'
          side='right'
          track={track}
        />
      </AudioEditorTrackView>
    );
  });
});
