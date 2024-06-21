import { AudioEditorTool } from '../../model';

export interface AudioEditorFloatingToolbarProps
  extends React.ComponentProps<'div'> {
  onToolChange?: (tool: AudioEditorTool) => void;
}
