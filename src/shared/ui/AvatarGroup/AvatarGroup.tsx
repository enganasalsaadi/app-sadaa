import React, { memo } from 'react';
import { User } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Avatar } from '../primitives/Image';

export type AvatarGroupSize = 'xs' | 'sm' | 'md';

export interface AvatarGroupItem {
  id: string;
  uri?: string;
}

export interface AvatarGroupProps {
  items: readonly AvatarGroupItem[];
  /** Spoken for the whole stack ("12 creators applied"). */
  accessibilityLabel: string;
  /** Visible avatars before the `+N` counter. */
  max?: number;
  size?: AvatarGroupSize;
}

const DEFAULT_MAX = 4;

/** Overlapping avatar stack (applicants, campaign participants). */
const AvatarGroupComponent: React.FC<AvatarGroupProps> = ({
  items,
  accessibilityLabel,
  max = DEFAULT_MAX,
  size = 'sm',
}) => {
  const { colors, sizes } = useTheme();
  const dimension = sizes.avatar[size];
  const styles = useStyles(
    ({ borderWidths, colors: c }) => ({
      // Negative spacing has no token: overlap by a third of the avatar.
      overlap: { marginStart: -Math.round(dimension / 3) },
      ring: {
        borderWidth: borderWidths.md,
        borderColor: c.surface.main,
        borderRadius: dimension,
        overflow: 'hidden' as const,
      },
    }),
    [dimension],
  );
  const visible = items.slice(0, max);
  const hidden = items.length - visible.length;

  return (
    <Box row align="center" accessible accessibilityLabel={accessibilityLabel}>
      {visible.map((item, index) => (
        <Box key={item.id} style={index === 0 ? styles.ring : [styles.ring, styles.overlap]}>
          {item.uri ? (
            <Avatar uri={item.uri} size={dimension} />
          ) : (
            <Box
              width={dimension}
              height={dimension}
              bg={colors.surface.elevated}
              align="center"
              justify="center"
            >
              <User size={Math.round(dimension / 2)} color={colors.icon.secondary} />
            </Box>
          )}
        </Box>
      ))}
      {hidden > 0 ? (
        <Box style={[styles.ring, styles.overlap]}>
          <Box
            width={dimension}
            height={dimension}
            bg={colors.surface.elevated}
            align="center"
            justify="center"
          >
            <Text variant="caption" color={colors.text.secondary}>
              {`+${formatNumber(hidden)}`}
            </Text>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

export const AvatarGroup = memo(AvatarGroupComponent);
