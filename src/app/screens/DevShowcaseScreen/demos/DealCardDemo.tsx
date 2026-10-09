import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@/shared/ui';
import { DealCard } from '@/domains/marketplace';
import { useDealCardDemo } from './hooks/useDealCardDemo';
import { MOCK_AVATAR_GROUP, MOCK_DEAL_SUMMARY } from './mockData';

const DealCardDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { dueAt, onPress } = useDealCardDemo();

  return (
    <Box gap="md">
      <DealCard
        title={t('devShowcase.sada.campaignTitle')}
        counterpartName={t('devShowcase.sada.creatorName')}
        counterpartAvatarUri={MOCK_AVATAR_GROUP[0]?.uri}
        adTypeLabel={t('devShowcase.sada.adReel')}
        amount={MOCK_DEAL_SUMMARY.budget}
        status="in_progress"
        dueAt={dueAt.draft}
        dueLabel={t('devShowcase.countdown.draftDue')}
        showProgress
        escrow={MOCK_DEAL_SUMMARY.upfront}
        onPress={onPress}
      />
      <DealCard
        title={t('devShowcase.sada.campaignTitleAlt')}
        counterpartName={t('devShowcase.sada.brandName')}
        adTypeLabel={t('devShowcase.sada.adStory')}
        amount={MOCK_DEAL_SUMMARY.upfront}
        status="under_review"
        dueAt={dueAt.review}
        dueLabel={t('devShowcase.countdown.reviewWindow')}
        onPress={onPress}
      />
      <DealCard
        title={t('devShowcase.sada.campaignTitle')}
        counterpartName={t('devShowcase.sada.creatorName')}
        adTypeLabel={t('devShowcase.sada.adReel')}
        amount={MOCK_DEAL_SUMMARY.payout}
        status="completed"
        onPress={onPress}
      />
    </Box>
  );
};

export const DealCardDemo = memo(DealCardDemoComponent);
