export const isSubTickTall = (index: number, subTickCount: number) => {
  if (subTickCount === 9) {
    return index !== 4;
  } else {
    return false;
  }
};
