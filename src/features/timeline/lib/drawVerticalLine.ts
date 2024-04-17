import { CSSProperties } from 'react';

export const drawVerticalLine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  height: number,
  color: CSSProperties['color'] = 'white',
) => {
  ctx.beginPath();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  ctx.moveTo(x, ctx.canvas.height);
  ctx.lineTo(x, ctx.canvas.height - height);

  ctx.stroke();
};
