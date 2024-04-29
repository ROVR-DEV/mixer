export const clampTime = (time: number) => {
  if (time < 0) {
    return 0;
  }

  return time;
};
