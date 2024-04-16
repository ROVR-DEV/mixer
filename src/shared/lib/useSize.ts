import useResizeObserver from '@react-hook/resize-observer';
import { RefObject, useLayoutEffect, useState } from 'react';

export const useSize = <T extends HTMLElement>(target: RefObject<T>) => {
  const [size, setSize] = useState<DOMRect>();

  useLayoutEffect(() => {
    const element = target.current;

    if (element) {
      setSize(element.getBoundingClientRect());
    }
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect));

  return size;
};
