export const preventAll = (e: MouseEvent | React.MouseEvent<HTMLElement>) => {
  e.preventDefault();
  e.stopPropagation();
  if ('nativeEvent' in e) {
    e.nativeEvent.stopImmediatePropagation();
  }
};

export const stopPropagation = (e: React.UIEvent | React.SyntheticEvent) => {
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};
