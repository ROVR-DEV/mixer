import { TrimMarkerProps } from '@/shared/ui';

import { AudioEditorTrack } from '../../model';

export interface TrackTrimMarkerProps extends TrimMarkerProps {
  track: AudioEditorTrack | null;
}
