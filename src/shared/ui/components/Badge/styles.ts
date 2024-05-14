import { cn } from '@/shared/lib';

import { BadgeVariant } from './types';

const baseStyles =
  'flex items-center justify-center rounded-full px-4 py-[10px]';

const defaultStyles: Record<BadgeVariant, string> = {
  default: cn(
    baseStyles,
    'border border-accent [&_svg]:fill-accent text-accent',
  ),
  filled: cn(
    baseStyles,
    'border border-transparent bg-accent [&_svg]:fill-primary text-primary',
  ),
  inverse: cn(
    baseStyles,
    'border border-primary [&_svg]:fill-primary text-primary',
  ),
};

export const getStyles = (variant: BadgeVariant) => {
  return defaultStyles[variant];
};
