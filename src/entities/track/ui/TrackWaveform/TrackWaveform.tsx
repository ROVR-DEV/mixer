'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo } from 'react';
import WaveSurfer from 'wavesurfer.js';

// eslint-disable-next-line boundaries/element-types
import { useTimelineController } from '@/entities/audio-editor';

import { DEFAULT_WAVEFORM_OPTIONS } from '../../config';
import { WaveformMemoized } from '../Waveform';

import { TrackWaveformProps } from './interfaces';

export const TrackWaveform = observer(function TrackWaveform({
  audioEditorManager,
  track,
  ignoreSelection,
  options,
  ...props
}: TrackWaveformProps) {
  const timelineController = useTimelineController();

  const color = useMemo(() => {
    const isSelected =
      !ignoreSelection && audioEditorManager.selectedTrack?.uuid === track.uuid;

    return isSelected ? 'primary' : 'secondary';
  }, [audioEditorManager.selectedTrack?.uuid, ignoreSelection, track.uuid]);

  const finalOptions = useMemo(() => {
    return {
      ...DEFAULT_WAVEFORM_OPTIONS,
      media: track?.mediaElement ?? undefined,
      peaks: track.audioBufferPeaks ?? undefined,
      duration: track.duration,
      ...options,
    };
  }, [options, track.audioBufferPeaks, track.duration, track?.mediaElement]);

  const handleMount = useCallback(
    (wavesurfer: WaveSurfer) => {
      if (track.audioBuffer) {
        return;
      }
      track.setAudioBuffer(wavesurfer);
    },
    [track],
  );

  useEffect(() => {
    const currentWidth = track.audioBuffer?.options.width;
    const newWidth = timelineController.timeToVirtualPixels(track.duration);

    if (currentWidth === newWidth) {
      return;
    }

    track.audioBuffer?.setOptions({
      width: newWidth,
    });
  }, [
    timelineController,
    track.audioBuffer,
    track.startTimeOffset,
    track.endTimeOffset,
    track.duration,
  ]);

  return (
    <div
      className='relative size-full'
      style={{ overflow: track.isTrimming ? '' : 'hidden' }}
    >
      <WaveformMemoized
        className='absolute w-full'
        style={{
          left: -timelineController.timeToVirtualPixels(track.startTimeOffset),
        }}
        color={color}
        waveColor={track.color ?? undefined}
        options={finalOptions}
        onMount={handleMount}
        {...props}
      />
    </div>
  );
});
