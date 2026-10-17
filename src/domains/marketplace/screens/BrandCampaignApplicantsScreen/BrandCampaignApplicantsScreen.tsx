import React, { memo, useCallback, useMemo } from 'react';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Users } from 'lucide-react-native';
import { useStyles } from '@/core/theme';
import { Box, Chip, ChipRow, Layout, SuperList } from '@/shared/ui';
import type { EmptyStateAction, LayoutHeaderConfig } from '@/shared/ui';
import { useJSScrollHandler } from '@/shared/context/ScrollContext';
import { ApplicantCard } from '../../components/ApplicantCard';
import { ApplicantSeatRail } from '../../components/ApplicantSeatRail';
import type { ApplicantCard as Applicant } from '../../types/campaign';
import { ApplicantFilterChip } from './components/ApplicantFilterChip';
import { ApplicantFilterSheet } from './components/ApplicantFilterSheet';
import { ApplicantTabs } from './components/ApplicantTabs';
import { ApplicantsSkeleton } from './components/ApplicantsSkeleton';
import { useBrandCampaignApplicantsScreen } from './hooks/useBrandCampaignApplicantsScreen';

const keyExtractor = (applicant: Applicant) => applicant.id;

/**
 * Brand «recruiting table» (PC3.1, approved 2026-10-17): the seats and the wallet that pays for the
 * next pick on top, the three tabs (new · shortlisted · selected) with their server counts, the
 * filters as chips, and the applicants as photo-led cards that show how long each one is still open.
 */
const BrandCampaignApplicantsScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const onScroll = useJSScrollHandler();
  const vm = useBrandCampaignApplicantsScreen();
  const { sheet } = vm;
  const openSheet = sheet.open;
  const styles = useStyles(({ spacing }) => ({
    list: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing['7xl'] * 1.5 },
    item: { paddingBottom: spacing.lg },
    rail: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
    tabs: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  }));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Applicant>) => (
      <Box style={styles.item}>
        <ApplicantCard applicant={item} />
      </Box>
    ),
    [styles.item],
  );

  const emptyAction = useMemo<EmptyStateAction | undefined>(
    () => (vm.emptyActionLabel ? { label: vm.emptyActionLabel, onPress: vm.clearFilters } : undefined),
    [vm.clearFilters, vm.emptyActionLabel],
  );

  const header = useMemo<LayoutHeaderConfig>(
    () => ({
      title: t('marketplace.campaign.applicants.title'),
      subtitle: vm.campaignTitle,
      actions: [
        {
          icon: SlidersHorizontal,
          accessibilityLabel: t('marketplace.campaign.applicants.filters.title'),
          onPress: openSheet,
          badge: vm.activeFilters > 0 ? vm.activeFilters : undefined,
        },
      ],
    }),
    [openSheet, t, vm.activeFilters, vm.campaignTitle],
  );

  return (
    <Layout mode="static" padding="none" header={header}>
      <Box style={styles.rail}>
        <ApplicantSeatRail
          total={vm.seatsTotal}
          occupied={vm.seatsOccupied}
          faces={vm.faces}
          balance={vm.balance}
          onWallet={vm.openWallet}
        />
      </Box>
      <Box style={styles.tabs}>
        <ApplicantTabs tabs={vm.tabs} active={vm.activeTab} onChange={vm.setTab} />
      </Box>
      <ChipRow accessibilityLabel={t('marketplace.campaign.applicants.filters.title')}>
        <Chip
          label={vm.sortLabel}
          value="sort"
          icon={SlidersHorizontal}
          dropdown
          onSelect={openSheet}
          accessibilityLabel={t('marketplace.campaign.applicants.filters.sort')}
        />
        {vm.chips.map(chip => (
          <ApplicantFilterChip key={chip.key} chipKey={chip.key} label={chip.label} onClear={vm.clearChip} />
        ))}
      </ChipRow>
      <SuperList
        key={`${vm.activeTab ?? 'filtered'}`}
        data={vm.applicants}
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
        emptyIcon={Users}
        emptyMessage={vm.emptyTitle}
        emptyDescription={vm.emptyHint}
        emptyAction={emptyAction}
        errorMessage={t('marketplace.campaign.applicants.loadFailed')}
        ListSkeletonComponent={<ApplicantsSkeleton />}
        contentContainerStyle={styles.list}
        onScroll={onScroll}
      />
      <ApplicantFilterSheet
        visible={sheet.visible}
        onClose={sheet.close}
        filters={vm.filters}
        options={sheet.options}
        optionsLoading={sheet.optionsLoading}
        optionsError={sheet.optionsError}
        onRetryOptions={sheet.retryOptions}
        onApply={sheet.apply}
      />
    </Layout>
  );
};

export const BrandCampaignApplicantsScreen = memo(BrandCampaignApplicantsScreenComponent);
