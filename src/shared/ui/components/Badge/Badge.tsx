import { cn } from '@/shared/lib/cn';

import { BadgeProps } from './interfaces';
import { getStyles } from './styles';

export const Badge = ({
  variant = 'default',
  className,
  ...props
}: BadgeProps) => {
  const styles = getStyles(variant);

  return <div className={cn(styles, className)} {...props} />;
};
