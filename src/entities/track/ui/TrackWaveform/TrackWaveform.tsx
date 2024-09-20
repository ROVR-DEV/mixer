'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useMemo, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

// eslint-disable-next-line boundaries/element-types
import { useAudioEditor, useTimeline } from '@/entities/audio-editor';

import { DEFAULT_WAVEFORM_OPTIONS } from '../../config';
import { WaveformMemoized } from '../Waveform';

import { TrackWaveformProps } from './interfaces';

export const TrackWaveform = observer(function TrackWaveform({
  track,
  ignoreSelection,
  options,
  ...props
}: TrackWaveformProps) {
  const audioEditor = useAudioEditor();

  const waveformRef = useRef<HTMLDivElement | null>(null);

  const timeline = useTimeline();

  const isSelectedInPlayer = audioEditor.isTrackSelected(track);

  const localAudioBufferRef = useRef<WaveSurfer | null>(null);

  const color = useMemo(() => {
    const isSelected = !ignoreSelection && isSelectedInPlayer;

    return isSelected ? 'primary' : 'secondary';
  }, [ignoreSelection, isSelectedInPlayer]);

  const combinedOptions = useMemo(() => {
    return {
      ...DEFAULT_WAVEFORM_OPTIONS,
      media: track?.mediaElement ?? undefined,
      peaks: track.audioPeaks ?? undefined,
      duration: track.duration,
      ...options,
    };
  }, [options, track.audioPeaks, track.duration, track?.mediaElement]);

  const trackCardBorderWidthCompensatorFactor = useMemo(
    () => 0.1 / timeline.hPixelsPerSecond,
    [timeline.hPixelsPerSecond],
  );

  const handleMount = useCallback(
    (wavesurfer: WaveSurfer) => {
      localAudioBufferRef.current = wavesurfer;

      if (track.audioBuffer) {
        return;
      }

      track.setAudioBuffer(wavesurfer);
    },
    [track],
  );

  const trimStart = useMemo(
    () =>
      ((track.startTrimDuration - trackCardBorderWidthCompensatorFactor) /
        track.duration) *
      100,
    [
      track.duration,
      track.startTrimDuration,
      trackCardBorderWidthCompensatorFactor,
    ],
  );

  const trimEnd = useMemo(
    () =>
      ((track.endTrimDuration - trackCardBorderWidthCompensatorFactor) /
        track.duration) *
      100,
    [
      track.duration,
      track.endTrimDuration,
      trackCardBorderWidthCompensatorFactor,
    ],
  );

  const width = useMemo(
    () => timeline.timeToPixels(track.duration),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeline, track.duration, timeline.hPixelsPerSecond],
  );

  const position = useMemo(
    () => -timeline.timeToPixels(track.startTrimDuration),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeline, track.startTrimDuration, timeline.hPixelsPerSecond],
  );

  const style = useMemo(() => {
    return {
      width,
      left: position,
    };
  }, [position, width]);

  return (
    <div
      className='relative size-full'
      style={{ overflow: track.isTrimming ? '' : 'hidden' }}
    >
      <WaveformMemoized
        ref={waveformRef}
        className='absolute w-full'
        style={style}
        color={color}
        waveColor={track.color ?? undefined}
        trimStart={trimStart}
        trimEnd={trimEnd}
        options={combinedOptions}
        onMount={handleMount}
        {...props}
      />
    </div>
  );
});
