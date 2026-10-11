import React, { memo, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BookmarkCheck, BookmarkPlus, Share2, UserX } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { EmptyState, ErrorState, Layout } from '@/shared/ui';
import type { LayoutHeaderConfig, ScreenHeaderAction } from '@/shared/ui';
import {
  MediaKitHeaderBar,
  MediaKitHero,
  MediaKitShowcaseBody,
  MediaKitShowcaseBodySkeleton,
  MediaKitShowcaseHeroSkeleton,
} from '../../components/MediaKitShowcase';
import { OfferFooter } from './components/OfferFooter';
import { PriceLockFooter } from './components/PriceLockFooter';
import { useMediaKitPublicScreen, type MediaKitPublicScreenModel } from './hooks/useMediaKitPublicScreen';

const Footer = memo<{ vm: MediaKitPublicScreenModel }>(({ vm }) => {
  switch (vm.footer) {
    case 'lock':
      return vm.priceLock ? <PriceLockFooter notice={vm.priceLock} onAction={vm.onPriceLockAction} /> : null;
    case 'offer':
      return (
        <OfferFooter
          priceFrom={vm.priceFrom}
          total={vm.services.total}
          selectedCount={vm.services.selected.size}
          isShortlisted={vm.isShortlisted}
          saving={vm.savingShortlist}
          onSave={vm.onSaveToShortlist}
          onOpenShortlist={vm.onOpenShortlist}
        />
      );
    case 'none':
      return null;
    default: {
      const _exhaustive: never = vm.footer;
      return _exhaustive;
    }
  }
});

/**
 * A creator's public media kit as a pitch (Dashboard chrome over a navy hero): cover and big
 * avatar, headline numbers, then platforms, audience, brands worked with, past work, services
 * by platform and terms. Brands pick services (estimate) and save the creator; locked prices
 * get the unlock step instead. Opened over the tabs or Login.
 */
const MediaKitPublicScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useMediaKitPublicScreen();
  const { kit } = vm;

  // ≤ 2 glass icons on the navy bar: save (brands only) and share (once the server sends the link).
  const actions = useMemo<LayoutHeaderConfig['actions']>(() => {
    const save: ScreenHeaderAction | null = vm.canShortlist
      ? {
          icon: vm.isShortlisted ? BookmarkCheck : BookmarkPlus,
          accessibilityLabel: t(
            vm.isShortlisted
              ? 'account.mediaKit.showcase.shortlist.remove'
              : 'account.mediaKit.showcase.shortlist.add',
          ),
          onPress: vm.onToggleShortlist,
          glass: true,
        }
      : null;
    const share: ScreenHeaderAction | null = vm.onShare
      ? {
          icon: Share2,
          accessibilityLabel: t('account.mediaKit.showcase.share'),
          onPress: vm.onShare,
          glass: true,
        }
      : null;
    if (save && share) return [save, share];
    const only = save ?? share;
    return only ? [only] : undefined;
  }, [t, vm.canShortlist, vm.isShortlisted, vm.onShare, vm.onToggleShortlist]);

  if (vm.status === 'not_found' || vm.status === 'error') {
    return (
      <Layout header={{ title: t('account.mediaKit.publicScreen.title') }}>
        {vm.status === 'not_found' ? (
          <EmptyState
            icon={UserX}
            title={t('account.mediaKit.publicScreen.notFoundTitle')}
            message={t('account.mediaKit.publicScreen.notFoundBody')}
            action={{ label: t('account.mediaKit.publicScreen.back'), onPress: vm.onBack }}
          />
        ) : (
          <ErrorState
            title={t('account.mediaKit.publicScreen.loadFailed')}
            error={vm.error}
            onRetry={vm.onRetry}
          />
        )}
      </Layout>
    );
  }

  const ready = vm.status === 'ready' && kit !== undefined;

  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      heroBackdrop="brandGlow"
      heroBehavior="parallax"
      header={{
        title: kit?.display_name ?? t('account.mediaKit.publicScreen.title'),
        variant: 'brand',
        leading: kit ? <MediaKitHeaderBar kit={kit} /> : undefined,
        actions,
      }}
      hero={
        ready ? (
          <MediaKitHero kit={kit} nicheLabels={vm.nicheLabels} metrics={vm.metrics} />
        ) : (
          <MediaKitShowcaseHeroSkeleton />
        )
      }
      footer={ready && vm.footer !== 'none' ? <Footer vm={vm} /> : undefined}
      footerBehavior="elevate"
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            // The spinner sits over the navy backdrop.
            tintColor={colors.text.onBrand}
          />
        ),
      }}
    >
      {ready ? (
        <MediaKitShowcaseBody kit={kit} services={vm.services} selectable={vm.selectable} />
      ) : (
        <MediaKitShowcaseBodySkeleton />
      )}
    </Layout>
  );
};

export const MediaKitPublicScreen = memo(MediaKitPublicScreenComponent);
