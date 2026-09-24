type RetryFn = () => Promise<unknown>;

let counter = 0;
const registry = new Map<string, RetryFn>();

export const retryRegistry = {
  register(fn: RetryFn): string {
    const key = String(++counter);
    registry.set(key, fn);
    return key;
  },
  get(key: string): RetryFn | undefined {
    return registry.get(key);
  },
  remove(key: string): void {
    registry.delete(key);
  },
};
