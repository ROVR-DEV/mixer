import { forwardRef } from 'react';

import { cn } from '@/shared/lib';

import { RectangularSelectionProps } from './interfaces';

export const RectangularSelection = forwardRef<
  HTMLDivElement,
  RectangularSelectionProps
>(function RectangularSelection({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('border border-accent/60 bg-accent-light/30', className)}
      {...props}
    />
  );
});
