import React, { memo, useCallback } from 'react';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { Megaphone } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Layout, SuperList, Text } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { CampaignCard } from '../../components/CampaignCard';
import { CampaignDraftCard } from '../../components/CampaignDraftCard';
import { CampaignDraftSheet } from '../../components/CampaignDraftSheet';
import { CampaignFinishedRow } from '../../components/CampaignFinishedRow';
import { CampaignsListHeader } from '../../components/CampaignsListHeader';
import { CampaignsSkeleton } from '../../components/CampaignsSkeleton';
import type { CampaignScope } from '../../components/CampaignScopeSwitch';
import type { Campaign } from '../../types';
import { useBrandCampaignsScreen } from './hooks/useBrandCampaignsScreen';

const keyExtractor = (campaign: Campaign) => campaign.id;

export interface BrandCampaignsScreenProps {
  scope: CampaignScope;
  onScope: (scope: CampaignScope) => void;
}

/**
 * Brand `DealsTab` root, campaigns side (PC2.0, approved 2026-10-17): the title switches with the
 * deals board, what needs a decision rides above the tabs, and each tab shows its campaigns the
 * way they deserve: live ones lead with the cover and seats, drafts with how complete they are,
 * finished ones as quiet rows.
 */
const BrandCampaignsScreenComponent: React.FC<BrandCampaignsScreenProps> = ({ scope, onScope }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const onScroll = useJSScrollHandler();
  const vm = useBrandCampaignsScreen();
  const { tab, openCampaign, resumeDraft, drafts } = vm;
  const openDraftSheet = drafts.open;
  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing['7xl'] * 1.5 },
    item: { paddingBottom: spacing.lg },
    limit: { paddingBottom: spacing.md },
  }));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Campaign>) => (
      <Box style={styles.item}>
        {tab === 'drafts' ? (
          <CampaignDraftCard campaign={item} onResume={resumeDraft} onMore={openDraftSheet} />
        ) : tab === 'finished' ? (
          <CampaignFinishedRow campaign={item} onPress={openCampaign} />
        ) : (
          <CampaignCard campaign={item} onPress={openCampaign} />
        )}
      </Box>
    ),
    [openCampaign, openDraftSheet, resumeDraft, styles.item, tab],
  );

  return (
    <Layout
      mode="static"
      padding="none"
      header={
        <CampaignsListHeader
          scope={scope}
          onScope={onScope}
          subtitle={vm.subtitle}
          needsYou={vm.needsYou}
          onAttention={vm.onAttention}
          options={vm.options}
          tab={vm.tab}
          onTab={vm.setTab}
          onNewCampaign={vm.openNewCampaign}
        />
      }
    >
      <SuperList
        key={vm.tab}
        data={vm.campaigns}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isLoading={vm.isLoading}
        isError={vm.isError}
        isRefreshing={vm.isRefreshing}
        isFetchingNextPage={vm.isFetchingNextPage}
        hasNextPage={vm.hasNextPage}
        onEndReached={vm.onEndReached}
        onRefresh={vm.onRefresh}
        onRetry={vm.onRetry}
        emptyIcon={Megaphone}
        emptyMessage={vm.emptyTitle}
        emptyDescription={vm.emptyHint}
        emptyAction={vm.emptyAction}
        errorMessage={t('marketplace.campaign.list.loadFailed')}
        ListHeaderComponent={
          vm.draftsLimit ? (
            <Box style={styles.limit}>
              <Text variant="caption" color={colors.text.tertiary} align="center">
                {vm.draftsLimit}
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
    </Layout>
  );
};

export const BrandCampaignsScreen = memo(BrandCampaignsScreenComponent);
