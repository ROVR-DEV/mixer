'use client';

import { observer } from 'mobx-react-lite';

import { TrackModifyOverlay, TrackWaveform } from '@/entities/track';

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
        <TrackModifyOverlay track={track} />
      </AudioEditorTrackView>
    );
  });
});
