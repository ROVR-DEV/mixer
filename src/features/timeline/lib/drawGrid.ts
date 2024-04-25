import { Property } from 'csstype';

import { Tick } from '../model';

import { drawVerticalLine } from './drawVerticalLine';

export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  ticks: { mainTicks: Tick[]; subTicks: Tick[] },
  ticksStartPadding: number,
  shiftWidth: number,
  tickColor: Property.Color = 'white',
  subTickColor: Property.Color = 'white',
) => {
  const bufferWidth = 1000;
  ticks.mainTicks.forEach((tick) => {
    if (tick.x >= shiftWidth - bufferWidth) {
      drawVerticalLine(
        ctx,
        tick.x + ticksStartPadding - shiftWidth,
        ctx.canvas.height,
        tickColor,
      );

      ticks.subTicks.forEach((subTick) =>
        drawVerticalLine(
          ctx,
          tick.x + subTick.x + ticksStartPadding - shiftWidth,
          ctx.canvas.height,
          subTickColor,
        ),
      );
    }
  });
};
