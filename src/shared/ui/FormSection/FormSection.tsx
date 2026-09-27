import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export interface FormSectionProps {
  title: string;
  /** Muted tag next to the title (e.g. "Optional"). */
  tag?: string;
  description?: string;
  /** Validation message for the whole group (chip groups have no own error slot). */
  error?: string;
  children: React.ReactNode;
}

/** Groups related fields under one heading (field-grouping, rule 05 forms). */
const FormSectionComponent: React.FC<FormSectionProps> = ({
  title,
  tag,
  description,
  error,
  children,
}) => {
  const { colors } = useTheme();

  return (
    <Box gap="md">
      <Box gap="xs">
        <Box row align="center" gap="sm">
          <Text variant="title" accessibilityRole="header">
            {title}
          </Text>
          {tag ? (
            <Box px="sm" py="xs" borderRadius="full" bg={colors.status.neutral.soft}>
              <Text variant="caption" color={colors.status.neutral.text}>
                {tag}
              </Text>
            </Box>
          ) : null}
        </Box>
        {description ? (
          <Text variant="bodySmall" color={colors.text.secondary}>
            {description}
          </Text>
        ) : null}
      </Box>
      {children}
      {error ? (
        <Text
          variant="caption"
          color={colors.status.danger.text}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </Box>
  );
};

export const FormSection = memo(FormSectionComponent);
