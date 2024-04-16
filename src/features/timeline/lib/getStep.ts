export const getStep = (zoom: number) => {
  if (zoom < 1.75) {
    return 4;
  } else if (zoom >= 1.75 && zoom <= 2.5) {
    return 2;
  } else {
    return 1;
  }
};
