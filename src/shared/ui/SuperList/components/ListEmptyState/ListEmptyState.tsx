import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { CustomButton } from '../../../CustomButton';

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
  const { colors } = useTheme();

  const displayMessage = message ?? (isError ? t('errors.generic') : t('common.noResults'));

  return (
    <Box flex={1} align="center" justify="center" py="6xl" px="2xl">
      <Text variant="body" color={colors.text.secondary} align="center">
        {displayMessage}
      </Text>
      {isError && onRetry && (
        <Box mt="lg" width={160}>
          <CustomButton
            title={t('common.retry')}
            onPress={onRetry}
            variant="primary"
            size="sm"
          />
        </Box>
      )}
    </Box>
  );
};
