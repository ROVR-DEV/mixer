import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

import { IconButtonVariant } from './types';

export interface IconButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  variant?: IconButtonVariant;
}
