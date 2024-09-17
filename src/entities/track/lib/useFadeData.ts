import { useMemo } from 'react';

import { AudioEditorTrack, FadeSide } from '../model';

import { getFadeMarkerAriaAttributes } from './fadeMarkerAria';

export const useFadeData = (track: AudioEditorTrack | null, side: FadeSide) => {
  return useMemo(() => {
    if (!track) {
      return { fadeDuration: 0, ariaAttributes: undefined };
    }

    const fadeDuration =
      side === 'left'
        ? track.filters.fadeInDuration
        : track.filters.fadeOutDuration;

    const ariaAttributes = getFadeMarkerAriaAttributes(
      track.trimDuration,
      side,
      fadeDuration,
    );

    return {
      fadeDuration: isNaN(fadeDuration) ? 0 : fadeDuration,
      ariaAttributes,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    track,
    track?.filters,
    track?.filters.fadeInDuration,
    track?.filters.fadeOutDuration,
    side,
  ]);
};
