import React, { memo } from 'react';
import { RefreshControl, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Bookmark } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, ErrorState, Layout, LayoutFooter, StaggerIn } from '@/shared/ui';
import type { LayoutHeaderConfig } from '@/shared/ui';
import { CampaignBriefLock } from '../../components/CampaignBriefLock';
import { CampaignDetailSkeleton } from '../../components/CampaignDetailSkeleton';
import { CampaignPageSection } from '../../components/CampaignPageSection';
import { CreatorApplyDockTop } from '../../components/CreatorApplyDockTop';
import { CreatorAskCard } from '../../components/CreatorAskCard';
import { CreatorCampaignHero } from '../../components/CreatorCampaignHero';
import { CreatorConditionsCard } from '../../components/CreatorConditionsCard';
import { CreatorNetCard } from '../../components/CreatorNetCard';
import { CreatorScheduleCard } from '../../components/CreatorScheduleCard';
import { RestrictionDockTop } from '../../components/RestrictionDockTop';
import type { ApplyAction } from '../../utils/opportunities';
import { CampaignApplySheet } from './components/CampaignApplySheet';
import { useCreatorCampaignDetailScreen } from './hooks/useCreatorCampaignDetailScreen';

const DOCK_LABEL = {
  apply: 'marketplace.campaign.opportunity.dock.apply',
  bid: 'marketplace.campaign.opportunity.dock.bid',
  gender: 'marketplace.campaign.opportunity.dock.gender',
  blocked: 'marketplace.campaign.opportunity.dock.blocked',
  closed: 'marketplace.campaign.opportunity.dock.closed',
} as const satisfies Record<ApplyAction['kind'], ParseKeys>;

/**
 * The creator's campaign page (`sada://campaigns/{id}`, PC4.0 frames 6 · 6ب · 7): the cover with the
 * brand and the title, then numbered sections over it like the deal page — first what the creator
 * takes home, then what's asked, the schedule, the public terms and the sealed private brief. The
 * dock holds the seats, the time left and the one action (or why there is none).
 */
const CreatorCampaignDetailScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useCreatorCampaignDetailScreen();
  const { campaign, action } = vm;
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
  if (!campaign || !action) {
    return (
      <Layout mode="static" header={{ title: '' }}>
        <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.campaign.opportunity.loadFailed')} />
      </Layout>
    );
  }

  const header: LayoutHeaderConfig = {
    title: campaign.title,
    variant: 'brand',
    actions: vm.canSave
      ? [
          {
            icon: Bookmark,
            accessibilityLabel: t(
              campaign.bookmarked ? 'marketplace.campaign.opportunity.unsave' : 'marketplace.campaign.opportunity.save',
            ),
            onPress: vm.toggleSaved,
            glass: true,
            active: campaign.bookmarked,
          },
        ]
      : undefined,
  };
  const disabled = action.kind === 'blocked' || action.kind === 'closed';

  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      heroBehavior="parallax"
      header={header}
      footerBehavior="docked"
      footer={
        <LayoutFooter
          top={
            vm.restriction ? (
              <RestrictionDockTop notice={vm.restriction} scope="public" onWhy={vm.openRestriction} />
            ) : (
              <CreatorApplyDockTop seats={campaign.seats} deadline={vm.deadline} action={action} />
            )
          }
          primary={
            !vm.restriction
              ? { label: t(DOCK_LABEL[action.kind]), onPress: vm.onPrimary, disabled }
              : vm.restriction.kind === 'return_pending'
                ? { label: t('marketplace.restrictions.returnPending.dockAction'), onPress: vm.openRestriction }
                : undefined
          }
        />
      }
      hero={<CreatorCampaignHero campaign={campaign} />}
      scrollProps={{
        refreshControl: (
          <RefreshControl refreshing={vm.isRefreshing} onRefresh={vm.onRefresh} tintColor={colors.text.onBrand} />
        ),
      }}
    >
      <Box style={styles.sheet} px="xl" pt="xl" pb="5xl">
        <StaggerIn gap="xl">
          <CreatorNetCard pricing={campaign.pricing} />
          <CampaignPageSection
            index={1}
            title={t('marketplace.campaign.opportunity.asks.title')}
            note={t('marketplace.campaign.opportunity.asks.count', { count: campaign.deliverables.length })}
          >
            <Box gap="sm">
              {campaign.deliverables.map((deliverable, index) => (
                <CreatorAskCard key={`${deliverable.platform.key}:${deliverable.service.key}:${index}`} deliverable={deliverable} />
              ))}
            </Box>
          </CampaignPageSection>
          <CampaignPageSection index={2} title={t('marketplace.campaign.opportunity.schedule.title')}>
            <CreatorScheduleCard campaign={campaign} />
          </CampaignPageSection>
          <CampaignPageSection index={3} title={t('marketplace.campaign.opportunity.conditions.title')}>
            <CreatorConditionsCard
              chips={vm.chips}
              teaser={campaign.teaserRequirements}
              shipping={vm.shipping}
              anyoneLabel={t('marketplace.campaign.detail.terms.anyone')}
            />
          </CampaignPageSection>
          <CampaignPageSection index={4} title={t('marketplace.campaign.opportunity.brief.section')}>
            <CampaignBriefLock />
          </CampaignPageSection>
        </StaggerIn>
      </Box>
      <CampaignApplySheet campaign={campaign} apply={vm.apply} />
    </Layout>
  );
};

export const CreatorCampaignDetailScreen = memo(CreatorCampaignDetailScreenComponent);
