import React, { memo, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { LookupItem } from '@/core/api';
import { useStyles, useTheme } from '@/core/theme';
import { BottomSheet, Box, ChipGroup, CustomButton, FormSection, Notice, Pressable, Text } from '@/shared/ui';
import { OPPORTUNITY_PRICING_LABEL } from '../constants/opportunities';
import { useOpportunityFilterDraft } from '../hooks/useOpportunityFilterDraft';
import { CAMPAIGN_PRICING_MODEL } from '../types/campaign';
import type { CampaignPricingModel, CreatorFeedArgs } from '../types/campaign';
import { isActivityType } from '../utils/opportunities';

export interface OpportunityFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: CreatorFeedArgs;
  /** Activity types the server lists (labels from `/lookups`). */
  activityOptions: readonly LookupItem[];
  activityLoading: boolean;
  activityFailed: boolean;
  onRetryActivities: () => void;
  onApply: (filters: CreatorFeedArgs) => void;
}

const isPricing = (value: string): value is CampaignPricingModel =>
  (CAMPAIGN_PRICING_MODEL as readonly string[]).includes(value);

/** The two filters the server knows: campaign type (several) and pricing (one), applied together on «Show results». */
const OpportunityFilterSheetComponent: React.FC<OpportunityFilterSheetProps> = ({
  visible,
  onClose,
  filters,
  activityOptions,
  activityLoading,
  activityFailed,
  onRetryActivities,
  onApply,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(({ spacing }) => ({
    scroll: { flexGrow: 0, flexShrink: 1 },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing['2xl'] },
  }));
  const { draft, setActivityTypes, togglePricing, reset } = useOpportunityFilterDraft(filters, visible);
  const apply = useCallback(() => onApply(draft), [draft, onApply]);
  const changeActivities = useCallback(
    (values: string[]) => setActivityTypes(values.filter(isActivityType)),
    [setActivityTypes],
  );
  const changePricing = useCallback(
    (value: string) => {
      if (isPricing(value)) togglePricing(value);
    },
    [togglePricing],
  );
  const pricing = CAMPAIGN_PRICING_MODEL.map(value => ({ value, label: t(OPPORTUNITY_PRICING_LABEL[value]) }));

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Box row align="center" justify="space-between" px="lg" pb="sm">
        <Text variant="h4" accessibilityRole="header">
          {t('marketplace.campaign.feed.filters.title')}
        </Text>
        <Pressable
          onPress={reset}
          minHeight={sizes.button.md}
          justify="center"
          px="sm"
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.campaign.feed.filters.reset')}
        >
          <Text variant="bodyMedium" color={colors.interactive.text}>
            {t('marketplace.campaign.feed.filters.reset')}
          </Text>
        </Pressable>
      </Box>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSection title={t('marketplace.campaign.feed.filters.activity')}>
          {activityFailed ? (
            <Notice
              tone="danger"
              message={t('marketplace.campaign.feed.filters.activityFailed')}
              action={{ label: t('common.retry'), onPress: onRetryActivities }}
            />
          ) : (
            <ChipGroup
              multiple
              items={activityOptions}
              value={draft.activityTypes ?? []}
              onChange={changeActivities}
              loading={activityLoading}
              accessibilityLabel={t('marketplace.campaign.feed.filters.activity')}
            />
          )}
        </FormSection>
        <FormSection title={t('marketplace.campaign.feed.filters.pricing')}>
          <ChipGroup
            items={pricing}
            value={draft.pricingModel ?? null}
            onChange={changePricing}
            accessibilityLabel={t('marketplace.campaign.feed.filters.pricing')}
          />
        </FormSection>
      </ScrollView>
      <Box px="lg" pt="md" pb="lg">
        <CustomButton title={t('marketplace.campaign.feed.filters.apply')} onPress={apply} fullWidth />
      </Box>
    </BottomSheet>
  );
};

export const OpportunityFilterSheet = memo(OpportunityFilterSheetComponent);
