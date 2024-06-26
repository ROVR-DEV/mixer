import { Rect } from '@/shared/lib';
import {
  checkCollision,
  checkVerticalCollision,
} from '@/shared/lib/checkCollision';

import { Player, TimelineController } from '@/entities/audio-editor';
import { AudioEditorTrack } from '@/entities/track';

const getChannelVerticalBound = (
  index: number,
  timelineController: TimelineController,
) => {
  if (typeof timelineController.trackHeight !== 'number') {
    return { startY: 0, endY: 0 };
  }

  const startY = index * timelineController.trackHeight;
  const endY = startY + timelineController.trackHeight + 14;

  return { startY: startY, endY: endY };
};

const selectTrackInSelection = (
  track: AudioEditorTrack,
  player: Player,
  timelineController: TimelineController,
  channelStartY: number,
  rect: Rect,
  addToSelection: boolean = false,
) => {
  if (typeof timelineController.trackHeight !== 'number') {
    return;
  }

  const isIntersects = checkCollision(
    new Rect(
      timelineController.timeToVirtualPixels(track.trimStartTime) +
        timelineController.timelineLeftPadding,
      channelStartY + 7,
      timelineController.timeToVirtualPixels(track.trimDuration),
      timelineController.trackHeight - 14,
    ),
    rect,
  );

  const isSelected = player.isTrackSelected(track);

  if (isIntersects && !isSelected) {
    player.selectTrack(track, true);
  } else if (!isIntersects && isSelected && !addToSelection) {
    player.unselectTrack(track);
  }
};

export const selectTracksInSelection = (
  player: Player,
  timelineController: TimelineController,
  rect: Rect,
  addToSelection: boolean = false,
) => {
  player.channelIds.forEach((channelId, i) => {
    if (typeof timelineController.trackHeight !== 'number') {
      return;
    }

    const virtualRect = new Rect(
      rect.x +
        timelineController.realToVirtualPixels(timelineController.scroll),
      rect.y,
      rect.width,
      rect.height,
    );

    const { startY: channelStartY, endY: channelEndY } =
      getChannelVerticalBound(i, timelineController);

    const isChannelIntersects = checkVerticalCollision(
      channelStartY,
      channelEndY,
      virtualRect.y,
      virtualRect.bottom,
    );

    const channel = player.channels.get(channelId);

    if (!channel) {
      return;
    }

    if (!isChannelIntersects) {
      if (!addToSelection) {
        channel.tracks.forEach((track) => player.unselectTrack(track));
      }
      return;
    }

    channel.tracks.forEach((track) =>
      selectTrackInSelection(
        track,
        player,
        timelineController,
        channelStartY,
        virtualRect,
        addToSelection,
      ),
    );
  });
};
