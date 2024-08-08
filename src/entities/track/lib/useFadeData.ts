import { useMemo } from 'react';

// eslint-disable-next-line boundaries/element-types
import { Timeline } from '@/entities/audio-editor';

import { AudioEditorTrack, FadeSide } from '../model';

import { getFadeMarkerAriaAttributes } from './fadeMarkerAria';

export const useFadeData = (
  track: AudioEditorTrack | null,
  side: FadeSide,
  timeline: Timeline,
) => {
  return useMemo(() => {
    if (!track) {
      return { fadeDuration: 0, ariaAttributes: undefined };
    }

    const fadeDuration =
      (side === 'left'
        ? track.filters.fadeInDuration
        : track.filters.fadeOutDuration) ?? 0;

    const ariaAttributes = getFadeMarkerAriaAttributes(
      track.trimDuration,
      side,
      fadeDuration,
    );

    return { fadeDuration, ariaAttributes };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    track?.filters.fadeInDuration,
    track?.filters.fadeOutDuration,
    side,
    timeline,
  ]);
};
