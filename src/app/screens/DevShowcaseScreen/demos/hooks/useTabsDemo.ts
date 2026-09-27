import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TabItem } from '@/shared/ui';

type InboxTab = 'offers' | 'drafts' | 'archive';
type NicheTab = 'all' | 'fashion' | 'food' | 'tech' | 'travel' | 'beauty';

const DEMO_OFFER_COUNT = 3;
const DEMO_DRAFT_COUNT = 12;

export const useTabsDemo = () => {
  const { t } = useTranslation();
  const [inboxTab, setInboxTab] = useState<InboxTab>('offers');
  const [nicheTab, setNicheTab] = useState<NicheTab>('all');

  const inboxItems = useMemo<TabItem<InboxTab>[]>(
    () => [
      { value: 'offers', label: t('devShowcase.tabs.offers'), count: DEMO_OFFER_COUNT },
      { value: 'drafts', label: t('devShowcase.tabs.drafts'), count: DEMO_DRAFT_COUNT },
      { value: 'archive', label: t('devShowcase.tabs.archive') },
    ],
    [t],
  );
  const nicheItems = useMemo<TabItem<NicheTab>[]>(
    () => [
      { value: 'all', label: t('devShowcase.tabs.all') },
      { value: 'fashion', label: t('devShowcase.chips.fashion') },
      { value: 'food', label: t('devShowcase.chips.food') },
      { value: 'tech', label: t('devShowcase.chips.tech') },
      { value: 'travel', label: t('devShowcase.chips.travel') },
      { value: 'beauty', label: t('devShowcase.chips.beauty') },
    ],
    [t],
  );

  return { inboxTab, setInboxTab, inboxItems, nicheTab, setNicheTab, nicheItems };
};
