'use client';

import { observer } from 'mobx-react-lite';

import { useTimelineController } from '@/entities/audio-editor';

import { TrackCardView } from '@/features/track-card-view';

import { AudioEditorTracksViewProps } from './interfaces';

export const AudioEditorTracksView = observer(function AudioEditorTracksView({
  channel,
  audioEditorManager,
}: AudioEditorTracksViewProps) {
  const timelineController = useTimelineController();

  return channel.tracks.map((track) => {
    return !track ? null : (
      <TrackCardView
        style={{
          height: timelineController.trackHeight,
          maxHeight: timelineController.trackHeight,
        }}
        key={`track-${track.uuid}`}
        track={track}
        audioEditorManager={audioEditorManager}
      />
    );
  });
});
