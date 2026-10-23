import NetInfo from '@react-native-community/netinfo';
import i18n from '@/core/i18n';
import { toastService } from '@/core/toast';
import { DownloadQueue, fetchWithRefresh, type BatchReport } from './downloadQueue';
import { clearFileCache, fetchToCache } from './fileCache';
import {
  ensureSaveAccess,
  openSavedFile,
  presentFileSheet,
  saveSilently,
  savesSilently,
} from './saveFile';
import type { DownloadJob, RemoteFile } from './downloadTypes';

const queue = new DownloadQueue({
  fetchToCache,
  savesSilently,
  saveSilently,
  presentSheet: presentFileSheet,
  isOnline: async () => (await NetInfo.fetch()).isConnected !== false,
  onOnline: callback =>
    NetInfo.addEventListener(state => {
      if (state.isConnected === true) callback();
    }),
});

/** Screens showing the run themselves (the vault dock); the toast speaks only when none is open. */
let batchWatchers = 0;

const reportBatch = ({ batch, ready }: BatchReport): void => {
  if (batch.failed > 0) {
    toastService.error(i18n.t('files.toast.batchFailed', { count: batch.failed }), {
      action: { label: i18n.t('files.toast.retry'), onPress: () => queue.retryFailed() },
    });
  } else if (ready.length > 0) {
    toastService.info(i18n.t('files.toast.batchReady', { count: ready.length }), {
      action: {
        label: i18n.t('files.toast.saveDocuments'),
        onPress: () => {
          queue.presentReady(ready.map(file => file.id)).catch(() => undefined);
        },
      },
    });
  } else {
    toastService.success(i18n.t('files.toast.batchSaved', { count: batch.saved }));
  }
  queue.clearBatch();
};

queue.onBatchSettled(report => {
  if (batchWatchers === 0) reportBatch(report);
});

export interface CachedFile {
  promise: Promise<string | null>;
  cancel(): void;
}

/**
 * The app's one download queue (outside React: a run outlives the screen that started it).
 * Saves land in Photos (images, videos) and Downloads / Files (documents).
 */
export const downloads = {
  queue,

  /** One file, from a tap: may open the system sheet. `false` = Photos access refused. */
  async save(job: DownloadJob): Promise<boolean> {
    if (!(await ensureSaveAccess([job.file]))) return false;
    queue.enqueue([job], 'single');
    return true;
  },

  /** «Download all / selected»: one access prompt, then a silent run. */
  async saveAll(jobs: readonly DownloadJob[]): Promise<boolean> {
    if (!(await ensureSaveAccess(jobs.map(job => job.file)))) return false;
    queue.enqueue(jobs, 'batch');
    return true;
  },

  /** The share / «open with» sheet for one file, without marking it saved. */
  async share(job: DownloadJob): Promise<boolean> {
    const fetched = await fetchWithRefresh(job, { fetchToCache }, { onStart: () => undefined, onProgress: () => undefined });
    if (fetched.kind === 'failed') return false;
    await presentFileSheet(job.file, fetched.path).catch(() => false);
    return true;
  },

  /** A local copy for in-app reading (PDF); `null` when it can't be had. */
  cache(job: DownloadJob, onProgress?: (progress: number) => void): CachedFile {
    let current: { cancel(): void } | null = null;
    let canceled = false;
    const promise = fetchWithRefresh(job, { fetchToCache }, {
      onStart: task => {
        current = task;
        if (canceled) task.cancel();
      },
      onProgress: progress => onProgress?.(progress),
    }).then(result => (result.kind === 'cached' ? result.path : null));
    return {
      promise,
      cancel: () => {
        canceled = true;
        current?.cancel();
      },
    };
  },

  /** «Open» after a save: Photos (iOS) or the file's viewer app (Android). */
  async openSaved(file: RemoteFile): Promise<void> {
    const path = queue.pathOf(file.id);
    if (path) await openSavedFile(file, path).catch(() => undefined);
  },

  /** Registers a screen that shows the run; returns the release. */
  watchBatch(): () => void {
    batchWatchers += 1;
    return () => {
      batchWatchers = Math.max(0, batchWatchers - 1);
    };
  },

  /** Sign-out: stop every run and delete every cached file. */
  async reset(): Promise<void> {
    queue.reset();
    await clearFileCache().catch(() => undefined);
  },
};
