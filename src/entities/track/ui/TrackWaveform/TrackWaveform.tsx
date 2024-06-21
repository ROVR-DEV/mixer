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

  const isSelectedInEditor = audioEditorManager.isTrackSelected(track);

  const color = useMemo(() => {
    const isSelected = !ignoreSelection && isSelectedInEditor;

    return isSelected ? 'primary' : 'secondary';
  }, [ignoreSelection, isSelectedInEditor]);

  const finalOptions = useMemo(() => {
    return {
      ...DEFAULT_WAVEFORM_OPTIONS,
      media: track?.mediaElement ?? undefined,
      peaks: track.audioPeaks ?? undefined,
      duration: track.duration,
      ...options,
    };
  }, [options, track.audioPeaks, track.duration, track?.mediaElement]);

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
    track.startTrimDuration,
    track.endTrimDuration,
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
          left: -timelineController.timeToVirtualPixels(
            track.startTrimDuration,
          ),
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
