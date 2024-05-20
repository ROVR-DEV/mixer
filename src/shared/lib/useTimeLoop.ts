'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

export const useIsomorphicEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface TimerLoopProps {
  isRunning: boolean;
  onUpdate: (delta: number) => void;
}

export const useTimeLoop = ({ isRunning, onUpdate }: TimerLoopProps) => {
  const previousTimeStampRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  const loop = (timeStamp: number) => {
    if (previousTimeStampRef.current === null) {
      previousTimeStampRef.current = timeStamp;
      requestRef.current = requestAnimationFrame(loop);
      return;
    }

    const delta = timeStamp - previousTimeStampRef.current;

    onUpdate(delta);

    previousTimeStampRef.current = timeStamp;

    requestRef.current = requestAnimationFrame(loop);
  };

  const cleanup = () => {
    previousTimeStampRef.current = null;
    requestRef.current && cancelAnimationFrame(requestRef.current);
  };

  useIsomorphicEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(loop);
    }

    return cleanup;
  }, [isRunning]);
};
