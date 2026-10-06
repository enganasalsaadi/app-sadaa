import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from '@/core/toast';
import { useGetMediaKitQuery, useShareMediaKitMutation } from '../api/mediaKitApi';
import {
  buildShareUrl,
  classifyShareError,
  createShareAttempts,
  resolveShareChannel,
} from '../utils/mediaKitShare';
import type { MediaKitShareError, ShareAttempt } from '../utils/mediaKitShare';

/**
 * Creator Home share CTA (contract §17.6). The UUID is minted before the OS
 * sheet opens; the POST goes out only after the user completes the share
 * (immediately on copy) and is never auto-retried: a failed attempt waits for
 * `retry()`, which replays the same key.
 */
export const useMediaKitShare = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: kit } = useGetMediaKitQuery();
  const [shareMediaKit] = useShareMediaKitMutation();
  const attempts = useMemo(() => createShareAttempts(), []);
  const inFlight = useRef(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<MediaKitShareError | null>(null);
  const [canRetry, setCanRetry] = useState(false);

  const shareUrl = kit ? buildShareUrl(kit.public_url) : null;

  const record = useCallback(
    async (attempt: ShareAttempt) => {
      try {
        await shareMediaKit(attempt).unwrap();
        attempts.clear();
        setCanRetry(false);
      } catch (e) {
        const kind = classifyShareError(e);
        if (kind === 'failed') {
          attempts.fail(attempt);
        } else {
          attempts.clear();
        }
        setCanRetry(kind === 'failed');
        setError(kind);
      }
    },
    [attempts, shareMediaKit],
  );

  const run = useCallback(
    async (task: () => Promise<void>) => {
      if (inFlight.current) {
        return;
      }
      inFlight.current = true;
      setIsSharing(true);
      setError(null);
      try {
        await task();
      } finally {
        inFlight.current = false;
        setIsSharing(false);
      }
    },
    [],
  );

  const share = useCallback(
    () =>
      run(async () => {
        if (!shareUrl) {
          return;
        }
        const idempotencyKey = attempts.begin();
        const channel = resolveShareChannel(
          Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'other',
          await Share.share({ message: shareUrl }),
        );
        if (channel) {
          await record({ channel, idempotencyKey });
        }
      }),
    [attempts, record, run, shareUrl],
  );

  const copyLink = useCallback(
    () =>
      run(async () => {
        if (!shareUrl) {
          return;
        }
        const idempotencyKey = attempts.begin();
        Clipboard.setString(shareUrl);
        toast.success(t('account.mediaKit.share.copied'));
        await record({ channel: 'copy_link', idempotencyKey });
      }),
    [attempts, record, run, shareUrl, t, toast],
  );

  const retry = useCallback(
    () =>
      run(async () => {
        const pending = attempts.getPending();
        if (pending) {
          await record(pending);
        }
      }),
    [attempts, record, run],
  );

  const dismissError = useCallback(() => setError(null), []);

  return { isReady: shareUrl !== null, isSharing, error, canRetry, share, copyLink, retry, dismissError };
};
