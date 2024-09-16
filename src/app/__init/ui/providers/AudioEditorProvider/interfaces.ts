import React from 'react';

import { Playlist } from '@/entities/playlist';

// eslint-disable-next-line import/no-named-as-default-member
export interface AudioEditorProviderProps extends React.PropsWithChildren {
  playlist: Playlist;
}
