export const getSegmentWidth = (zoom: number) => {
  if (zoom >= 1 && zoom < 1.75) {
    return { min: 123, max: 201 };
  } else if (zoom >= 1.75 && zoom < 2.5) {
    return { min: 80, max: 125 };
  } else if (zoom >= 2.5 && zoom < 4.5) {
    return { min: 78, max: 313 };
  } else if (zoom >= 4.5 && zoom < 5.25) {
    return { min: 85, max: 122 };
  } else if (zoom >= 5.25 && zoom < 6.75) {
    return { min: 82, max: 330 };
  } else if (zoom >= 6.75 && zoom < 7.5) {
    return { min: 82, max: 134 };
  } else {
    return { min: 75, max: Number.MAX_VALUE };
  }
};
