import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SegmentedOption } from '@/shared/ui';

type DealView = 'active' | 'completed';
type Period = 'week' | 'month' | 'year';

export const useSegmentedControlDemo = () => {
  const { t } = useTranslation();
  const [dealView, setDealView] = useState<DealView>('active');
  const [period, setPeriod] = useState<Period>('month');

  const dealOptions = useMemo<SegmentedOption<DealView>[]>(
    () => [
      { value: 'active', label: t('devShowcase.segmented.active') },
      { value: 'completed', label: t('devShowcase.segmented.completed') },
    ],
    [t],
  );
  const periodOptions = useMemo<SegmentedOption<Period>[]>(
    () => [
      { value: 'week', label: t('devShowcase.segmented.week') },
      { value: 'month', label: t('devShowcase.segmented.month') },
      { value: 'year', label: t('devShowcase.segmented.year') },
    ],
    [t],
  );

  return { dealView, setDealView, dealOptions, period, setPeriod, periodOptions };
};
