export const getSubTickSegmentWidth = (zoom = 2) => {
  if (zoom >= 1 && zoom < 1.75) {
    return { min: 42, max: 68 };
  } else if (zoom >= 1.75 && zoom < 2.5) {
    return { min: 7, max: 14 };
  } else if (zoom >= 2.5 && zoom < 4.5) {
    return { min: 14, max: 62 };
  } else if (zoom >= 4.5 && zoom < 5.25) {
    return { min: 7, max: 11 };
  } else if (zoom >= 5.25 && zoom < 6.75) {
    return { min: 16, max: 65 };
  } else if (zoom >= 6.75 && zoom < 7.5) {
    return { min: 7, max: 12 };
  } else {
    return { min: 14, max: Number.MAX_VALUE };
  }
};
