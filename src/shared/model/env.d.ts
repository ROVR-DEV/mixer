declare namespace NodeJS {
  export interface ProcessEnv {
    BACKEND_URL: string;
    BACKEND_API_URL: string;
    NEXT_PUBLIC_DEBUG_TRACKS_MAX_ENABLED: string;
    NEXT_PUBLIC_DEBUG_TRACKS_MAX_COUNT: number;
  }
}
