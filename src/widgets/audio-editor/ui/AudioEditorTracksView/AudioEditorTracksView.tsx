'use client';

import { observer } from 'mobx-react-lite';

import { TrackModifyOverlay, TrackWaveform } from '@/entities/track';

import { AudioEditorTrackView } from '@/features/track-card-view';
import { TrackContextMenu } from '@/features/track-context-menu';
import { TrackEditMenu } from '@/features/track-edit-menu';

import { AudioEditorTracksViewProps } from './interfaces';

export const AudioEditorTracksView = observer(function AudioEditorTracksView({
  channel,
}: AudioEditorTracksViewProps) {
  return channel.tracks.map((track) => {
    return !track ? null : (
      <AudioEditorTrackView
        className='h-[calc(100%-14px)]'
        key={`track-${track.id}`}
        track={track}
        waveformComponent={<TrackWaveform track={track} />}
        editMenu={TrackEditMenu}
        contextMenu={TrackContextMenu}
      >
        <TrackModifyOverlay track={track} />
      </AudioEditorTrackView>
    );
  });
});
