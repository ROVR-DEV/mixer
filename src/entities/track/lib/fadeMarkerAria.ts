import { Side } from '../model';

export const getFadeMarkerStartAriaAttributes = (
  trackDuration: number,
  side: Side,
  time: number,
) => {
  const currentTime =
    Math.round((side === 'left' ? time : trackDuration - time) * 100) / 100;

  return {
    role: 'slider',
    'aria-label': `Fade ${side === 'left' ? 'in' : 'out'}`,
    'aria-valuemax': trackDuration,
    'aria-valuenow': currentTime,
    'aria-valuetext': `Fade ${side === 'left' ? 'in' : 'out'} for ${currentTime} seconds}`,
  };
};
