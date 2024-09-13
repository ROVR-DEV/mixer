import { memo } from 'react';

import { IconButton, PlusIcon } from '@/shared/ui';

import { AddNewChannelButtonProps } from './interfaces';

export const AddNewChannelButton = ({ ...props }: AddNewChannelButtonProps) => {
  return (
    <IconButton aria-label='Add new channel' title='Add new channel' {...props}>
      <PlusIcon />
    </IconButton>
  );
};

export const AddNewChannelButtonMemoized = memo(AddNewChannelButton);
