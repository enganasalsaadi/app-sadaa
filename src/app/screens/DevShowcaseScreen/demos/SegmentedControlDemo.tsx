import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, SegmentedControl } from '@/shared/ui';
import { useSegmentedControlDemo } from './hooks/useSegmentedControlDemo';

const SegmentedControlDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useSegmentedControlDemo();

  return (
    <Box gap="lg">
      <SegmentedControl
        options={demo.dealOptions}
        value={demo.dealView}
        onChange={demo.setDealView}
        accessibilityLabel={t('devShowcase.segmented.dealsLabel')}
      />
      <SegmentedControl
        options={demo.periodOptions}
        value={demo.period}
        onChange={demo.setPeriod}
        accessibilityLabel={t('devShowcase.segmented.periodLabel')}
      />
      <SegmentedControl
        options={demo.periodOptions}
        value={demo.period}
        onChange={demo.setPeriod}
        accessibilityLabel={t('devShowcase.segmented.periodLabel')}
        disabled
      />
    </Box>
  );
};

export const SegmentedControlDemo = memo(SegmentedControlDemoComponent);
