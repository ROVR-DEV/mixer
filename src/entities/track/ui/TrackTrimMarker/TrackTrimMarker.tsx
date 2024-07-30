'use client';

import { observer } from 'mobx-react-lite';

import { TrimMakerMemoized } from '@/shared/ui';

// eslint-disable-next-line boundaries/element-types
import { useTimeline } from '@/entities/audio-editor';

import { useTrimMarker as useTrackTrimMarker } from '../../lib';

import { TrackTrimMarkerProps } from './interfaces';

export const TrackTrimMarker = observer(
  ({ track, trimSide, ...props }: TrackTrimMarkerProps) => {
    const timeline = useTimeline();

    const trimMarkerProps = useTrackTrimMarker({
      track,
      timeline,
      trimSide,
    });

    return (
      <TrimMakerMemoized trimSide={trimSide} {...trimMarkerProps} {...props} />
    );
  },
);
