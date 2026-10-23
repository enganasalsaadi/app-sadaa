/** What a file is for the viewer and for where it gets saved. */
export type FileKind = 'image' | 'video' | 'document';

/** A server file the user can open and save. `url` is short-lived and signed; `null` once purged. */
export interface RemoteFile {
  id: string;
  url: string | null;
  name: string;
  mime: string;
  kind: FileKind;
  /** Bytes; `null` when the server didn't say. */
  size: number | null;
}

/** Asks the owner for a fresh signed link after one expired; `null` = the file is gone. */
export type RefreshUrl = (fileId: string) => Promise<string | null>;

export interface DownloadJob {
  file: RemoteFile;
  refreshUrl?: RefreshUrl;
}

/** Where a save landed. `shared` = handed to a system sheet the user finished (iOS Files, another app). */
export type SaveTarget = 'photos' | 'downloads' | 'shared';

/**
 * `ready` = on the device but still needs the user's step in a system sheet (an iOS document in a
 * batch, any file on Android 7–9). No entry = never touched.
 */
export type DownloadStatus = 'queued' | 'downloading' | 'saving' | 'saved' | 'ready' | 'failed';

export type DownloadFailure = 'expired' | 'gone' | 'network' | 'storage' | 'permission' | 'canceled';

export interface DownloadEntry {
  status: DownloadStatus;
  /** 0–1 while downloading. */
  progress: number;
  target: SaveTarget | null;
  failure: DownloadFailure | null;
}

/** One «download all» / «download selected» run. */
export interface DownloadBatch {
  ids: readonly string[];
  /** Saved, ready or failed. */
  settled: number;
  saved: number;
  failed: number;
  totalBytes: number;
  doneBytes: number;
  /** Every file settled. */
  finished: boolean;
}
