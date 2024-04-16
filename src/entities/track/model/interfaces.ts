export interface Track {
  duration: string;
  show_cover: null;
  curator: Curator;
  tracks: TrackElement[];
  mixes: Mixes;
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
  show: TrackShow;
}

export interface Curator {
  shows: ShowElement[];
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

export interface ShowElement {
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

export interface Mixes {
  CUT: Auto;
  AUTO: Auto;
}

export interface Auto {
  id: number;
  playlist_id: number;
  type: string;
  uuid: string;
  cue: number[];
  created_at: Date;
  updated_at: Date;
  duration: number;
}

export interface TrackShow {
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

export interface TrackElement {
  duration: string;
  start: number;
  end: number;
  id: number;
  title: string;
  artist: string;
  album: string;
  year: string;
  bpm: number;
  key: Key | null;
  energy: number;
  quality: number;
  bitrate: number;
  mimetype: Mimetype;
  comment: string;
  cover: string;
  label: string;
  isrc: Isrc;
  program_manager_id: number;
  uuid: string;
  uuid_play: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  platforms: Platform[];
  curator_id: number;
  pivot: Pivot;
}

export enum Isrc {
  Dea621702008 = 'DEA621702008',
  Empty = '',
  Gb7Le0904670 = 'GB7LE0904670',
  Usuv72204512 = 'USUV72204512',
}

export interface Key {
  note: Note;
  alter: Alter;
  tone: Tone;
  name: string;
  value: string;
}

export enum Alter {
  Alter = '',
  Empty = '♭',
  Purple = '♯',
}

export enum Note {
  A = 'A',
  C = 'C',
  F = 'F',
}

export enum Tone {
  Major = 'major',
  Minor = 'minor',
}

export enum Mimetype {
  AudioWebm = 'audio/webm',
}

export interface Pivot {
  playlist_id: number;
  track_id: number;
  order: number;
  offset: number;
}

export interface Platform {
  id: string;
  track_id: number;
  platformtype_ord: number;
  link: string;
  platform_type: PlatformType;
}

export enum PlatformType {
  Applemusic = 'applemusic',
  Discogs = 'discogs',
  Spotify = 'spotify',
  Youtube = 'youtube',
}
