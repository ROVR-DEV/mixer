import { TrimSide } from './types';

export interface TrimMarkerProps extends React.ComponentProps<'div'> {
  side: TrimSide;
}
