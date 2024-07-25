// eslint-disable-next-line boundaries/element-types
import { Track } from '@/entities/track';

export interface PlaylistDTO {
  duration: string;
  show_cover: null;
  curator: CuratorDTO;
  tracks: Track[];
  mixes: MixesDTO;
  id: number;
  title: string;
  comment: null;
  show_id: number;
  curator_id: number;
  soundcloud_secret: null;
  created_at: Date;
  updated_at: Date;
  pending_approval_at: null;
  submitted_at: null;
  mix_id: null;
  ready_for_schedule_at: null;
  archived_at: null;
  deleted_at: null;
  status: string;
  show: PlaylistShowDTO;
}

export interface CuratorDTO {
  shows: ShowElementDTO[];
  next_program: null;
  is_client_subcscribed: boolean;
  photo: null;
  small_photo: null;
  photo_app_radio: null;
  photo_app_large: null;
  photo_app_archives: null;
  photo_dashboard: null;
  share_cover: null;
  links: string[];
  link_titles: string[];
  country_code: null;
  about: string;
  title_for_website: string;
  id: number;
  role: string;
  global_visible: boolean;
  name: string;
  email: string;
  timeshift: number;
  created_at: Date;
  updated_at: Date;
}

export interface ShowElementDTO {
  cover: null;
  cover_app_radio: null;
  cover_app_archives: null | string;
  cover_app_schedule_l: null;
  cover_app_schedule_s: null;
  cover_dashboard: null;
  share_cover: null;
  cover_desktop: null;
  cover_mobile: null;
  id: number;
  title: string;
  description: null;
  jingle_id: number;
  schedule_frequency: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  name: string;
  icon: null;
  since: null;
  until: null;
  about: null;
  start_at: null;
  end_at: null;
}

export interface MixesDTO {
  CUT: AutoDTO;
  AUTO: AutoDTO;
}

export interface AutoDTO {
  id: number;
  playlist_id: number;
  type: string;
  uuid: string;
  cue: number[];
  created_at: Date;
  updated_at: Date;
  duration: number;
}

export interface PlaylistShowDTO {
  id: number;
  title: string;
  description: null;
  jingle_id: number;
  schedule_frequency: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  cover: null;
  cover_app_radio: null;
  cover_app_archives: string;
  cover_app_schedule_l: null;
  cover_app_schedule_s: null;
  cover_dashboard: null;
  share_cover: null;
  cover_desktop: null;
  cover_mobile: null;
  next_curator: null;
}
