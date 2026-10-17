import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { Heart, UserPlus } from 'lucide-react-native';
import { useStyles } from '@/core/theme';
import { Box, Layout, SuperList } from '@/shared/ui';
import type { LayoutHeaderConfig } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { CreatorCard } from '../../components/CreatorCard';
import { CreatorRowsSkeleton } from '../../components/CreatorRowsSkeleton';
import type { ExploreCreator } from '../../types/explore';
import { InviteCampaignSheet } from './components/InviteCampaignSheet';
import { ShortlistInviteTray } from './components/ShortlistInviteTray';
import { useShortlistScreen } from './hooks/useShortlistScreen';

const keyExtractor = (creator: ExploreCreator) => creator.slug;

/**
 * Shortlist (List archetype, rule 09), opened from the ❤️ in the Home header: the brand's saved
 * creators as row cards, loading on near the end. Empty → a nudge back to Explore. The header's
 * invite action (PC3.5) turns the rows into a pick list: choose who, then the campaign to invite them to.
 */
const ShortlistScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const vm = useShortlistScreen();

  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing['5xl'] },
    item: { paddingBottom: spacing.md },
  }));

  const { pressCreator, removeCreator, requestOffer, invite } = vm;
  const { active: inviting, pickedSlugs } = invite;
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ExploreCreator>) => (
      <Box style={styles.item}>
        <CreatorCard
          creator={item}
          selected={inviting ? pickedSlugs.has(item.slug) : undefined}
          onPress={pressCreator}
          onToggleShortlist={inviting ? undefined : removeCreator}
          onRequestOffer={inviting ? undefined : requestOffer}
        />
      </Box>
    ),
    [inviting, pickedSlugs, pressCreator, removeCreator, requestOffer, styles.item],
  );

  const inviteStart = invite.start;
  const inviteExit = invite.exit;
  const canInvite = vm.creators.length > 0;
  const header = useMemo<LayoutHeaderConfig>(() => {
    if (inviting) {
      return {
        title: t('marketplace.shortlist.invite.title'),
        subtitle: t('marketplace.shortlist.invite.subtitle'),
        backIcon: 'close',
        onBackPress: inviteExit,
      };
    }
    return {
      title: t('marketplace.shortlist.title'),
      actions: canInvite
        ? [{ icon: UserPlus, accessibilityLabel: t('marketplace.shortlist.invite.enter'), onPress: inviteStart }]
        : undefined,
    };
  }, [canInvite, inviteExit, inviteStart, inviting, t]);
  const tray = inviting ? <ShortlistInviteTray picks={invite.picks} onInvite={invite.openSheet} /> : undefined;
  const rowState = useMemo(() => [inviting, pickedSlugs], [inviting, pickedSlugs]);

  return (
    <Layout mode="static" padding="none" header={header} overlay={tray}>
      <SuperList
        data={vm.creators}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        extraData={rowState}
        isLoading={vm.isLoading}
        isError={vm.isError}
        isRefreshing={vm.isRefreshing}
        isFetchingNextPage={vm.isFetchingNextPage}
        hasNextPage={vm.hasNextPage}
        onEndReached={vm.onEndReached}
        onRefresh={vm.onRefresh}
        onRetry={vm.onRetry}
        emptyIcon={Heart}
        emptyMessage={t('marketplace.shortlist.empty.title')}
        emptyDescription={t('marketplace.shortlist.empty.hint')}
        emptyAction={vm.emptyAction}
        errorMessage={t('marketplace.shortlist.loadFailed')}
        ListSkeletonComponent={<CreatorRowsSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
      <InviteCampaignSheet sheet={invite.sheet} />
    </Layout>
  );
};

export const ShortlistScreen = memo(ShortlistScreenComponent);
