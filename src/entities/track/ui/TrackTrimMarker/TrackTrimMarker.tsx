'use client';

import { observer } from 'mobx-react-lite';

import { TrimMakerMemoized } from '@/shared/ui';

// eslint-disable-next-line boundaries/element-types
import { useTimelineController } from '@/entities/audio-editor';

import { useTrimMarker as useTrackTrimMarker } from '../../lib';

import { TrackTrimMarkerProps } from './interfaces';

export const TrackTrimMarker = observer(
  ({ track, trimSide, ...props }: TrackTrimMarkerProps) => {
    const timelineController = useTimelineController();

    const trimMarkerProps = useTrackTrimMarker({
      track,
      timelineController,
      trimSide,
    });

    return (
      <TrimMakerMemoized trimSide={trimSide} {...trimMarkerProps} {...props} />
    );
  },
);
