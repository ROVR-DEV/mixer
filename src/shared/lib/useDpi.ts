'use client';

import { useLayoutEffect, useState } from 'react';

export const useDpi = () => {
  const [dpi, setDpi] = useState(1);

  useLayoutEffect(() => {
    const getDpi = () => {
      setDpi(window.devicePixelRatio);
    };

    window.addEventListener('resize', getDpi);

    return () => window.removeEventListener('resize', getDpi);
  }, []);

  return dpi;
};
