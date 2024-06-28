import { roundTo } from '@/shared/lib';

import { Side } from '../model';

export const getFadeMarkerAriaAttributes = (
  trackDuration: number,
  side: Side,
  time: number,
) => {
  const currentTime = roundTo(side === 'left' ? time : trackDuration - time, 2);

  return {
    role: 'slider',
    'aria-label': `Fade ${side === 'left' ? 'in' : 'out'}`,
    'aria-valuemax': roundTo(trackDuration, 2),
    'aria-valuenow': currentTime,
    'aria-valuetext': `Fade ${side === 'left' ? 'in' : 'out'} for ${currentTime} seconds}`,
  };
};
