import React, { memo } from 'react';
import { CloudOff } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '@/shared/utils';
import { EmptyState } from './EmptyState';

export interface ErrorStateProps {
  /** Anything thrown or returned by RTK Query; its message becomes the body. */
  error?: unknown;
  onRetry?: () => void;
  retrying?: boolean;
  title?: string;
}

/** Full-area failure (400/404 on a whole screen or list). A failed field or section → `InlineError`. */
const ErrorStateComponent: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  retrying,
  title,
}) => {
  const { t } = useTranslation();
  const heading = title ?? t('errors.generic');
  const message = getErrorMessage(error, heading);

  return (
    <EmptyState
      icon={CloudOff}
      tone="danger"
      title={heading}
      message={message === heading ? undefined : message}
      action={
        onRetry
          ? {
              label: t('common.retry'),
              onPress: onRetry,
              variant: 'secondary',
              loading: retrying,
            }
          : undefined
      }
    />
  );
};

export const ErrorState = memo(ErrorStateComponent);
