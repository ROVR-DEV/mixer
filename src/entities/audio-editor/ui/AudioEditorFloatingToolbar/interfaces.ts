import { AudioEditorTool } from '../../model';

export interface AudioEditorFloatingToolbarProps
  extends React.ComponentProps<'div'> {
  currentTool: AudioEditorTool;
  tools: AudioEditorTool[][];
  onToolChange?: (tool: AudioEditorTool) => void;
}
