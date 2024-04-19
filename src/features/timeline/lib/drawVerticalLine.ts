import { CSSProperties } from 'react';

export const drawVerticalLine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  height: number,
  color: CSSProperties['color'] = 'white',
) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.fillRect(x, ctx.canvas.clientHeight - height, 1, height);
};
