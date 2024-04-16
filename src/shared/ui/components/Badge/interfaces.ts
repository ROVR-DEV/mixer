import { DetailedHTMLProps, HTMLAttributes } from 'react';

import { BadgeVariant } from './types';

export interface BadgeProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  variant?: BadgeVariant;
}
