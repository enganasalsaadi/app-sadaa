import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';
import { MOCK_AVATAR_GROUP } from '../mockData';
import { buildMockDeal } from '../mockDeals';

const HOUR = 60 * 60 * 1000;

export const useDealCardDemo = () => {
  const { t } = useTranslation();
  const { info } = useToast();

  const deals = useMemo(() => {
    const now = Date.now();
    return {
      creating: buildMockDeal({
        id: 'demo-creating',
        status: 'in_progress',
        statusLabel: t('devShowcase.dealCard.statusInProgress'),
        stage: 'pending',
        title: t('devShowcase.sada.campaignTitle'),
        counterpart: t('devShowcase.sada.creatorName'),
        avatarUrl: MOCK_AVATAR_GROUP[0]?.uri,
        totalCents: 50000,
        itemsCount: 2,
        dueAt: now + 52 * HOUR,
        funded: true,
        shipping: true,
      }),
      offer: buildMockDeal({
        id: 'demo-offer',
        status: 'pending_influencer',
        statusLabel: t('devShowcase.dealCard.statusPending'),
        title: t('devShowcase.sada.campaignTitleAlt'),
        counterpart: t('devShowcase.sada.brandName'),
        totalCents: 15000,
        dueAt: now + 6 * HOUR,
      }),
      completed: buildMockDeal({
        id: 'demo-completed',
        status: 'completed',
        statusLabel: t('devShowcase.dealCard.statusCompleted'),
        title: t('devShowcase.sada.campaignTitle'),
        counterpart: t('devShowcase.sada.creatorName'),
        totalCents: 45000,
        funded: true,
      }),
    };
  }, [t]);

  const onPress = useCallback(() => info(t('devShowcase.dealCard.pressed')), [info, t]);
  return { deals, onPress };
};
