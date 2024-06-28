import { roundTo } from '@/shared/lib';

import { Side } from '../model';

export const getTrimMarkerAriaAttributes = (
  trackDuration: number,
  side: Side,
  startTimeOffset: number,
  endTimeOffset: number,
) => {
  const time = roundTo(side === 'left' ? startTimeOffset : endTimeOffset, 2);

  return {
    role: 'slider',
    'aria-label': `Trim ${side === 'left' ? 'start' : 'end'}`,
    'aria-valuemax': roundTo(trackDuration, 2),
    'aria-valuenow': time,
    'aria-valuetext': `Trim ${side === 'left' ? 'start' : 'end'} for ${time} seconds}`,
  };
};
