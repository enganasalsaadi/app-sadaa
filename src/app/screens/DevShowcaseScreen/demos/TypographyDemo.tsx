import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Box, Text, Card } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { TypographyVariant } from '@/core/theme';

interface TypographyRow {
  variant: TypographyVariant;
  labelKey: ParseKeys;
}

const ROWS = [
  { variant: 'h1', labelKey: 'devShowcase.typography.h1Label' },
  { variant: 'h2', labelKey: 'devShowcase.typography.h2Label' },
  { variant: 'h3', labelKey: 'devShowcase.typography.h3Label' },
  { variant: 'h4', labelKey: 'devShowcase.typography.h4Label' },
  { variant: 'body', labelKey: 'devShowcase.typography.bodyLabel' },
  { variant: 'bodyMedium', labelKey: 'devShowcase.typography.bodyMediumLabel' },
  { variant: 'bodySmall', labelKey: 'devShowcase.typography.bodySmallLabel' },
  { variant: 'caption', labelKey: 'devShowcase.typography.captionLabel' },
] as const satisfies readonly TypographyRow[];

const TypographySectionComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Card>
      <Box gap="lg">
        <Text variant="title">{t('devShowcase.sections.typography')}</Text>

        {ROWS.map(row => (
          <Box key={row.variant} gap="xs">
            <Text variant="caption" color={colors.text.tertiary}>
              {t(row.labelKey)}
            </Text>
            <Text variant={row.variant}>{t(row.labelKey)}</Text>
          </Box>
        ))}

        <Box
          borderTopWidth="hairline"
          borderColor={colors.border.default}
          pt="lg"
          gap="xs"
        >
          <Text variant="caption" color={colors.text.tertiary}>
            {t('devShowcase.typography.taglineLabel')}
          </Text>
          <Text variant="h4" color={colors.brand.text}>
            {t('common.tagline')}
          </Text>
        </Box>
      </Box>
    </Card>
  );
};

export const TypographySection = memo(TypographySectionComponent);
