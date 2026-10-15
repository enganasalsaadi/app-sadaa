import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isUploadError } from './uploadError';
import { uploadFile } from './uploadFile';
import type { RequestUploadSlot, UploadFailure, UploadPolicy, UploadSource } from './uploadTypes';

export type UploadStatus = 'uploading' | 'done' | 'failed';

export interface UploadEntry {
  key: string;
  source: UploadSource;
  status: UploadStatus;
  /** 0–1. */
  progress: number;
  fileId: string | null;
  failure: UploadFailure | null;
  /** The cap that was exceeded (`size`). */
  maxBytes: number | null;
  /** API error behind a `slot` failure (`deal_upload_limit`…), for `normalizeApiError`. */
  cause: unknown;
}

export interface FileUploadsConfig {
  policy: UploadPolicy;
  requestSlot: RequestUploadSlot;
  /** Max files in the set (server `file_ids` cap); extra picks are dropped. */
  limit?: number;
}

export interface FileUploads {
  entries: UploadEntry[];
  /** `file_id`s of finished uploads, in pick order, for the submit call. */
  fileIds: string[];
  isUploading: boolean;
  hasFailed: boolean;
  /** Free places left under `limit` (Infinity without one). */
  remaining: number;
  /** Starts uploading right away. Returns how many sources were dropped by `limit`. */
  add(sources: readonly UploadSource[]): number;
  /** Fresh slot + PUT for a `slot` / `transfer` failure. */
  retry(key: string): void;
  /** Cancels an in-flight upload; the unused slot expires server-side. */
  remove(key: string): void;
  /** Puts a file at another place in the set (the submit order, e.g. a post's carousel). */
  move(key: string, toIndex: number): void;
  /** Cancels everything (after submit, or the user starts over). */
  clear(): void;
}

const patchEntry = (entries: UploadEntry[], key: string, patch: Partial<UploadEntry>) =>
  entries.map(entry => (entry.key === key ? { ...entry, ...patch } : entry));

/**
 * A set of files for one submit (draft round, proof, evidence, brief). Each file uploads
 * on its own; removing one or leaving the screen aborts what is still in flight.
 */
export const useFileUploads = ({ policy, requestSlot, limit }: FileUploadsConfig): FileUploads => {
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const controllers = useRef(new Map<string, AbortController>());
  // Every kept entry's file, in sync with `entries` before React re-renders (rapid adds, retry).
  const sources = useRef(new Map<string, UploadSource>());
  const nextKey = useRef(0);
  // The latest config without restarting uploads when a parent re-renders.
  const config = useRef({ policy, requestSlot });
  useEffect(() => {
    config.current = { policy, requestSlot };
  }, [policy, requestSlot]);

  const start = useCallback((key: string, source: UploadSource) => {
    controllers.current.get(key)?.abort();
    const controller = new AbortController();
    controllers.current.set(key, controller);
    const isCurrent = () => controllers.current.get(key) === controller && !controller.signal.aborted;

    uploadFile({
      source,
      policy: config.current.policy,
      requestSlot: config.current.requestSlot,
      signal: controller.signal,
      onProgress: progress => {
        if (isCurrent()) setEntries(prev => patchEntry(prev, key, { progress }));
      },
    }).then(
      fileId => {
        if (!isCurrent()) return;
        controllers.current.delete(key);
        setEntries(prev => patchEntry(prev, key, { status: 'done', progress: 1, fileId }));
      },
      (error: unknown) => {
        if (!isCurrent()) return;
        controllers.current.delete(key);
        setEntries(prev =>
          patchEntry(prev, key, {
            status: 'failed',
            failure: isUploadError(error) ? error.failure : 'transfer',
            maxBytes: isUploadError(error) ? error.maxBytes : null,
            cause: isUploadError(error) ? error.cause : error,
          }),
        );
      },
    );
  }, []);

  const add = useCallback(
    (picked: readonly UploadSource[]) => {
      const room = limit === undefined ? picked.length : Math.max(limit - sources.current.size, 0);
      const accepted = picked.slice(0, room);
      const added = accepted.map<UploadEntry>(source => {
        nextKey.current += 1;
        const key = `upload-${nextKey.current}`;
        sources.current.set(key, source);
        return {
          key,
          source,
          status: 'uploading',
          progress: 0,
          fileId: null,
          failure: null,
          maxBytes: null,
          cause: null,
        };
      });
      setEntries(prev => [...prev, ...added]);
      added.forEach(entry => start(entry.key, entry.source));
      return picked.length - accepted.length;
    },
    [limit, start],
  );

  const retry = useCallback(
    (key: string) => {
      const source = sources.current.get(key);
      // Only settled entries have no controller; an in-flight one keeps its upload.
      if (!source || controllers.current.has(key)) return;
      setEntries(prev =>
        patchEntry(prev, key, {
          status: 'uploading',
          progress: 0,
          failure: null,
          maxBytes: null,
          cause: null,
        }),
      );
      start(key, source);
    },
    [start],
  );

  const remove = useCallback((key: string) => {
    controllers.current.get(key)?.abort();
    controllers.current.delete(key);
    sources.current.delete(key);
    setEntries(prev => prev.filter(entry => entry.key !== key));
  }, []);

  const move = useCallback((key: string, toIndex: number) => {
    setEntries(prev => {
      const from = prev.findIndex(entry => entry.key === key);
      const moving = prev[from];
      if (!moving) return prev;
      const rest = prev.filter(entry => entry.key !== key);
      const at = Math.min(Math.max(toIndex, 0), rest.length);
      return [...rest.slice(0, at), moving, ...rest.slice(at)];
    });
  }, []);

  const clear = useCallback(() => {
    controllers.current.forEach(controller => controller.abort());
    controllers.current.clear();
    sources.current.clear();
    setEntries([]);
  }, []);

  useEffect(() => {
    const active = controllers.current;
    return () => {
      active.forEach(controller => controller.abort());
      active.clear();
    };
  }, []);

  return useMemo(() => {
    const fileIds = entries.flatMap(entry => (entry.fileId ? [entry.fileId] : []));
    return {
      entries,
      fileIds,
      isUploading: entries.some(entry => entry.status === 'uploading'),
      hasFailed: entries.some(entry => entry.status === 'failed'),
      remaining: limit === undefined ? Infinity : Math.max(limit - entries.length, 0),
      add,
      retry,
      remove,
      move,
      clear,
    };
  }, [entries, limit, add, retry, remove, move, clear]);
};
