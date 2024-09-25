import { resolvedTailwindConfig } from '@/shared/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const primaryColor = (resolvedTailwindConfig.theme.colors as any).primary
  .DEFAULT as string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const secondaryColor = (resolvedTailwindConfig.theme.colors as any).third
  .DEFAULT as string;

export type WaveformColor = 'primary' | 'secondary';

export const WAVEFORM_COLORS: Record<WaveformColor, string> = {
  primary: primaryColor,
  secondary: secondaryColor,
};
