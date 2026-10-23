import { useCallback, useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HAPTIC_SUCCESS_MS } from '@/core/config';
import {
  downloads,
  saveDestination,
  useDownloadEntry,
  type DownloadEntry,
  type DownloadStatus,
  type RefreshUrl,
  type RemoteFile,
  type SaveDestination,
} from '@/core/download';
import type { ViewerBannerModel } from './ViewerBanner';

/** How long the saved / failed banner stays. */
const BANNER_MS = 3500;

const BUSY: readonly DownloadStatus[] = ['queued', 'downloading', 'saving'];

export interface ViewerSave {
  entry: DownloadEntry | undefined;
  destination: SaveDestination;
  /** Share / «open with» is preparing the file. */
  sharing: boolean;
  banner: ViewerBannerModel | null;
  save(): void;
  share(): void;
}

/**
 * The active file's save: the dock's main button and its banner. Reads the shared download queue,
 * so a save started in the vault shows here too (and keeps going after the viewer closes).
 */
export const useViewerSave = (file: RemoteFile | null, refreshUrl?: RefreshUrl): ViewerSave => {
  const { t } = useTranslation();
  const entry = useDownloadEntry(file?.id ?? '');
  const [sharing, setSharing] = useState(false);
  const [banner, setBanner] = useState<ViewerBannerModel | null>(null);
  const previous = useRef<DownloadStatus | undefined>(entry?.status);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: ViewerBannerModel) => {
    if (timer.current) clearTimeout(timer.current);
    setBanner(next);
    timer.current = setTimeout(() => setBanner(null), BANNER_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // A new file: its own state, no leftover banner.
  useEffect(() => {
    previous.current = undefined;
    setBanner(null);
    setSharing(false);
  }, [file?.id]);

  const save = useCallback(() => {
    if (!file) return;
    const job = { file, refreshUrl };
    if (entry?.status === 'saved') {
      // Already in Photos / Downloads: open it there. Shared through a sheet: offer the sheet again.
      if (entry.target === 'shared') downloads.share(job).catch(() => undefined);
      else downloads.openSaved(file).catch(() => undefined);
      return;
    }
    if (entry && BUSY.includes(entry.status)) return;
    downloads
      .save(job)
      .then(allowed => {
        if (!allowed) show({ tone: 'failed', message: t('files.viewer.banner.permission') });
      })
      .catch(() => show({ tone: 'failed', message: t('files.viewer.banner.failed') }));
  }, [entry, file, refreshUrl, show, t]);

  const share = useCallback(() => {
    if (!file || sharing) return;
    setSharing(true);
    downloads
      .share({ file, refreshUrl })
      .then(ok => {
        if (!ok) show({ tone: 'failed', message: t('files.viewer.banner.failed') });
      })
      .catch(() => show({ tone: 'failed', message: t('files.viewer.banner.failed') }))
      .finally(() => setSharing(false));
  }, [file, refreshUrl, sharing, show, t]);

  // Banner only for a run the user watched finish here.
  useEffect(() => {
    const before = previous.current;
    previous.current = entry?.status;
    if (!file || !entry || !before || !BUSY.includes(before)) return;
    if (entry.status === 'saved') {
      Vibration.vibrate(HAPTIC_SUCCESS_MS);
      if (entry.target === 'shared') {
        show({ tone: 'saved', message: t('files.viewer.banner.shared') });
        return;
      }
      show({
        tone: 'saved',
        message:
          entry.target === 'downloads' ? t('files.viewer.banner.savedDownloads') : t('files.viewer.banner.savedPhotos'),
        action: {
          label: t('files.viewer.banner.open'),
          onPress: () => {
            downloads.openSaved(file).catch(() => undefined);
          },
        },
      });
      return;
    }
    if (entry.status === 'failed' && entry.failure !== 'canceled') {
      show({
        tone: 'failed',
        message:
          entry.failure === 'gone'
            ? t('files.viewer.gone')
            : entry.failure === 'permission'
              ? t('files.viewer.banner.permission')
              : t('files.viewer.banner.failed'),
        action:
          entry.failure === 'gone' || entry.failure === 'permission'
            ? null
            : { label: t('files.viewer.retry'), onPress: save },
      });
    }
  }, [entry, file, save, show, t]);

  return {
    entry,
    destination: file ? saveDestination(file) : 'photos',
    sharing,
    banner,
    save,
    share,
  };
};
