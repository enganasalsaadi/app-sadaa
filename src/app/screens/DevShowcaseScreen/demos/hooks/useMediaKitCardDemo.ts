import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MediaKitCardProps } from '@/domains/identity';
import {
  MOCK_MEDIA_KIT_LINK,
  MOCK_MEDIA_KIT_NICHE_LABELS,
  MOCK_MEDIA_KIT_PREVIEW,
  MOCK_MEDIA_KIT_TILES,
} from '../mockData';

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

  const displayName = t('devShowcase.mediaKitCard.displayName');

  return useMemo(() => {
    const preview = { ...MOCK_MEDIA_KIT_PREVIEW, display_name: displayName };
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
      preview,
      link: MOCK_MEDIA_KIT_LINK,
      nicheLabels: MOCK_MEDIA_KIT_NICHE_LABELS,
      stats: { status: 'ready', tiles: MOCK_MEDIA_KIT_TILES },
      share,
      onRetry: noop,
      onRetryStats: noop,
      onOpenInsights: noop,
      onOpenPreview: noop,
    } satisfies MediaKitCardProps;
    const withShareError = (error: 'private' | 'rate_limited' | 'failed'): MediaKitCardProps => ({
      ...base,
      share: { ...share, error, canRetry: error === 'failed' },
    });

    return [
      { id: 'default', title: t('devShowcase.mediaKitCard.default'), props: base },
      {
        id: 'offersLive',
        title: t('devShowcase.mediaKitCard.offersLive'),
        props: {
          ...base,
          stats: {
            status: 'ready',
            tiles: [...MOCK_MEDIA_KIT_TILES, { key: 'offers_from_profile', value: 4, change: -0.2 }],
          },
        },
      },
      {
        id: 'noActivity',
        title: t('devShowcase.mediaKitCard.noActivity'),
        props: {
          ...base,
          stats: { status: 'ready', tiles: MOCK_MEDIA_KIT_TILES.map(tile => ({ ...tile, value: 0, change: undefined })) },
        },
      },
      {
        id: 'minimal',
        title: t('devShowcase.mediaKitCard.minimal'),
        props: {
          ...base,
          preview: {
            ...MOCK_MEDIA_KIT_PREVIEW,
            display_name: null,
            avatar_url: null,
            tier: null,
            is_verified: false,
            niches: [],
            platforms: [],
            price_from_usd: null,
          },
          nicheLabels: [],
          onOpenInsights: undefined,
          onOpenPreview: undefined,
        },
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
        id: 'statsLoading',
        title: t('devShowcase.mediaKitCard.statsLoading'),
        props: { ...base, stats: { status: 'loading', tiles: [] } },
      },
      {
        id: 'statsError',
        title: t('devShowcase.mediaKitCard.statsError'),
        props: { ...base, stats: { status: 'error', tiles: [] } },
      },
      {
        id: 'loading',
        title: t('devShowcase.mediaKitCard.loading'),
        props: { ...base, status: 'loading', preview: undefined, link: undefined },
      },
      {
        id: 'loadError',
        title: t('devShowcase.mediaKitCard.loadError'),
        props: { ...base, status: 'error', preview: undefined, link: undefined },
      },
    ];
  }, [displayName, onShare, sharing, t]);
};
