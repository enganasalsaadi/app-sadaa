import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react-native';
import { EmptyState, ErrorState } from '../../../EmptyState';

interface ListEmptyStateProps {
  isError?: boolean;
  message?: string;
  onRetry?: () => void;
}

export const ListEmptyState: React.FC<ListEmptyStateProps> = ({
  isError = false,
  message,
  onRetry,
}) => {
  const { t } = useTranslation();

  return isError ? (
    <ErrorState error={message} onRetry={onRetry} />
  ) : (
    <EmptyState icon={SearchX} title={message ?? t('common.noResults')} />
  );
};
