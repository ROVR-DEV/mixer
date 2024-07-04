'use client';

import { observer } from 'mobx-react-lite';

import { preventAll } from '@/shared/lib';
import { TrimMarker } from '@/shared/ui';

import { usePlayer, useTimelineController } from '@/entities/audio-editor';

import { useAudioEditorRegionTrimMarker } from '../../lib';

import { AudioEditorRegionTrimMarkerProps } from './interfaces';

export const AudioEditorRegionTrimMarker = observer(
  function AudioEditorRegionTrimMarker({
    trimSide,
    ...props
  }: AudioEditorRegionTrimMarkerProps) {
    const player = usePlayer();
    const timelineController = useTimelineController();

    const { onMouseDown, onMouseUp } = useAudioEditorRegionTrimMarker(
      player,
      timelineController,
      trimSide,
    );

    return (
      <TrimMarker
        trimSide={trimSide}
        onClick={preventAll}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        {...props}
      />
    );
  },
);
