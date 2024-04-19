import { CSSProperties } from 'react';

import { Tick } from '../model';

import { drawVerticalLine } from './drawVerticalLine';
import { isSubTickTall } from './isSubTickTall';

const drawMainDash = (
  ctx: CanvasRenderingContext2D,
  x: number,
  text: string,
  color: CSSProperties['color'] = 'white',
  height: number = 19,
) => {
  drawVerticalLine(ctx, x, height, color);

  ctx.fillStyle = color;
  ctx.fillText(text, x - 3, ctx.canvas.clientHeight - height - 3);
};

const tickValueToTime = (value: number) => {
  const minutes = Math.floor(value / 60);
  const seconds = (value - minutes * 60).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

  return { minutes, seconds };
};

export const drawRuler = (
  ctx: CanvasRenderingContext2D,
  ticks: { mainTicks: Tick[]; subTicks: Tick[] },
  subTickHeight: { short: number; tall: number },
  ticksStartPadding: number,
  shiftWidth: number,
  color: CSSProperties['color'] = 'white',
) => {
  const bufferWidth = 1000;
  ticks.mainTicks.forEach((tick) => {
    if (tick.x >= shiftWidth - bufferWidth) {
      const { minutes, seconds } = tickValueToTime(tick.number);

      drawMainDash(
        ctx,
        tick.x + ticksStartPadding - shiftWidth,
        `${minutes}:${seconds}`,
        color,
      );

      ticks.subTicks.forEach((subTick, i) =>
        drawVerticalLine(
          ctx,
          tick.x + subTick.x + ticksStartPadding - shiftWidth,
          isSubTickTall(i, ticks.subTicks.length)
            ? subTickHeight.short
            : subTickHeight.tall,
          color,
        ),
      );
    }
  });
};
