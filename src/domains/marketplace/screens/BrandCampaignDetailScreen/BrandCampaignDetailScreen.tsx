import React, { memo } from 'react';
import { RefreshControl, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStyles, useTheme } from '@/core/theme';
import { Box, ErrorState, Layout, LayoutFooter, StaggerIn } from '@/shared/ui';
import { CampaignDetailHero } from '../../components/CampaignDetailHero';
import { CampaignDetailSkeleton } from '../../components/CampaignDetailSkeleton';
import { CampaignHistoryCard } from '../../components/CampaignHistoryCard';
import { CampaignIsland } from '../../components/CampaignIsland';
import { CampaignReadinessCard } from '../../components/CampaignReadinessCard';
import { CampaignReviewNoteCard } from '../../components/CampaignReviewNoteCard';
import { CampaignSeatsCard } from '../../components/CampaignSeatsCard';
import { CampaignTermsCard } from '../../components/CampaignTermsCard';
import { useBrandCampaignDetailScreen } from './hooks/useBrandCampaignDetailScreen';

/**
 * The brand's campaign page (`sada://campaigns/{id}`): the cover with the status and time left,
 * the one thing the campaign waits on, the seats as the hero (or a readiness checklist for a
 * draft), the terms with their lock, and the campaign's own history. The body slides over the
 * cover like the deal page.
 */
const BrandCampaignDetailScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useBrandCampaignDetailScreen();
  const { campaign } = vm;
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

  if (vm.isLoading) return <CampaignDetailSkeleton />;
  if (!campaign) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.campaign.detail.loadFailed')} />
      </Layout>
    );
  }

  const dock = vm.dock;
  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      heroBehavior="parallax"
      header={{ title: campaign.title, variant: 'brand' }}
      footerBehavior="docked"
      footer={
        dock ? (
          <LayoutFooter
            primary={{
              label: t(dock === 'resubmit' ? 'marketplace.campaign.detail.dock.resubmit' : 'marketplace.campaign.detail.dock.resume'),
              onPress: vm.openWizard,
            }}
          />
        ) : undefined
      }
      hero={<CampaignDetailHero campaign={campaign} />}
      scrollProps={{
        refreshControl: (
          <RefreshControl refreshing={vm.isRefreshing} onRefresh={vm.onRefresh} tintColor={colors.text.onBrand} />
        ),
      }}
    >
      <Box style={styles.sheet} px="xl" pt="xl" pb="5xl">
        {/* Spaces itself: it renders nothing most of the time, and a null child would still take a gap. */}
        <CampaignIsland campaign={campaign} />
        <StaggerIn gap="lg">
          {vm.reviewNote ? <CampaignReviewNoteCard note={vm.reviewNote} /> : null}
          {vm.showReadiness ? (
            <CampaignReadinessCard missing={campaign.missing} onEdit={vm.openWizard} />
          ) : (
            <CampaignSeatsCard campaign={campaign} />
          )}
          <CampaignTermsCard campaign={campaign} locked={vm.termsLocked} />
          <CampaignHistoryCard {...vm.history} />
        </StaggerIn>
      </Box>
    </Layout>
  );
};

export const BrandCampaignDetailScreen = memo(BrandCampaignDetailScreenComponent);
