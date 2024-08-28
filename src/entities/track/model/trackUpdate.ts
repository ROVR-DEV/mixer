import { AudioEditorTrack } from './audioEditorTrack';

export interface TracksUpdateDto {
  tracks: TrackUpdateDto[];
}

export interface TrackUpdateDto {
  id: number;
  offset: number;
  duration: number;
  filters?: {
    fadein?: number;
    fadeout?: number;
  };
}

export const tracksToTracksUpdateDto = (
  tracks: AudioEditorTrack[],
): TracksUpdateDto => ({
  tracks: tracks.map(trackToTrackUpdateDto),
});

export const trackToTrackUpdateDto = (
  track: AudioEditorTrack,
): TrackUpdateDto => ({
  id: track.meta.id,
  offset: track.startTime,
  duration: track.duration,
  filters: {
    fadein: track.filters.fadeInDuration,
    fadeout: track.filters.fadeOutDuration,
  },
});
