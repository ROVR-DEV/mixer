import { AudioEditorTrack } from '../../model';

export interface FadeOverlayProps extends React.ComponentProps<'div'> {
  track: AudioEditorTrack | null;
  side: 'left' | 'right';
  isTrackSelected?: boolean;
  position?: number;
}
