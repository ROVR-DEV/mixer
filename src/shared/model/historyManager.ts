export class HistoryManager<T> {
  private stack: T[] = [];

  addState(state: T) {
    this.stack.push(state);
  }

  undo(): T | null {
    if (this.stack.length > 1) {
      return this.stack.pop() ?? null;
    }
    return null;
  }

  redo(): T | null {
    if (this.stack.length > 0) {
      const state = this.stack[this.stack.length - 1];
      this.stack.push(this.currentState);
      return state;
    }
    return null;
  }

  clear() {
    this.stack = [];
  }

  get currentState(): T {
    return this.stack[this.stack.length - 1];
  }
}
