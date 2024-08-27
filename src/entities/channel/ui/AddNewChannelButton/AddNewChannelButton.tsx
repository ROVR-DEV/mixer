import { memo } from 'react';

import { IconButton } from '@/shared/ui';
import { PlusIcon } from '@/shared/ui/assets';

import { AddNewChannelButtonProps } from './interfaces';

export const AddNewChannelButton = ({ ...props }: AddNewChannelButtonProps) => {
  return (
    <IconButton aria-label='Add new channel' title='Add new channel' {...props}>
      <PlusIcon />
    </IconButton>
  );
};

export const AddNewChannelButtonMemoized = memo(AddNewChannelButton);
