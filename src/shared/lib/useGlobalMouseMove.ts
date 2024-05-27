'use client';

import { RefObject, useCallback, useEffect, useRef } from 'react';

export const useGlobalMouseMove = (
  onMove: (e: MouseEvent) => void,
  target: RefObject<HTMLElement> | string,
) => {
  const isAbleToMove = useRef<boolean>(false);

  const checkIsRightTarget = useCallback(
    (mouseTarget: MouseEvent['target']) => {
      if (!mouseTarget) {
        return false;
      }

      if (typeof target === 'string') {
        // @ts-expect-error property
        return mouseTarget.id === target;
      }

      return mouseTarget === target.current;
    },
    [target],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const checkIsAbleToMove = (e: MouseEvent) => {
      isAbleToMove.current = e.buttons === 1 && checkIsRightTarget(e.target);
    };

    const resetIsAbleToMove = () => {
      isAbleToMove.current = false;
    };

    const onMoveProtected = (e: MouseEvent) => {
      if (!isAbleToMove.current) {
        return;
      }

      onMove(e);
    };

    window.addEventListener('mousemove', onMoveProtected);
    document.addEventListener('mousedown', checkIsAbleToMove);
    document.addEventListener('mouseup', resetIsAbleToMove);

    return () => {
      window.removeEventListener('mousemove', onMoveProtected);
      document.removeEventListener('mousedown', checkIsAbleToMove);
      document.removeEventListener('mouseup', resetIsAbleToMove);
    };
  }, [checkIsRightTarget, onMove]);
};
