import { FadeSide } from '../../model';

export interface FadeMarkerProps extends React.ComponentProps<'div'> {
  side: FadeSide;
  hideStick?: boolean;
}
