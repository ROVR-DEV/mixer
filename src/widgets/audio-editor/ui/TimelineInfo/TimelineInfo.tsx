'use client';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { cn, useWindowEvent } from '@/shared/lib';
import { Point } from '@/shared/model';

import { tickValueToTime } from '@/features/timeline';

import { TimelineInfoProps } from './interfaces';

export const TimelineInfo = observer(function TimelineInfo({
  timeline,
  className,
  ...props
}: TimelineInfoProps) {
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });

  useWindowEvent('mousemove', (e) => {
    setMousePosition({ x: e.pageX, y: e.pageY });
  });

  return (
    <div
      className={cn(
        'fixed w-max rounded-md border bg-primary px-2 py-1',
        className,
      )}
      style={{
        left: mousePosition.x + 20,
        top: mousePosition.y + 20,
      }}
      {...props}
    >
      {`x: ${mousePosition.x}, y: ${mousePosition.y}`}
      <br />
      {`tX: ${mousePosition.x - timeline.boundingClientRect.x - timeline.zeroMarkOffsetX + timeline.hScroll}`}
      <br />
      {`tScroll: ${timeline.hScroll}`}
      <br />
      {`zoom: ${timeline.zoom.toPrecision(4)} (${Math.round(Math.log(timeline.zoom) / Math.log(1.25))})`}
      <br />
      {`time: ${Object.values(tickValueToTime(timeline.globalToTime(mousePosition.x), timeline.zoom)).join(':')}`}
    </div>
  );
});
