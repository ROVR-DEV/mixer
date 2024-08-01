import { extractPeaksPromise } from '@/shared/lib';

export const calculatePeaks = async (
  arrayBuffer: ArrayBuffer,
): Promise<number[][]> => {
  const audioContext = new OfflineAudioContext({
    numberOfChannels: 2,
    length: arrayBuffer.byteLength,
    sampleRate: 8000,
  });

  const peaks = await extractPeaksPromise(
    audioContext,
    arrayBuffer,
    527,
    false,
    undefined,
    undefined,
    16,
  );

  return [[...peaks.data[0]], [...peaks.data[1]]];
};
