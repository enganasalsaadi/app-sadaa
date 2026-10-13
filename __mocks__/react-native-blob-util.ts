/** Controllable PUT tasks: each `fetch` pushes a `FakePut` the test settles by hand. */
export interface FakePut {
  args: unknown[];
  cancel: jest.Mock;
  progress(sent: number, total: number): void;
  succeed(status?: number): void;
  fail(error: unknown): void;
}

export const fakePuts: FakePut[] = [];
export const fakeStat = jest.fn();

const createTask = (args: unknown[]) => {
  let resolve: (value: unknown) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  let onProgress: ((sent: number, total: number) => void) | undefined;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const cancel = jest.fn(() => reject(new Error('canceled')));
  const task = Object.assign(promise, {
    uploadProgress: (_config: unknown, callback: (sent: number, total: number) => void) => {
      onProgress = callback;
      return task;
    },
    cancel,
  });
  fakePuts.push({
    args,
    cancel,
    progress: (sent, total) => onProgress?.(sent, total),
    succeed: (status = 200) => resolve({ info: () => ({ status }) }),
    fail: error => reject(error),
  });
  return task;
};

export default {
  config: () => ({ fetch: (...args: unknown[]) => createTask(args) }),
  wrap: (path: string) => `wrap:${path}`,
  fs: { stat: (path: string) => fakeStat(path) },
};
