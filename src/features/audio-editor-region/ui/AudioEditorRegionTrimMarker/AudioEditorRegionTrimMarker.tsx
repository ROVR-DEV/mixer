'use client';

import { observer } from 'mobx-react-lite';

import { preventAll } from '@/shared/lib';
import { TrimMakerMemoized } from '@/shared/ui';

import { usePlayer, useTimelineController } from '@/entities/audio-editor';

import { useAudioEditorRegionTrimMarker } from '../../lib';

import { AudioEditorRegionTrimMarkerProps } from './interfaces';

export const AudioEditorRegionTrimMarker = observer(
  function AudioEditorRegionTrimMarker({
    trimSide,
    ...props
  }: AudioEditorRegionTrimMarkerProps) {
    const player = usePlayer();
    const timeline = useTimelineController();

    const { onMouseDown, onMouseUp } = useAudioEditorRegionTrimMarker(
      player,
      timeline,
      trimSide,
    );

    return (
      <TrimMakerMemoized
        trimSide={trimSide}
        onClick={preventAll}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        {...props}
      />
    );
  },
);
