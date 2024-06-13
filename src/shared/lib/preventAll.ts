export const preventAll = (e: React.MouseEvent<HTMLElement>) => {
  e.preventDefault();
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};
