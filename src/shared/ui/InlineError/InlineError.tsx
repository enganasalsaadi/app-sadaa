import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import type { SpacingToken } from '@/core/theme/types';
import { Card, Text } from '../primitives';

export interface InlineErrorProps {
  error?: string | Error | { message: string } | unknown;
  mb?: SpacingToken;
}

const extractMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
};

export const InlineError: React.FC<InlineErrorProps> = ({ error, mb }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (!error) return null;

  const message = extractMessage(error, t('errors.generic'));

  return (
    <Card
      p="md"
      mb={mb}
      bg={colors.status.danger.soft}
      shadow="none"
      borderWidth="none"
    >
      <Text
        variant="bodySmall"
        color={colors.status.danger.text}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        {message}
      </Text>
    </Card>
  );
};
