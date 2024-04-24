import { cn } from '@/shared/lib/cn';

import { IconButtonSvgFillType, IconButtonVariant } from './types';

const baseStyles =
  'flex items-center justify-center rounded-full size-8 aspect-square';

const defaultStyles: Record<IconButtonVariant, string> = {
  unstyled: baseStyles,
  primary: cn(baseStyles, 'border border-accent'),
  primaryFilled: cn(baseStyles, 'border border-transparent bg-accent'),
  secondary: cn(baseStyles, 'border border-third'),
  secondaryFilled: cn(baseStyles, 'border border-transparent bg-third'),
  inverse: cn(baseStyles, 'border border-transparent bg-primary'),
};

const defaultFillStyles: Record<
  IconButtonVariant,
  Record<Exclude<IconButtonSvgFillType, 'both'>, string>
> = {
  primary: {
    stroke: '[&_svg]:stroke-accent',
    fill: '[&_svg]:fill-accent',
  },
  primaryFilled: {
    stroke: '[&_svg]:stroke-primary',
    fill: '[&_svg]:fill-primary',
  },
  secondary: {
    stroke: '[&_svg]:stroke-third',
    fill: '[&_svg]:fill-third',
  },
  secondaryFilled: {
    stroke: '[&_svg]:stroke-primary',
    fill: '[&_svg]:fill-primary',
  },
  inverse: {
    stroke: '[&_svg]:stroke-accent',
    fill: '[&_svg]:fill-accent',
  },
  unstyled: { stroke: '', fill: '' },
};

const getFillStyle = (
  variant: IconButtonVariant,
  svgFillType: IconButtonSvgFillType,
) => {
  const currentFillStyleForVariant = defaultFillStyles[variant];

  switch (svgFillType) {
    case 'both':
      return cn(
        currentFillStyleForVariant.fill,
        currentFillStyleForVariant.stroke,
      );
    case 'fill':
    case 'stroke':
      return currentFillStyleForVariant[svgFillType];
    default:
      return '';
  }
};

export const getStyles = (
  variant: IconButtonVariant,
  svgFillType: IconButtonSvgFillType,
) => {
  return cn(defaultStyles[variant], getFillStyle(variant, svgFillType));
};
