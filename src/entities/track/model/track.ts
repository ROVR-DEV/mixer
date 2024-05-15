export interface Track {
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
