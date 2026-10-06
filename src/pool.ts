export class Pool<T> {
  private free: T[] = []
  private factory: () => T
  private reset: (item: T) => void

  constructor(
    factory: () => T,
    reset: (item: T) => void,
  ) {
    this.factory = factory
    this.reset = reset
  }

  acquire(): T {
    return this.free.pop() ?? this.factory()
  }

  release(item: T): void {
    this.reset(item)
    this.free.push(item)
  }

  drain(): T[] {
    const items = this.free

    this.free = []

    return items
  }
}