'use client';

import { RefObject, useEffect } from 'react';

export const useWheel = (
  callback: (e: WheelEvent) => void,
  elementRef: RefObject<HTMLElement>,
) => {
  useEffect(() => {
    const element = elementRef.current;

    if (element) {
      element.addEventListener('wheel', callback, { passive: false });
      return () => element.removeEventListener('wheel', callback);
    }
  }, [callback, elementRef]);
};
