import { TrackWithMeta, TrimSide } from '../../model';

export interface TrimMarkerProps extends React.ComponentProps<'div'> {
  side: TrimSide;
  track: TrackWithMeta | null;
}
