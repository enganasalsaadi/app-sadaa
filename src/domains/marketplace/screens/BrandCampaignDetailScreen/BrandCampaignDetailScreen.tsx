import React, { memo } from 'react';
import { RefreshControl, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { MoreHorizontal } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import { Box, ConfirmSheet, ErrorState, Layout, LayoutFooter, StaggerIn } from '@/shared/ui';
import { CampaignBatchToolsCard } from '../../components/CampaignBatchToolsCard';
import { CampaignDetailHero } from '../../components/CampaignDetailHero';
import { CampaignDetailSkeleton } from '../../components/CampaignDetailSkeleton';
import { CampaignHistoryCard } from '../../components/CampaignHistoryCard';
import { CampaignJourney } from '../../components/CampaignJourney';
import { CampaignNowCard } from '../../components/CampaignNowCard';
import { CampaignQuickActions } from '../../components/CampaignQuickActions';
import { CampaignTermsCard } from '../../components/CampaignTermsCard';
import { VaultEntryStrip } from '../../components/VaultEntryStrip';
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
  applicants: 'marketplace.campaign.detail.dock.applicants',
  creators: 'marketplace.campaign.detail.dock.creators',
} as const satisfies Record<CampaignDetailDock, ParseKeys>;

/**
 * The brand's campaign page (`sada://campaigns/{id}`): a short cover (the campaign's photo, rings on
 * the brand gradient without one), then the body that slides over it, in the order a brand asks:
 * what can I do right now (quick actions), what is happening and what is asked of me, the terms,
 * the tools, the journey so far, and the campaign's own history. The «⋯» in the bar opens
 * everything the status allows; the dock holds the one thing it asks.
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
                label: t(DOCK_LABEL[dock.kind], { count: formatNumber(dock.count) }),
                onPress: vm.dockPress,
                loading: dock.kind === 'reopen' && lifecycle.isRunning,
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
          <StaggerIn gap="2xl">
            {vm.quickActions.length > 0 ? (
              <CampaignQuickActions actions={vm.quickActions} onAction={vm.onQuickAction} busy={lifecycle.isRunning} />
            ) : null}
            {vm.nowCard ? (
              <CampaignNowCard now={vm.nowCard} note={vm.reviewNote} onTodo={vm.onTodo} busy={lifecycle.isRunning} />
            ) : null}
            {vm.tools?.any ? (
              <CampaignBatchToolsCard
                campaign={campaign}
                tools={vm.tools}
                onOpenDrop={vm.openDrop}
                onOpenShipping={vm.openShipping}
                onOpenAnnouncements={vm.openAnnouncements}
              />
            ) : null}
            <CampaignTermsCard campaign={campaign} state={vm.termsState} onEdit={vm.editTerms} />
            {vm.files ? (
              <VaultEntryStrip
                title={t('marketplace.vault.entry.campaign')}
                count={vm.files.count}
                files={vm.files.files}
                refreshUrl={vm.files.refreshUrl}
                onSeeAll={vm.files.onSeeAll}
              />
            ) : null}
            {vm.journey && vm.nowCard ? (
              <CampaignJourney stations={vm.journey} tone={vm.nowCard.tone} onOpenApplicants={vm.openApplicants} />
            ) : null}
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
