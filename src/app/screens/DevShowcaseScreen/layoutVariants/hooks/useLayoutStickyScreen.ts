import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SegmentedOption } from '@/shared/ui';

type CampaignFilter = 'all' | 'open' | 'closed';

export const useLayoutStickyScreen = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<CampaignFilter>('all');

  const options = useMemo<SegmentedOption<CampaignFilter>[]>(
    () => [
      { value: 'all', label: t('devShowcase.layoutGallery.filterAll') },
      { value: 'open', label: t('devShowcase.layoutGallery.filterOpen') },
      { value: 'closed', label: t('devShowcase.layoutGallery.filterClosed') },
    ],
    [t],
  );

  return { filter, setFilter, options };
};
