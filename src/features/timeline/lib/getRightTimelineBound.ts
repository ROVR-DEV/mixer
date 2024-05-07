export const getRightTimelineBound = (
  timelineClientWidth: number,
  timelineScrollWidth: number,
) => {
  return timelineScrollWidth - timelineClientWidth;
};
