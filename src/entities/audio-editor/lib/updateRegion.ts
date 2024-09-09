import { clamp } from '@/shared/lib';
import { Rect } from '@/shared/model';
import { TrimSide } from '@/shared/ui';

import { Region, Timeline } from '../model';

export const updateRegion = (
  newTime: number,
  region: Region,
  side: TrimSide,
) => {
  if (side == 'left') {
    region.start = clamp(newTime, 0, region.end);
  } else if (side == 'right') {
    region.end = clamp(newTime, region.start);
  }
};

export const updateRegionRect = (
  timeline: Timeline,
  region: Region,
  rect: Rect,
) => {
  if (!region.isEnabled) {
    region.toggle();
  }

  const start = clamp(timeline.localToTime(rect.left), 0, timeline.endTime);
  const end = clamp(timeline.localToTime(rect.right), 0, timeline.endTime);

  region.setBounds(start, end);
};
