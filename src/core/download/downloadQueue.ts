import { isDownloadError, type CacheTask } from './fileCache';
import type {
  DownloadBatch,
  DownloadEntry,
  DownloadFailure,
  DownloadJob,
  RemoteFile,
  SaveTarget,
} from './downloadTypes';

/** Native edges, injected so the queue's rules are tested without a device. */
export interface DownloadQueueDeps {
  fetchToCache(file: RemoteFile, url: string, onProgress: (progress: number) => void): CacheTask;
  savesSilently(file: RemoteFile): boolean;
  saveSilently(file: RemoteFile, path: string): Promise<SaveTarget>;
  presentSheet(file: RemoteFile, path: string): Promise<boolean>;
  isOnline(): Promise<boolean>;
  /** Calls back once the device is online again; returns the unsubscribe. */
  onOnline(callback: () => void): () => void;
}

/**
 * `batch` = «download all / selected»: saves silently, files that need a sheet end `ready`.
 * `single` = one tap on one file: may open the system sheet right away.
 */
export type DownloadMode = 'batch' | 'single';

export interface BatchReport {
  batch: DownloadBatch;
  /** Cached, waiting for the user's sheet (iOS documents). */
  ready: readonly RemoteFile[];
}

interface QueuedJob {
  job: DownloadJob;
  mode: DownloadMode;
}

/** Two at a time: fast enough on a phone line, light on memory and the storage host. */
export const DOWNLOAD_CONCURRENCY = 2;

const BUSY = new Set<DownloadEntry['status']>(['queued', 'downloading', 'saving']);

const entryOf = (status: DownloadEntry['status'], patch: Partial<DownloadEntry> = {}): DownloadEntry => ({
  status,
  progress: 0,
  target: null,
  failure: null,
  ...patch,
});

/**
 * Downloads and saves files outside React (a run survives leaving the screen). Signed links are
 * short-lived: an expired one asks the owner for a fresh link and retries once. Offline pauses the
 * run until the device is back. Holds no URL beyond the running job (rule 07).
 */
export class DownloadQueue {
  private entries: Readonly<Record<string, DownloadEntry>> = {};
  private batch: DownloadBatch | null = null;
  private pending: QueuedJob[] = [];
  private active = new Map<string, CacheTask>();
  private files = new Map<string, RemoteFile>();
  private paths = new Map<string, string>();
  private failedJobs = new Map<string, DownloadJob>();
  private canceled = new Set<string>();
  /** Bumped by `reset`: runs started before it stop writing. */
  private generation = 0;
  private listeners = new Set<() => void>();
  private batchListeners = new Set<(report: BatchReport) => void>();
  private stopWaitingOnline: (() => void) | null = null;

  constructor(private readonly deps: DownloadQueueDeps) {}

  // ── reading ──────────────────────────────────────────────────────────────

  getEntries = (): Readonly<Record<string, DownloadEntry>> => this.entries;

  getBatch = (): DownloadBatch | null => this.batch;

  /** Cached path of a `ready` / `saved` file (for its sheet or «open»). */
  pathOf = (id: string): string | null => this.paths.get(id) ?? null;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  onBatchSettled = (listener: (report: BatchReport) => void): (() => void) => {
    this.batchListeners.add(listener);
    return () => {
      this.batchListeners.delete(listener);
    };
  };

  // ── writing ──────────────────────────────────────────────────────────────

  /** Busy and saved files are skipped; returns how many were queued. */
  enqueue(jobs: readonly DownloadJob[], mode: DownloadMode): number {
    const fresh = jobs.filter(({ file }) => {
      const status = this.entries[file.id]?.status;
      if (status && BUSY.has(status)) return false;
      // A batch never redoes a saved or sheet-waiting file; a single tap on a `ready` one opens its sheet.
      return mode === 'single' ? status !== 'saved' : status !== 'saved' && status !== 'ready';
    });
    if (fresh.length === 0) return 0;

    if (mode === 'batch') this.extendBatch(fresh.map(({ file }) => file));
    const next = { ...this.entries };
    for (const job of fresh) {
      next[job.file.id] = entryOf('queued');
      this.files.set(job.file.id, job.file);
      this.failedJobs.delete(job.file.id);
      this.pending.push({ job, mode });
    }
    this.entries = next;
    this.emit();
    this.pump();
    return fresh.length;
  }

