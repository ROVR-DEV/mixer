export const getZoomStepBreakpoint = (zoom: number) => {
  if (zoom >= 1 && zoom < 1.75) {
    return 1;
  }
  if (zoom >= 1.75 && zoom < 2.5) {
    return 1.75;
  } else if (zoom >= 2.5 && zoom < 4.5) {
    return 2.5;
  } else if (zoom >= 4.5 && zoom < 5.25) {
    return 4.5;
  } else if (zoom >= 5.25 && zoom < 6.75) {
    return 5.25;
  } else if (zoom >= 6.75 && zoom < 7.5) {
    return 6.75;
  } else {
    return 7.5;
  }
};
