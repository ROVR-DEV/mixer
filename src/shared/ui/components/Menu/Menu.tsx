import { forwardRef, memo } from 'react';

import { cn } from '@/shared/lib';

import { MenuProps } from './interfaces';

export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      tabIndex={0}
      className={cn(
        'z-20 flex h-max w-[213px] flex-col justify-between divide-y divide-accent overflow-hidden rounded-lg border border-accent bg-primary outline-none',
        className,
      )}
      {...props}
    />
  );
});

export const MenuMemoized = memo(Menu);
