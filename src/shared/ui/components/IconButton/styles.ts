import { cn } from '@/shared/lib/cn';

import { IconButtonVariant } from './types';

const baseStyles =
  'flex items-center justify-center rounded-full size-8 aspect-square';

const defaultStyles: Record<IconButtonVariant, string> = {
  unstyled: baseStyles,
  primary: cn(baseStyles, 'border border-accent [&_svg]:fill-accent'),
  primaryFilled: cn(
    baseStyles,
    'border border-transparent bg-accent [&_svg]:fill-primary',
  ),
  secondary: cn(baseStyles, 'border border-third [&_svg]:fill-third'),
  secondaryFilled: cn(
    baseStyles,
    'border border-transparent bg-third [&_svg]:fill-primary',
  ),
  inverse: cn(
    baseStyles,
    'border border-transparent bg-primary [&_svg]:stroke-accent',
  ),
};

export const getStyles = (variant: IconButtonVariant) => {
  return defaultStyles[variant];
};
