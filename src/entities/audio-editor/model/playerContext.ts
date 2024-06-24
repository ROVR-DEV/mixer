'use client';

import { createContext, useContext } from 'react';

import { Player } from './player';

export const PlayerContext = createContext<Player | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === null) {
    throw new Error(
      'You have forgotten to wrap your root component with PlayerContext',
    );
  }
  return context;
};
