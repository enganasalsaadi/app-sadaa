import React, { memo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { BottomSheet, Box, Checkbox, ChipGroup, CustomButton, FormSection, Notice, Pressable, Text } from '@/shared/ui';
import {
  APPLICANT_FOLLOWER_FLOORS,
  APPLICANT_SORT_LABEL,
  APPLICANT_STATUS_FILTERS,
  APPLICANT_STATUS_FILTER_LABEL,
} from '../../../constants/applicants';
import { APPLICANT_SORT } from '../../../types/campaign';
import type { ApplicantFilters, ApplicantSort } from '../../../types/campaign';
import type { ExploreFilterOptions } from '../../../types/explore';
import { useApplicantFilterDraft } from '../hooks/useApplicantFilterDraft';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

export interface ApplicantFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: ApplicantFilters;
  options: ExploreFilterOptions | undefined;
  optionsLoading: boolean;
  optionsError: boolean;
  onRetryOptions: () => void;
  onApply: (filters: ApplicantFilters) => void;
}

/**
 * Sort + filters on a working copy: nothing reaches the list until «Show results». The «Status»
 * row is where expired / rejected / not-selected applicants live (they are not tabs).
 */
const ApplicantFilterSheetComponent: React.FC<ApplicantFilterSheetProps> = ({
  visible,
  onClose,
  filters,
  options,
  optionsLoading,
  optionsError,
  onRetryOptions,
  onApply,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(({ spacing }) => ({
    scroll: { flexGrow: 0, flexShrink: 1 },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing['2xl'] },
  }));
  const { draft, set, toggleStatus, toggleFloor, reset } = useApplicantFilterDraft(filters, visible);
  const apply = useCallback(() => onApply(draft), [draft, onApply]);
  const setSort = useCallback((sort: string) => set('sort', sort as ApplicantSort), [set]);
  const setGovernorates = useCallback((value: string[]) => set('governorates', value), [set]);
  const setNiches = useCallback((value: string[]) => set('niches', value), [set]);
  const setInvited = useCallback((value: boolean) => set('invitedOnly', value), [set]);
  const loading = optionsLoading && !options;

  const sorts = APPLICANT_SORT.map(value => ({ value, label: t(APPLICANT_SORT_LABEL[value]) }));
  const statuses = APPLICANT_STATUS_FILTERS.map(value => ({ value, label: t(APPLICANT_STATUS_FILTER_LABEL[value]) }));
  const floors = APPLICANT_FOLLOWER_FLOORS.map(value => ({
    value: String(value),
    label: t('marketplace.campaign.applicants.filters.followersOption', { count: formatNumber(value, COMPACT) }),
  }));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Box row align="center" justify="space-between" px="lg" pb="sm">
        <Text variant="h4" accessibilityRole="header">
          {t('marketplace.campaign.applicants.filters.title')}
        </Text>
        <Pressable
          onPress={reset}
          minHeight={sizes.button.md}
          justify="center"
          px="sm"
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.campaign.applicants.filters.reset')}
        >
          <Text variant="bodyMedium" color={colors.interactive.text}>
            {t('marketplace.campaign.applicants.filters.reset')}
          </Text>
        </Pressable>
      </Box>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSection title={t('marketplace.campaign.applicants.filters.sort')}>
          <ChipGroup
            items={sorts}
            value={draft.sort}
            onChange={setSort}
            accessibilityLabel={t('marketplace.campaign.applicants.filters.sort')}
          />
        </FormSection>
        <FormSection title={t('marketplace.campaign.applicants.filters.status.title')}>
          <ChipGroup
            items={statuses}
            value={draft.status}
            onChange={toggleStatus}
            accessibilityLabel={t('marketplace.campaign.applicants.filters.status.title')}
          />
        </FormSection>
        {optionsError ? (
          <Notice
            tone="danger"
            message={t('marketplace.campaign.applicants.filters.optionsFailed')}
            action={{ label: t('common.retry'), onPress: onRetryOptions }}
          />
        ) : null}
        <FormSection title={t('marketplace.campaign.applicants.filters.governorate')}>
          <ChipGroup
            multiple
            items={options?.governorates ?? []}
            value={draft.governorates}
            onChange={setGovernorates}
            loading={loading}
            accessibilityLabel={t('marketplace.campaign.applicants.filters.governorate')}
          />
        </FormSection>
        <FormSection title={t('marketplace.campaign.applicants.filters.niche')}>
          <ChipGroup
            multiple
            items={options?.niches ?? []}
            value={draft.niches}
            onChange={setNiches}
            loading={loading}
            accessibilityLabel={t('marketplace.campaign.applicants.filters.niche')}
          />
        </FormSection>
        <FormSection title={t('marketplace.campaign.applicants.filters.followers')}>
          <ChipGroup
            items={floors}
            value={draft.minFollowers === null ? null : String(draft.minFollowers)}
            onChange={toggleFloor}
            accessibilityLabel={t('marketplace.campaign.applicants.filters.followers')}
          />
        </FormSection>
        <Checkbox
          label={t('marketplace.campaign.applicants.filters.invitedOnly')}
          checked={draft.invitedOnly}
          onChange={setInvited}
        />
      </ScrollView>
      <Box px="lg" pt="md" pb="lg">
        <CustomButton title={t('marketplace.campaign.applicants.filters.apply')} onPress={apply} fullWidth />
      </Box>
    </BottomSheet>
  );
};

export const ApplicantFilterSheet = memo(ApplicantFilterSheetComponent);
