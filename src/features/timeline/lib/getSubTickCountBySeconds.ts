export const getSubTickCountBySeconds = (step: number) => {
  if (step == 30) {
    return 2;
  } else if (step == 10) {
    return 9;
  } else if (step === 5) {
    return 4;
  } else if (step === 1) {
    return 9;
  } else if (step === 0.5) {
    return 4;
  } else if (step === 0.1) {
    return 9;
  } else if (step === 0.05) {
    return 4;
  } else {
    return 4;
  }
};
