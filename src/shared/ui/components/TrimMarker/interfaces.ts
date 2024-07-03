import { TrimSide } from './types';

export interface TrimMarkerProps extends React.ComponentProps<'div'> {
  trimSide: TrimSide;
}
