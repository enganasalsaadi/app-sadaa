import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Box, StatusPill, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { HueColors, HueTone } from '@/core/theme';

/** Dev-only mock status labels — not the real `DealStatus` (rule 06; that state machine isn't built yet). */
const MOCK_STATUS_KEYS = [
  'draft',
  'pending',
  'active',
  'completed',
  'disputed',
] as const;
type MockStatusKey = (typeof MOCK_STATUS_KEYS)[number];

const STATUS_PILL_LABEL_KEY: Record<MockStatusKey, ParseKeys> = {
  draft: 'devShowcase.statusPills.draft',
  pending: 'devShowcase.statusPills.pending',
  active: 'devShowcase.statusPills.active',
  completed: 'devShowcase.statusPills.completed',
  disputed: 'devShowcase.statusPills.disputed',
};

const STATUS_PILL_TONE = {
  draft: 'neutral',
  pending: 'warning',
  active: 'interactive',
  completed: 'success',
  disputed: 'danger',
} as const satisfies Record<MockStatusKey, HueTone>;

const ColorsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

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

  return (
    <Box gap="xl">
      {swatchGroups.map(group => (
        <Box key={group.labelKey} gap="sm">
          <Text variant="bodySmall" color={group.hue.text}>
            {t(group.labelKey)}
          </Text>
          <Box row gap="md">
            <Box gap="xs" align="center">
              <Box
                width={sizes.icon.xl}
                height={sizes.icon.xl}
                borderRadius="sm"
                bg={group.hue.main}
              />
              <Text variant="caption" color={colors.text.tertiary}>
                {t('devShowcase.colors.shadeMain')}
              </Text>
            </Box>
            <Box gap="xs" align="center">
              <Box
                width={sizes.icon.xl}
                height={sizes.icon.xl}
                borderRadius="sm"
                bg={group.hue.text}
              />
              <Text variant="caption" color={colors.text.tertiary}>
                {t('devShowcase.colors.shadeText')}
              </Text>
            </Box>
            <Box gap="xs" align="center">
              <Box
                width={sizes.icon.xl}
                height={sizes.icon.xl}
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
          {MOCK_STATUS_KEYS.map(key => (
            <StatusPill
              key={key}
              tone={STATUS_PILL_TONE[key]}
              label={t(STATUS_PILL_LABEL_KEY[key])}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export const ColorsDemo = memo(ColorsDemoComponent);
