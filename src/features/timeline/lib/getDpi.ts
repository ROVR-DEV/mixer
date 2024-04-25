export const getDpi = () =>
  typeof window !== 'undefined' && window.devicePixelRatio
    ? window.devicePixelRatio
    : 1;
