export const setupHiDpiCanvas = (
  canvas: HTMLCanvasElement,
  dpi: number,
): CanvasRenderingContext2D | null => {
  const canvasRect = canvas.getBoundingClientRect();
  canvas.width = canvasRect.width * dpi;
  canvas.height = canvasRect.height * dpi;

  const ctx = canvas.getContext('2d', {
    desynchronized: true,
    colorSpace: 'srgb',
  });

  if (!ctx) {
    return null;
  }

  const computedStyles = getComputedStyle(canvas);
  ctx.font = `11.5px ${computedStyles.fontFamily}`;

  ctx.resetTransform();
  ctx.scale(dpi, dpi);

  return ctx;
};
