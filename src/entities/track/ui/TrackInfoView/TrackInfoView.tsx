'use client';

import { observer } from 'mobx-react-lite';

// eslint-disable-next-line boundaries/element-types
import { useAudioEditorManager } from '@/entities/audio-editor';

import { TrackInfo } from '..';

import { TrackInfoViewProps } from './interfaces';

export const TrackInfoView = observer(function TrackInfoView({
  ...props
}: TrackInfoViewProps) {
  const audioEditorManager = useAudioEditorManager();

  return (
    <TrackInfo
      track={audioEditorManager.selectedTrack?.data ?? null}
      {...props}
    />
  );
});
