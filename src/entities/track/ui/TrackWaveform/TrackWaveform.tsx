'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

// eslint-disable-next-line boundaries/element-types
import { useTimelineController } from '@/entities/audio-editor';

import { DEFAULT_WAVEFORM_OPTIONS } from '../../config';
import { WaveformMemoized } from '../Waveform';

import { TrackWaveformProps } from './interfaces';

export const TrackWaveform = observer(function TrackWaveform({
  player,
  track,
  ignoreSelection,
  options,
  ...props
}: TrackWaveformProps) {
  const waveformRef = useRef<HTMLDivElement | null>(null);

  const timelineController = useTimelineController();

  const isSelectedInPlayer = player.isTrackSelected(track);

  const localAudioBufferRef = useRef<WaveSurfer | null>(null);

  const color = useMemo(() => {
    const isSelected = !ignoreSelection && isSelectedInPlayer;

    return isSelected ? 'primary' : 'secondary';
  }, [ignoreSelection, isSelectedInPlayer]);

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
      localAudioBufferRef.current = wavesurfer;

      if (track.audioBuffer) {
        return;
      }

      track.setAudioBuffer(wavesurfer);
    },
    [track],
  );

  const updateWidth = useCallback(
    (trackDuration: number) => {
      if (!waveformRef.current) {
        return;
      }

      waveformRef.current.style.width = `${timelineController.timeToVirtualPixels(trackDuration)}px`;
    },
    [timelineController],
  );

  useEffect(() => {
    updateWidth(track.duration);
  }, [track.duration, updateWidth]);

  useEffect(() => {
    const update = () => {
      updateWidth(track.duration);
    };

    timelineController.zoomController.addListener(update);
    return () => timelineController.zoomController.removeListener(update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineController.zoomController, updateWidth]);

  return (
    <div
      className='relative size-full'
      style={{ overflow: track.isTrimming ? '' : 'hidden' }}
    >
      <WaveformMemoized
        ref={waveformRef}
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
