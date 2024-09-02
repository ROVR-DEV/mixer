import * as Progress from '@radix-ui/react-progress';

import { cn } from '@/shared/lib';

import { ProgressBarProps } from './interfaces';
import styles from './styles.module.css';

export const ProgressBar = ({
  value,
  className,
  ...props
}: ProgressBarProps) => {
  return (
    <Progress.Root
      className={cn(styles.ProgressRoot, className)}
      value={value}
      {...props}
    >
      <Progress.Indicator
        className={styles.ProgressIndicator}
        style={{
          transform:
            value !== undefined && value !== null
              ? `translateX(-${100 - value}%)`
              : '',
        }}
      ></Progress.Indicator>
    </Progress.Root>
  );
};
