import { PlayButtonProps } from '@/entities/audio-editor';

export interface PlayButtonViewProps
  extends Omit<PlayButtonProps, 'isPlaying'> {}
