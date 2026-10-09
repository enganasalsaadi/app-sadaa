import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Card, Divider, KeyValueRow, Pressable, Text } from '@/shared/ui';

export interface ReviewSectionRow {
  key: string;
  label: string;
  value: string;
}

interface ReviewSectionProps {
  title: string;
  rows: readonly ReviewSectionRow[];
  /** Back to the step that owns these rows. */
  onEdit: () => void;
}

/** A money wizard's review section: label + teal Edit link over one card of rows (rule 09 §2). */
const ReviewSectionComponent: React.FC<ReviewSectionProps> = ({ title, rows, onEdit }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box gap="sm">
      <Box row align="center" justify="space-between">
        <Text variant="label" color={colors.text.secondary} accessibilityRole="header">
          {title}
        </Text>
        <Pressable
          onPress={onEdit}
          minHeight={sizes.button.sm}
          justify="center"
          px="xs"
          accessibilityRole="link"
          accessibilityLabel={t('finance.reviewSection.editA11y', { section: title })}
        >
          <Text variant="bodyMedium" color={colors.interactive.text}>
            {t('finance.reviewSection.edit')}
          </Text>
        </Pressable>
      </Box>
      <Card px="lg" py="sm">
        {rows.map((row, index) => (
          <Box key={row.key}>
            {index > 0 ? <Divider /> : null}
            <Box py="xs">
              <KeyValueRow label={row.label} value={row.value} />
            </Box>
          </Box>
        ))}
      </Card>
    </Box>
  );
};

export const ReviewSection = memo(ReviewSectionComponent);
