import { AudioEditorTrack } from '../../model';
import { FadeMarkerProps } from '../FadeMarker';

export interface FadeMarkerDragHandlerProps
  extends Omit<FadeMarkerProps, 'ref'> {
  track: AudioEditorTrack | null;
  side: 'left' | 'right';
}
