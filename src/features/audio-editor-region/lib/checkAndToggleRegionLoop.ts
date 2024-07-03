import { Player } from '@/entities/audio-editor';

export const checkAndToggleRegionLoop = (player: Player) => {
  if (
    (player.region.duration === 0 && player.isRegionLoopEnabled) ||
    (player.region.duration > 0 && !player.isRegionLoopEnabled)
  ) {
    player.toggleRegionLoop();
  }
};
