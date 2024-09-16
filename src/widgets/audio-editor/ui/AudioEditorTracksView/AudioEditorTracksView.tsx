'use client';

import { observer } from 'mobx-react-lite';

import { TrackModifyOverlay, TrackWaveform } from '@/entities/track';

import { AudioEditorTrackView } from '@/features/track-card-view';
import { TrackContextMenuView } from '@/features/track-context-menu';
import { TrackEditMenuMemoized } from '@/features/track-edit-menu';

import { AudioEditorTracksViewProps } from './interfaces';

export const AudioEditorTracksView = observer(function AudioEditorTracksView({
  channel,
}: AudioEditorTracksViewProps) {
  return channel.tracks.map((track) => {
    return !track ? null : (
      <AudioEditorTrackView
        className='h-[calc(100%-13px)]'
        key={`track-${track.id}`}
        track={track}
        waveformComponent={<TrackWaveform track={track} />}
        editMenu={TrackEditMenuMemoized}
        contextMenu={TrackContextMenuView}
      >
        <TrackModifyOverlay track={track} />
      </AudioEditorTrackView>
    );
  });
});