  /** Stops one file; a file already saved stays saved. */
  cancel(id: string): void {
    this.pending = this.pending.filter(({ job }) => job.file.id !== id);
    const running = this.active.get(id);
    if (running) {
      // The run drops the entry once its fetch stops.
      this.canceled.add(id);
      running.cancel();
    } else if (this.entries[id] && BUSY.has(this.entries[id].status)) {
      this.drop(id);
    }
  }

  /** × on the dock: the rest of the run stops, saved files stay. */
  cancelBatch(): void {
    const ids = this.batch?.ids ?? [];
    for (const id of ids) this.cancel(id);
    this.batch = null;
    this.emit();
  }

  /** «Retry» after a run: the files that failed go again as a new batch. */
  retryFailed(): number {
    const jobs = [...this.failedJobs.values()];
    return this.enqueue(jobs, 'batch');
  }

  /** The dock's done state was seen: forget the run. */
  clearBatch(): void {
    if (!this.batch?.finished) return;
    this.batch = null;
    this.emit();
  }

  /** Opens the sheet for a `ready` file (sequentially for several). */
  async presentReady(ids: readonly string[]): Promise<void> {
    for (const id of ids) {
      const file = this.files.get(id);
      const path = this.paths.get(id);
      if (!file || !path || this.entries[id]?.status !== 'ready') continue;
      const done = await this.deps.presentSheet(file, path).catch(() => false);
      if (done) this.patch(id, entryOf('saved', { target: 'shared', progress: 1 }));
    }
  }

  /** Sign-out: every run stops and nothing is remembered. */
  reset(): void {
    this.generation += 1;
    this.pending = [];
    for (const task of this.active.values()) task.cancel();
    this.active.clear();
    this.files.clear();
    this.paths.clear();
    this.failedJobs.clear();
    this.canceled.clear();
    this.stopWaitingOnline?.();
    this.stopWaitingOnline = null;
    this.batch = null;
    this.entries = {};
    this.emit();
  }

  // ── running ──────────────────────────────────────────────────────────────

  private pump(): void {
    if (this.stopWaitingOnline) return;
    while (this.active.size < DOWNLOAD_CONCURRENCY && this.pending.length > 0) {
      const next = this.pending.shift();
      if (next) this.run(next).catch(() => undefined);
    }
  }

  private async run(queued: QueuedJob): Promise<void> {
    const { job, mode } = queued;
    const { file } = job;
    const generation = this.generation;
    // Holds the slot while a fresh link is asked for, before the fetch starts.
    const placeholder: CacheTask = { promise: Promise.resolve(''), cancel: () => undefined };
    this.active.set(file.id, placeholder);

    const fetched = await fetchWithRefresh(job, this.deps, {
      onStart: task => {
        this.active.set(file.id, task);
        if (this.canceled.has(file.id)) task.cancel();
      },
      onProgress: progress => this.patch(file.id, entryOf('downloading', { progress })),
    });
    if (generation !== this.generation) return;
    this.active.delete(file.id);

    if (this.canceled.delete(file.id) || (fetched.kind === 'failed' && fetched.failure === 'canceled')) {
      this.drop(file.id);
      this.pump();
      return;
    }
    if (fetched.kind === 'failed') {
      if (fetched.failure === 'network' && !(await this.deps.isOnline())) {
        this.waitForNetwork(queued);
      } else {
        this.fail(job, fetched.failure);
      }
      this.pump();
      return;
    }

    this.paths.set(file.id, fetched.path);
    this.patch(file.id, entryOf('saving', { progress: 1 }));
    // The run stops writing if the user signed out while a save was open.
    const settle = (entry: DownloadEntry) => {
      if (generation === this.generation) this.settle(file.id, entry);
    };
    try {
      if (this.deps.savesSilently(file)) {
        const target = await this.deps.saveSilently(file, fetched.path);
        settle(entryOf('saved', { target, progress: 1 }));
      } else if (mode === 'single') {
        const done = await this.deps.presentSheet(file, fetched.path).catch(() => false);
        settle(entryOf(done ? 'saved' : 'ready', { target: done ? 'shared' : null, progress: 1 }));
      } else {
        settle(entryOf('ready', { progress: 1 }));
      }
    } catch (error) {
      if (generation === this.generation) this.fail(job, isDownloadError(error) ? error.failure : 'storage');
    }
    this.pump();
  }

