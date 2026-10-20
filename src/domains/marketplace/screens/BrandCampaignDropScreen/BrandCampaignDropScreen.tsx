import React, { memo } from 'react';
import { RefreshControl, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Rocket, Users } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, EmptyState, ErrorState, Layout, StaggerIn } from '@/shared/ui';
import { DropFilters } from './components/DropFilters';
import { DropLane } from './components/DropLane';
import { DropRoomHero } from './components/DropRoomHero';
import { DropRunway } from './components/DropRunway';
import { DropSkeleton } from './components/DropSkeleton';
import { DropSquad } from './components/DropSquad';
import { useBrandCampaignDropScreen } from './hooks/useBrandCampaignDropScreen';

/**
 * The brand's launch room (`GET /{id}/drop`, approved design 2026-10-17, hero slimmed 2026-10-19):
 * a short hero with the clock of the next moment on the live gradient (the ring of verified
 * creators once on air); the body slides over it and opens with the runway card (stations +
 * reminders), then the squad as one bar with state filters, and a row per creator, late ones
 * first, each opening its deal. Pull to refresh, and a push re-reads it.
 */
const BrandCampaignDropScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useBrandCampaignDropScreen();
  const { board } = vm;
  const styles = useStyles(
    ({ radii, spacing }): Record<'sheet', ViewStyle> => ({
      sheet: {
        marginTop: -spacing['2xl'],
        borderTopStartRadius: radii.xl,
        borderTopEndRadius: radii.xl,
        backgroundColor: colors.layout.base,
      },
    }),
    [colors.layout.base],
  );

  if (vm.isLoading) return <DropSkeleton />;
  if (!board) {
    return (
      <Layout mode="static" header={{ title: t('marketplace.campaign.drop.title') }}>
        {vm.noDrop ? (
          <EmptyState
            icon={Rocket}
            title={t('marketplace.campaign.drop.empty.noDrop.title')}
            message={t('marketplace.campaign.drop.empty.noDrop.message')}
          />
        ) : (
          <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.campaign.drop.loadFailed')} />
        )}
      </Layout>
    );
  }

  const creators = t('marketplace.campaign.drop.creators', { count: board.creators.length });
  const subtitle = vm.campaignTitle
    ? t('marketplace.campaign.drop.subtitle', { title: vm.campaignTitle, creators })
    : creators;

  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      heroBackdrop="brandGlow"
      heroBehavior="parallax"
      header={{ title: t('marketplace.campaign.drop.title'), subtitle, variant: 'brand' }}
      hero={<DropRoomHero board={board} title={t('marketplace.campaign.drop.title')} subtitle={subtitle} />}
      scrollProps={{
        refreshControl: (
          <RefreshControl refreshing={vm.isRefreshing} onRefresh={vm.onRefresh} tintColor={colors.text.onBrand} />
        ),
      }}
    >
      <Box style={styles.sheet} px="xl" pt="xl" pb="5xl">
        {board.creators.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('marketplace.campaign.drop.empty.noCreators.title')}
            message={t('marketplace.campaign.drop.empty.noCreators.message')}
          />
        ) : (
          <StaggerIn gap="lg">
            <DropRunway board={board} />
            <Box gap="lg">
              <DropSquad creators={vm.bar} />
              <DropFilters chips={vm.chips} selected={vm.filter} onSelect={vm.selectFilter} />
            </Box>
            {vm.lanes.length === 0 ? (
              <EmptyState
                icon={Users}
                title={t('marketplace.campaign.drop.empty.filtered.title')}
                message={t('marketplace.campaign.drop.empty.filtered.message')}
              />
            ) : (
              <Box gap="md">
                {vm.lanes.map(creator => (
                  <DropLane key={creator.dealId} creator={creator} now={vm.minute} onOpen={vm.openDeal} />
                ))}
              </Box>
            )}
          </StaggerIn>
        )}
      </Box>
    </Layout>
  );
};

export const BrandCampaignDropScreen = memo(BrandCampaignDropScreenComponent);
