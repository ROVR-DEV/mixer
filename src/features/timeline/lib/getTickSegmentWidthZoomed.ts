export const getTickSegmentWidthZoomed = (
  tickSegmentWidth: number,
  zoom: number,
  zoomStepBreakpoint: number,
) => {
  const fixedZoom =
    zoom >= zoomStepBreakpoint ? 1 + (zoom % zoomStepBreakpoint) : zoom;

  return tickSegmentWidth * fixedZoom;
};
