import { cn } from '@/shared/lib';

import { ButtonProps } from './interfaces';

export const Button = ({ disabled, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        'flex items-center justify-center bg-accent px-4 py-[10px] rounded-3xl text-primary leading-4 font-semibold',
        className,
        {
          'brightness-50': disabled,
        },
      )}
      disabled={disabled}
      type='button'
      {...props}
    />
  );
};
