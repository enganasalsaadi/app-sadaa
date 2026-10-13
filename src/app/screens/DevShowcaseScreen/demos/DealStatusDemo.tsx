import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, SectionHeader } from '@/shared/ui';
import { DEAL_STATUS, DealProgress, DealStatusPill } from '@/domains/marketplace';

const DealStatusDemoComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box gap="xl">
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.dealStatus.pillsTitle')} />
        <Box row wrap gap="sm">
          {DEAL_STATUS.map(status => (
            <DealStatusPill key={status} status={{ key: status, label: status }} />
          ))}
          <DealStatusPill status={{ key: null, label: 'on_hold' }} />
        </Box>
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.dealStatus.progressTitle')} />
        <DealProgress status="in_progress" stage="draft_submitted" hasShipping />
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.dealStatus.completedTitle')} />
        <DealProgress status="completed" stage={null} hasShipping={false} />
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.dealStatus.disputedTitle')} />
        <DealProgress status="disputed" stage="revision_requested" hasShipping={false} frozenFrom="in_progress" />
      </Box>
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.dealStatus.trackTitle')} />
        <DealProgress status="product_shipping" stage={null} hasShipping variant="track" />
        <DealProgress status="in_progress" stage="verifying_live" hasShipping={false} variant="track" />
      </Box>
    </Box>
  );
};

export const DealStatusDemo = memo(DealStatusDemoComponent);
