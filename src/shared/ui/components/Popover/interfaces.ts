import { Middleware, Placement } from '@floating-ui/react';

export interface PopoverProps {
  initialOpen?: boolean;
  placement?: Placement;
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  middleware?: Middleware[];
}
