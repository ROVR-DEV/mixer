'use client';

import { useEffect } from 'react';

export const useWindowEvent = <T extends keyof WindowEventMap>(
  ...args: Parameters<typeof window.addEventListener<T>>
) => {
  useEffect(() => {
    window.addEventListener(...args);
    return () => window.removeEventListener(args[0], args[1]);
  });
};
