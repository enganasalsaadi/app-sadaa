import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MediaKitCardProps } from '@/domains/identity';
import { MOCK_MEDIA_KIT_LINK } from '../mockData';

const MOCK_LATENCY_MS = 1200;

interface MediaKitCardVariant {
  id: string;
  title: string;
  props: MediaKitCardProps;
}

const noop = () => {};

/** Every state of the card with mocked triggers; only "Share" fakes a short in-flight state. */
export const useMediaKitCardDemo = (): MediaKitCardVariant[] => {
  const { t } = useTranslation();
  const [sharing, setSharing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onShare = useCallback(() => {
    setSharing(true);
    timer.current = setTimeout(() => setSharing(false), MOCK_LATENCY_MS);
  }, []);

  return useMemo(() => {
    const share = {
      isReady: true,
      isSharing: sharing,
      error: null,
      canRetry: false,
      isMakingPublic: false,
      onShare,
      onCopy: noop,
      onRetry: noop,
      onDismissError: noop,
      onMakePublic: noop,
    } satisfies MediaKitCardProps['share'];
    const base = {
      status: 'ready',
      link: MOCK_MEDIA_KIT_LINK,
      isPublic: true,
      noActivity: false,
      share,
      onRetry: noop,
      onOpenPreview: noop,
    } satisfies MediaKitCardProps;
    const withShareError = (error: 'private' | 'rate_limited' | 'failed'): MediaKitCardProps => ({
      ...base,
      share: { ...share, error, canRetry: error === 'failed' },
    });

    return [
      { id: 'default', title: t('devShowcase.mediaKitCard.default'), props: base },
      {
        id: 'hidden',
        title: t('devShowcase.mediaKitCard.hidden'),
        props: { ...base, isPublic: false },
      },
      {
        id: 'noActivity',
        title: t('devShowcase.mediaKitCard.noActivity'),
        props: { ...base, noActivity: true },
      },
      {
        id: 'noPreview',
        title: t('devShowcase.mediaKitCard.noPreview'),
        props: { ...base, onOpenPreview: undefined },
      },
      {
        id: 'sharing',
        title: t('devShowcase.mediaKitCard.sharing'),
        props: { ...base, share: { ...share, isSharing: true } },
      },
      { id: 'shareHidden', title: t('devShowcase.mediaKitCard.shareHidden'), props: withShareError('private') },
      { id: 'shareFailed', title: t('devShowcase.mediaKitCard.shareFailed'), props: withShareError('failed') },
      {
        id: 'shareRateLimited',
        title: t('devShowcase.mediaKitCard.shareRateLimited'),
        props: withShareError('rate_limited'),
      },
      {
        id: 'loading',
        title: t('devShowcase.mediaKitCard.loading'),
        props: {
          ...base,
          status: 'loading',
          link: undefined,
          isPublic: null,
          share: { ...share, isReady: false },
        },
      },
      {
        id: 'loadError',
        title: t('devShowcase.mediaKitCard.loadError'),
        props: { ...base, status: 'error', link: undefined, isPublic: null },
      },
    ];
  }, [onShare, sharing, t]);
};
