import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/core/i18n';
import { Box, SectionHeader, Timeline } from '@/shared/ui';
import type { TimelineStep } from '@/shared/ui';
import { MOCK_DEAL_DATES } from './mockData';

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

const TimelineDemoComponent: React.FC = () => {
  const { t, i18n } = useTranslation();

  const { progress, failed } = useMemo(() => {
    const date = (at: number) => formatDate(at, DATE_FORMAT, i18n.language);
    const brief: TimelineStep = { key: 'brief', title: t('devShowcase.timeline.brief'), caption: date(MOCK_DEAL_DATES.pending_approval), state: 'done' };
    const paid: TimelineStep = { key: 'paid', title: t('devShowcase.timeline.paid'), caption: date(MOCK_DEAL_DATES.awaiting_payment), state: 'done' };
    return {
      progress: [
        brief,
        paid,
        { key: 'draft', title: t('devShowcase.timeline.draft'), caption: t('devShowcase.timeline.draftCaption'), state: 'current' },
        { key: 'publish', title: t('devShowcase.timeline.publish'), state: 'upcoming' },
      ] satisfies TimelineStep[],
      failed: [
        brief,
        paid,
        { key: 'failed', title: t('devShowcase.timeline.failed'), caption: date(MOCK_DEAL_DATES.under_review), state: 'error' },
      ] satisfies TimelineStep[],
    };
  }, [t, i18n.language]);

  return (
    <Box gap="lg">
      <Timeline steps={progress} />
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.timeline.errorTitle')} />
        <Timeline steps={failed} />
      </Box>
    </Box>
  );
};

export const TimelineDemo = memo(TimelineDemoComponent);
