import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { formatNumber } from '@/core/i18n';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

export type BadgeTone = 'danger' | 'warning' | 'interactive' | 'neutral';
export type BadgeVariant = 'count' | 'dot';

export interface BadgeProps {
  /** Ignored for `dot`. Zero renders nothing. */
  count?: number;
  /** Above this the badge reads `max+`. */
  max?: number;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  /** Spoken instead of the bare number ("3 unread"). Omit when the parent already says it. */
  accessibilityLabel?: string;
}

const DEFAULT_MAX = 99;

/** Unread / pending counter on icons and tabs. For statuses use `StatusPill`. */
const BadgeComponent: React.FC<BadgeProps> = ({
  count = 0,
  max = DEFAULT_MAX,
  variant = 'count',
  tone = 'danger',
  accessibilityLabel,
}) => {
  const { colors, sizes } = useTheme();
  const bg = {
    neutral: colors.status.neutral.main,
    danger: colors.status.danger.main,
    warning: colors.status.warning.main,
    interactive: colors.interactive.main,
  }[tone];

  if (variant === 'dot') {
    return (
      <Box
        width={sizes.dot.md}
        height={sizes.dot.md}
        borderRadius="full"
        bg={bg}
        accessibilityLabel={accessibilityLabel}
        accessible={!!accessibilityLabel}
      />
    );
  }

  if (count <= 0) return null;

  const text =
    count > max ? `${formatNumber(max)}+` : formatNumber(count);

  return (
    <Box
      minWidth={sizes.badge.md}
      height={sizes.badge.md}
      px="xs"
      borderRadius="full"
      bg={bg}
      align="center"
      justify="center"
      accessible
      accessibilityLabel={accessibilityLabel ?? text}
    >
      <Text variant="caption" color={colors.text.onAccent}>
        {text}
      </Text>
    </Box>
  );
};

export const Badge = memo(BadgeComponent);
