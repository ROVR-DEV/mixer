'use client';

import { useCallback, useRef } from 'react';

/**
 * @description Repeat function until it cleaned up or called again
 */
export const useRepeatFun = () => {
  const animationIdRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
    }
  }, []);

  const loop = useCallback(
    (repeatFun: () => void | false) => {
      if (repeatFun() === undefined) {
        animationIdRef.current = requestAnimationFrame(() => loop(repeatFun));
      } else {
        stop();
      }
    },
    [stop],
  );

  const repeat = useCallback(
    (repeatFun: () => void | false) => {
      stop();
      loop(repeatFun);
    },
    [loop, stop],
  );

  return {
    /**
     * @description Return false to prevent repeating
     */
    repeat,
    stop,
  };
};
