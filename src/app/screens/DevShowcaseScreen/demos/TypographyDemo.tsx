import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Box, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { TypographyVariant } from '@/core/theme';

/** Exhaustive: a new typography token fails the build until it is shown here. */
const LABEL_KEY = {
  h1: 'devShowcase.typography.h1Label',
  h2: 'devShowcase.typography.h2Label',
  h3: 'devShowcase.typography.h3Label',
  h4: 'devShowcase.typography.h4Label',
  title: 'devShowcase.typography.titleLabel',
  body: 'devShowcase.typography.bodyLabel',
  bodyMedium: 'devShowcase.typography.bodyMediumLabel',
  bodySmall: 'devShowcase.typography.bodySmallLabel',
  caption: 'devShowcase.typography.captionLabel',
  button: 'devShowcase.typography.buttonLabel',
  buttonSmall: 'devShowcase.typography.buttonSmallLabel',
  overline: 'devShowcase.typography.overlineLabel',
  label: 'devShowcase.typography.labelLabel',
  amountSmall: 'devShowcase.typography.amountSmallLabel',
  amount: 'devShowcase.typography.amountLabel',
  amountTitle: 'devShowcase.typography.amountTitleLabel',
  amountLarge: 'devShowcase.typography.amountLargeLabel',
  amountHero: 'devShowcase.typography.amountHeroLabel',
  amountDisplay: 'devShowcase.typography.amountDisplayLabel',
} as const satisfies Record<TypographyVariant, ParseKeys>;

const VARIANTS = Object.keys(LABEL_KEY) as TypographyVariant[];

const TypographyDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Box gap="lg">
      {VARIANTS.map(variant => (
        <Box key={variant} gap="xs">
          <Text variant="caption" color={colors.text.tertiary}>
            {variant}
          </Text>
          <Text variant={variant}>{t(LABEL_KEY[variant])}</Text>
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
  );
};

export const TypographyDemo = memo(TypographyDemoComponent);
