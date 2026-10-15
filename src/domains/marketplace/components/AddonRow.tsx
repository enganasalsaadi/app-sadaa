import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import type { AddonType } from '@/core/api';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { ADDON_ICONS } from '@/domains/identity';
import { Box, MoneyText, Pressable, Text } from '@/shared/ui';
import type { OfferAddon } from '../utils/offerServices';
import { formatDays, formatDuration } from '../utils/offerDuration';

const TILE = moderateScale(28);

export interface AddonRowProps {
  addon: OfferAddon;
  on: boolean;
  onPress: (type: AddonType) => void;
}

/** One add-on as a full-width checkbox row: icon tile, name · detail, + price, tick box. */
const AddonRowComponent: React.FC<AddonRowProps> = ({ addon, on, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const Icon = ADDON_ICONS[addon.type];
  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'row' | 'tile' | 'box', ViewStyle> => ({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        minHeight: sizes.button.md + spacing.xs,
        paddingStart: spacing.md,
        paddingEnd: spacing.sm,
        borderRadius: radii.md,
        borderWidth: borderWidths.thin,
        borderColor: on ? colors.interactive.main : colors.border.default,
        backgroundColor: on ? colors.interactive.soft : colors.surface.main,
      },
      tile: {
        width: TILE,
        height: TILE,
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: on ? colors.surface.main : colors.interactive.soft,
      },
      box: {
        width: sizes.control.md,
        height: sizes.control.md,
        borderRadius: radii.xs,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: borderWidths.sm,
        borderColor: on ? colors.interactive.main : colors.border.default,
        backgroundColor: on ? colors.interactive.main : colors.surface.main,
      },
    }),
    [colors, on, sizes.button.md, sizes.control.md],
  );
  const press = useCallback(() => onPress(addon.type), [addon.type, onPress]);
  const detail = addon.detail
    ? addon.detail.unit === 'hours'
      ? formatDuration(t, addon.detail.count)
      : formatDays(t, addon.detail.count)
    : null;

  return (
    <Pressable
      style={styles.row}
      onPress={press}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={detail ? `${addon.label} · ${detail}` : addon.label}
    >
      <Box style={styles.tile}>
        <Icon size={sizes.icon.xs} color={colors.interactive.main} />
      </Box>
      <Box flex={1}>
        <Text variant="bodySmall" color={colors.text.primary} numberOfLines={1}>
          {addon.label}
          {detail ? (
            <Text variant="caption" color={colors.text.tertiary}>
              {` · ${detail}`}
            </Text>
          ) : null}
        </Text>
      </Box>
      <MoneyText value={addon.price} size="sm" showSign tone={on ? 'default' : 'muted'} />
      <Box style={styles.box}>
        {on ? <Check size={sizes.icon.xs} color={colors.text.onAccent} strokeWidth={3} /> : null}
      </Box>
    </Pressable>
  );
};

export const AddonRow = memo(AddonRowComponent);
