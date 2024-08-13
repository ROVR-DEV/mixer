import * as Progress from '@radix-ui/react-progress';

import { ProgressBarProps } from './interfaces';
import styles from './styles.module.css';

export const ProgressBar = ({ value, ...props }: ProgressBarProps) => {
  return (
    <Progress.Root className={styles.ProgressRoot} value={value} {...props}>
      <Progress.Indicator
        className={styles.ProgressIndicator}
        style={{ transform: value ? `translateX(-${100 - value}%)` : '' }}
      ></Progress.Indicator>
    </Progress.Root>
  );
};
