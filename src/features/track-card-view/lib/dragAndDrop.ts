export const setDragProperties = (track: HTMLDivElement) => {
  track.style.cursor = 'grabbing';
};

export const clearDragProperties = (track: HTMLDivElement) => {
  track.style.zIndex = '';
  track.style.top = '';
  track.style.cursor = '';
};
