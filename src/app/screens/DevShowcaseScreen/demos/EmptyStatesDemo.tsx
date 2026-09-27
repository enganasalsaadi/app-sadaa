import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Inbox, Megaphone } from 'lucide-react-native';
import { Box, Divider, EmptyState, ErrorState } from '@/shared/ui';
import { useEmptyStatesDemo } from './hooks/useEmptyStatesDemo';

const EmptyStatesDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useEmptyStatesDemo();
  const serverError = useMemo(
    () => new Error(t('devShowcase.emptyStates.errorMessage')),
    [t],
  );

  return (
    <Box>
      <EmptyState
        icon={Megaphone}
        title={t('devShowcase.emptyStates.campaignsTitle')}
        message={t('devShowcase.emptyStates.campaignsMessage')}
        action={{ label: t('devShowcase.emptyStates.create'), onPress: demo.create }}
      />
      <Divider />
      <EmptyState icon={Inbox} title={t('devShowcase.emptyStates.inboxTitle')} />
      <Divider />
      <ErrorState error={serverError} onRetry={demo.retry} retrying={demo.retrying} />
      <Divider />
      <ErrorState />
    </Box>
  );
};

export const EmptyStatesDemo = memo(EmptyStatesDemoComponent);
