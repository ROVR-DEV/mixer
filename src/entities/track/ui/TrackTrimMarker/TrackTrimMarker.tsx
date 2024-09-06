'use client';

import { observer } from 'mobx-react-lite';
import { useRef } from 'react';

import { preventAll } from '@/shared/lib';
import { CustomDraggable, TrimMakerMemoized } from '@/shared/ui';

// eslint-disable-next-line boundaries/element-types
import { useTimeline } from '@/entities/audio-editor';

import { useTrackTrimMarkerAttributes, useTrackTrimMarkerDnD } from '../../lib';

import { TrackTrimMarkerProps } from './interfaces';

export const TrackTrimMarker = observer(
  ({ track, side, ...props }: TrackTrimMarkerProps) => {
    const timeline = useTimeline();

    const markerRef = useRef<HTMLDivElement | null>(null);

    const attributes = useTrackTrimMarkerAttributes(track, side);

    const draggableProps = useTrackTrimMarkerDnD({
      track,
      timeline,
      side,
    });

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
          side={side}
          {...attributes}
          {...props}
        />
      </CustomDraggable>
    );
  },
);
