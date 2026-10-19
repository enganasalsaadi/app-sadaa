import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { LookupItem } from '@/core/api';
import { useTheme } from '@/core/theme';
import { ChipGroup, CustomButton, FormSection, Notice, Pressable, SheetFrame, Text } from '@/shared/ui';
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
    <SheetFrame
      visible={visible}
      onClose={onClose}
      title={t('marketplace.campaign.feed.filters.title')}
      gap="2xl"
      action={
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
      }
      footer={<CustomButton title={t('marketplace.campaign.feed.filters.apply')} onPress={apply} fullWidth />}
    >
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
    </SheetFrame>
  );
};

export const OpportunityFilterSheet = memo(OpportunityFilterSheetComponent);
