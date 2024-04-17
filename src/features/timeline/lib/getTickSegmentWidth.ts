export const getSegmentWidth = (zoom: number) => {
  if (zoom === 1) {
    return { min: 60, max: 60 };
  } else if (zoom < 1.75) {
    return { min: 39, max: 78 };
  } else if (zoom >= 1.75 && zoom < 2) {
    return { min: 39, max: 78 };
  } else if (zoom >= 2 && zoom < 4) {
    return { min: 39, max: 39 };
  } else {
    return { min: 39, max: Number.MAX_VALUE };
  }
};
