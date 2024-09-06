'use client';

import { observer } from 'mobx-react-lite';
import { useRef } from 'react';

import { preventAll } from '@/shared/lib';
import { CustomDraggable, TrimMakerMemoized } from '@/shared/ui';

import { usePlayer, useTimeline } from '@/entities/audio-editor';

import { useRegionTrimMarker } from '../../lib';

import { AudioEditorRegionTrimMarkerProps } from './interfaces';

export const RegionTrimMarker = observer(function RegionTrimMarker({
  side: trimSide,
  ...props
}: AudioEditorRegionTrimMarkerProps) {
  const player = usePlayer();
  const timeline = useTimeline();

  const markerRef = useRef<HTMLDivElement | null>(null);

  const draggableProps = useRegionTrimMarker(player, timeline, trimSide);

  return (
    <CustomDraggable
      cancel=''
      handle=''
      nodeRef={markerRef}
      onMouseDown={preventAll}
      {...draggableProps}
    >
      <TrimMakerMemoized
        ref={markerRef}
        side={trimSide}
        onClick={preventAll}
        {...props}
      />
    </CustomDraggable>
  );
});
