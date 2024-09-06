import { useMemo } from 'react';

import { AudioEditorTrack, TrimSide } from '../model';

import { getTrimMarkerAriaAttributes } from './trimMarkerAria';

export const useTrackTrimMarkerAttributes = (
  track: AudioEditorTrack | null,
  trimSide: TrimSide,
) => {
  return useMemo(
    () =>
      getTrimMarkerAriaAttributes(
        track?.duration ?? 0,
        trimSide,
        track?.startTrimDuration ?? 0,
        track?.endTrimDuration ?? 0,
      ),
    [
      track?.duration,
      trimSide,
      track?.startTrimDuration,
      track?.endTrimDuration,
    ],
  );
};
