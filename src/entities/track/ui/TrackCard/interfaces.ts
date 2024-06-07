import { Track } from '../../model';

export interface TrackCardProps extends React.ComponentProps<'div'> {
  track: Track;
  isSelected?: boolean;
  isSolo?: boolean;
  waveformComponent: JSX.Element;
  hideTitle?: boolean;
}
