import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { downloads } from './downloads';
import type { DownloadBatch, DownloadEntry } from './downloadTypes';

const { queue } = downloads;

/** One file's state; re-renders only when that file changes. `undefined` = never touched. */
export const useDownloadEntry = (id: string): DownloadEntry | undefined => {
  const getSnapshot = useCallback(() => queue.getEntries()[id], [id]);
  return useSyncExternalStore(queue.subscribe, getSnapshot);
};

/** Every file's state (the vault grid: one subscription, tiles read their own). */
export const useDownloadEntries = (): Readonly<Record<string, DownloadEntry>> =>
  useSyncExternalStore(queue.subscribe, queue.getEntries);

/**
 * The running «download all» and, while mounted, owns its feedback: the batch toast stays quiet
 * because this screen shows the run itself.
 */
export const useDownloadBatch = (): DownloadBatch | null => {
  useEffect(() => downloads.watchBatch(), []);
  return useSyncExternalStore(queue.subscribe, queue.getBatch);
};
