import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Box, Text, Card } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { HueColors } from '@/core/theme';
import { MOCK_STATUS_KEYS } from '../hooks/useDevShowcaseScreen';
import type { MockStatusKey } from '../hooks/useDevShowcaseScreen';

const SWATCH_SIZE = 40;

const STATUS_PILL_LABEL_KEY: Record<MockStatusKey, ParseKeys> = {
  draft: 'devShowcase.statusPills.draft',
  pending: 'devShowcase.statusPills.pending',
  active: 'devShowcase.statusPills.active',
  completed: 'devShowcase.statusPills.completed',
  disputed: 'devShowcase.statusPills.disputed',
};

const ColorSectionComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const swatchGroups = useMemo<{ labelKey: ParseKeys; hue: HueColors }[]>(
    () => [
      { labelKey: 'devShowcase.colors.brand', hue: colors.brand },
      { labelKey: 'devShowcase.colors.interactive', hue: colors.interactive },
      { labelKey: 'devShowcase.colors.money', hue: colors.money },
      { labelKey: 'devShowcase.colors.premium', hue: colors.premium },
      { labelKey: 'devShowcase.colors.warning', hue: colors.status.warning },
    ],
    [colors],
  );

  const statusPillHue = useMemo<Record<MockStatusKey, HueColors>>(
    () => ({
      draft: colors.status.neutral,
      pending: colors.status.warning,
      active: colors.interactive,
      completed: colors.status.success,
      disputed: colors.status.danger,
    }),
    [colors],
  );

  return (
    <Card>
      <Box gap="xl">
        <Text variant="title">{t('devShowcase.sections.colors')}</Text>

        {swatchGroups.map(group => (
          <Box key={group.labelKey} gap="sm">
            <Text variant="bodySmall" color={group.hue.text}>
              {t(group.labelKey)}
            </Text>
            <Box row gap="md">
              <Box gap="xs" align="center">
                <Box
                  width={SWATCH_SIZE}
                  height={SWATCH_SIZE}
                  borderRadius="sm"
                  bg={group.hue.main}
                />
                <Text variant="caption" color={colors.text.tertiary}>
                  {t('devShowcase.colors.shadeMain')}
                </Text>
              </Box>
              <Box gap="xs" align="center">
                <Box
                  width={SWATCH_SIZE}
                  height={SWATCH_SIZE}
                  borderRadius="sm"
                  bg={group.hue.text}
                />
                <Text variant="caption" color={colors.text.tertiary}>
                  {t('devShowcase.colors.shadeText')}
                </Text>
              </Box>
              <Box gap="xs" align="center">
                <Box
                  width={SWATCH_SIZE}
                  height={SWATCH_SIZE}
                  borderRadius="sm"
                  bg={group.hue.soft}
                  borderWidth="hairline"
                  borderColor={colors.border.default}
                />
                <Text variant="caption" color={colors.text.tertiary}>
                  {t('devShowcase.colors.shadeSoft')}
                </Text>
              </Box>
            </Box>
          </Box>
        ))}

        <Box
          borderTopWidth="hairline"
          borderColor={colors.border.default}
          pt="lg"
          gap="md"
        >
          <Text variant="label" color={colors.text.secondary}>
            {t('devShowcase.statusPills.title')}
          </Text>
          <Box row wrap gap="sm">
            {MOCK_STATUS_KEYS.map(key => {
              const hue = statusPillHue[key];
              return (
                <Box
                  key={key}
                  row
                  align="center"
                  gap="xs"
                  px="md"
                  py="xs"
                  borderRadius="full"
                  bg={hue.soft}
                >
                  <Box
                    width={8}
                    height={8}
                    borderRadius="full"
                    bg={hue.main}
                  />
                  <Text variant="caption" color={hue.text}>
                    {t(STATUS_PILL_LABEL_KEY[key])}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export const ColorSection = memo(ColorSectionComponent);
