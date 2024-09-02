export const TRACK_BASE_URL = 'https://app.rovr.live/api/track';

export const getTrackPlayUrl = (trackUuid: string) =>
  `${TRACK_BASE_URL}/${trackUuid}/play`;
