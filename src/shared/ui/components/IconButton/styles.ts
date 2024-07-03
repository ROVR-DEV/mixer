import { cn } from '@/shared/lib';

import { IconButtonSvgFillType, IconButtonVariant } from './types';

const baseStyles =
  'flex items-center justify-center rounded-full size-8 aspect-square';

const defaultStyles: Record<IconButtonVariant, string> = {
  unstyled: baseStyles,
  primary: cn(baseStyles, 'border border-accent'),
  primaryFilled: cn(baseStyles, 'border border-transparent bg-accent'),
  secondary: cn(baseStyles, 'border border-third'),
  secondaryFilled: cn(baseStyles, 'border border-transparent bg-third'),
  accent: cn(baseStyles, 'border border-transparent bg-primary'),
  inverse: cn(baseStyles, 'border border-transparent bg-primary'),
  inverseFilled: cn(baseStyles, 'border border-transparent bg-accent-inverse'),
};

const defaultFillStyles: Record<
  IconButtonVariant,
  Record<Exclude<IconButtonSvgFillType, 'both'>, string>
> = {
  primary: {
    stroke: '[&_svg_*]:stroke-accent',
    fill: '[&_svg]:fill-accent',
  },
  primaryFilled: {
    stroke: '[&_svg_*]:stroke-primary',
    fill: '[&_svg]:fill-primary',
  },
  secondary: {
    stroke: '[&_svg_*]:stroke-third',
    fill: '[&_svg]:fill-third',
  },
  secondaryFilled: {
    stroke: '[&_svg_*]:stroke-secondary',
    fill: '[&_svg]:fill-secondary',
  },
  accent: {
    stroke: '[&_svg_*]:stroke-accent',
    fill: '[&_svg]:fill-accent',
  },
  inverse: {
    stroke: '[&_svg_*]:stroke-accent-inverse',
    fill: '[&_svg]:fill-accent-inverse',
  },
  inverseFilled: {
    stroke: '[&_svg_*]:stroke-primary',
    fill: '[&_svg]:fill-primary',
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
