import { IconButtonSvgFillType, IconButtonVariant } from './types';

export interface IconButtonProps extends React.ComponentProps<'button'> {
  variant?: IconButtonVariant;
  svgFillType?: IconButtonSvgFillType;
}
