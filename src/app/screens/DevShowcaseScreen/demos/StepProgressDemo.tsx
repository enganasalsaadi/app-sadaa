import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomButton, StepProgress } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import {
  STEP_DEMO_TOTAL,
  useStepProgressDemo,
} from './hooks/useStepProgressDemo';

const StepProgressDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { current, next, prev } = useStepProgressDemo();
  const label = t('devShowcase.stepProgress.label', {
    current,
    total: STEP_DEMO_TOTAL,
  });

  return (
    <Box gap="lg">
      <StepProgress
        current={current}
        total={STEP_DEMO_TOTAL}
        accessibilityLabel={label}
      />
      <Box p="lg" borderRadius="lg" bg={colors.brand.main}>
        <StepProgress
          current={current}
          total={STEP_DEMO_TOTAL}
          tone="onBrand"
          accessibilityLabel={label}
        />
      </Box>
      <Box row gap="sm">
        <CustomButton
          title={t('common.back')}
          onPress={prev}
          variant="outline"
          size="sm"
        />
        <CustomButton
          title={t('common.next')}
          onPress={next}
          variant="secondary"
          size="sm"
        />
      </Box>
    </Box>
  );
};

export const StepProgressDemo = memo(StepProgressDemoComponent);
