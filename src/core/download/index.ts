export { downloads } from './downloads';
export type { CachedFile } from './downloads';
export { useDownloadBatch, useDownloadEntries, useDownloadEntry } from './useDownloads';
export { canBatchSave, saveDestination } from './saveFile';
export type { SaveDestination } from './saveFile';
export { extensionOf, fileKindOf, isPdf, mimeFromName } from './fileKind';
export type {
  DownloadBatch,
  DownloadEntry,
  DownloadFailure,
  DownloadJob,
  DownloadStatus,
  FileKind,
  RefreshUrl,
  RemoteFile,
  SaveTarget,
} from './downloadTypes';
