'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { recolorCanvas, useWindowEvent } from '@/shared/lib';
import { HiDpiCanvasMemoized } from '@/shared/ui';

import { WAVEFORM_COLORS } from '../../config';

import Decoder from './Decoder';
import { OptimizedWaveformProps } from './interfaces';

export const OptimizedWaveform = ({
  waveColor,
  minPxPerSeconds,
  startTime,
  endTime,
  duration,
  peaks,
  renderFunction,
  updateColor,
  height,
  width,
  ...props
}: OptimizedWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const prevStartPositionRef = useRef(startTime);
  const prevEndPositionRef = useRef(endTime);
  const prevDurationRef = useRef(duration);
  const isDrawnRef = useRef(false);

  const audioData = useMemo(() => {
    return Decoder.createBuffer(
      !peaks || peaks.length === 0 ? [[], []] : peaks,
      duration,
    );
  }, [duration, peaks]);

  const render = useCallback(() => {
    const totalWidth = (prevDurationRef.current = duration);

    const startPosition = (prevStartPositionRef.current = startTime);
    const endPosition = (prevEndPositionRef.current = endTime);

    const channelData = [audioData.getChannelData(0)];
    if (audioData.numberOfChannels > 1) {
      channelData.push(audioData.getChannelData(1));
    }

    const dataPart = channelData.map((channel) => {
      const start = Math.floor((startPosition / totalWidth) * channel.length);
      const end = Math.floor((endPosition / totalWidth) * channel.length);
      return channel.slice(start, end);
    });

    if (!ctx) {
      return;
    }

    renderFunction(ctx, dataPart, waveColor ?? WAVEFORM_COLORS['primary']);

    isDrawnRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    minPxPerSeconds,
    peaks,
    ctx,
    duration,
    endTime,
    renderFunction,
    startTime,
    audioData,
  ]);

  // TODO: may not works
  useEffect(() => {
    if (!ctx || !updateColor) {
      return;
    }

    recolorCanvas(ctx, waveColor, 0, ctx.canvas.width);
  }, [ctx, updateColor, waveColor]);

  useEffect(() => {
    if (
      prevStartPositionRef.current === startTime &&
      prevEndPositionRef.current === endTime &&
      prevDurationRef.current === duration &&
      isDrawnRef.current
    ) {
      return;
    }

    render();
  }, [
    render,
    minPxPerSeconds,
    peaks,
    ctx,
    duration,
    endTime,
    renderFunction,
    startTime,
    audioData,
    waveColor,
  ]);

  useEffect(() => {
    if (canvasRef.current && typeof width === 'number') {
      canvasRef.current.width = width;
      render();
    }
  }, [render, width]);

  useEffect(() => {
    if (canvasRef.current && typeof height === 'number') {
      canvasRef.current.height = height;
      render();
    }
  }, [height, render]);

  useWindowEvent('resize', () => {
    setTimeout(render, 1000);
  });

  return (
    <HiDpiCanvasMemoized ref={canvasRef} onHiDpiCtxCreate={setCtx} {...props} />
  );
};
