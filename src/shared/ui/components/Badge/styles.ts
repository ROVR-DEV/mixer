import { cn } from '@/shared/lib/cn';

import { BadgeVariant } from './types';

const baseStyles =
  'flex items-center justify-center rounded-full px-4 py-[10px] leading-4';

const defaultStyles: Record<BadgeVariant, string> = {
  default: cn(
    baseStyles,
    'border border-accent [&_svg]:fill-accent text-accent',
  ),
  filled: cn(
    baseStyles,
    'border border-transparent bg-accent [&_svg]:fill-primary text-primary font-semibold',
  ),
};

export const getStyles = (variant: BadgeVariant) => {
  return defaultStyles[variant];
};
