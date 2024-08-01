export const arrayBufferToBlob = (arrayBuffer: ArrayBuffer, type?: string) =>
  new Blob([arrayBuffer], { type: type });
