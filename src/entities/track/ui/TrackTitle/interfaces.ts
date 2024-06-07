import { Track } from '../../model';

export interface TrackTitleProps extends React.ComponentProps<'span'> {
  track?: Track | null;
}
