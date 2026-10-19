import React, { memo, useCallback, useMemo } from 'react';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { Megaphone } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, SuperList, Text, type EmptyStateAction } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { CampaignCard } from '../../../components/CampaignCard';
import { CampaignDraftCard } from '../../../components/CampaignDraftCard';
import { CampaignDraftSheet } from '../../../components/CampaignDraftSheet';
import { CampaignFinishedRow } from '../../../components/CampaignFinishedRow';
import { CampaignsSkeleton } from '../../../components/CampaignsSkeleton';
import { CAMPAIGN_DRAFT_LIMIT } from '../../../constants/campaignList';
import type { useCampaignsList } from '../../../hooks/useCampaignsList';
import { useCampaignDraftActions } from '../../../hooks/useCampaignDraftActions';
import type { Campaign } from '../../../types';
import { getCampaignStatusMeta } from '../../../utils/campaignStatus';

const keyExtractor = (campaign: Campaign) => campaign.id;

/** The filters that offer a first campaign when they are empty. */
const OFFERS_NEW = ['all', 'live', 'drafts'];

export interface BrandCampaignsListProps {
  list: ReturnType<typeof useCampaignsList>;
  /** Refreshes the whole hub, not just this face. */
  onRefresh: () => Promise<void>;
}

/**
 * The public campaigns face: each campaign as the card its state deserves. A draft shows how
 * complete it is, a finished one is a quiet row, the rest (in review or running) carry the station
 * track. Every chip has its own empty message; the ones that can start a campaign offer to.
 */
const BrandCampaignsListComponent: React.FC<BrandCampaignsListProps> = ({
  list,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const onScroll = useJSScrollHandler();
  const { filter, openCampaign, resumeDraft, openNewCampaign, draftsTotal } =
    list;
  const drafts = useCampaignDraftActions(draftsTotal);
  const openDraftSheet = drafts.open;
  const styles = useStyles(({ spacing }) => ({
    list: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing['7xl'] * 1.5,
    },
    item: { paddingBottom: spacing.md },
    limit: { paddingBottom: spacing.md },
  }));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Campaign>) => {
      const { tab } = getCampaignStatusMeta(item.status.key);
      return (
        <Box style={styles.item}>
          {tab === 'drafts' ? (
            <CampaignDraftCard
              campaign={item}
              onResume={resumeDraft}
              onMore={openDraftSheet}
            />
          ) : tab === 'finished' ? (
            <CampaignFinishedRow campaign={item} onPress={openCampaign} />
          ) : (
            <CampaignCard campaign={item} onPress={openCampaign} />
          )}
        </Box>
      );
    },
    [openCampaign, openDraftSheet, resumeDraft, styles.item],
  );

  const emptyAction: EmptyStateAction | undefined = useMemo(
    () =>
      OFFERS_NEW.includes(filter)
        ? {
            label: t('marketplace.deals.newCampaign'),
            onPress: openNewCampaign,
          }
        : undefined,
    [filter, openNewCampaign, t],
  );

  const draftsLimit =
    filter === 'drafts' && draftsTotal !== null && draftsTotal > 0
      ? t('marketplace.campaign.list.draftsLimit', {
          count: draftsTotal,
          max: CAMPAIGN_DRAFT_LIMIT,
        })
      : null;

  return (
    <>
      <SuperList
        data={list.campaigns}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isLoading={list.isLoading}
        isError={list.isError}
        isRefreshing={list.isRefreshing}
        isFetchingNextPage={list.isFetchingNextPage}
        hasNextPage={list.hasNextPage}
        onEndReached={list.onEndReached}
        onRefresh={onRefresh}
        onRetry={list.onRetry}
        emptyIcon={Megaphone}
        emptyMessage={list.emptyTitle}
        emptyDescription={list.emptyHint}
        emptyAction={emptyAction}
        errorMessage={t('marketplace.campaign.list.loadFailed')}
        ListHeaderComponent={
          draftsLimit ? (
            <Box style={styles.limit}>
              <Text
                variant="caption"
                color={colors.text.tertiary}
                align="center"
              >
                {draftsLimit}
              </Text>
            </Box>
          ) : null
        }
        ListSkeletonComponent={<CampaignsSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
      <CampaignDraftSheet
        campaign={drafts.target}
        actionsVisible={drafts.isActionsOpen}
        deleteVisible={drafts.isDeleteOpen}
        atLimit={drafts.atLimit}
        isDuplicating={drafts.isDuplicating}
        isDeleting={drafts.isDeleting}
        onClose={drafts.close}
        onResume={drafts.resume}
        onDuplicate={drafts.duplicate}
        onAskDelete={drafts.askDelete}
        onCancelDelete={drafts.backToActions}
        onConfirmDelete={drafts.confirmDelete}
      />
    </>
  );
};

export const BrandCampaignsList = memo(BrandCampaignsListComponent);
