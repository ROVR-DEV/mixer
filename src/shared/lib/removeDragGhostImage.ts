export const removeDragGhostImage = (e: React.DragEvent) => {
  const canvas = document.createElement('canvas');
  e.dataTransfer.setDragImage(canvas, 0, 0);
  canvas.remove();
};
