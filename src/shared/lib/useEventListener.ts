'use client';

import { RefObject, useEffect } from 'react';

export const useEventListener = <
  T extends HTMLElement,
  K extends keyof HTMLElementEventMap,
>(
  elementRef: RefObject<T>,
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    element.addEventListener(eventName, handler, options);
    return () => element.removeEventListener(eventName, handler);
  });
};
