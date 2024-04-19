export const getTickSegmentWidthZoomed = (
  tickSegmentWidth: number,
  zoom: number,
  zoomStepBreakpoint: number,
) => {
  const fixedZoom = zoom / zoomStepBreakpoint;

  return tickSegmentWidth * fixedZoom;
};
