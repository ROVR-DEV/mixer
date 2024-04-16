export const drawVerticalLine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  height: number,
  color: string = 'white',
) => {
  ctx.beginPath();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  ctx.moveTo(x, ctx.canvas.height);
  ctx.lineTo(x, ctx.canvas.height - height);

  ctx.stroke();
};
