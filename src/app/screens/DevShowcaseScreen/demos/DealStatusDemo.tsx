import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, SectionHeader } from '@/shared/ui';
import { DEAL_STATUS, DealProgress, DealStatusPill } from '@/domains/marketplace';
import { MOCK_DEAL_DATES } from './mockData';

const DealStatusDemoComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box gap="xl">
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.dealStatus.pillsTitle')} />
        <Box row wrap gap="sm">
          {DEAL_STATUS.map(status => (
            <DealStatusPill key={status} status={status} />
          ))}
          <DealStatusPill status={null} />
        </Box>
        <DealStatusPill status="in_progress" size="sm" />
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.dealStatus.progressTitle')} />
        <DealProgress status="under_review" reachedAt={MOCK_DEAL_DATES} />
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.dealStatus.completedTitle')} />
        <DealProgress status="completed" />
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.dealStatus.disputedTitle')} />
        <DealProgress status="disputed" stoppedAt="in_progress" reachedAt={MOCK_DEAL_DATES} />
      </Box>
    </Box>
  );
};

export const DealStatusDemo = memo(DealStatusDemoComponent);
