import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Countdown } from '@/shared/ui';
import { useCountdownDemo } from './hooks/useCountdownDemo';

const CountdownDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const deadlines = useCountdownDemo();

  return (
    <Box gap="sm">
      <Countdown endsAt={deadlines.days} label={t('devShowcase.countdown.draftDue')} />
      <Countdown endsAt={deadlines.hours} label={t('devShowcase.countdown.reviewWindow')} />
      <Countdown endsAt={deadlines.minutes} />
      <Countdown endsAt={deadlines.expired} label={t('devShowcase.countdown.offer')} />
      <Countdown endsAt={deadlines.days} size="sm" />
    </Box>
  );
};

export const CountdownDemo = memo(CountdownDemoComponent);
