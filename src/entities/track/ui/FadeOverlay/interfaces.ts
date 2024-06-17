import { TrackWithMeta } from '../../model';

export interface FadeOverlayProps extends React.ComponentProps<'div'> {
  track: TrackWithMeta | null;
  side: 'left' | 'right';
}
