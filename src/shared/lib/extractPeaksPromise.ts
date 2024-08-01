import extractPeaks, { PeakData } from 'webaudio-peaks';

import { DropFirstParameter } from './typescript';

type ExtractArgs = DropFirstParameter<Parameters<typeof extractPeaks>>;

export const extractPeaksPromise = (
  audioContext: BaseAudioContext,
  audioData: ArrayBuffer,
  ...args: ExtractArgs
): Promise<PeakData> =>
  new Promise((resolve) => {
    audioContext.decodeAudioData(audioData, (decodedData) => {
      resolve(extractPeaks(decodedData, ...args));
    });
  });
