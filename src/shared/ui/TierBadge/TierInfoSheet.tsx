import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetLookupsQuery } from '@/core/api';
import { resolveHue, useTheme } from '@/core/theme';
import { FOLLOWER_TIERS, FOLLOWER_TIER_STYLE } from '@/core/config';
import { BottomSheet } from '../BottomSheet';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { TierCrestIcon } from './TierBadge';
import { TIER_DESCRIPTION_KEY, TIER_NAME_KEY } from './tierBadgeI18n';

export interface TierInfoSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Explains every follower tier — opened by tapping any `TierBadge` (rule 08). */
const TierInfoSheetComponent: React.FC<TierInfoSheetProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { data } = useGetLookupsQuery();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Box px="2xl" pt="lg" pb="3xl" gap="lg">
        <Box gap="xs">
          <Text variant="h4">{t('followerTier.sheet.title')}</Text>
          <Text variant="body" color={colors.text.secondary}>
            {t('followerTier.sheet.subtitle')}
          </Text>
        </Box>

        <Box
          gap="lg"
        >
          {FOLLOWER_TIERS.map(tier => {
            const { tone, level } = FOLLOWER_TIER_STYLE[tier];
            const hue = resolveHue(colors, tone);
            const glyph =
              tone === 'premium' ? colors.brand.main : colors.text.onAccent;
            const range = data?.follower_tiers[tier]?.range;

            return (
              <Box
                key={tier}
                row
                gap="lg"
                align="center"
                borderWidth="hairline"
                borderColor={colors.border.default}
                p="md"
                borderRadius="md"
              >
                <TierCrestIcon
                  level={level}
                  size={sizes.icon.xl}
                  fill={hue.main}
                  glyph={glyph}
                />
                <Box flex={1} gap="xs">
                  <Box row align="center" gap="sm">
                    <Text variant="bodyMedium" color={colors.text.primary}>
                      {t(TIER_NAME_KEY[tier])}
                    </Text>
                    {range ? (
                      <Text variant="caption" color={colors.text.secondary}>
                        {range}
                      </Text>
                    ) : null}
                  </Box>
                  <Text variant="bodySmall" color={colors.text.secondary}>
                    {t(TIER_DESCRIPTION_KEY[tier])}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </BottomSheet>
  );
};

export const TierInfoSheet = memo(TierInfoSheetComponent);
