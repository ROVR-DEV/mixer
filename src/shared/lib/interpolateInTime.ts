// TODO: add non linear functions support
export const interpolateInTime = (
  from: number,
  to: number,
  callback: (value: number, animationFrameId: number) => void,
  duration: number,
  steps: number,
): void => {
  const stepTime = duration / steps;

  const sign = to >= from ? 1 : -1;
  const diff = Math.abs(from - to);
  const stepValue = diff / steps;

  let currentStep = 0;
  let animationFrameId: number;

  let prevTimestamp = 0;
  let stepTimer = 0;
  const stepFunction = (timestamp: number) => {
    if (prevTimestamp === 0) {
      prevTimestamp = timestamp;
    }

    const delta = timestamp - prevTimestamp;
    stepTimer += delta;

    if (stepTimer >= stepTime) {
      stepTimer = 0;
      currentStep += 1;

      const delta = sign * stepValue * currentStep;
      const value = from + delta;
      callback(value, animationFrameId);
    }

    if (currentStep >= steps) {
      return;
    }

    prevTimestamp = timestamp;

    animationFrameId = requestAnimationFrame(stepFunction);
  };

  animationFrameId = requestAnimationFrame(stepFunction);
};
