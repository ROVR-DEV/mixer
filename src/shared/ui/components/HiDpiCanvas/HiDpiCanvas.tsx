'use client';

import { forwardRef, memo, useCallback, useEffect, useRef } from 'react';

import { getDpi } from '@/shared/lib/getDpi';
import { setupHiDpiCanvas } from '@/shared/lib/setupHiDpiCanvas';

import { HighDpiCanvasProps as HiDpiCanvasProps } from './interfaces';

export const HiDpiCanvas = forwardRef<HTMLCanvasElement, HiDpiCanvasProps>(
  function HiDpiCanvas({ onHiDpiCtxCreate, useHiDpi = true, ...props }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const updateContext = useCallback(() => {
      if (canvasRef.current === null) {
        onHiDpiCtxCreate?.(null);
        return;
      }

      const dpi = useHiDpi ? getDpi() : 1;

      const ctx = setupHiDpiCanvas(canvasRef.current, dpi);

      onHiDpiCtxCreate?.(ctx);
    }, [onHiDpiCtxCreate, useHiDpi]);

    const handleCanvasRef = useCallback(
      (newRef: HTMLCanvasElement | null) => {
        canvasRef.current = newRef;

        if (ref !== null) {
          if (typeof ref === 'function') {
            ref(newRef);
          } else {
            ref.current = newRef;
          }
        }

        updateContext();
      },
      [ref, updateContext],
    );

    useEffect(() => {
      if (useHiDpi) {
        window.addEventListener('resize', updateContext);
        return () => window.removeEventListener('resize', updateContext);
      }
    }, [updateContext, useHiDpi]);

    return <canvas ref={handleCanvasRef} {...props} />;
  },
);

export const HiDpiCanvasMemoized = memo(HiDpiCanvas);
