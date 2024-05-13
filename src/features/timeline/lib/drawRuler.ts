import { CSSProperties } from 'react';

import { Tick } from '../model';

import { drawVerticalLine } from './drawVerticalLine';

const drawMainDash = (
  ctx: CanvasRenderingContext2D,
  x: number,
  text: string,
  color: CSSProperties['color'] = 'white',
  height: number = 19,
) => {
  drawVerticalLine(ctx, x, height, color);

  const renderedText = ctx.measureText(text);

  ctx.fillStyle = color;
  ctx.fillText(
    text,
    x - renderedText.width / 2,
    ctx.canvas.clientHeight - height - 3,
  );
};

export const drawRuler = (
  ctx: CanvasRenderingContext2D,
  ticks: { mainTicks: Tick[]; subTicks: Tick[] },
  subTickHeight: { short: number; tall: number },
  ticksStartPadding: number,
  shiftWidth: number,
  tickTextConverter: (value: number) => string,
  color: CSSProperties['color'] = 'white',
) => {
  const bufferWidth = 1000;
  ticks.mainTicks.forEach((tick) => {
    if (tick.x >= shiftWidth - bufferWidth) {
      drawMainDash(
        ctx,
        tick.x + ticksStartPadding - shiftWidth,
        tickTextConverter(tick.number),
        color,
      );

      ticks.subTicks.forEach((subTick) =>
        drawVerticalLine(
          ctx,
          tick.x + subTick.x + ticksStartPadding - shiftWidth,
          subTickHeight.short,
          color,
        ),
      );
    }
  });
};
