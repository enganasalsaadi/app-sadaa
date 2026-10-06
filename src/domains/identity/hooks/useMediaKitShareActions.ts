import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';
import { useUpdateMediaKitMutation } from '../api/mediaKitApi';
import type { MediaKitCardShare } from '../components/MediaKitCard';
import { useMediaKitShare } from './useMediaKitShare';

/**
 * Share / copy / retry plus the "Make public" answer to a 409 `media_kit_private`
 * (§17.2, §17.6). Shared by the Home card and the Insights footer.
 */
export const useMediaKitShareActions = (): MediaKitCardShare => {
  const { t } = useTranslation();
  const toast = useToast();
  const [updateMediaKit, { isLoading: isMakingPublic }] =
    useUpdateMediaKitMutation();
  const {
    isReady,
    isSharing,
    error,
    canRetry,
    share: onShare,
    copyLink: onCopy,
    retry: onRetry,
    dismissError: onDismissError,
  } = useMediaKitShare();

  const onMakePublic = useCallback(async () => {
    try {
      await updateMediaKit({ is_public: true }).unwrap();
      onDismissError();
      toast.success(t('account.mediaKit.share.madePublic'));
    } catch {
      toast.error(t('account.mediaKit.share.makePublicFailed'));
    }
  }, [onDismissError, t, toast, updateMediaKit]);

  return useMemo(
    () => ({
      isReady,
      isSharing,
      error,
      canRetry,
      isMakingPublic,
      onShare,
      onCopy,
      onRetry,
      onDismissError,
      onMakePublic,
    }),
    [
      canRetry,
      error,
      isMakingPublic,
      isReady,
      isSharing,
      onCopy,
      onDismissError,
      onMakePublic,
      onRetry,
      onShare,
    ],
  );
};
