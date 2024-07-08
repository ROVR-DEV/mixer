import { cn } from '@/shared/lib';

import { AudioEditorFloatingToolbarGroupProps } from './interfaces';

export const AudioEditorFloatingToolbarGroup = ({
  className,
  ...props
}: AudioEditorFloatingToolbarGroupProps) => {
  return (
    <div
      className={cn('flex items-center gap-4 px-4 py-[10px]', className)}
      {...props}
    />
  );
};
