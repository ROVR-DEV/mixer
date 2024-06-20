import { Side } from '../model';

export const getTrimMarkerAriaAttributes = (
  trackDuration: number,
  side: Side,
  startTimeOffset: number,
  endTimeOffset: number,
) => {
  const time = side === 'left' ? startTimeOffset : endTimeOffset;

  return {
    role: 'slider',
    'aria-label': `Trim ${side === 'left' ? 'start' : 'end'}`,
    'aria-valuemax': trackDuration,
    'aria-valuenow': time,
    'aria-valuetext': `Trim ${side === 'left' ? 'start' : 'end'} for ${time} seconds}`,
  };
};
