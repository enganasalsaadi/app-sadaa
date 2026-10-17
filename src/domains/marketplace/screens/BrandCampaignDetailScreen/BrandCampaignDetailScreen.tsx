import React, { memo } from 'react';
import { RefreshControl, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { MoreHorizontal } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, ConfirmSheet, ErrorState, Layout, LayoutFooter, StaggerIn } from '@/shared/ui';
import { CampaignDetailHero } from '../../components/CampaignDetailHero';
import { CampaignDetailSkeleton } from '../../components/CampaignDetailSkeleton';
import { CampaignHistoryCard } from '../../components/CampaignHistoryCard';
import { CampaignIsland } from '../../components/CampaignIsland';
import { CampaignReadinessCard } from '../../components/CampaignReadinessCard';
import { CampaignReviewNoteCard } from '../../components/CampaignReviewNoteCard';
import { CampaignSeatsCard } from '../../components/CampaignSeatsCard';
import { CampaignTermsCard } from '../../components/CampaignTermsCard';
import { CampaignActionsSheet } from './components/CampaignActionsSheet';
import { CampaignAddSeatsSheet } from './components/CampaignAddSeatsSheet';
import { CampaignDeadlineSheet } from './components/CampaignDeadlineSheet';
import { CampaignEndSheet } from './components/CampaignEndSheet';
import { CampaignExtendSheet } from './components/CampaignExtendSheet';
import { CampaignReduceSheet } from './components/CampaignReduceSheet';
import { CampaignReopenSheet } from './components/CampaignReopenSheet';
import { useBrandCampaignDetailScreen, type CampaignDetailDock } from './hooks/useBrandCampaignDetailScreen';

const DOCK_LABEL = {
  resume: 'marketplace.campaign.detail.dock.resume',
  resubmit: 'marketplace.campaign.detail.dock.resubmit',
  reopen: 'marketplace.campaign.detail.dock.reopen',
} as const satisfies Record<CampaignDetailDock, ParseKeys>;

/**
 * The brand's campaign page (`sada://campaigns/{id}`): the cover with the status and time left,
 * the one thing the campaign waits on, the seats as the hero (or a readiness checklist for a
 * draft), the terms with their lock, and the campaign's own history. The body slides over the
 * cover like the deal page. The «⋯» in the bar opens what the status allows.
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

  const { dock, lifecycle } = vm;
  return (
    <>
      <Layout
        padding="none"
        statusBar="light"
        headerBehavior="overlay"
        heroBehavior="parallax"
        header={{
          title: campaign.title,
          variant: 'brand',
          actions: [
            {
              icon: MoreHorizontal,
              accessibilityLabel: t('marketplace.campaign.detail.menu.title'),
              onPress: lifecycle.openMenu,
              glass: true,
            },
          ],
        }}
        footerBehavior="docked"
        footer={
          dock ? (
            <LayoutFooter
              primary={{
                label: t(DOCK_LABEL[dock]),
                onPress: dock === 'reopen' ? vm.reopenFromDock : vm.openWizard,
                loading: dock === 'reopen' && lifecycle.isRunning,
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
          <CampaignIsland campaign={campaign} onAction={lifecycle.decide} busy={lifecycle.isRunning} />
          <StaggerIn gap="lg">
            {vm.reviewNote ? <CampaignReviewNoteCard note={vm.reviewNote} /> : null}
            {vm.showReadiness ? (
              <CampaignReadinessCard missing={campaign.missing} onEdit={vm.openWizard} />
            ) : (
              <CampaignSeatsCard campaign={campaign} onReview={vm.openApplicants} />
            )}
            <CampaignTermsCard campaign={campaign} locked={vm.termsLocked} />
            <CampaignHistoryCard {...vm.history} />
          </StaggerIn>
        </Box>
      </Layout>
      <CampaignActionsSheet campaign={campaign} lifecycle={lifecycle} termsLocked={vm.termsLocked} />
      <CampaignAddSeatsSheet campaign={campaign} lifecycle={lifecycle} />
      <CampaignDeadlineSheet campaign={campaign} lifecycle={lifecycle} />
      <CampaignEndSheet campaign={campaign} lifecycle={lifecycle} />
      <CampaignReduceSheet campaign={campaign} lifecycle={lifecycle} />
      <CampaignReopenSheet lifecycle={lifecycle} />
      <CampaignExtendSheet campaign={campaign} lifecycle={lifecycle} />
      <ConfirmSheet
        visible={lifecycle.deleteVisible}
        onClose={lifecycle.close}
        title={t('marketplace.campaign.list.draftSheet.deleteTitle')}
        body={t('marketplace.campaign.list.draftSheet.deleteBody', {
          title: campaign.title.trim() || t('marketplace.campaign.list.untitled'),
        })}
        confirmLabel={t('marketplace.campaign.list.draftSheet.deleteConfirm')}
        confirmVariant="danger"
        confirmLoading={lifecycle.isDeleting}
        onConfirm={lifecycle.confirmDelete}
        cancelLabel={t('marketplace.campaign.list.draftSheet.keep')}
      />
    </>
  );
};

export const BrandCampaignDetailScreen = memo(BrandCampaignDetailScreenComponent);
