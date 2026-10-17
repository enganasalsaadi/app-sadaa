import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import { toastService } from '@/core/toast';
import { checkUpload, normalizeMime } from '@/core/upload';
import { DEAL_ISSUE_PHOTO_POLICY } from '../constants/dealUploads';

/** A picked report photo, kept on the device until the report goes (multipart, original quality). */
export interface DealIssuePhoto {
  key: string;
  uri: string;
  name: string;
  mime: string;
}

/**
 * The photos of a problem report (shipping issue, returned-sample issue): pick up to `max` from
 * the library, checked against the issue policy (jpg/png/webp, 20 MB). They are evidence, so they
 * go at original quality (rule 07) and ride in the report itself.
 */
export const useIssuePhotos = (max: number) => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<DealIssuePhoto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhotos([]);
    setError(null);
  }, []);

  const remaining = max - photos.length;
  const pick = useCallback(async () => {
    if (remaining <= 0) {
      toastService.info(t('marketplace.deals.shipping.issue.photosLimit', { max }));
      return;
    }
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        assetRepresentationMode: 'current',
        selectionLimit: remaining,
      });
      if (response.didCancel) return;
      if (response.errorCode) throw new Error(response.errorCode);
      let rejected = 0;
      const picked = (response.assets ?? []).flatMap<DealIssuePhoto>(asset => {
        const name = asset.fileName ?? asset.uri ?? '';
        const check = checkUpload(
          DEAL_ISSUE_PHOTO_POLICY,
          normalizeMime(asset.type, name),
          asset.fileSize ?? 0,
        );
        if (!asset.uri || !check.ok) {
          rejected += 1;
          return [];
        }
        return [{ key: `${asset.uri}-${Date.now()}`, uri: asset.uri, name, mime: check.mime }];
      });
      if (rejected > 0) toastService.error(t('marketplace.deals.shipping.issue.photoRejected'));
      if (picked.length === 0) return;
      setError(null);
      setPhotos(list => [...list, ...picked].slice(0, max));
    } catch {
      toastService.error(t('marketplace.deals.shipping.issue.pickFailed'));
    }
  }, [max, remaining, t]);

  const remove = useCallback((key: string) => setPhotos(list => list.filter(photo => photo.key !== key)), []);

  /** Adds every photo to the report as `photos[]`. */
  const appendTo = useCallback(
    (form: FormData) => {
      photos.forEach(photo => {
        const file: FormDataValue = { uri: photo.uri, name: photo.name, type: photo.mime };
        form.append('photos[]', file);
      });
    },
    [photos],
  );

  return { photos, error, setError, reset, pick, remove, appendTo };
};
