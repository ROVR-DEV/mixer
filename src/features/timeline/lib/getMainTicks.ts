const getRealTickSegmentWidth = (
  minTickSegmentWidth: number,
  maxTickSegmentWidth: number,
  zoom: number,
) => {
  const fixedZoom = zoom >= 2 ? zoom - 1 : zoom;

  const realSegmentWidth = minTickSegmentWidth * fixedZoom;

  if (zoom < 2 && realSegmentWidth > maxTickSegmentWidth) {
    return minTickSegmentWidth;
  }

  return realSegmentWidth;
};

const getRealSubTickSegmentWidth = (
  minSubTickSegmentWidth: number,
  maxSubTickSegmentWidth: number,
  zoom: number,
) => {
  const realSubTickSegmentWidth = minSubTickSegmentWidth * zoom;

  if (realSubTickSegmentWidth > maxSubTickSegmentWidth) {
    return minSubTickSegmentWidth;
  }

  return realSubTickSegmentWidth;
};

const createTick = (index: number, segmentWidth: number, step: number) => ({
  x: index * segmentWidth,
  number: index * step + 1,
});

const getMainTicks = (width: number, step: number, segmentWidth: number) => {
  const count = Math.floor(width / segmentWidth);

  return Array.from(Array(count)).map((_, i) =>
    createTick(i, segmentWidth, step),
  );
};

const getSubTicks = (tickSegmentWidth: number, subTickCount: number) => {
  const width = tickSegmentWidth / (subTickCount + 1);

  return Array.from(Array(subTickCount)).map((_, i) =>
    createTick(i + 1, width, 1),
  );
};

export const getTicks = (
  width: number,
  zoom: number,
  step: number,
  minSegmentWidth: number,
  maxSegmentWidth: number,
  minSubTickSegmentWidth: number,
  maxSubTickSegmentWidth: number,
) => {
  const realTickSegmentWidth = getRealTickSegmentWidth(
    minSegmentWidth,
    maxSegmentWidth,
    zoom,
  );

  const mainTicks = getMainTicks(width, step, realTickSegmentWidth);

  if (zoom < 2.75) {
    return { mainTicks, subTicks: [] };
  }

  const realSubTickSegmentWidth = getRealSubTickSegmentWidth(
    minSubTickSegmentWidth,
    maxSubTickSegmentWidth,
    zoom,
  );

  let subTickCount = 3;
  if (zoom >= 3.5 && zoom <= 4) {
    subTickCount = 7;
  } else if (zoom >= 4) {
    subTickCount = Math.floor(realTickSegmentWidth / realSubTickSegmentWidth);
    if (subTickCount % 2 === 0) {
      subTickCount -= 1;
    }

    if (subTickCount === 9 || subTickCount === 11 || subTickCount === 13) {
      subTickCount = 15;
    }

    if (subTickCount > 15 && subTickCount < 31) {
      subTickCount = 31;
    }
  }

  const subTicks = getSubTicks(realTickSegmentWidth, subTickCount);

  return { mainTicks, subTicks };
};
