'use client';

import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { recolorCanvas, renderBarWaveform, useSize } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { useAudioEditor, useTimeline } from '@/entities/audio-editor';

import { WAVEFORM_COLORS } from '../../config';
import { OptimizedWaveform } from '../OptimizedWaveform';

import { TrackWaveformProps } from './interfaces';

export const TrackWaveform = observer(function TrackWaveform({
  track,
  ignoreSelection,
}: TrackWaveformProps) {
  const audioEditor = useAudioEditor();
  const timeline = useTimeline();

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const isSelectedInPlayer = audioEditor.isTrackSelected(track);

  const color = useMemo(() => {
    const isSelected = !ignoreSelection && isSelectedInPlayer;

    return isSelected
      ? WAVEFORM_COLORS['primary']
      : (track.color ?? WAVEFORM_COLORS['secondary']);
  }, [ignoreSelection, isSelectedInPlayer, track.color]);

  const wrapperSize = useSize(wrapperRef);

  const { trimStartXClamped, trimEndXClamped, trimWidth } = useMemo(() => {
    const trimStartXGlobal = timeline.timeToGlobal(track.trimStartTime);
    const trimEndXGlobal = timeline.timeToGlobal(track.trimEndTime);

    const trimStartXClamped = Math.max(
      trimStartXGlobal,
      timeline.viewportBoundsWithBuffer.start,
    );
    const trimEndXClamped = Math.min(
      trimEndXGlobal,
      timeline.viewportBoundsWithBuffer.end,
    );

    return {
      trimStartXClamped: trimStartXClamped,
      trimEndXClamped: trimEndXClamped,
      trimWidth: trimEndXClamped - trimStartXClamped,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeline,
    timeline.viewportBoundsWithBuffer.end,
    timeline.viewportBoundsWithBuffer.start,
    track.trimStartTime,
    track.trimEndTime,
    timeline.hScroll,
    timeline.hPixelsPerSecond,
    timeline.zeroMarkOffsetX,
  ]);

  const { startXClamped, endXClamped, width } = useMemo(() => {
    const startXGlobal = timeline.timeToGlobal(track.startTime);
    const endXGlobal = timeline.timeToGlobal(track.endTime);

    const startXClamped = Math.max(
      startXGlobal,
      timeline.viewportBoundsWithBuffer.start,
    );
    const endXClamped = Math.min(
      endXGlobal,
      timeline.viewportBoundsWithBuffer.end,
    );

    return {
      startXClamped: startXClamped,
      endXClamped: endXClamped,
      width: endXClamped - startXClamped,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeline,
    timeline.viewportBoundsWithBuffer.end,
    timeline.viewportBoundsWithBuffer.start,
    track.trimStartTime,
    track.trimEndTime,
    timeline.hScroll,
    timeline.hPixelsPerSecond,
    timeline.zeroMarkOffsetX,
  ]);

  const { startTime, endTime } = useMemo(() => {
    const startTime = track.getRelativeTime(
      timeline.pixelsToTime(
        (track.isTrimming ? startXClamped : trimStartXClamped) -
          timeline.zeroMarkOffsetX,
      ),
    );

    const endTime = track.getRelativeTime(
      timeline.pixelsToTime(
        (track.isTrimming ? endXClamped : trimEndXClamped) -
          timeline.zeroMarkOffsetX,
      ),
    );

    return { startTime, endTime };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    endXClamped,
    startXClamped,
    timeline,
    track,
    track.isTrimming,
    trimEndXClamped,
    trimStartXClamped,
    timeline.hScroll,
    timeline.zeroMarkOffsetX,
    timeline.hPixelsPerSecond,
  ]);

  const offset = useMemo(
    () => trimStartXClamped - startXClamped,
    [startXClamped, trimStartXClamped],
  );

  const waveformWidth = useMemo(() => {
    return track.isTrimming ? width : trimWidth;
  }, [track.isTrimming, trimWidth, width]);

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const renderBarWaveformWithTrimColor = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      channelData: Array<Float32Array | number[]>,
      waveColor: string,
    ) => {
      ctxRef.current = ctx;
      renderBarWaveform(ctx, channelData, waveColor);
    },
    [],
  );

  const style = useMemo(
    () => ({
      left: track.isTrimming ? -offset : 0,
      // maxHeight: wrapperSize?.height,
    }),
    [track.isTrimming, offset],
  );

  const lineStyles = useMemo(
    () => ({
      backgroundColor: `${color}66`,
      width: trimWidth,
    }),
    [color, trimWidth],
  );

  const timerIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!ctxRef.current) {
      return;
    }

    if (timerIdRef.current !== null) {
      cancelAnimationFrame(timerIdRef.current);
      timerIdRef.current = null;
    }

    timerIdRef.current = requestAnimationFrame(() => {
      if (!ctxRef.current) {
        return;
      }
      if (track.isTrimming) {
        recolorCanvas(ctxRef.current, WAVEFORM_COLORS['secondary'], 0, offset);
        recolorCanvas(ctxRef.current, color, offset, offset + trimWidth);
        recolorCanvas(
          ctxRef.current,
          WAVEFORM_COLORS['secondary'],
          offset + trimWidth,
          ctxRef.current.canvas.width,
        );
      } else {
        recolorCanvas(ctxRef.current, color, 0, ctxRef.current.canvas.width);
      }
    });
  }, [color, offset, track.isTrimming, trimWidth]);

  return (
    <div
      ref={wrapperRef}
      className='relative size-full'
      style={{ overflow: track.isTrimming ? '' : 'hidden' }}
    >
      <div
        className='absolute inset-y-0 my-auto h-px w-full'
        style={lineStyles}
      />
      <OptimizedWaveform
        className='absolute'
        height={wrapperSize?.height}
        width={waveformWidth}
        style={style}
        waveColor={color}
        minPxPerSeconds={timeline.hPixelsPerSecond}
        startTime={startTime}
        endTime={endTime}
        duration={track.duration}
        peaks={track.audioPeaks}
        renderFunction={renderBarWaveformWithTrimColor}
      />
    </div>
  );
});
