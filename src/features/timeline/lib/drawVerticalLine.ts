import { Property } from 'csstype';

export const drawVerticalLine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  height: number,
  color: Property.Color,
) => {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.fillRect(x, ctx.canvas.clientHeight - height, 1, height);
};
