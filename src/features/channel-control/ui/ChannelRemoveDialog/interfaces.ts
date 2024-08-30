import { DialogProps } from '@/shared/ui';

export interface ChannelRemoveDialogProps extends DialogProps {
  number: number;
  onRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
