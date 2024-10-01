import { MutableRefObject } from 'react';

import { AudioEditorTrack } from '../../model';

export interface TrackModifyOverlayProps {
  track: AudioEditorTrack;
  ignoreSelection?: boolean;
  trackRef?: MutableRefObject<HTMLDivElement | null>;
  fadePosition: {
    right: number;
    left: number;
  };
}
