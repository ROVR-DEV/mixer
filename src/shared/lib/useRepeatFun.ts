'use client';

import { useCallback, useRef } from 'react';

/**
 * @description Repeat function until it cleaned up or called again
 */
export const useRepeatFun = () => {
  const animationIdRef = useRef<number | null>(null);

  const loop = useCallback((repeatFun: FrameRequestCallback) => {
    requestAnimationFrame(repeatFun);
    animationIdRef.current = requestAnimationFrame(() => loop(repeatFun));
  }, []);

  const stop = useCallback(() => {
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
    }
  }, []);

  const repeat = useCallback(
    (repeatFun: FrameRequestCallback) => {
      stop();
      loop(repeatFun);
    },
    [loop, stop],
  );

  return { repeat, stop };
};
