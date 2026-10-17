import React, { memo } from 'react';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

const BADGE = moderateScale(24);
const CHIP_MIN = moderateScale(44);

export type ChipTone = 'info' | 'warning' | 'danger';

export interface CountChipProps {
  count: number;
  label: string;
  tone: ChipTone;
  onPress: () => void;
}

/** A tappable count pill: the number in a tinted disc, then what it counts. */
export const CountChip = memo<CountChipProps>(({ count, label, tone, onPress }) => {
  const { colors } = useTheme();
  const hue = colors.status[tone];
  return (
    <Pressable
      row
      align="center"
      gap="sm"
      pe="md"
      ps="sm"
      minHeight={CHIP_MIN}
      borderRadius="full"
      bg={colors.surface.main}
      shadow="card"
      borderWidth="thin"
      borderColor={colors.border.card}
      scaleOnPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${formatNumber(count)} ${label}`}
    >
      <Box
        minWidth={BADGE}
        height={BADGE}
        px="xs"
        borderRadius="full"
        bg={hue.soft}
        align="center"
        justify="center"
      >
        <Text variant="buttonSmall" color={hue.text}>
          {formatNumber(count)}
        </Text>
      </Box>
      <Text variant="buttonSmall">{label}</Text>
    </Pressable>
  );
});
