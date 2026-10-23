import { DownloadQueue, type DownloadQueueDeps } from '../downloadQueue';
import { DownloadError, type CacheTask } from '../fileCache';
import type { DownloadJob, RemoteFile } from '../downloadTypes';

jest.mock('react-native-blob-util');

interface FakeFetch {
  file: RemoteFile;
  url: string;
  progress(value: number): void;
  succeed(): void;
  fail(error: unknown): void;
  cancel: jest.Mock;
}

const flush = () => new Promise(resolve => setImmediate(resolve));

const fileOf = (id: string, patch: Partial<RemoteFile> = {}): RemoteFile => ({
  id,
  url: `https://files.test/${id}?sig=1`,
  name: `${id}.jpg`,
  mime: 'image/jpeg',
  kind: 'image',
  size: 100,
  ...patch,
});

const setup = (overrides: Partial<DownloadQueueDeps> = {}) => {
  const fetches: FakeFetch[] = [];
  let online = true;
  let wake: (() => void) | null = null;
  const deps: DownloadQueueDeps = {
    fetchToCache: (file, url, onProgress): CacheTask => {
      let resolve: (path: string) => void = () => undefined;
      let reject: (error: unknown) => void = () => undefined;
      const promise = new Promise<string>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      const cancel = jest.fn(() => reject(new DownloadError('canceled')));
      fetches.push({
        file,
        url,
        progress: onProgress,
        succeed: () => resolve(`/cache/${file.id}`),
        fail: reject,
        cancel,
      });
      return { promise, cancel };
    },
    savesSilently: file => file.kind !== 'document',
    saveSilently: jest.fn(async () => 'photos' as const),
    presentSheet: jest.fn(async () => true),
    isOnline: async () => online,
    onOnline: callback => {
      wake = callback;
      return () => {
        wake = null;
      };
    },
    ...overrides,
  };
  const queue = new DownloadQueue(deps);
  return {
    queue,
    deps,
    fetches,
    goOffline: () => {
      online = false;
    },
    goOnline: () => {
      online = true;
      wake?.();
    },
  };
};

const jobsOf = (...ids: string[]): DownloadJob[] => ids.map(id => ({ file: fileOf(id) }));

describe('DownloadQueue', () => {
  it('runs two files at a time and starts the next as one settles', async () => {
    const { queue, fetches } = setup();
    queue.enqueue(jobsOf('a', 'b', 'c'), 'batch');
    await flush();
    expect(fetches.map(f => f.file.id)).toEqual(['a', 'b']);
    expect(queue.getEntries().c?.status).toBe('queued');

    fetches[0]?.succeed();
    await flush();
    expect(fetches.map(f => f.file.id)).toEqual(['a', 'b', 'c']);
    expect(queue.getEntries().a).toMatchObject({ status: 'saved', target: 'photos' });
  });

  it('counts the batch and reports once every file settled', async () => {
    const { queue, fetches } = setup();
    const reports = jest.fn();
    queue.onBatchSettled(reports);
    queue.enqueue(jobsOf('a', 'b'), 'batch');
    await flush();
    fetches[0]?.progress(0.5);
    expect(queue.getBatch()).toMatchObject({ settled: 0, totalBytes: 200, doneBytes: 50 });

    fetches[0]?.succeed();
    fetches[1]?.fail(new DownloadError('network'));
    await flush();
    expect(queue.getBatch()).toMatchObject({ settled: 2, saved: 1, failed: 1, finished: true });
    expect(reports).toHaveBeenCalledTimes(1);
  });

  it('refreshes an expired link once and retries with it', async () => {
    const refreshUrl = jest.fn(async () => 'https://files.test/a?sig=2');
    const { queue, fetches } = setup();
    queue.enqueue([{ file: fileOf('a'), refreshUrl }], 'single');
    await flush();
    fetches[0]?.fail(new DownloadError('expired'));
    await flush();
    expect(refreshUrl).toHaveBeenCalledWith('a');
    expect(fetches[1]?.url).toBe('https://files.test/a?sig=2');

    fetches[1]?.fail(new DownloadError('expired'));
    await flush();
    expect(refreshUrl).toHaveBeenCalledTimes(1);
    expect(queue.getEntries().a).toMatchObject({ status: 'failed', failure: 'expired' });
  });

  it('marks a purged file gone when the owner has no fresh link', async () => {
    const { queue, fetches } = setup();
    queue.enqueue([{ file: fileOf('a', { url: null }), refreshUrl: async () => null }], 'single');
    await flush();
    expect(fetches).toHaveLength(0);
    expect(queue.getEntries().a).toMatchObject({ status: 'failed', failure: 'gone' });
  });

  it('leaves a batch document ready for its sheet, a single tap opens it', async () => {
    const { queue, fetches, deps } = setup();
    const doc = fileOf('d', { kind: 'document', mime: 'application/pdf', name: 'd.pdf' });
    queue.enqueue([{ file: doc }], 'batch');
    await flush();
    fetches[0]?.succeed();
    await flush();
    expect(queue.getEntries().d?.status).toBe('ready');
    expect(deps.presentSheet).not.toHaveBeenCalled();

    await queue.presentReady(['d']);
    expect(queue.getEntries().d).toMatchObject({ status: 'saved', target: 'shared' });
  });

  it('cancels a running file without keeping it', async () => {
    const { queue, fetches } = setup();
    queue.enqueue(jobsOf('a', 'b', 'c'), 'batch');
    await flush();
    queue.cancelBatch();
    await flush();
    expect(fetches[0]?.cancel).toHaveBeenCalled();
    expect(queue.getEntries()).toEqual({});
    expect(queue.getBatch()).toBeNull();
  });

  it('pauses offline and resumes the same file once back online', async () => {
    const { queue, fetches, goOffline, goOnline } = setup();
    queue.enqueue(jobsOf('a'), 'single');
    await flush();
    goOffline();
    fetches[0]?.fail(new DownloadError('network'));
    await flush();
    expect(queue.getEntries().a?.status).toBe('queued');

    goOnline();
    await flush();
    expect(fetches).toHaveLength(2);
    expect(fetches[1]?.file.id).toBe('a');
  });

  it('skips files already saved or running', async () => {
    const { queue, fetches } = setup();
    queue.enqueue(jobsOf('a'), 'single');
    await flush();
    expect(queue.enqueue(jobsOf('a'), 'batch')).toBe(0);
    fetches[0]?.succeed();
    await flush();
    expect(queue.enqueue(jobsOf('a', 'b'), 'batch')).toBe(1);
  });

  it('retries only the failed files as a new batch', async () => {
    const { queue, fetches } = setup();
    queue.enqueue(jobsOf('a', 'b'), 'batch');
    await flush();
    fetches[0]?.succeed();
    fetches[1]?.fail(new DownloadError('storage'));
    await flush();
    expect(queue.retryFailed()).toBe(1);
    expect(queue.getBatch()?.ids).toEqual(['b']);
  });

  it('forgets everything on reset, even runs still in flight', async () => {
    const { queue, fetches } = setup();
    queue.enqueue(jobsOf('a'), 'single');
    await flush();
    queue.reset();
    fetches[0]?.succeed();
    await flush();
    expect(queue.getEntries()).toEqual({});
  });
});
