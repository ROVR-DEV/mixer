import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

import { IconButtonSvgFillType, IconButtonVariant } from './types';

export interface IconButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  variant?: IconButtonVariant;
  svgFillType?: IconButtonSvgFillType;
}
