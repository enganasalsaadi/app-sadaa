import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, EmptyState, ErrorState, Layout, Skeleton, StaggerIn, Text } from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { StrikeCard } from './components/StrikeCard';
import { useStrikesScreen } from './hooks/useStrikesScreen';

/**
 * The creator's strikes (M8): how many are active, and each one with the time it has left. Brands
 * never see this. A clean record is its own calm state, not an empty list.
 */
const StrikesScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useStrikesScreen();
  useHideBottomBar();
  const title = t('marketplace.deals.strikes.title');
  const { strikes } = vm;

  if (vm.isLoading) {
    return (
      <Layout header={{ title }}>
        <Box gap="lg">
          <Skeleton width="100%" height={moderateScale(96)} borderRadius="xl" />
          <Skeleton width="100%" height={moderateScale(88)} borderRadius="xl" />
        </Box>
      </Layout>
    );
  }
  if (!strikes) {
    return (
      <Layout mode="static" header={{ title }}>
        <ErrorState error={vm.error} onRetry={vm.onRetry} title={t('marketplace.deals.strikes.loadFailed')} />
      </Layout>
    );
  }

  const refresh = <RefreshControl refreshing={vm.isRefreshing} onRefresh={vm.onRefresh} />;
  if (strikes.items.length === 0) {
    return (
      <Layout header={{ title }} scrollProps={{ refreshControl: refresh }}>
        <EmptyState
          icon={ShieldCheck}
          title={t('marketplace.deals.strikes.emptyTitle')}
          message={t('marketplace.deals.strikes.emptyBody')}
        />
      </Layout>
    );
  }

  return (
    <Layout header={{ title }} scrollProps={{ refreshControl: refresh }}>
      <StaggerIn gap="lg">
        <Box row align="center" gap="lg" p="lg" bg={colors.surface.main} borderRadius="xl" shadow="card">
          <Text variant="h1" color={colors.status.warning.text}>
            {formatNumber(strikes.activeCount)}
          </Text>
          <Box flex={1}>
            <Text variant="bodyMedium" color={colors.text.primary}>
              {t('marketplace.deals.strikes.active', { count: strikes.activeCount })}
            </Text>
          </Box>
        </Box>
        {strikes.items.map(strike => (
          <StrikeCard key={strike.id} strike={strike} now={vm.now} />
        ))}
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.deals.strikes.footnote', { days: strikes.windowDays })}
        </Text>
      </StaggerIn>
    </Layout>
  );
};

export const StrikesScreen = memo(StrikesScreenComponent);
