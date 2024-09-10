'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * @description Repeat function until it cleaned up or called again
 */
export const useRepeatFun = () => {
  const animationIdRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, []);

  const loop = useCallback((repeatFun: () => void | false) => {
    if (repeatFun() === undefined) {
      animationIdRef.current = requestAnimationFrame(() => loop(repeatFun));
    }
  }, []);

  const repeat = useCallback(
    (repeatFun: () => void | false) => {
      stop();
      loop(repeatFun);
    },
    [loop, stop],
  );

  // Stop dragging on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    /**
     * @description Return false to prevent next repeating
     */
    repeat,
    stop,
  };
};
