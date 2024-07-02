import { makeAutoObservable } from 'mobx';

import { AudioEditorTool } from './audioEditorTool';
import { Player } from './player';

export class AudioEditor {
  private _player: Player;

  private _tool: AudioEditorTool = 'cursor';
  readonly availableTools: AudioEditorTool[] = ['cursor', 'scissors', 'repeat'];

  get tool(): AudioEditorTool {
    return this._tool;
  }

  constructor(player: Player) {
    this._player = player;

    makeAutoObservable(this);
  }

  useTool = (tool: AudioEditorTool) => {
    if (!this.availableTools.includes(tool)) {
      return;
    }

    switch (tool) {
      case 'repeat':
        this._player.toggleRegionLoop();
        break;
      case 'cursor':
      case 'scissors':
        this._tool = tool;
    }
  };
}
