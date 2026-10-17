import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { Megaphone } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Layout, SuperList, Text } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import type { CampaignAnnouncement } from '../../types/campaignAnnouncement';
import { AnnouncementCard } from './components/AnnouncementCard';
import { AnnouncementDock } from './components/AnnouncementDock';
import { AnnouncementEditor } from './components/AnnouncementEditor';
import { AnnouncementLock } from './components/AnnouncementLock';
import { AnnouncementQuota } from './components/AnnouncementQuota';
import { AnnouncementsSkeleton } from './components/AnnouncementsSkeleton';
import { useBrandCampaignAnnouncementsScreen } from './hooks/useBrandCampaignAnnouncementsScreen';

const keyExtractor = (announcement: CampaignAnnouncement) => announcement.id;

/**
 * Broadcasts of a campaign (approved design 2026-10-17): three dots for today's real broadcasts
 * above an editor; at the cap the dots turn amber and a clock replaces the dock until the server's
 * reset, with the text kept. Sending is a hold. The history below is the quota's source.
 */
const BrandCampaignAnnouncementsScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const onScroll = useJSScrollHandler();
  const vm = useBrandCampaignAnnouncementsScreen();
  const { copyLink } = vm;
  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing['7xl'] },
    item: { paddingBottom: spacing.md },
  }));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CampaignAnnouncement>) => (
      <Box style={styles.item}>
        <AnnouncementCard announcement={item} onCopyLink={copyLink} />
      </Box>
    ),
    [copyLink, styles.item],
  );

  if (vm.isLoading) return <AnnouncementsSkeleton />;

  const subtitle = vm.campaignTitle
    ? t('marketplace.campaign.announcements.subtitle', { title: vm.campaignTitle })
    : undefined;
  const locked = vm.quota.unlocksAt !== null;

  return (
    <Layout
      mode="static"
      padding="none"
      header={{ title: t('marketplace.campaign.announcements.title'), subtitle }}
      footer={vm.isError ? undefined : <AnnouncementDock unlocksAt={vm.quota.unlocksAt} onSend={vm.onSend} />}
      footerBehavior="docked"
    >
      <SuperList
        data={vm.items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        isError={vm.isError}
        isRefreshing={vm.isRefreshing}
        isFetchingNextPage={vm.isFetchingNextPage}
        hasNextPage={vm.hasNextPage}
        onEndReached={vm.onEndReached}
        onRefresh={vm.onRefresh}
        onRetry={vm.onRetry}
        emptyIcon={Megaphone}
        emptyMessage={t('marketplace.campaign.announcements.empty.title')}
        emptyDescription={t('marketplace.campaign.announcements.empty.message')}
        errorMessage={t('marketplace.campaign.announcements.loadFailed')}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          vm.isError ? null : (
            <Box gap="lg" pb="lg">
              <AnnouncementQuota quota={vm.quota} />
              {vm.quota.unlocksAt !== null ? <AnnouncementLock unlocksAt={vm.quota.unlocksAt} /> : null}
              <AnnouncementEditor control={vm.control} locked={locked} noRecipients={vm.noRecipients} />
              {vm.items.length > 0 ? (
                <Text variant="h3" color={colors.text.primary}>
                  {t('marketplace.campaign.announcements.history.title')}
                </Text>
              ) : null}
            </Box>
          )
        }
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
    </Layout>
  );
};

export const BrandCampaignAnnouncementsScreen = memo(BrandCampaignAnnouncementsScreenComponent);
