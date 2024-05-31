import { Track } from '../../model';

export interface TrackInfoProps extends React.ComponentProps<'div'> {
  track: Track | null;
}
