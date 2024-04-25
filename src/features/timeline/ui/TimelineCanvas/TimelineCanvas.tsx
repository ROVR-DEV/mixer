import { forwardRef } from 'react';

import { TimelineCanvasProps } from './interfaces';

export const TimelineCanvas = forwardRef<
  HTMLCanvasElement,
  TimelineCanvasProps
>(function TimelineCanvas({ width, height, dpi, ...props }, ref) {
  return (
    <canvas
      width={width * dpi}
      height={height * dpi}
      ref={ref}
      style={{
        width,
        height,
        aspectRatio: `auto ${width}/${height}`,
      }}
      {...props}
    />
  );
});
