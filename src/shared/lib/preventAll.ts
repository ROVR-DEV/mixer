export const preventAll = (e: React.MouseEvent<HTMLElement> | MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if ('nativeEvent' in e) {
    e.nativeEvent.stopImmediatePropagation();
  }
};

export const stopPropagation = (e: React.MouseEvent) => {
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};
