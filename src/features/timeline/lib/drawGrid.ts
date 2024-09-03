import { Property } from 'csstype';

import { TimelineTicks } from '../model';

import { drawVerticalLine } from './drawVerticalLine';

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  ticks: TimelineTicks,
  zeroMarkOffset: number,
  scroll: number,
  tickColor: Property.Color = 'white',
  subTickColor: Property.Color = 'white',
) => {
  const startX = zeroMarkOffset - scroll;

  ticks.mainTicks.forEach((tick) => {
    drawVerticalLine(ctx, tick.x + startX, ctx.canvas.height, tickColor);

    ticks.subTicks.forEach((subTick) =>
      drawVerticalLine(
        ctx,
        tick.x + subTick.x + startX,
        ctx.canvas.height,
        subTickColor,
      ),
    );
  });
};
