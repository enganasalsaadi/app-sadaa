import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { ApplicantTab } from '../../../constants/applicants';
import type { ApplicantTabOption } from '../hooks/useBrandCampaignApplicantsScreen';

export interface ApplicantTabsProps {
  tabs: readonly ApplicantTabOption[];
  /** `null` while a status filter (expired, rejected…) stands in for the tabs. */
  active: ApplicantTab | null;
  onChange: (tab: ApplicantTab) => void;
}

const TabItem = memo<{ tab: ApplicantTabOption; selected: boolean; onSelect: (tab: ApplicantTab) => void }>(
  ({ tab, selected, onSelect }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const styles = useStyles(
      ({ radii, spacing }): Record<'bar', ViewStyle> => ({
        bar: { height: spacing.xs, borderRadius: radii.full, backgroundColor: colors.interactive.main },
      }),
      [colors.interactive.main],
    );
    const press = useCallback(() => onSelect(tab.value), [onSelect, tab.value]);
    const ink = selected ? colors.text.primary : colors.text.tertiary;
    return (
      <Pressable
        onPress={press}
        flex={1}
        gap="xs"
        pt="xs"
        pb="sm"
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        accessibilityLabel={
          tab.count === null
            ? tab.label
            : t('marketplace.campaign.applicants.tabs.a11y', { label: tab.label, count: tab.count })
        }
      >
        <Text variant="amountLarge" color={ink}>
          {tab.count === null ? '–' : formatNumber(tab.count)}
        </Text>
        <Text variant={selected ? 'bodyMedium' : 'body'} color={ink}>
          {tab.label}
        </Text>
        {selected ? <Box style={styles.bar} /> : null}
      </Pressable>
    );
  },
);

/** The three groups as big numerals (the counts are the point: how many wait, how many are kept, how many are in). */
const ApplicantTabsComponent: React.FC<ApplicantTabsProps> = ({ tabs, active, onChange }) => {
  const { t } = useTranslation();
  return (
    <Box row gap="md" px="xl" pt="md" accessibilityRole="tablist" accessibilityLabel={t('marketplace.campaign.applicants.tabs.label')}>
      {tabs.map(tab => (
        <TabItem key={tab.value} tab={tab} selected={tab.value === active} onSelect={onChange} />
      ))}
    </Box>
  );
};

export const ApplicantTabs = memo(ApplicantTabsComponent);
