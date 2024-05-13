import { CSSProperties } from 'react';

import { Tick } from '../model';

import { drawVerticalLine } from './drawVerticalLine';

const drawMainDash = (
  ctx: CanvasRenderingContext2D,
  x: number,
  text: string,
  isFirstDash: boolean,
  color: CSSProperties['color'] = 'white',
  height: number = 19,
) => {
  drawVerticalLine(ctx, x, height, color);

  const renderedText = ctx.measureText(text);

  ctx.fillStyle = color;
  ctx.fillText(
    text,
    !isFirstDash ? x - renderedText.width / 2 : x,
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
        tick.x === 0,
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
