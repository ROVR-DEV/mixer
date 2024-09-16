import { memo } from 'react';

import { cn } from '@/shared/lib';

import { AudioEditorLayoutProps } from './interfaces';

export const AudioEditorLayout = ({
  className,
  ...props
}: AudioEditorLayoutProps) => {
  return <div className={cn('flex flex-col relative', className)} {...props} />;
};

export const AudioEditorLayoutMemoized = memo(AudioEditorLayout);
