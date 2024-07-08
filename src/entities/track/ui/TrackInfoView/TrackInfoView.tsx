'use client';

import { observer } from 'mobx-react-lite';

// eslint-disable-next-line boundaries/element-types
import { useAudioEditor } from '@/entities/audio-editor';

import { TrackInfo } from '..';

import { TrackInfoViewProps } from './interfaces';

export const TrackInfoView = observer(function TrackInfoView({
  ...props
}: TrackInfoViewProps) {
  const audioEditor = useAudioEditor();

  return (
    <TrackInfo
      track={audioEditor.selectedTracks.values().next().value?.meta ?? null}
      {...props}
    />
  );
});
