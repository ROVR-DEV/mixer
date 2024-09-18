import extractPeaks from 'webaudio-peaks';

export const calculatePeaks = async (
  arrayBuffer: ArrayBuffer,
): Promise<number[][]> => {
  const audioContext = new OfflineAudioContext({
    numberOfChannels: 2,
    length: arrayBuffer.byteLength,
    sampleRate: 8000,
  });

  try {
    const decodedData = await audioContext.decodeAudioData(arrayBuffer);

    const peaks = extractPeaks(decodedData, 256, false);

    return [[...peaks.data[0]], [...peaks.data[1]]];
  } catch {
    return [];
  }
};
