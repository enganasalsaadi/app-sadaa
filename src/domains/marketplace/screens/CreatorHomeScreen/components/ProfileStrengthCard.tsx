import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { Box, Card, ListRow, ProgressBar } from '@/shared/ui';
import type { ProfileStepTarget } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';

interface ProfileStrengthCardProps {
  completion: CreatorHomeScreenModel['completion'];
  onStepPress: (target: ProfileStepTarget) => void;
}

const percent = (value: number) => formatNumber(value / 100, { style: 'percent' });

/** Completion bar + the one next step; the full rail stays on Profile. Hidden at 100%. */
const ProfileStrengthCardComponent: React.FC<ProfileStrengthCardProps> = ({
  completion,
  onStepPress,
}) => {
  const { t } = useTranslation();
  const { nextStep } = completion;
  const target = nextStep?.meta.target ?? null;
  const handleStep = useCallback(() => {
    if (target) onStepPress(target);
  }, [onStepPress, target]);

  return (
    <Card shadow="none" p="lg">
      <Box gap="md">
        <ProgressBar
          value={completion.percentage / 100}
          label={t('marketplace.creatorHome.strength.title')}
          valueLabel={percent(completion.percentage)}
          accessibilityLabel={t('marketplace.creatorHome.strength.title')}
        />
        {nextStep ? (
          <ListRow
            icon={nextStep.meta.icon}
            title={t(nextStep.meta.titleKey)}
            subtitle={t('marketplace.creatorHome.strength.nextStep')}
            value={`+${percent(nextStep.points)}`}
            onPress={handleStep}
          />
        ) : null}
      </Box>
    </Card>
  );
};

export const ProfileStrengthCard = memo(ProfileStrengthCardComponent);
