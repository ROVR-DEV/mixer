import { IconButtonProps } from '@/shared/ui';

export interface ToolButton {
  name: string;
  icon: JSX.Element;
  isActive: boolean;
  onClick: () => void;
  fillType?: IconButtonProps['svgFillType'];
}

export interface ToolGroup {
  name: string;
  buttons: ToolButton[];
}

export interface AudioEditorFloatingToolbarProps
  extends React.ComponentProps<'div'> {
  tools: ToolGroup[];
}
