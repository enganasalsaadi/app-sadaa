import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, ChipGroup, InlineError, Text } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';

/** Cities and niches the brand prefers: they lift matching creators in the feed but never keep anyone out. */
const TargetingRankingComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { values, requirements } = useCampaignWizard();
  const { governorates, governoratesLoading, niches, nichesLoading, nicheMax, setCities, setNiches, targetingError } =
    requirements;

  return (
    <Box gap="lg">
      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('marketplace.campaign.wizard.requirements.ranking.cities')}
        </Text>
        <ChipGroup
          multiple
          items={governorates}
          value={values.cities}
          onChange={setCities}
          loading={governoratesLoading}
          accessibilityLabel={t('marketplace.campaign.wizard.requirements.ranking.cities')}
        />
      </Box>
      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('marketplace.campaign.wizard.requirements.ranking.niches', { max: nicheMax })}
        </Text>
        <ChipGroup
          multiple
          items={niches}
          value={values.niches}
          onChange={setNiches}
          max={nicheMax}
          loading={nichesLoading}
          accessibilityLabel={t('marketplace.campaign.wizard.requirements.ranking.niches', { max: nicheMax })}
        />
      </Box>
      {targetingError ? <InlineError error={targetingError} /> : null}
    </Box>
  );
};

export const TargetingRanking = memo(TargetingRankingComponent);
