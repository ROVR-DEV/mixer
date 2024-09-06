import { clamp } from '@/shared/lib';

import { AudioEditorTrack, FadeSide } from '../model';

export const updateFade = (
  track: AudioEditorTrack,
  time: number,
  side: FadeSide,
) => {
  const clampedTime = clamp(time, 0, track.duration);

  if (side === 'left') {
    track.filters.setFadeInEndTime(clampedTime);
  } else if (side === 'right') {
    track.filters.setFadeOutStartTime(clampedTime);
  }
};
