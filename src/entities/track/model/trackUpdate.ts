export interface TrackUpdate {
  id: number;
  offset: number;
  duration: number;
  filters?: {
    fadeIn?: number;
    fadeOut?: number;
  };
}
