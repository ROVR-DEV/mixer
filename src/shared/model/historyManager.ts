export class HistoryManager<T> {
  private _stack: T[] = [];

  private _pointer: number = -1;

  addState(state: T) {
    this._pointer += 1;
    if (this._pointer < this._stack.length) {
      this._stack = this._stack.slice(0, this._pointer);
    }

    this._stack.push(state);
  }

  undo(): T | null {
    if (this._pointer > 0) {
      this._pointer -= 1;

      return this._stack[this._pointer];
    }

    return null;
  }

  redo(): T | null {
    if (this._pointer < this._stack.length - 1) {
      this._pointer += 1;

      return this._stack[this._pointer];
    }

    return null;
  }

  clear() {
    this._pointer = -1;
    this._stack = [];
  }

  get currentState(): T {
    return this._stack[this._pointer];
  }
}
