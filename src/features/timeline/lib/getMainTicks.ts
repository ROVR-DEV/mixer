const createTick = (
  index: number,
  segmentWidth: number,
  isFirstTick: boolean,
  step: number,
) => ({
  x: index * segmentWidth + index * Number(!isFirstTick),
  number: index * step,
});

const getMainTicks = (width: number, step: number, segmentWidth: number) => {
  const count = Math.floor(width / segmentWidth);

  return Array.from(Array(count)).map((_, i) =>
    createTick(i, segmentWidth, i === 0, step),
  );
};

const getSubTicks = (subTickCount: number, subTickSegmentWidth: number) => {
  return Array.from(Array(subTickCount)).map((_, i) =>
    createTick(i + 1, subTickSegmentWidth, false, 1),
  );
};

export const getTicks = (
  width: number,
  step: number,
  tickSegmentWidth: number,
  subTickSegmentWidth: number,
  subTickCount: number,
) => {
  const mainTicks = getMainTicks(width, step, tickSegmentWidth);
  const subTicks = getSubTicks(subTickCount, subTickSegmentWidth);
  return { mainTicks, subTicks };
};
