'use client';

import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { SoloButton } from '@/entities/channel';

import { SoloButtonViewProps } from './interfaces';

export const SoloButtonView = observer(function SoloButtonView({
  channel,
  ...props
}: SoloButtonViewProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      channel.toggleSolo();
    },
    [channel],
  );

  return (
    <SoloButton isSolo={channel.isSolo} onClick={handleClick} {...props} />
  );
});
