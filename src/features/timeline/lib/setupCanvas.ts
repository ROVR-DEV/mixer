export const setupCanvasAndCtx = (canvas: HTMLCanvasElement, dpi: number) => {
  const canvasRect = canvas.getBoundingClientRect();
  canvas.width = canvasRect.width * dpi;
  canvas.height = canvasRect.height * dpi;

  const ctx = canvas.getContext('2d', { desynchronized: true });
  if (!ctx) {
    return;
  }

  ctx.resetTransform();
  ctx.scale(dpi, dpi);

  return ctx;
};
