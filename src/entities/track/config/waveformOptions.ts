// eslint-disable-next-line import/named
import { WaveSurferOptions } from 'wavesurfer.js';

import { resolvedTailwindConfig } from '@/shared/config';

import { WaveformColor } from '../ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const primaryColor = (resolvedTailwindConfig.theme.colors as any).primary
  .DEFAULT as string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const secondaryColor = (resolvedTailwindConfig.theme.colors as any).third
  .DEFAULT as string;

const primaryColorOptions: Partial<WaveSurfer['options']> = {
  waveColor: primaryColor,
  progressColor: primaryColor,
};

const secondaryColorOptions: Partial<WaveSurfer['options']> = {
  waveColor: secondaryColor,
  progressColor: secondaryColor,
};

export const DEFAULT_WAVEFORM_OPTIONS: Partial<WaveSurferOptions> = {
  barWidth: 1.5,
  barGap: 2.8,
  barHeight: 1.5,
  height: 'auto',
  interact: false,
  normalize: true,
  backend: 'MediaElement',
};

export const WAVEFORM_COLORS: Record<
  WaveformColor,
  Partial<WaveSurfer['options']>
> = {
  primary: primaryColorOptions,
  secondary: secondaryColorOptions,
};
