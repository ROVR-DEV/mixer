import { makeAutoObservable } from 'mobx';

import { AudioEditorTool } from './audioEditorTool';

export class AudioEditor {
  private _tool: AudioEditorTool = 'cursor';
  readonly availableTools: AudioEditorTool[] = ['cursor', 'scissors'];

  get tool(): AudioEditorTool {
    return this._tool;
  }

  constructor() {
    makeAutoObservable(this);
  }

  useTool = (tool: AudioEditorTool) => {
    if (!this.availableTools.includes(tool)) {
      return;
    }

    this._tool = tool;
  };
}
