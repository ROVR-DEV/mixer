import { removeDragGhostImage } from '@/shared/lib';

export const setDragSettings = (e: React.DragEvent<HTMLDivElement>) => {
  removeDragGhostImage(e);

  e.dataTransfer.dropEffect = 'move';
  e.dataTransfer.effectAllowed = 'move';

  e.currentTarget.style.cursor = 'pointer';
};

export const setDragProperties = (
  e: React.DragEvent<HTMLDivElement>,
  startTime: number,
) => {
  e.currentTarget.dataset.startX = `${e.nativeEvent.pageX}`;
  e.currentTarget.dataset.startY = `${e.nativeEvent.pageY}`;
  e.currentTarget.dataset.startTime = `${startTime}`;
  e.currentTarget.dataset.leftBound = `${0}`;
  e.currentTarget.dataset.rightBound = `${Infinity}`;

  e.currentTarget.style.zIndex = '10';
};

export const clearDragProperties = (e: React.DragEvent<HTMLDivElement>) => {
  e.currentTarget.dataset.startX = '';
  e.currentTarget.dataset.startY = '';
  e.currentTarget.dataset.startTime = '';
  e.currentTarget.dataset.leftBound = '';
  e.currentTarget.dataset.rightBound = '';
  e.currentTarget.style.zIndex = '';
  e.currentTarget.style.top = '';
};
