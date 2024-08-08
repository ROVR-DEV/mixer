'use client';

import { useCallback, useRef } from 'react';

export const useIsMouseClickStartsOnThisSpecificElement = (): Pick<
  React.ComponentProps<'div'>,
  'onMouseDown' | 'onClick'
> => {
  const isMouseDownBeforeClickRef = useRef<boolean | null>(null);

  const onMouseDown = useCallback(() => {
    isMouseDownBeforeClickRef.current = true;
  }, []);

  const onClick = useCallback(() => {
    const value = isMouseDownBeforeClickRef.current;
    isMouseDownBeforeClickRef.current = false;
    return value;
  }, []);

  return {
    onMouseDown,
    onClick,
  };
};
