export const getStepInSeconds = (zoom: number) => {
  if (zoom >= 1 && zoom < 1.75) {
    return 30;
  }
  if (zoom >= 1.75 && zoom < 2.5) {
    return 10;
  } else if (zoom >= 1.75 && zoom < 4.5) {
    return 5;
  } else if (zoom >= 4.5 && zoom < 5.25) {
    return 1;
  } else if (zoom >= 5.25 && zoom < 6.75) {
    return 0.5;
  } else if (zoom >= 6.75 && zoom < 7.5) {
    return 0.1;
  } else {
    return 0.05;
  }
};
