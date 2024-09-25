import { HighDpiCanvasProps } from '@/shared/ui';

export interface OptimizedWaveformProps
  extends Omit<HighDpiCanvasProps, 'ref' | 'onHiDpiCtxCreate'> {
  waveColor?: string;
  startTime: number;
  endTime: number;
  duration: number;
  minPxPerSeconds: number;
  peaks: Array<Float32Array | number[]> | null;
  updateColor?: boolean;
  renderFunction: (
    ctx: CanvasRenderingContext2D,
    channelData: Array<Float32Array | number[]>,
    waveColor: string,
  ) => void;
}
