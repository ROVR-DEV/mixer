'use client';

import { observer } from 'mobx-react-lite';

import { TrackWaveform } from '@/entities/track';

import { TrackCardView } from '@/features/track-card-view';

import { AudioEditorTracksViewProps } from './interfaces';

export const AudioEditorTracksView = observer(function AudioEditorTracksView({
  channel,
  audioEditorManager,
}: AudioEditorTracksViewProps) {
  return channel.tracks.map((track) => {
    return !track ? null : (
      <TrackCardView
        className='h-[calc(100%-14px)]'
        key={`track-${track.uuid}`}
        track={track}
        audioEditorManager={audioEditorManager}
        waveformComponent={
          <TrackWaveform
            audioEditorManager={audioEditorManager}
            track={track}
          />
        }
      />
    );
  });
});
