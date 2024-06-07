'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useMemo } from 'react';
import WaveSurfer from 'wavesurfer.js';

import { DEFAULT_WAVEFORM_OPTIONS } from '../../config';
import { useTracksManager } from '../../model';
import { WaveformMemoized } from '../Waveform';

import { TrackWaveformProps } from './interfaces';

export const TrackWaveform = observer(function TrackWaveform({
  audioEditorManager,
  track,
  ignoreSelection,
  options,
  ...props
}: TrackWaveformProps) {
  const tracksManager = useTracksManager(false);
  const trackData = useMemo(
    () => tracksManager?.tracksData.get(track.data.uuid),
    [track.data.uuid, tracksManager?.tracksData],
  );

  const color = useMemo(() => {
    const isSelected = ignoreSelection
      ? false
      : audioEditorManager.selectedTrack?.uuid === track.uuid;
    return isSelected ? 'primary' : 'secondary';
  }, [audioEditorManager.selectedTrack?.uuid, ignoreSelection, track.uuid]);

  const finalOptions = useMemo(
    () => ({
      ...DEFAULT_WAVEFORM_OPTIONS,
      peaks: track.audioBufferPeaks ?? undefined,
      duration: track.duration,
      media: track.media ?? undefined,
      ...options,
    }),
    [options, track.audioBufferPeaks, track.duration, track.media],
  );

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
      data={trackData?.blob}
      color={color}
      options={finalOptions}
      onMount={handleMount}
      {...props}
    />
  );
});
