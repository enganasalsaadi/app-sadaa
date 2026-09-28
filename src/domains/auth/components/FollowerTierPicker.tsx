import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Crown } from 'lucide-react-native';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, Pressable, Skeleton, Text } from '@/shared/ui';
import { FOLLOWER_TIER_STYLE } from '../constants/influencerOnboarding';
import type { FollowerTierId } from '../store';
import { TierLevelMeter } from './TierLevelMeter';

export interface FollowerTierOption {
  id: FollowerTierId;
  label: string;
  /** Server-formatted range ("10K - 100K"). */
  range: string;
}

interface TierCardProps {
  option: FollowerTierOption;
  selected: boolean;
  onSelect: (id: FollowerTierId) => void;
}

const TierCard: React.FC<TierCardProps> = memo(({ option, selected, onSelect }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { tone, level } = FOLLOWER_TIER_STYLE[option.id];
  const hue = resolveHue(colors, tone);
  const isTop = option.id === 'MEGA';
  const handlePress = useCallback(() => onSelect(option.id), [onSelect, option.id]);

  return (
    <Pressable
      onPress={handlePress}
      flex={1}
      gap="sm"
      p="md"
      borderRadius="lg"
      borderWidth={selected ? 'sm' : 'thin'}
      borderColor={selected ? hue.main : colors.border.default}
      bg={selected ? hue.soft : colors.surface.main}
      scaleOnPress
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={t('auth.influencerOnboarding.socials.tierA11y', {
        tier: option.label,
        range: option.range,
      })}
    >
      <Box row align="center" justify="space-between">
        <TierLevelMeter level={level} color={hue.main} />
        {selected ? (
          <Check size={sizes.icon.xs} color={hue.main} strokeWidth={iconStroke.bold} />
        ) : isTop ? (
          <Crown size={sizes.icon.xs} color={colors.premium.main} />
        ) : null}
      </Box>
      <Box gap="xs">
        <Text variant="bodyMedium" color={selected ? hue.text : colors.text.primary}>
          {option.label}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {option.range}
        </Text>
      </Box>
    </Pressable>
  );
});

interface FollowerTierPickerProps {
  options: readonly FollowerTierOption[];
  value: FollowerTierId | null;
  onChange: (id: FollowerTierId) => void;
  loading?: boolean;
  accessibilityLabel: string;
}

const COLUMNS = 2;

/** Follower-range cards, two per row; the last odd one (MEGA) spans the row. */
export const FollowerTierPicker: React.FC<FollowerTierPickerProps> = memo(
  ({ options, value, onChange, loading = false, accessibilityLabel }) => {
    const { sizes } = useTheme();

    if (loading) {
      return (
        <Box gap="sm" accessibilityElementsHidden>
          {[0, 1, 2].map(row => (
            <Box key={row} row gap="sm">
              <Box flex={1}>
                <Skeleton width="100%" height={sizes.avatar.xl} borderRadius="lg" />
              </Box>
              <Box flex={1}>
                <Skeleton width="100%" height={sizes.avatar.xl} borderRadius="lg" />
              </Box>
            </Box>
          ))}
        </Box>
      );
    }

    const rows: FollowerTierOption[][] = [];
    for (let i = 0; i < options.length; i += COLUMNS) {
      rows.push(options.slice(i, i + COLUMNS));
    }

    return (
      <Box gap="sm" accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
        {rows.map(row => (
          <Box key={row.map(o => o.id).join()} row gap="sm">
            {row.map(option => (
              <TierCard
                key={option.id}
                option={option}
                selected={option.id === value}
                onSelect={onChange}
              />
            ))}
          </Box>
        ))}
      </Box>
    );
  },
);
