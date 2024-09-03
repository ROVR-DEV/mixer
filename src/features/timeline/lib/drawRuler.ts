import { CSSProperties } from 'react';

import { TimelineTicks } from '../model';

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
  ticks: TimelineTicks,
  subTickHeight: { short: number; tall: number },
  zeroMarkOffset: number,
  scroll: number,
  tickTextConverter: (value: number) => string,
  color: CSSProperties['color'] = 'white',
) => {
  const startX = zeroMarkOffset - scroll;

  ticks.mainTicks.forEach((tick) => {
    drawMainDash(
      ctx,
      tick.x + startX,
      tickTextConverter(tick.number),
      tick.x === 0,
      color,
    );

    ticks.subTicks.forEach((subTick) =>
      drawVerticalLine(
        ctx,
        tick.x + subTick.x + startX,
        subTickHeight.short,
        color,
      ),
    );
  });
};
