import { clamp } from '@/shared/lib';

import { AudioEditorTrack, FadeSide } from '../model';

export const updateFade = (
  track: AudioEditorTrack,
  time: number,
  side: FadeSide,
) => {
  const clampedTime = clamp(time, 0, track.duration);

  if (side === 'left') {
    track.filters.fadeInNode.linearFadeIn(track.startTrimDuration, clampedTime);
  } else if (side === 'right') {
    track.filters.fadeOutNode.linearFadeOut(
      clampedTime,
      track.duration - track.endTrimDuration,
    );
  }
};
