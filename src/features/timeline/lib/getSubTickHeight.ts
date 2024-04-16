export const getSubTickHeight = (count: number) => {
  if (count <= 3) {
    return { short: 4, tall: 4 };
  }

  return { short: 2, tall: 4 };
};
