'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useMemo } from 'react';
import WaveSurfer from 'wavesurfer.js';

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

  return (
    <WaveformMemoized
      color={color}
      waveColor={track.channel.color ?? undefined}
      options={finalOptions}
      onMount={handleMount}
      {...props}
    />
  );
});
