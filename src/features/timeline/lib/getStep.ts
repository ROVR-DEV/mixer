export const getStep = (zoom: number) => {
  if (zoom == 1) {
    return 30 / 1000;
  }
  if (zoom < 1 * 1.5) {
    return 50 / 1000;
  } else if (zoom >= 1.75 && zoom <= 2.5) {
    return 2;
  } else {
    return 1;
  }
};
