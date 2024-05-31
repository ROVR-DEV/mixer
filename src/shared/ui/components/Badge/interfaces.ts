import { BadgeVariant } from './types';

export interface BadgeProps extends React.ComponentProps<'div'> {
  variant?: BadgeVariant;
}
