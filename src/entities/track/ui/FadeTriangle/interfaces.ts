import { FadeSide } from '../../model';

import { FadeTriangleVariant } from './types';

export interface FadeTriangleProps extends React.ComponentProps<'div'> {
  side: FadeSide;
  variant?: FadeTriangleVariant;
}
