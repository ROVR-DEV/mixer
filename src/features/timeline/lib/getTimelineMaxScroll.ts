export const getTimelineMaxScroll = (
  timelineClientWidth: number,
  timelineScrollWidth: number,
) => {
  return timelineScrollWidth - timelineClientWidth;
};
