import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX, type LucideIcon } from 'lucide-react-native';
import { EmptyState, ErrorState } from '../../../EmptyState';

interface ListEmptyStateProps {
  isError?: boolean;
  message?: string;
  icon?: LucideIcon;
  onRetry?: () => void;
}

export const ListEmptyState: React.FC<ListEmptyStateProps> = ({
  isError = false,
  message,
  icon = SearchX,
  onRetry,
}) => {
  const { t } = useTranslation();

  return isError ? (
    <ErrorState error={message} onRetry={onRetry} />
  ) : (
    <EmptyState icon={icon} title={message ?? t('common.noResults')} />
  );
};
