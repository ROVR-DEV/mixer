export const preventAll = (e: React.MouseEvent<HTMLElement>) => {
  e.preventDefault();
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};

export const stopPropagation = (e: React.MouseEvent) => {
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};