  private waitForNetwork(queued: QueuedJob): void {
    this.pending.unshift(queued);
    this.patch(queued.job.file.id, entryOf('queued'));
    if (this.stopWaitingOnline) return;
    this.stopWaitingOnline = this.deps.onOnline(() => {
      this.stopWaitingOnline?.();
      this.stopWaitingOnline = null;
      this.pump();
    });
  }

  private fail(job: DownloadJob, failure: DownloadFailure): void {
    this.failedJobs.set(job.file.id, job);
    this.settle(job.file.id, entryOf('failed', { failure }));
  }

  private drop(id: string): void {
    this.active.delete(id);
    this.entries = Object.fromEntries(Object.entries(this.entries).filter(([key]) => key !== id));
    if (this.batch?.ids.includes(id)) {
      this.batch = { ...this.batch, ids: this.batch.ids.filter(other => other !== id) };
      this.recountBatch();
    }
    this.emit();
  }

  private settle(id: string, entry: DownloadEntry): void {
    this.patch(id, entry);
    if (this.batch?.finished) this.reportBatch();
  }

  private patch(id: string, entry: DownloadEntry): void {
    this.entries = { ...this.entries, [id]: entry };
    if (this.batch?.ids.includes(id)) this.recountBatch();
    this.emit();
  }

  private extendBatch(files: readonly RemoteFile[]): void {
    const running = this.batch && !this.batch.finished ? this.batch : null;
    const ids = [...(running?.ids ?? []), ...files.map(file => file.id)];
    this.batch = {
      ids,
      settled: 0,
      saved: 0,
      failed: 0,
      totalBytes: 0,
      doneBytes: 0,
      finished: false,
    };
    for (const file of files) this.files.set(file.id, file);
    this.recountBatch();
  }

  private recountBatch(): void {
    if (!this.batch) return;
    let settled = 0;
    let saved = 0;
    let failed = 0;
    let totalBytes = 0;
    let doneBytes = 0;
    for (const id of this.batch.ids) {
      const size = this.files.get(id)?.size ?? 0;
      const entry = this.entries[id];
      totalBytes += size;
      if (!entry) continue;
      if (entry.status === 'saved' || entry.status === 'ready') {
        settled += 1;
        saved += 1;
        doneBytes += size;
      } else if (entry.status === 'failed') {
        settled += 1;
        failed += 1;
      } else {
        doneBytes += size * entry.progress;
      }
    }
    const finished = this.batch.ids.length > 0 && settled === this.batch.ids.length;
    this.batch = { ...this.batch, settled, saved, failed, totalBytes, doneBytes, finished };
  }

  private reportBatch(): void {
    const { batch } = this;
    if (!batch) return;
    const ready = batch.ids
      .filter(id => this.entries[id]?.status === 'ready')
      .map(id => this.files.get(id))
      .filter((file): file is RemoteFile => file !== undefined);
    for (const listener of this.batchListeners) listener({ batch, ready });
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

type FetchResult = { kind: 'cached'; path: string } | { kind: 'failed'; failure: DownloadFailure };

interface FetchHooks {
  onStart(task: CacheTask): void;
  onProgress(progress: number): void;
}

/** Fetches with the job's link; an expired (or missing) link is refreshed once through the owner. */
export const fetchWithRefresh = async (
  job: DownloadJob,
  deps: Pick<DownloadQueueDeps, 'fetchToCache'>,
  hooks: FetchHooks,
): Promise<FetchResult> => {
  const { file, refreshUrl } = job;
  let refreshed = false;
  const refresh = async (): Promise<string | null> => {
    refreshed = true;
    return refreshUrl ? refreshUrl(file.id).catch(() => null) : null;
  };

  let url = file.url ?? (await refresh());
  while (url) {
    const task = deps.fetchToCache(file, url, hooks.onProgress);
    hooks.onStart(task);
    try {
      return { kind: 'cached', path: await task.promise };
    } catch (error) {
      const failure = isDownloadError(error) ? error.failure : 'network';
      if (failure !== 'expired' || refreshed || !refreshUrl) return { kind: 'failed', failure };
      url = await refresh();
    }
  }
  return { kind: 'failed', failure: 'gone' };
};

