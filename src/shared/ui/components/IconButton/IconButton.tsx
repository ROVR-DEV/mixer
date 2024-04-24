import { cn } from '@/shared/lib/cn';

import { IconButtonProps } from './interfaces';
import { getStyles } from './styles';

export const IconButton = ({
  variant = 'primary',
  svgFillType = 'fill',
  className,
  ...props
}: IconButtonProps) => {
  const styles = getStyles(variant, svgFillType);

  return <button className={cn(styles, className)} {...props} />;
};
