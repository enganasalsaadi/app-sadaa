import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CircleDollarSign, Link2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ErrorState, Layout, LayoutFooter, ListGroup, ListRow, Notice, Skeleton } from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { RateGroupSection } from './components/RateGroupSection';
import { useRateCardsScreen, type RateCardsScreenModel } from './hooks/useRateCardsScreen';

const SKELETON_GROUPS = ['a', 'b'] as const;

const RateCardsSkeleton = memo(() => {
  const { sizes } = useTheme();
  return (
    <Box gap="2xl">
      {SKELETON_GROUPS.map(key => (
        <Box key={key} gap="sm">
          <Skeleton width="30%" height={sizes.icon.sm} />
          <Skeleton width="100%" height={sizes.button.lg * 2} borderRadius="lg" />
        </Box>
      ))}
    </Box>
  );
});

const RateCardsContent: React.FC<{ vm: RateCardsScreenModel }> = memo(({ vm }) => {
  const { t } = useTranslation();

  return (
    <Box gap="2xl" pb="xl">
      {vm.showNotice ? (
        <Notice
          tone="warning"
          icon={CircleDollarSign}
          title={t('account.rates.notice.title')}
          message={t('account.rates.notice.message')}
        />
      ) : null}
      {vm.groups.map(group => (
        <RateGroupSection key={group.key} group={group} onOpenCard={vm.openCard} onAdd={vm.addToGroup} />
      ))}
      {vm.hasNoPlatforms ? (
        <ListGroup>
          <ListRow
            icon={Link2}
            title={t('account.rates.linkPlatform')}
            subtitle={t('account.rates.linkPlatformHint')}
            onPress={vm.openPlatforms}
          />
        </ListGroup>
      ) : null}
    </Box>
  );
});

/** Settings archetype: prices grouped by platform; each opens the editor, adding is the one primary action. */
const RateCardsScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useRateCardsScreen();
  useHideBottomBar();

  const body = vm.isLoading ? (
    <RateCardsSkeleton />
  ) : vm.isError ? (
    <ErrorState error={vm.error} onRetry={vm.retry} retrying={vm.isRetrying} />
  ) : (
    <RateCardsContent vm={vm} />
  );

  return (
    <Layout
      header={{ title: t('account.rates.title') }}
      scrollProps={{
        refreshControl: (
          <RefreshControl refreshing={vm.refreshing} onRefresh={vm.onRefresh} tintColor={colors.interactive.main} />
        ),
      }}
      footer={
        !vm.isLoading && !vm.isError && vm.canAdd ? (
          <LayoutFooter primary={{ label: t('account.rates.addPrice'), onPress: vm.addCard }} />
        ) : undefined
      }
    >
      {body}
    </Layout>
  );
};

export const RateCardsScreen = memo(RateCardsScreenComponent);
