import { forwardRef } from 'react';

import { cn } from '@/shared/lib';

import { EditInputProps } from './interfaces';

export const EditInput = forwardRef<HTMLInputElement, EditInputProps>(
  function EditInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'bg-primary-light px-2 border-none text-white rounded-sm',
          className,
        )}
        {...props}
      />
    );
  },
);
