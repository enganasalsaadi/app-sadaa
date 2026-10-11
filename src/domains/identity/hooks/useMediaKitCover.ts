import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import { normalizeApiError } from '@/core/api';
import { toastService } from '@/core/toast';
import {
  useRemoveMediaKitCoverMutation,
  useUploadMediaKitCoverMutation,
} from '../api/mediaKitApi';
import {
  COVER_PICK_EDGE,
  COVER_PICK_QUALITY,
  isValidCoverAsset,
  toCoverFormData,
} from '../utils/mediaKitCover';
import { shouldToastFailure } from '../utils/requestFailure';

/** A picked photo waiting for "Use this photo": shown in the 5:2 frame, not uploaded yet. */
type PendingCover = Asset & { uri: string };

const isRateLimited = (error: unknown): boolean => {
  const { statusCode, code } = normalizeApiError(error);
  return statusCode === 429 || code === 'too_many_requests';
};

/**
 * Cover photo of the media kit (contract §17.11). The picker has no crop step, but the server
 * center-crops to 5:2 exactly like `resizeMode="cover"`, so the pending preview is the result.
 * A photo is only uploaded once the creator confirms it (10 uploads/h).
 */
export const useMediaKitCover = (coverUrl: string | null) => {
  const { t } = useTranslation();
  const [upload, { isLoading: isUploading }] = useUploadMediaKitCoverMutation();
  const [remove, { isLoading: isRemoving }] = useRemoveMediaKitCoverMutation();
  const [pending, setPending] = useState<PendingCover | null>(null);
  const [removeSheetVisible, setRemoveSheetVisible] = useState(false);

  const onChoose = useCallback(async () => {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: COVER_PICK_QUALITY,
      maxWidth: COVER_PICK_EDGE,
      maxHeight: COVER_PICK_EDGE,
    });
    const asset = response.assets?.[0];
    if (response.didCancel || !asset?.uri) return;
    if (!isValidCoverAsset(asset)) {
      toastService.error(t('account.mediaKit.settingsScreen.cover.invalid'));
      return;
    }
    setPending({ ...asset, uri: asset.uri });
  }, [t]);

  const onCancelPending = useCallback(() => setPending(null), []);

  const onUpload = useCallback(async () => {
    if (!pending || isUploading) return;
    try {
      await upload(toCoverFormData(pending)).unwrap();
      setPending(null);
      toastService.success(t('account.mediaKit.settingsScreen.cover.uploaded'));
    } catch (err) {
      // Stays pending so a retry needs no new pick. 422 is already toasted by baseQuery.
      if (isRateLimited(err)) {
        toastService.error(t('account.mediaKit.settingsScreen.cover.rateLimited'));
      } else if (shouldToastFailure(err) && normalizeApiError(err).statusCode !== 422) {
        toastService.error(t('account.mediaKit.settingsScreen.cover.uploadFailed'));
      }
    }
  }, [isUploading, pending, t, upload]);

  const openRemoveSheet = useCallback(() => setRemoveSheetVisible(true), []);
  const closeRemoveSheet = useCallback(() => setRemoveSheetVisible(false), []);

  const confirmRemove = useCallback(async () => {
    setRemoveSheetVisible(false);
    try {
      await remove().unwrap();
      toastService.success(t('account.mediaKit.settingsScreen.cover.removed'));
    } catch (err) {
      if (shouldToastFailure(err)) {
        toastService.error(t('account.mediaKit.settingsScreen.cover.removeFailed'));
      }
    }
  }, [remove, t]);

  return {
    /** What the frame shows: the picked photo, else the saved cover, else the empty tile. */
    previewUri: pending?.uri ?? coverUrl,
    hasCover: coverUrl !== null,
    isPending: pending !== null,
    isUploading,
    isRemoving,
    onChoose,
    onCancelPending,
    onUpload,
    removeSheetVisible,
    openRemoveSheet,
    closeRemoveSheet,
    confirmRemove,
  };
};

export type MediaKitCoverModel = ReturnType<typeof useMediaKitCover>;
