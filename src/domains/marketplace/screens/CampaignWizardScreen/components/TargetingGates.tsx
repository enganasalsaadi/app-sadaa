import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, ChipGroup, Text } from '@/shared/ui';
import { CAMPAIGN_GENDER } from '../../../types/campaign';
import { useCampaignWizard } from '../CampaignWizardContext';

const GENDER_KEY = {
  male: 'common.gender.male',
  female: 'common.gender.female',
} as const satisfies Record<(typeof CAMPAIGN_GENDER)[number], string>;

/** The gates on who may apply: gender and a follower floor. Nothing chosen = everyone. */
const TargetingGatesComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { values, requirements } = useCampaignWizard();
  const { followerPresets, setGenders, chooseFollowerFloor } = requirements;

  const genders = useMemo(
    () => CAMPAIGN_GENDER.map(gender => ({ value: gender, label: t(GENDER_KEY[gender]) })),
    [t],
  );
  const floors = useMemo(
    () =>
      followerPresets.map(floor => ({
        value: String(floor),
        label: `${formatNumber(floor, { notation: 'compact' })}+`,
      })),
    [followerPresets],
  );

  return (
    <Box gap="lg">
      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('marketplace.campaign.wizard.requirements.gates.gender')}
        </Text>
        <ChipGroup
          multiple
          items={genders}
          value={values.genders}
          onChange={setGenders}
          accessibilityLabel={t('marketplace.campaign.wizard.requirements.gates.gender')}
        />
      </Box>
      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('marketplace.campaign.wizard.requirements.gates.followers')}
        </Text>
        <ChipGroup
          items={floors}
          value={values.minFollowers === null ? null : String(values.minFollowers)}
          onChange={chooseFollowerFloor}
          accessibilityLabel={t('marketplace.campaign.wizard.requirements.gates.followers')}
        />
      </Box>
    </Box>
  );
};

export const TargetingGates = memo(TargetingGatesComponent);
