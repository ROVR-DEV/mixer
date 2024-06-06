import { TimelineController } from '../model';

export const pageXToTime = (
  x: number,
  timelineController: TimelineController,
) => {
  return timelineController.virtualToRealGlobalPixels(
    x - timelineController.startPageX,
  );
};
