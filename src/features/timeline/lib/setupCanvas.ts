import { clamp } from '@/shared/lib';

export const setupCanvasAndCtx = (
  canvas: HTMLCanvasElement,
  dpi: number,
): CanvasRenderingContext2D | null => {
  const clampedDpi = clamp(dpi, 1);

  const canvasRect = canvas.getBoundingClientRect();

  canvas.width = canvasRect.width * clampedDpi;
  canvas.height = canvasRect.height * clampedDpi;

  const ctx = canvas.getContext('2d', { desynchronized: true });
  if (!ctx) {
    return null;
  }

  const computedStyles = getComputedStyle(canvas);
  ctx.font = `11.5px ${computedStyles.fontFamily}`;

  ctx.resetTransform();
  ctx.scale(clampedDpi, clampedDpi);

  return ctx;
};
