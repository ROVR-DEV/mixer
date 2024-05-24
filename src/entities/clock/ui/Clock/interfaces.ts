import { BadgeProps } from '@/shared/ui';

export interface ClockProps extends BadgeProps {}

export interface ClockRef {
  updateTime: (time: number) => void;
}
