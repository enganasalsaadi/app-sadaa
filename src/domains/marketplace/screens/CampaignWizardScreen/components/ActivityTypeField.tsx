import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ChipGroup, CustomButton, InlineError } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';

/** The campaign's activity type as chips (labels come from `/lookups`); tapping the chosen one clears it. */
const ActivityTypeFieldComponent: React.FC = () => {
  const { t } = useTranslation();
  const {
    values,
    activityOptions,
    activityLoading,
    activityFailed,
    reloadActivities,
    activityError,
    chooseActivity,
  } = useCampaignWizard();

  if (activityFailed) {
    return (
      <Box gap="sm" align="flex-start">
        <InlineError error={t('marketplace.campaign.wizard.idea.activity.failed')} />
        <CustomButton
          title={t('marketplace.campaign.wizard.strip.retry')}
          variant="outline"
          size="sm"
          onPress={reloadActivities}
        />
      </Box>
    );
  }

  return (
    <Box gap="sm">
      <ChipGroup
        items={activityOptions}
        value={values.activityType}
        onChange={chooseActivity}
        loading={activityLoading}
        accessibilityLabel={t('marketplace.campaign.wizard.idea.activity.label')}
      />
      {activityError ? <InlineError error={activityError} /> : null}
    </Box>
  );
};

export const ActivityTypeField = memo(ActivityTypeFieldComponent);
