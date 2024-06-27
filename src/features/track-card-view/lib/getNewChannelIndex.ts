import { clamp } from '@/shared/lib';

export const getNewChannelIndex = (
  mouseY: number,
  startY: number,
  trackHeight: number,
  startChannel: number,
  minChannel: number = 0,
  maxChannel: number = Infinity,
) => {
  const dragStartChannelIndex = Math.floor(startY / trackHeight);

  const mouseChannelIndex = Math.floor(mouseY / trackHeight);

  const channelOffset = mouseChannelIndex - dragStartChannelIndex;

  return clamp(startChannel + channelOffset, minChannel, maxChannel);
};
