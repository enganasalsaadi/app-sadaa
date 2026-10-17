import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GitCompare } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, EmptyState, ErrorState, Layout, StaggerIn, Text } from '@/shared/ui';
import { CompareFaces } from './components/CompareFaces';
import { CompareRowView } from './components/CompareRowView';
import { CompareSkeleton } from './components/CompareSkeleton';
import { useBrandCampaignCompareScreen } from './hooks/useBrandCampaignCompareScreen';

/**
 * Up to three waiting applicants side by side (PC3.3, approved 2026-10-17): their faces stay pinned
 * while the rows scroll (price as the server sends it, total reach, rating, deals, accounts, city).
 * The lead of each numeric row is marked, with a word as well as a tint; picking one to select
 * joins this page in PC3.4.
 */
const BrandCampaignCompareScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useBrandCampaignCompareScreen();
  const title = t('marketplace.campaign.applicants.compare.result.title');

  if (vm.isLoading) return <CompareSkeleton />;
  if (vm.isError) {
    return (
      <Layout mode="static" header={{ title }}>
        <ErrorState
          error={vm.error}
          onRetry={vm.onRetry}
          title={t('marketplace.campaign.applicants.compare.result.loadFailed')}
        />
      </Layout>
    );
  }
  if (vm.tooFew) {
    return (
      <Layout mode="static" header={{ title }}>
        <EmptyState
          icon={GitCompare}
          title={t('marketplace.campaign.applicants.compare.result.tooFew.title')}
          message={t('marketplace.campaign.applicants.compare.result.tooFew.hint')}
          action={{ label: t('common.back'), onPress: vm.goBack }}
        />
      </Layout>
    );
  }

  return (
    <Layout
      header={{ title }}
      sticky={<CompareFaces cards={vm.cards} onOpen={vm.openApplicant} />}
      scrollProps={{
        refreshControl: <RefreshControl refreshing={vm.isRefreshing} onRefresh={vm.onRefresh} tintColor={colors.text.secondary} />,
      }}
    >
      <StaggerIn gap="lg">
        {vm.rows.map(row => (
          <CompareRowView key={row.key} row={row} />
        ))}
        <Box align="center">
          <Text variant="caption" color={colors.text.secondary} align="center">
            {t('marketplace.campaign.applicants.compare.result.openHint')}
          </Text>
        </Box>
      </StaggerIn>
    </Layout>
  );
};

export const BrandCampaignCompareScreen = memo(BrandCampaignCompareScreenComponent);
